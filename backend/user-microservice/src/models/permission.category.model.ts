import { Document, model, Schema } from "mongoose";

export interface IPermissionCategory extends Document {
    _id: string;
    name: string;
    createdAt: any;
    updatedAt: any;
    __v: any;
}

export const PermissionCategorySchema = new Schema<IPermissionCategory>(
    {
        name: {
            type: String,
            required: [true, "Name is required"],
        },
    },
    { timestamps: true }
);

export const PermissionCategory = model<IPermissionCategory>(
    "PermissionCategory",
    PermissionCategorySchema
);
