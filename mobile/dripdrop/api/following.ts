import { User, Following } from '../types/types';
import { apiRequest } from './api';

// Fetch user by username
export const fetchUserByUsername = async (username: string): Promise<User> => {
  return apiRequest<User>('GET', `/users/username/${username}`);
};

// Fetch user following list by userID
export const fetchFollowing = async (userID: number): Promise<Following[]> => {
  return apiRequest<Following[]>('GET', `/follow/${userID}/following`);
};


// Follow user
export const followUser = async (followerID: number, followingID: number): Promise<string> => {
  const payload = {
    followerId: followerID.toString(),
    followedId: followingID.toString(),
  };
  return apiRequest<string>('POST', '/follow', payload);
};

// Unfollow user
export const unfollowUser = async (followerID: number, followingID: number): Promise<string> => {
  const payload = {
    followerId: followerID.toString(),
    followedId: followingID.toString(),
  };
  return apiRequest<string>('DELETE', '/follow', payload);
};
