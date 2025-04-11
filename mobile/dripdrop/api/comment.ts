import { sendComment } from "../types/sendComment.interface";
import { Comment } from "@/types/Comment";
import { apiRequest } from "./api";

// Fetch comments for a specific post
export const fetchCommentsByPostID = async (postID: number): Promise<Comment[]> => {
  const response = await apiRequest<Comment[]>('GET', `/comment/post/${postID}`);
  return typeof response === 'string' ? [] : response;
};

// Create a new comment
export const createComment = async (
  newComment: sendComment
): Promise<sendComment> => {
  return apiRequest<sendComment>("POST", "/comment", newComment);
};

// Delete a comment by commentID
export const deleteComment = async (commentID: number): Promise<void> => {
  return apiRequest<void>("DELETE", `/comment/${commentID}`);
};
