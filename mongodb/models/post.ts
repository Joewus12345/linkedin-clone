import mongoose, { Schema, Document, models, Model } from "mongoose";
import { Comment, IComment, ICommentBase } from "./comment";
import { IUserLimited } from "./user";

export interface IPostBase {
  user: IUserLimited;
  text: string;
  imageUrl?: string;
  comments?: IComment[];
  likes?: string[];
}

export interface IPost extends Document, IPostBase {
  createdAt: Date;
  updatedAt: Date;
}

// Define the document methods (for each instance of a post)
interface IPostMethods {
  likePost(userId: string): Promise<void>;
  unlikePost(userId: string): Promise<void>;
  commentOnPost(comment: ICommentBase): Promise<void>;
  getAllComments(): Promise<IComment[]>;
  removePost(): Promise<void>;
}

// Define the static methods
interface IPostStatics {
  getAllPosts(): Promise<IPostDocument[]>;
  getPostById(postId: string): Promise<IPostDocument>;
}

// Merge the document methods, and static methods with IPost
// for singular instance of a post
export interface IPostDocument extends IPost, IPostMethods {
  _id: mongoose.Types.ObjectId;
}
// for all posts
interface IPostModel extends IPostStatics, Model<IPostDocument> {}

const PostSchema = new Schema<IPostDocument>(
  {
    user: {
      userId: { type: String, required: true },
      userImage: { type: String, required: true },
      firstName: { type: String, required: true },
      lastName: { type: String },
    },
    text: { type: String, required: true },
    imageUrl: { type: String },
    comments: { type: [Schema.Types.ObjectId], ref: "Comment", default: [] },
    likes: { type: [String] },
  },
  {
    timestamps: true,
  }
);

PostSchema.methods.likePost = async function (userId: string) {
  try {
    await this.updateOne({ $addToSet: { likes: userId } });
  } catch (error) {
    console.log("Failed to like post", error);
  }
};

PostSchema.methods.unlikePost = async function (userId: string) {
  try {
    await this.updateOne({ $pull: { likes: userId } });
  } catch (error) {
    console.log("Failed to unlike post", error);
  }
};

PostSchema.methods.removePost = async function () {
  try {
    await this.model("Post").deleteOne({ _id: this._id });
  } catch (error) {
    console.log("Failed to remove post", error);
  }
};

PostSchema.methods.commentOnPost = async function (commentToAdd: ICommentBase) {
  try {
    const comment = await Comment.create(commentToAdd);
    this.comments.push(comment._id);
    await this.save();
  } catch (error) {
    console.log("Failed to comment on post", error);
  }
};

PostSchema.methods.getAllComments = async function () {
  try {
    await this.populate({
      path: "comments",

      options: { sort: { createdAt: -1 } }, // sort comments by newest first
    });
    return this.comments;
  } catch (error) {
    console.log("Failed to get all comments", error);
  }
};

PostSchema.statics.getAllPosts = async function () {
  try {
    const posts = await this.find()
      .sort({ createdAt: -1 }) // sort posts by newest first
      .populate({
        path: "comments",

        options: { sort: { createdAt: -1 } }, // sort comments by newest first
      })
      .populate("likes") // take off if you don't want to create like comments schema
      .lean(); // lean() returns a plain JS object instead of a Mongoose document

    return posts.map(
      (post: IPostDocument & { _id: mongoose.Types.ObjectId }) => ({
        ...post,
        _id: post._id.toString(),
        comments: post.comments?.map(
          (comment: IComment & { _id: mongoose.Types.ObjectId }) => ({
            ...comment,
            _id: comment._id.toString(),
          })
        ),
      })
    );
  } catch (error) {
    console.log("Failed to get all posts", error);
  }
};

PostSchema.statics.getPostById = async function (postId: string) {
  try {
    // Validate if postId is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(postId)) {
      console.error("Invalid Post ID format");
      throw new Error("Invalid Post ID");
    }

    const post = await this.findById(postId)
      .populate({
        path: "comments",

        options: { sort: { createdAt: -1 } }, // sort comments by newest first
      }) // populate comments
      .populate("likes") // take off if you don't want to create like comments schema
      .lean(); // lean() returns a plain JS object instead of a Mongoose document

    if (!post) {
      console.log("Post not found in database");
      throw new Error("Post not found");
    }

    // Convert ObjectId to string
    return {
      ...post,
      _id: post._id.toString(),
      comments: post.comments?.map(
        (comment: IComment & { _id: mongoose.Types.ObjectId }) => ({
          ...comment,
          _id: comment._id.toString(),
        })
      ),
    };
  } catch (error) {
    console.log("Failed to get post by id", error);
  }
};
export const Post =
  (models.Post as IPostModel) ||
  mongoose.model<IPostDocument, IPostModel>("Post", PostSchema);
