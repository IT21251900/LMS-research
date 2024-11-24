import { Router } from "express";
import path from "path";
import {
  createPermissionController,
  findOnePermissionByIdController,
  getAllPermissionsController,
  getPermissionByGroupController,
  updatePermissionController,
} from "../controllers/permission.controller";
import { Shield } from "../middleware/auth/shield";
import { SETTINGS } from "../constants/commons.settings";

const publicKey = path.join(__dirname, "../../config/public.pem");
const shield = new Shield(publicKey);

export const permissionRouter = Router();

permissionRouter.get(
  "/get-all",
  shield.auth(null, SETTINGS.USERS.ADMIN),
  getAllPermissionsController
);
permissionRouter.get(
  "/get-by-group",
  shield.auth(null, SETTINGS.USERS.ADMIN),
  getPermissionByGroupController
);
permissionRouter.post(
  "/create",
  // shield.auth(null, SETTINGS.USERS.ADMIN),
  createPermissionController
);
permissionRouter.put(
  "/update",
  shield.auth(null, SETTINGS.USERS.ADMIN),
  updatePermissionController
);
permissionRouter.get(
  "/get-one/:id",
  shield.auth(null, SETTINGS.USERS.ADMIN),
  findOnePermissionByIdController
);
