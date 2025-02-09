import mongoose, { Document, Schema } from "mongoose";

export interface IUserDocument extends Document {
  userId: string;
  userImage: string;
  firstName: string;
  lastName?: string;
  email: string | { address: string; verified: boolean };
}

export type IUserLimited = Omit<IUserDocument, "email">;

const UserSchema = new Schema<IUserDocument>(
  {
    userId: { type: String, required: true, unique: true },
    userImage: { type: String, default: "" },
    firstName: { type: String, required: true },
    lastName: { type: String },
    email: { type: String, required: true, unique: true },
  },
  { timestamps: true }
);

export const User =
  mongoose.models.User || mongoose.model<IUserDocument>("User", UserSchema);
