import { IRefreshToken, RefreshToken } from "../models/user.token.model";

export const createUserRefreshTokenRepo = (data) => {
    return new RefreshToken(data).save();
};
export const findOneUserRefreshTokenRepo = async (filters): Promise<IRefreshToken> => {
    return RefreshToken.findOne(filters).exec();
};
export const findOneAndDeleteUserRefreshTokenRepo = (filters) => {
    return RefreshToken.findOneAndDelete(filters).exec();
};
