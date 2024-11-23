import { Request, Response } from "express";
import {
    createPermissionService,
    findOneAndUpdatePermissionService,
    findOnePermissionByIdService,
    findPermissionByGroupService,
    getAllPermissionsService,
} from "../services/permission.service";
import { log } from "../util/logger";

export const getAllPermissionsController = async (req: Request, res: Response) => {
    log.info("Retrieving all permissions");
    try {
        const data = await getAllPermissionsService();
        res.send(data);
        log.info("Retrieving all permissions completed");
    } catch (e) {
        log.error(JSON.stringify(e));
        return res.status(400).send(e);
    }
};

export const createPermissionController = async (req: Request, res: Response) => {
    log.info("Creating permission");
    try {
        const data = await createPermissionService(req.body);
        res.send(data);
        log.info("Creating permission completed");
    } catch (e) {
        log.error(JSON.stringify(e));
        return res.status(400).send(e);
    }
};

export const updatePermissionController = async (req: Request, res: Response) => {
    log.info("Updating permission");
    try {
        const data = await findOneAndUpdatePermissionService(req.body);
        res.send(data);
        log.info("Updating permission completed");
    } catch (e) {
        log.error(JSON.stringify(e));
        return res.status(400).send(e);
    }
};

export const findOnePermissionByIdController = async (req: Request, res: Response) => {
    log.info("Find permission by id");
    try {
        const data = await findOnePermissionByIdService(req.params.id);
        res.send(data);
        log.info("Find permission by id completed");
    } catch (e) {
        log.error(JSON.stringify(e));
        return res.status(400).send(e);
    }
};

export const getPermissionByGroupController = async (req: Request, res: Response) => {
    log.info("Find permissions by group");
    try {
        const data = await findPermissionByGroupService();
        res.send(data);
        log.info("Find permissions by group completed");
    } catch (e) {
        log.error(JSON.stringify(e));
        return res.status(400).send(e);
    }
};
