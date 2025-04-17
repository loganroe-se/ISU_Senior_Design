import { Post } from '@/types/post';
import { apiRequest } from './api';

// Get the feed for a given userID
export const getFeed = async (userID: string): Promise<Post[] | null> => {
    return await apiRequest<Post[] | null>('GET', `/feed/${userID}`);
};