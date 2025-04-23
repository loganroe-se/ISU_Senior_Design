import { getBookmarks } from "@/api/bookmark";
import { useState, useEffect } from "react";
import { Post } from "@/types/post";
import { PostGrid } from "../profile/_components/PostGrid";
import { router } from "expo-router";
import { useUserContext } from "@/context/UserContext";
import { View, Text } from "react-native";

const Bookmarks = () => {
    const [posts, setPosts] = useState<Post[]>([]);
    const [subPage, setSubPage] = useState("PUBLIC");

    const { user, signOut } = useUserContext();

    useEffect(() => {
        const fetchBookmarks = async () => {
            let bookmarks = await getBookmarks();
            
            if(bookmarks != null && bookmarks.length > 0) {
                setPosts(bookmarks);
            }
        }

        fetchBookmarks();
    },[])

    return (
        <View>
            <Text style={{textAlign: "center", fontSize: 24, fontWeight: "bold", marginTop: 16, marginBottom: 32}}>Bookmarks</Text>
            <PostGrid
                posts={posts}
                onPressPost={(post) => {
                    router.push({
                        pathname: "../authenticated/posts/viewposts",
                        params: {
                            postID: post.postID.toString(),
                            tab: subPage,
                            userID: post?.uuid, // Needed to fetch scoped posts
                            posts: encodeURIComponent(JSON.stringify(posts)),
                        },
                    });
                }}
            />
        </View>
    );
}

export default Bookmarks;