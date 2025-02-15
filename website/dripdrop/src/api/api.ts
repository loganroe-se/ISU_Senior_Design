import { Following, User, Post, sendPost, Comment } from '../types';

// Fetch all posts
export const fetchPosts = async (): Promise<Post[]> => {
  try {
    const response = await fetch('https://api.dripdropco.com/posts/');
    if (!response.ok) {
      throw new Error('Failed to fetch posts');
    }
    const data: Post[] = await response.json(); // Cast the response to an array of posts
    return data;
  } catch (error) {
    if (error instanceof Error) {
      console.error('Failed to fetch posts:', error.message);
      throw error; // Re-throw the error to handle it in the calling component
    }
    throw new Error('Unknown error occurred while fetching posts');
  }
};

// Fetch user by userID to get the username
export const fetchUserById = async (userID: number): Promise<string | null> => {
  try {
    const response = await fetch(`https://api.dripdropco.com/users/${userID}`);
    if (!response.ok) {
      throw new Error('Failed to fetch user');
    }
    const userData = await response.json();
    return userData.username; // Return the username
  } catch (error) {
    console.error('Error fetching user:', error);
    return null; // Return null if user fetching fails
  }
};

// Fetch user by userID to get the username
export const fetchUserEmail = async (userID: number): Promise<string | null> => {
  try {
    const response = await fetch(`https://api.dripdropco.com/users/${userID}`);
    if (!response.ok) {
      throw new Error('Failed to fetch user');
    }
    const userData = await response.json();
    return userData.email; // Return the user
  } catch (error) {
    console.error('Error fetching user:', error);
    return null; // Return null if user fetching fails
  }
};

// Create a new post
export const createPost = async (newPost: sendPost): Promise<sendPost> => {
  try {
    const response = await fetch('https://api.dripdropco.com/posts/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(newPost), // Send the new post as JSON
    });

    if (!response.ok) {
      throw new Error('Failed to create post');
    }

    const createdPost: sendPost = await response.json();
    return createdPost; // Return the newly created post
  } catch (error) {
    console.error('Error creating post:', error);
    throw error; // Re-throw the error to be handled in the calling component
  }
};

// Fetch user by username
export const fetchUserByUsername = async (username: string): Promise<User> => {
  try {
    const response = await fetch(`https://api.dripdropco.com/users/username/${username}`);
    if (!response.ok) {
      throw new Error('Failed to fetch user');
    }
    const userData = await response.json();
    return userData; // Return the user
  } catch (error) {
    console.error('Error fetching user:', error);
    return {} as User; // Return null if user fetching fails
  }
};

// Fetch user following list by userID
export const fetchFollowing = async (userID: number): Promise<Following[]> => {
  try {
    const response = await fetch(`https://api.dripdropco.com/follow/${userID}/following`);
    if (!response.ok) {
      throw new Error('Failed to fetch following list');
    }
    const following = await response.json();

    return following; // Return the following list
  } catch (error) {
    console.error('Error fetching following list:', error);
    return []; // Return null if follow fetching fails
  }
};

//Follow user
export const followUser = async (followerID: number, followingID: number): Promise<string> => {
  try {
    const response = await fetch('https://api.dripdropco.com/follow', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },

      body: JSON.stringify({
        followerId: followerID.toString(),
        followedId: followingID.toString(),
      }),
    });

    if (!response.ok) {
      throw new Error(`Error status: ${response.status}`);
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
};

//Unfollow user
export const unfollowUser = async (followerID: number, followingID: number): Promise<string> => {
  try {
    const response = await fetch('https://api.dripdropco.com/follow', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        followerId: followerID.toString(),
        followedId: followingID.toString(),
      }),
    });

    if (!response.ok) {
      throw new Error(`Error status: ${response.status}`);
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
};

// Like a post
export const likePost = async (userId: number, postId: number): Promise<void> => {
  try {
    const response = await fetch('https://api.dripdropco.com/like', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userId, postId }),
    });

    if (!response.ok) {
      throw new Error('Failed to like post');
    }
  } catch (error) {
    console.error('Error liking post:', error);
    throw error;
  }
};

// Unlike a post
export const unlikePost = async (userId: number, postId: number): Promise<void> => {
  try {
    const response = await fetch('https://api.dripdropco.com/like', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userId, postId }),
    });

    if (!response.ok) {
      throw new Error('Failed to unlike post');
    }
  } catch (error) {
    console.error('Error unliking post:', error);
    throw error;
  }
};
// Fetch comments for a specific post
export const fetchCommentsByPostID = async (postID: number): Promise<Comment[]> => {
  try {
    console.log('POST ID ' + postID);
    const response = await fetch(`https://api.dripdropco.com/comment/post/${postID}`);
    if (!response.ok) {
      throw new Error(`Error fetching comments: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error(error);
    throw error;
  }
};

// Create a new comment
export const createComment = async (
  userId: number,
  postId: number,
  content: string
): Promise<Comment> => {
  try {
    const response = await fetch(`https://api.dripdropco.com/comment`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userId, postId, content }),
    });

    if (!response.ok) {
      throw new Error(`Error creating comment: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error(error);
    throw error;
  }
};

// Delete a comment by commentID
export const deleteComment = async (commentID: number): Promise<void> => {
  try {
    const response = await fetch(`https://api.dripdropco.com/comment/${commentID}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error(`Error deleting comment: ${response.statusText}`);
    }
  } catch (error) {
    console.error(error);
    throw error;
  }
};
