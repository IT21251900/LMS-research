import {
    createRoleRepo,
    deleteRoleRepo,
    findAllRolesForOptionsRepo,
    findOneAndUpdateRoleRepo,
    findOneRoleRepo,
    findRoleRepo,
    getPagedRolesRepo,
} from "../data-access/role.repo";
import { IRole } from "../models/role.model";

export const getAllRolesService = async () => {
    try {
        return await findRoleRepo();
    } catch (e) {
        throw e;
    }
};

export const createRoleService = async (data) => {
    try {
        const exist: IRole = await findOneRoleRepo({ name: data.name });
        if (exist) {
            throw { message: "Role with the same name already exist!" };
        }
        const role = await createRoleRepo(data);
        return role;
    } catch (e) {
        throw e;
    }
};

export const findOneRoleByIdService = async (id) => {
    try {
        return await findOneRoleRepo({ _id: id });
    } catch (e) {
        throw e;
    }
};

export const findOneAndUpdateRoleService = async (data) => {
    try {
        const existingRole = await findOneRoleRepo({ name: data.name });

        // Prevent updates to "SUPER ADMIN" role
        if (existingRole?.name === "SUPER ADMIN") {
            throw {
                status: 403,
                message: "Restricted from modifying the 'SUPER ADMIN' role",
            };
        }

        // Check if role with the same name already exists but has a different ID
        if (existingRole && existingRole._id.toString() !== data.id.toString()) {
            throw {
                status: 400,
                message: "Role with the same name already exist!",
            };
        }

        // Update role
        const updatedRole = await findOneAndUpdateRoleRepo({ _id: data.id }, data);
        if (!updatedRole) {
            throw {
                status: 404,
                message: "Role not found",
            };
        }
        return updatedRole;
    } catch (e) { 
        throw e;
    }
};


export const findOneAndDeleteRoleService = async (id, reqUserId) => {
    try {
        const role = await findOneRoleRepo({ _id: id });
        if (role.name === "SUPER ADMIN") {
            throw {
                check: true,
                message: "Restricted removing Super admin Role",
            };
        }
        const result = await deleteRoleRepo({ _id: id });
        return result;
    } catch (e) {
        throw e;
    }
};

export const getPagedRolesService = async (data) => {
    try {
        return await getPagedRolesRepo(data);
    } catch (e) {
        throw e;
    }
};

export const findAllRolesForOptionsService = async (data) => {
    try {
        return await findAllRolesForOptionsRepo(data);
    } catch (e) {
        throw e;
    }
};
