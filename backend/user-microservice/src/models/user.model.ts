import { Document, model, Schema } from "mongoose";
import bcrypt from "bcrypt";
import uniqueValidator from "mongoose-unique-validator";
import { isEmail } from "validator";
import { IRole } from "./role.model";

export interface IUser extends Document {
    _id: string;
    refNo: string;
    role: IRole;
    firstname: string;
    lastname: string;
    phoneNumberPrefix: string;
    mobilenumber: string;
    email: string;
    active: boolean;
    password: string;
    archived: boolean;
    createdAt: any;
    updatedAt: any;
    __v: any;
}
export const UserSchema = new Schema<IUser>(
    {
        refNo: {
            type: String,
        },
        firstname: {
            type: String,
            required: [true, "First name is required"],
        },
        lastname: {
            type: String,
            required: [true, "Last name is required"],
        },
        phoneNumberPrefix: {
            type: String,
            required: [true, "Mobile number prefix is required"],
        },
        mobilenumber: {
            type: String,
            required: [true, "Mobile number is required"],
        },
        role: {
            type: Schema.Types.ObjectId,
            ref: "roles",
            required: [true, "Role is required"],
        },
        email: {
            type: String,
            unique: true,
            uniqueCaseInsensitive: true,
            required: [true, "Email is required"],
            validator: [isEmail, "Invalid Email"],
            lowercase: true,
        },
        password: {
            type: String,
            required: [true, "Password is required"],
        },
        active: {
            type: Boolean,
            default: true,
        },
        archived: {
            type: Boolean,
            default: false,
        },
    },
    {
        timestamps: true,
    }
);

UserSchema.pre("save", function (next) {
    const admin: IUser = this;
    if (!admin.isModified("password")) {
        return next();
    }
    bcrypt.genSalt(12, (err, salt) => {
        if (err) {
            return next(err);
        }
        bcrypt.hash(admin.password, salt, (err, hash) => {
            if (err) {
                return next(err);
            }
            admin.password = hash;
            next();
        });
    });
});

UserSchema.plugin(uniqueValidator, { message: "{PATH} must be unique" });

export const User = model<IUser>("User", UserSchema);
