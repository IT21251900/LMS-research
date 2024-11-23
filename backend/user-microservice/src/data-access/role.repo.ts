import { Role } from "../models/role.model";

export const findRoleRepo = () => {
    return Role.aggregate([
        {
            $lookup: {
                from: "permissions",
                localField: "permissions",
                foreignField: "_id",
                as: "permissions",
            },
        },
    ]).exec();
};

export const findAllRolesForOptionsRepo = (filters?) => {
    return Role.find(filters).exec();
};

export const createRoleRepo = (data) => {
    return new Role(data).save();
};

export const deleteRoleRepo = (filters) => {
    return Role.deleteOne(filters).exec();
};

export const findOneRoleRepo = (filters) => {
    return Role.findOne(filters).exec();
};

export const findOneAndUpdateRoleRepo = async (filters, data) => {
    return Role.findOneAndUpdate(filters, { $set: { ...data } }, { new: true }).exec();
};

export const getPagedRolesRepo = async (data) => {
    const { pageIndex, pageSize, sortField, sortOrder } = data;
    return Role.aggregate([
        {
            $lookup: {
                from: "permissions",
                localField: "permissions",
                foreignField: "_id",
                as: "permissions",
            },
        },
        {
            $lookup: {
                from: "users",
                localField: "_id",
                foreignField: "role",
                as: "users",
            },
        },
        {
            $project: {
                _id: 1,
                name: 1,
                createdAt: 1,
                updatedAt: 1,
                __v: 1,
                permissions: { $size: "$permissions" },
                users: { $size: "$users" },
            },
        },
        {
            $facet: {
                metadata: [{ $count: "total" }, { $addFields: { page: pageIndex } }],
                data: [
                    {
                        $sort: {
                            [sortField || "createdAt"]: sortOrder || -1,
                        },
                    },
                    { $skip: pageSize * (pageIndex - 1) || 0 },
                    { $limit: pageSize },
                ],
            },
        },
    ]).exec();
};
