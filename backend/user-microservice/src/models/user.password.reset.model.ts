import config from "config";
import moment from "moment";
import { Document, model, Schema } from "mongoose";

export interface IUserPWReset extends Document {
    _id: string;
    user: any;
    token: string;
    createdAt: any;
    expiredAt: any;
    __v: any;
}

export const UserPWResetSchema = new Schema<IUserPWReset>({
    user: {
        type: Schema.Types.ObjectId,
        default: null,
    },
    token: {
        type: String,
        required: [true, "Token is required"],
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    expiredAt: {
        type: Date,
        default: moment().add(
            config.get("auth.passwordReset.time"),
            config.get("auth.passwordReset.unit")
        ),
    },
});

export const UserPWReset = model<IUserPWReset>("UserPWReset", UserPWResetSchema);
