import { Request, Response } from "express";
import {
    createRoleService,
    findAllRolesForOptionsService,
    findOneAndDeleteRoleService,
    findOneAndUpdateRoleService,
    findOneRoleByIdService,
    getAllRolesService,
    getPagedRolesService,
} from "../services/role.service";
import { log } from "../util/logger";

export const getAllRolesController = async (req: Request, res: Response) => {
    try {
        const data = await getAllRolesService();
        res.send(data);
    } catch (e) {
        return res.status(403).send(e);
    }
};

export const getAllRolesForOptionsController = async (req: Request, res: Response) => {
    try {
        const data = await findAllRolesForOptionsService(req.body);
        res.send(data);
    } catch (e) {
        return res.status(403).send(e);
    }
};

export const createRoleController = async (req, res) => {
    log.info("Creating role");
    try {
        const data = await createRoleService(req.body);
        res.send(data);
        log.info("Creating role completed");
    } catch (e) {
        return res.status(403).send(e);
    }
};

export const findOneRoleByIdController = async (req: Request, res: Response) => {
    try {
        const data = await findOneRoleByIdService(req.params.id);
        res.send(data);
    } catch (e) {
        return res.status(403).send(e);
    }
};

export const findOneAndUpdateRoleController = async (req, res) => {
    log.info("Updating role");
    try {
        const data = await findOneAndUpdateRoleService(req.body);
        res.send(data);
        log.info("Updating role completed");
    } catch (e) {
        return res.status(403).send(e);
    }
};

export const findOneAndDeleteRoleController = async (req, res) => {
    try {
        const data = await findOneAndDeleteRoleService(req.params.id, req.user.userId);
        res.send(data);
    } catch (e) {
        return res.status(403).send(e);
    }
};

export const getPagedRolesController = async (req: Request, res: Response) => {
    try {
        const data = await getPagedRolesService(req.body);
        res.send(data);
    } catch (e) {
        return res.status(400).send(e);
    }
};
