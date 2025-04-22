import { MarkAsSeen } from "@/types/HasSeen";
import { Post } from "@/types/post";
import { User } from "@/types/user.interface";
import { apiRequest } from "./api";

// Mark posts as seen by a given user
export const markPostsAsSeen = async (seenPosts: MarkAsSeen): Promise<{ message: string }> => {
    return apiRequest<{ message: string }>("POST", "/hasSeen/", seenPosts);
};

// Reset seen posts for a given user
export const resetSeenPosts = async (userID: string): Promise<{ message: string }> => {
    return apiRequest<{ message: string }>("DELETE", `/hasSeen/${userID}/resetSeen`);
};

// Get seen posts for a given user
export const getSeenPosts = async (userID: string): Promise<Post[]> => {
    return apiRequest<Post[]>("GET", `/hasSeen/${userID}/seenPosts`);
};

// Get users who have seen a post
export const getUsersSeen = async (postID: number): Promise<User[]> => {
    return apiRequest<User[]>("GET", `/hasSeen/seenUsers/${postID}`);
};