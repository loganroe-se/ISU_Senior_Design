import { Following, Follower } from "@/types/Following";
import { BasicUserData, User } from "@/types/user.interface";
import { apiRequest } from "./api";

// Fetch user by username
export const fetchUserByUsername = async (username: string): Promise<User> => {
  return apiRequest<User>("GET", `/users/username/${username}`);
};

// Full list of followers
export const fetchFollowersList = async (userID: string): Promise<BasicUserData[]> => {
  return apiRequest<BasicUserData[]>("GET", `/follow/${userID}/followers`);
};

// Full list of following
export const fetchFollowingList = async (userID: string): Promise<BasicUserData[]> => {
  return apiRequest<BasicUserData[]>("GET", `/follow/${userID}/following`);
};


// New version:
export const fetchFollowingCount = async (
  userID: string,
  checkFollow: boolean = false
): Promise<number | { is_following: boolean }> => {
  const query = checkFollow
    ? `checkFollow=true`
    : `countOnly=true`;

  const res = await apiRequest<any>(
    "GET",
    `/follow/${userID}/following?${query}`
  );

  return checkFollow ? res : res.following_count;
};

export const fetchFollowerCount = async (userID: string): Promise<number> => {
  const res = await apiRequest<{ follower_count: number }>(
    "GET",
    `/follow/${userID}/followers?countOnly=true`
  );
  return res.follower_count;
};

// Follow user
export const followUser = async (
  followerID: string,
  followingID: string
): Promise<string> => {
  const payload = {
    followerId: followerID.toString(),
    followedId: followingID.toString(),
  };
  return apiRequest<string>("POST", "/follow", payload);
};

// Unfollow user
export const unfollowUser = async (
  followerID: string,
  followingID: string
): Promise<string> => {
  const payload = {
    followerId: followerID.toString(),
    followedId: followingID.toString(),
  };
  return apiRequest<string>("DELETE", "/follow", payload);
};
