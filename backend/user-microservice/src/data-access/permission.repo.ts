import { Permission } from "../models/permission.model";

export const findPermissionsRepo = (filters?) => {
    return Permission.find(filters).exec();
};

export const createPermissionRepo = (data) => {
    return new Permission(data).save();
};

export const findOnePermissionRepo = (filters) => {
    return Permission.findOne(filters).exec();
};

export const findOneAndUpdatePermissionRepo = async (filters, data) => {
    return Permission.findOneAndUpdate(filters, { $set: { ...data } }, { new: true }).exec();
};

export const findPermissionByGroupRepo = () => {
    return Permission.aggregate([
        {
            $sort: {
                code: 1,
            },
        },
        {
            $lookup: {
                from: "permissioncategories",
                localField: "category",
                foreignField: "_id",
                as: "category",
            },
        },
        {
            $unwind: {
                path: "$category",
                preserveNullAndEmptyArrays: true,
            },
        },
        {
            $project: {
                _id: 1,
                name: 1,
                code: 1,
                createdAt: 1,
                updatedAt: 1,
                category: "$category.name",
            },
        },
    ]);
};
