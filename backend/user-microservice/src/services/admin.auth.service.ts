import {
  aggregateUserRepo,
  createUserPwReset,
  createUserRepo,
  findAllUsersRepo,
  findOneAndUpdateUserRepo,
  findOneUserRepo,
  findUserPwResetToken,
  findUserPwResetTokenAndDelete,
  getPagedUsersRepo,
} from "../data-access/user.repo";
import { IUser } from "../models/user.model";
import passwordGen from "generate-password";
import { sendEmailService } from "./email.service";
import { SETTINGS } from "../constants/commons.settings";
import config from "config";
import { log } from "../util/logger";
import bcrypt from "bcrypt";
import { generateJWT } from "./token.service";
import { findOneAndDeleteUserRefreshTokenRepo } from "../data-access/token.repo";
import { IUserPWReset } from "../models/user.password.reset.model";
import { v4 as uuidv4 } from "uuid";
import { createUserRef } from "../util/reference-numbers";

export const signInUserService = async (password, email, userType) => {
  try {
    const admin = (await aggregateUserRepo({ email }))[0];
    if (!admin || admin.archived) {
      throw { message: "Admin not found!", userCheck: true };
    }
    if (!admin.active) {
      throw {
        message: "Admin has been deactivated. Please contact system admin",
        activateCheck: true,
      };
    }
    return await validateUser(password, admin, SETTINGS.USERS.ADMIN);
  } catch (e) {
    log.error(e.message || "User not found");
    throw e;
  }
};
const validateUser = async (password, user, userType) => {
  try {
    const result = await bcrypt.compare(password, user.password);
    if (!result) {
      throw {
        message: "Invalid User name or Password!",
        credentialCheck: true,
      };
    }
    return await generateJWT(user, false, userType);
  } catch (e) {
    log.error(e.message);
    throw e;
  }
};

export const logoutUserService = async (data) => {
  await findOneAndDeleteUserRefreshTokenRepo(data);
};

export const changeUserPasswordService = async (data) => {
  try {
    const admin: IUser = await findOneUserRepo({ _id: data.id });
    const result = await bcrypt.compare(data.oldPassword, admin.password);
    if (result === false) {
      throw {
        message: "You entered wrong old password",
        oldPwdCheck: true,
      };
    }
    await findOneAndUpdateUserRepo({ _id: data.id }, data);
    return { done: true, message: "Password changed successfully!" };
  } catch (e) {
    throw e;
  }
};

export const resetUserPasswordService = async (id) => {
  try {
    const password = passwordGen.generate({
      length: 8, // Minimum length of 8 characters
      numbers: true, // Include digits
      lowercase: true, // Include lowercase letters
      uppercase: true, // Include uppercase letters
    });
    const user: IUser = await findOneAndUpdateUserRepo(
      { _id: id },
      { password }
    );
    sendEmailService(
      SETTINGS.EMAIL.USER_PASSWORD_RESET,
      {
        name: user.firstname + " " + user.lastname,
        email: user.email,
        password,
        url: `${config.get("frontEndUrl")}/auth/login`.toString(),
      },
      user.email,
      "Password Reset"
    );
    return {
      done: true,
      message: "Password reset information sent to user's Email.",
    };
  } catch (e) {
    throw e;
  }
};

export const createUserService = async (data) => {
  try {
    const emailCheck: IUser = await findOneUserRepo({ email: data.email });
    if (emailCheck) {
      throw { message: "Email is already existing!", emailCheck: true };
    } else {
      data.refNo = await createUserRef();
      const admin: IUser = await createUserRepo(data);
      admin.password = undefined;
      return admin;
    }
  } catch (e) {
    throw e;
  }
};

export const findOneAndUpdateUserService = async (filters, data) => {
  try {
    const emailCheck: IUser = await findOneUserRepo({ email: data.email });
    if (emailCheck && emailCheck._id.toString() !== filters._id.toString()) {
      throw { message: "Email is already existing!", emailCheck: true };
    }
    const admin = await findOneAndUpdateUserRepo(filters, data);
    admin.password = undefined;
    return admin;
  } catch (e) {
    throw e;
  }
};

export const requestUserPasswordResetService = async (email, userType) => {
  try {
    let user;

    const admin: IUser = await findOneUserRepo({ email });
    user = {
      _id: admin._id,
      name: admin.firstname + " " + admin.lastname,
    };

    if (user._id && user.name) {
      log.info("Found User for password reset.");
      const pwResetData: IUserPWReset = await createUserPwReset({
        user: user._id,
        token: uuidv4(),
      });
      log.info("Password reset token created.");
      log.info(pwResetData);
      sendEmailService(
        SETTINGS.EMAIL.PASSWORD_RESET,
        {
          url: `${config.get("frontEndUrl")}/auth/reset-password/${
            pwResetData.token
          }`.toString(),
          name: user.name,
        },
        email,
        "Password Reset"
      );
      return {
        done: true,
        message: "Password reset link sent to your Email.",
      };
    } else {
      return {
        done: false,
        message: "No user was found for this Email.",
      };
    }
  } catch (e) {
    throw e;
  }
};

export const validateUserPWResetTokenService = async (token) => {
  try {
    const pwReset: IUserPWReset = await findUserPwResetToken({ token });
    if (pwReset) {
      return { done: true, message: "Token validated.", data: pwReset };
    } else {
      return { done: false, message: "Invalid or expired token." };
    }
  } catch (e) {
    throw e;
  }
};

export const validateAndUpdateUserPwService = async (
  token,
  password,
  userType
) => {
  try {
    const pwReset: IUserPWReset = await findUserPwResetToken({ token });

    let user;

    const admin: IUser = await findOneUserRepo({ _id: pwReset.user });
    user = {
      _id: admin._id,
      name: admin.firstname + " " + admin.lastname,
      email: admin.email,
      url: `${config.get("frontEndUrl")}/auth/login`.toString(),
    };

    if (pwReset && user._id && user.email && user.name) {
      await Promise.all([
        passwordUpdateRepoCheck(user._id, password, userType),
        findUserPwResetTokenAndDelete({ token }),
      ]);
      log.info("sending mail");
      sendEmailService(
        SETTINGS.EMAIL.PASSWORD_CHANGED,
        {
          url: user.url,
          name: user.name,
        },
        user.email,
        "Password reset successfully"
      );
      return { done: true, message: "Password reset successfully" };
    } else {
      log.info("reset failed. Invalid or expired token.");
      return {
        done: false,
        message: "Password reset failed. Invalid or expired token.",
      };
    }
  } catch (e) {
    throw e;
  }
};

const passwordUpdateRepoCheck = (useId, password, userType) => {
  return findOneAndUpdateUserRepo({ _id: useId }, { password });
};

export const findAllUsersService = async (data) => {
  try {
    const result = await findAllUsersRepo(data);
    return result;
  } catch (e) {
    throw e;
  }
};
export const getPagedUsersService = async (data) => {
  try {
    return await getPagedUsersRepo(data);
  } catch (e) {
    throw e;
  }
};
export const findOneUserByIdService = async (id) => {
  try {
    const result: IUser = await findOneUserRepo({ _id: id });
    result.password = undefined;
    return result;
  } catch (e) {
    throw e;
  }
};
