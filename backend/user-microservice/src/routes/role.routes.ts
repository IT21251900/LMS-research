import { Router } from "express";
import {
    createRoleController,
    findOneAndDeleteRoleController,
    findOneAndUpdateRoleController,
    findOneRoleByIdController,
    getAllRolesController,
    getAllRolesForOptionsController,
    getPagedRolesController,
} from "../controllers/role.controller";
import * as path from "path";
import { Shield } from "../middleware/auth/shield";
import { SETTINGS } from "../constants/commons.settings";

const publicKey = path.join(__dirname, "../../config/public.pem");
const shield = new Shield(publicKey);

export const roleRouter = Router();

roleRouter.get("/get-all", shield.auth(null, SETTINGS.USERS.ADMIN), getAllRolesController);
roleRouter.get("/get", shield.auth(null, SETTINGS.USERS.ADMIN), getAllRolesForOptionsController);
roleRouter.post("/get-paged", shield.auth(null, SETTINGS.USERS.ADMIN), getPagedRolesController);
roleRouter.post("/create", createRoleController);
roleRouter.get("/get-one/:id", shield.auth(null, SETTINGS.USERS.ADMIN), findOneRoleByIdController);
roleRouter.put("/update", shield.auth(null, SETTINGS.USERS.ADMIN),  findOneAndUpdateRoleController);
roleRouter.delete("/delete/:id", shield.auth(null, SETTINGS.USERS.ADMIN), findOneAndDeleteRoleController);
