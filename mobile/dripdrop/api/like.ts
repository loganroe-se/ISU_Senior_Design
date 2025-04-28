import { apiRequest } from './api';

// Like a post
export const likePost = async (postId: number): Promise<void> => {
  return apiRequest<void>('POST', '/like', { postId });
};

// Unlike a post
export const unlikePost = async (postId: number): Promise<void> => {
  return apiRequest<void>('DELETE', '/like', { postId });
};