import { IUser } from "@/types/user";
import mongoose, { Schema, Document, Model, models } from "mongoose";
import { toast } from "sonner";

export interface IFollowersBase {
  follower: IUser;
  following: IUser;
}

// Define the document methods (for each instance of a follower relationship)
interface IFollowersMethods {
  unfollow(): Promise<void>;
}

// Define the document interface
export interface IFollowers
  extends IFollowersBase,
    Document,
    IFollowersMethods {
  createdAt: Date;
  updatedAt: Date;
}

// Define the static methods
interface IFollowersStatics {
  follow(follower: IUser, following: IUser): Promise<IFollowers>;
  getAllFollowers(userId: string): Promise<IFollowers[]>;
  getAllFollowing(userId: string): Promise<IFollowers[]>;
}

// Merge the document methods, and static methods with IFollowers
interface IFollowersModel extends Model<IFollowers>, IFollowersStatics {}

// Define Schema
const FollowersSchema = new Schema<IFollowers>(
  {
    follower: {
      userId: { type: String, required: true },
      userImage: { type: String, required: true },
      firstName: { type: String, required: true },
      lastName: { type: String },
    },
    following: {
      userId: { type: String, required: true },
      userImage: { type: String, required: true },
      firstName: { type: String, required: true },
      lastName: { type: String },
    },
  },
  {
    timestamps: true,
  }
);

FollowersSchema.methods.unfollow = async function () {
  try {
    await this.deleteOne({ _id: this._id });
  } catch (error) {
    console.log("error when unfollowing", error);
  }
};

// Static Method: Follow a User
FollowersSchema.statics.follow = async function (
  follower: IUser,
  following: IUser
) {
  try {
    const existingFollow = await this.findOne({
      "follower.userId": follower.userId,
      "following.userId": following.userId,
    });

    if (existingFollow) {
      toast.error("You are already following this user");
      throw new Error("You are already following this user");
    }

    const follow = await this.create({ follower, following });
    return follow;
  } catch (error) {
    console.error("Error following user", error);
  }
};

// Static Method: Get Followers of a User
FollowersSchema.statics.getAllFollowers = async function (userId: string) {
  try {
    const followers = await this.find({ "following.userId": userId }).lean();
    return followers.map((follow: IFollowers) => ({
      follower: follow.follower.userId,
      followerImage: follow.follower.userImage,
      followerFirstName: follow.follower.firstName,
      followerLastName: follow.follower.lastName,
    }));
  } catch (error) {
    console.log("Error fetching followers", error);
  }
};

// Static Method: Get Users a Person is Following
FollowersSchema.statics.getAllFollowing = async function (userId: string) {
  try {
    const following = await this.find({ "follower.userId": userId }).lean();
    return following.map((follow: IFollowers) => ({
      following: follow.following.userId,
      followingImage: follow.following.userImage,
      followingFirstName: follow.following.firstName,
      followingLastName: follow.following.lastName,
    }));
  } catch (error) {
    console.log("Error fetching following", error);
  }
};

export const Followers =
  (models.Followers as IFollowersModel) ||
  mongoose.model<IFollowers, IFollowersModel>("Followers", FollowersSchema);
