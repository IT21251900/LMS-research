import { Document, model, Schema } from "mongoose";
import uniqueValidator from "mongoose-unique-validator";

export interface IRole extends Document {
    _id: string;
    name: string;
    permissions: any;
    createdAt: any;
    updatedAt: any;
    __v: any;
}

export const RoleSchema = new Schema<IRole>(
    {
        name: {
            type: String,
            required: [true, "Name is required"],
            unique: true,
            uniqueCaseInsensitive: true,
        },
        permissions: {
            type: [
                {
                    type: Schema.Types.ObjectId,
                    ref: "permissions",
                },
            ],
        },
    },
    {
        timestamps: true,
    }
);

RoleSchema.plugin(uniqueValidator, { message: "{PATH} must be unique" });

export const Role = model<IRole>("Role", RoleSchema);
