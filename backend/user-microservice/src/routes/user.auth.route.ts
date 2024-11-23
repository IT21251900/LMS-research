import {
    changeUserPasswordController,
    createUserController,
    findAllUsersController,
    findOneAndUpdateUserController,
    findOneUserByIdController,
    getPagedUsersController,
    logoutUserController,
    requestUserPWResetController,
    resetUserPasswordController,
    updateUserPasswordController,
    userLoginController,
    userRefreshTokenController,
    validateUserPWResetTokenController,
} from "../controllers/admin.auth.controller";
import { Router } from "express";
import { Shield } from "../middleware/auth/shield";
import * as path from "path";
import { SETTINGS } from "../constants/commons.settings";

const publicKey = path.join(__dirname, "../../config/public.pem");
const shield = new Shield(publicKey);

export const userAuthRouter = Router();

// Login, Logout & token refresh routes
userAuthRouter.post("/login", userLoginController);
userAuthRouter.post("/refresh-token", userRefreshTokenController);
userAuthRouter.post("/logout", shield.auth(null, SETTINGS.USERS.ADMIN), logoutUserController);
userAuthRouter.get(
    "/admin-reset-password/:id",
    shield.auth(null, SETTINGS.USERS.ADMIN),
    resetUserPasswordController
);

// Forgot password routes
userAuthRouter.post("/request-reset-password", requestUserPWResetController);
userAuthRouter.post("/validate-reset-password", validateUserPWResetTokenController);
userAuthRouter.post("/reset-password", updateUserPasswordController);

// Admin site routes
userAuthRouter.post("/create", createUserController);
userAuthRouter.put(
    "/update",
    shield.auth(null, SETTINGS.USERS.ADMIN),
    findOneAndUpdateUserController 
);
userAuthRouter.get("/get-all", shield.auth(null, SETTINGS.USERS.ADMIN), findAllUsersController);
userAuthRouter.post("/get-paged", shield.auth(null, SETTINGS.USERS.ADMIN), getPagedUsersController);
userAuthRouter.get(
    "/get-one/:id",
    shield.auth(null, SETTINGS.USERS.ADMIN),
    findOneUserByIdController
);
userAuthRouter.post(
    "/change-password",
    shield.auth(null, SETTINGS.USERS.ADMIN),
    changeUserPasswordController
);
