import { sendComment } from '../types/sendComment.interface';
import { Comment } from '../types/types';
import { apiRequest } from './api';

// Fetch comments for a specific post
export const fetchCommentsByPostID = async (postID: number): Promise<Comment[]> => {
  return apiRequest<Comment[]>('GET', `/comment/post/${postID}`);
};

// Create a new comment
export const createComment = async (newComment: sendComment): Promise<sendComment> => {
  console.log('Sending comment data:', newComment);
  return apiRequest<sendComment>('POST', '/comment', newComment);
};

// Delete a comment by commentID
export const deleteComment = async (commentID: number): Promise<void> => {
  return apiRequest<void>('DELETE', `/comment/${commentID}`);
};
