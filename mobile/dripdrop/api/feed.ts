import { FeedPost } from '@/types/post';
import { apiRequest } from './api';

// Get the feed for a given userID
export const getFeed = async (userID: number): Promise<FeedPost[] | null> => {
    return await apiRequest<FeedPost[] | null>('GET', `/feed/${userID}`);
};