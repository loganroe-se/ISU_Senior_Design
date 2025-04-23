import { apiRequest } from './api';

// Create a bookmark
export const createBookmark = async (postId: number): Promise<void> => {
    return apiRequest<void>('POST', '/bookmark', { postId });
};

// Remove a bookmark
export const removeBookmark = async (postId: number): Promise<void> => {
    return apiRequest<void>('DELETE', '/bookmark', { postId });
};

// Get all bookmarks