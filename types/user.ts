export interface IUser {
  userId: string;
  userImage: string;
  firstName: string;
  lastName?: string;
}

export interface IUserExtended extends IUser {
  email?: string | { address: string; verified: boolean };
}

export interface Follower {
  follower: string;
  followerFirstName: string;
  followerLastName: string;
  followerImage?: string;
}

export interface Following {
  following: string;
  followingFirstName: string;
  followingLastName: string;
  followingImage?: string;
}

export const BASE_URL =
  process.env.NODE_ENV !== "development"
    ? `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`
    : "http://localhost:3000";
