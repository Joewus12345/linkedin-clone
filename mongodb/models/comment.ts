import mongoose, { Schema, Document, models } from "mongoose";
import { IUserLimited } from "./user";

export interface ICommentBase {
  user: IUserLimited;
  text: string;
}

export interface IComment extends Document, ICommentBase {
  createdAt: Date;
  updatedAt: Date;
  _id: mongoose.Types.ObjectId;
}

const CommentSchema = new Schema<IComment>(
  {
    user: {
      userId: { type: String, required: true },
      userImage: { type: String, required: true },
      firstName: { type: String, required: true },
      lastName: { type: String },
    },
    text: { type: String, required: true },
  },
  {
    timestamps: true,
  }
);

export const Comment =
  models.Comment || mongoose.model<IComment>("Comment", CommentSchema);
