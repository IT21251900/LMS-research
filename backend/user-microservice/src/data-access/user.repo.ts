import { IUser, User } from "../models/user.model";
import { UserPWReset } from "../models/user.password.reset.model";
import { hashPassword, validatePassword } from "../util/hash";
import { Types } from "mongoose";
import ObjectId = Types.ObjectId;

export const createUserRepo = (data): Promise<IUser> => {
    return new User(data).save();
};
export const findOneUserRepo = async (filters): Promise<IUser> => {
    return User.findOne(filters).exec();
};

export const findLatestUserRepo = async (filters?) => {
    return User.find(filters).sort({ createdAt: -1 }).limit(1).exec();
};

export const aggregateUserRepo = (filters) => {
    return User.aggregate([
        {
            $match: {
                ...filters,
            },
        },
        {
            $lookup: {
                from: "roles",
                localField: "role",
                foreignField: "_id",
                as: "role",
            },
        },
        {
            $unwind: {
                path: "$role",
            },
        },
        {
            $lookup: {
                from: "permissions",
                localField: "role.permissions",
                foreignField: "_id",
                as: "role.permissions",
            },
        },
    ]).exec();
};
export const findOneAndUpdateUserRepo = async (filters, data) => {
    if (data.password) {
        if (validatePassword(data.password)) {
            data.password = await hashPassword(data.password);
        } else {
            throw {
                pwdValid: false,
                message:
                    "Password must be at least 8 characters long, contain at least one lowercase letter, one uppercase letter, one digit, and one special character (e.g., @, #, $, etc.).",
            };
        }
    }
    return User.findOneAndUpdate(filters, { $set: { ...data } }, { new: true }).exec();
};
export const findAllUsersRepo = (filters?) => {
    return User.aggregate([
        {
            $project: {
                _id: 1,
                role: 1,
                email: 1,
                firstname: 1,
                lastname: 1,
                mobilenumber: 1,
                active: 1,
                archived: 1,
                createdAt: 1,
                updatedAt: 1,
            },
        },
    ]).exec();
};
export const getPagedUsersRepo = async (data) => {
    const { pageIndex, pageSize, sortField, sortOrder, filters } = data;
    let statusFilter = {};
    let roleFilter = {};
    let textFilter = {};
    let departmentFilter = {};
    let archivedFilter = {};

    if (filters?.department) {
        departmentFilter = {
            department: new ObjectId(filters?.department),
        };
    }

    if (filters?.searchText) {
        textFilter = {
            $or: [
                { refNo: { $regex: filters.searchText, $options: "i" } },
                { email: { $regex: filters.searchText, $options: "i" } },
                { mobilenumber: { $regex: filters.searchText, $options: "i" } },
                { firstname: { $regex: filters.searchText, $options: "i" } },
                { lastname: { $regex: filters.searchText, $options: "i" } },
            ],
        };
    }

    if (filters?.status === true || filters?.status === false) {
        statusFilter = {
            active: filters?.status,
        };
    }

    if (filters?.role) {
        roleFilter = {
            role: new ObjectId(filters?.role),
        };
    }
 
    if (typeof filters?.archived === "boolean") {
        archivedFilter = {
            archived: filters.archived,
        };
    }

    return User.aggregate([
        {
            $match: {
                ...archivedFilter,
                ...departmentFilter,
                ...roleFilter,
                ...statusFilter,
            },
        },
        {
            $lookup: {
                from: "roles",
                localField: "role",
                foreignField: "_id",
                as: "role",
            },
        },
        {
            $unwind: {
                path: "$role",
                preserveNullAndEmptyArrays: true,
            },
        },
        {
            $project: {
                _id: 1,
                role: 1,
                refNo: 1,
                email: 1,
                active: 1,
                createdAt: 1,
                firstname: 1,
                lastname: 1,
                mobilenumber: 1,
                phoneNumberPrefix: 1,
                archived: 1,
                text: {
                    $concat: ["$firstname", " ", "$lastname", " ", "$email", " ", "$role.name"],
                },
                filterRole: "$role.name",
            },
        },
        {
            $match: {
                ...textFilter,
            },
        },
        {
            $facet: {
                metadata: [{ $count: "total" }, { $addFields: { page: pageIndex } }],
                data: [
                    {
                        $sort: {
                            [sortField]: sortOrder,
                        },
                    },
                    { $skip: pageSize * (pageIndex - 1) || 0 },
                    { $limit: pageSize },
                ],
            },
        },
    ]).exec();
};

export const createUserPwReset = (data, session?) => {
    return new UserPWReset(data).save({ session });
};
export const findUserPwResetToken = (filters?) => {
    return UserPWReset.findOne(filters).exec();
};
export const findUserPwResetTokenAndDelete = (filters?) => {
    return UserPWReset.findOneAndDelete(filters).exec();
};
