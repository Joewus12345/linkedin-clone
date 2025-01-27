export interface IUser {
  userId: string;
  userImage: string;
  firstName: string;
  lastName?: string;
}

export interface Follower {
  follower: string;
  followerName: string;
  followerImage?: string;
}

export interface Following {
  following: string;
  followingName: string;
  followingImage?: string;
}
