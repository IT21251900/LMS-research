import {
    createPermissionRepo,
    findOneAndUpdatePermissionRepo,
    findOnePermissionRepo,
    findPermissionByGroupRepo,
    findPermissionsRepo,
} from "../data-access/permission.repo";

export const getAllPermissionsService = async () => {
    try {
        return await findPermissionsRepo();
    } catch (e) {
        throw e;
    }
};

export const createPermissionService = async (data) => {
    try {
        return await createPermissionRepo(data);
    } catch (e) {
        throw e;
    }
};

export const findOnePermissionByIdService = async (id) => {
    try {
        return await findOnePermissionRepo({ _id: id });
    } catch (e) {
        throw e;
    }
};

export const findOneAndUpdatePermissionService = async (data) => {
    try {
        return await findOneAndUpdatePermissionRepo({ _id: data._id }, data);
    } catch (e) {
        throw e;
    }
};

export const findPermissionByGroupService = async () => {
    try {
        return await findPermissionByGroupRepo();
    } catch (e) {
        throw e;
    }
};
