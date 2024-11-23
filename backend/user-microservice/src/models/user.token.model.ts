import { Document, model, Schema } from "mongoose";

export interface IRefreshToken extends Document {
    _id: string;
    user: any;
    refreshToken: string;
    createdAt: any;
    __v: any;
}

export const TokenSchema = new Schema<IRefreshToken>({
    user: {
        type: Schema.Types.ObjectId,
    },
    refreshToken: {
        type: String,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

export const RefreshToken = model<IRefreshToken>("RefreshToken", TokenSchema);
