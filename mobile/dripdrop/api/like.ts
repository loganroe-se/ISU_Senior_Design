import { apiRequest } from './api';

// Like a post
export const likePost = async (userId: number, postId: number): Promise<void> => {
  return apiRequest<void>('POST', '/like', { userId, postId });
};

// Unlike a post
export const unlikePost = async (userId: number, postId: number): Promise<void> => {
  return apiRequest<void>('DELETE', '/like', { userId, postId });
};
