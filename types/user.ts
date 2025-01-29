export interface IUser {
  userId: string;
  userImage: string;
  firstName: string;
  lastName?: string;
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
