import { log } from "../util/logger";
import {
    changeUserPasswordService,
    createUserService,
    findAllUsersService,
    findOneAndUpdateUserService,
    findOneUserByIdService,
    getPagedUsersService,
    logoutUserService,
    requestUserPasswordResetService,
    resetUserPasswordService,
    signInUserService,
    validateAndUpdateUserPwService,
    validateUserPWResetTokenService,
} from "../services/admin.auth.service";
import { validateRefreshTokenReq } from "../services/token.service";
import { SETTINGS } from "../constants/commons.settings";

export const userLoginController = async (req, res) => {
    log.info("User login started");
    if (!req.body.email) {
        log.error("Email not found");
        return res.status(404).send({ message: "Email not found" });
    }
    const email = req.body.email.toLowerCase();
    try {
        res.send(await signInUserService(req.body.password, email, SETTINGS.USERS.ADMIN));
    } catch (e) {
        log.error(e);
        res.status(403).send(e);
    }
};
export const userRefreshTokenController = async (req, res) => {
    log.info("User token refresh started");
    const rToken = req.body.refreshToken;
    if (!rToken) {
        log.error("Refresh token not found");
        return res.status(402).send({ code: 1000, message: "Refresh token not found" });
    } else {
        try {
            res.send(await validateRefreshTokenReq(true, rToken, SETTINGS.USERS.ADMIN));
        } catch (e) {
            log.error(e);
            res.status(400).send(e);
        }
    }
};
export const logoutUserController = async (req, res) => {
    log.info("User login out");
    try {
        await logoutUserService({ user: req.user.userId });
        log.info("Logout Successful");
        return res.status(200).send({ message: "Log out successful" });
    } catch (e) {
        log.error("Logout Unsuccessful");
        return res.status(403).send({ error: "Logout Unsuccessful" });
    }
};
export const changeUserPasswordController = async (req, res) => {
    try {
        const result = await changeUserPasswordService({
            id: req.user.userId,
            ...req.body,
        });
        res.send(result);
        log.info("Change password successfully.");
    } catch (e) {
        log.error(JSON.stringify(e));
        return res.status(400).send(e);
    }
};
export const resetUserPasswordController = async (req, res) => {
    log.info("resetting Password");
    try {
        const data = await resetUserPasswordService(req.params.id);
        res.send(data);
        log.info("reset password Email Sent");
    } catch (e) {
        return res.status(400).send(e);
    }
};

export const createUserController = async (req, res) => {
    log.info("Creating user");
    try {
        const data = await createUserService(req.body);
        res.send(data);
        log.info("Creating user completed");
    } catch (e) {
        log.error(JSON.stringify(e));
        return res.status(400).send(e);
    }
};
export const findOneAndUpdateUserController = async (req, res) => {
    log.info("Updating user started");
    try {
        const result = await findOneAndUpdateUserService({ _id: req.body._id }, { ...req.body });
        res.send(result);
        log.info("Updating user completed");
    } catch (e) {
        log.error(JSON.stringify(e));
        res.status(400).send(e);
    }
};

export const requestUserPWResetController = async (req, res) => {
    log.info("Requesting Reset Password");
    log.info(req.body.email);
    try {
        const data = await requestUserPasswordResetService(req.body.email, SETTINGS.USERS.ADMIN);
        res.send(data);
        log.info("Requesting Reset Password completed");
    } catch (e) {
        log.error(JSON.stringify(e));
        return res.status(400).send(e);
    }
};

export const validateUserPWResetTokenController = async (req, res) => {
    log.info("Validating Reset Password");
    try {
        const data = await validateUserPWResetTokenService(req.body.token);
        res.send(data);
        log.info("Validating Reset Password completed");
    } catch (e) {
        return res.status(400).send(e);
    }
};
export const updateUserPasswordController = async (req, res) => {
    log.info("Resetting Password");
    try {
        const { token, password } = req.body;
        const data = await validateAndUpdateUserPwService(token, password, SETTINGS.USERS.ADMIN);
        res.send(data);
        log.info("Resetting Password completed");
    } catch (e) {
        return res.status(400).send(e);
    }
};
export const findAllUsersController = async (req, res) => {
    log.info("Getting all users");
    try {
        const result = await findAllUsersService(req.body);
        res.send(result);
        log.info("Getting all users completed");
    } catch (e) {
        log.error(JSON.stringify(e));
        res.status(400).send(e);
    }
};
export const getPagedUsersController = async (req, res) => {
    log.info("Getting paged users");
    try {
        const data = await getPagedUsersService(req.body);
        res.send(data);
        log.info("Getting paged users completed");
    } catch (e) {
        log.error(JSON.stringify(e));
        res.status(400).send(e);
    }
};
export const findOneUserByIdController = async (req, res) => {
    log.info("Finding user by id");
    try {
        const result = await findOneUserByIdService(req.params.id);
        res.send(result);
        log.info("Finding user by id completed");
    } catch (e) {
        log.error(JSON.stringify(e));
        res.status(400).send(e);
    }
};
