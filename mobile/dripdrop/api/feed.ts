import { FeedPost } from '../types/types';
import { apiRequest } from './api';

// Get the feed for a given userID
export const getFeed = async (userID: String): Promise<FeedPost[] | null> => {
    return await apiRequest<FeedPost[] | null>('GET', `/feed/${userID}`);
};