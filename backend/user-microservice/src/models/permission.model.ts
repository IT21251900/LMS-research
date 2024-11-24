import { Document, model, Schema } from "mongoose";
import { IPermissionCategory } from "./permission.category.model";

export interface IPermission extends Document {
    _id: string;
    category: IPermissionCategory;
    name: string;
    code: string;
    createdAt: any;
    updatedAt: any;
    __v: any;
}

export const PermissionSchema = new Schema<IPermission>(
    {
        name: {
            type: String,
            required: [true, "Name is required"],
        },
        category: {
            type: Schema.Types.ObjectId,
            required: [true, "Category is required"],
        },
        code: {
            type: String,
            required: [true, "Code is required"],
        },
    },
    { timestamps: true }
);

export const Permission = model<IPermission>("Permission", PermissionSchema);
