import { getBookmarks } from "@/api/bookmark";
import { useState, useEffect } from "react";
import { Post } from "@/types/post";
import { PostGrid } from "../profile/_components/PostGrid";
import { router } from "expo-router";
import { View, Text, ActivityIndicator } from "react-native";
import { Colors } from "@/constants/Colors";

const Bookmarks = () => {
    const [posts, setPosts] = useState<Post[]>([]);
    const [subPage, setSubPage] = useState("PUBLIC");
    const [isLoading, setIsLoading] = useState(true);


    useEffect(() => {
        const fetchBookmarks = async () => {
            setIsLoading(true);

            let bookmarks = await getBookmarks();
            
            if(bookmarks != null && bookmarks.length > 0) {
                setPosts(bookmarks);
            }
            setIsLoading(false);
        }

        fetchBookmarks();
    },[])

    return (
        <View>
            <Text style={{textAlign: "center", fontSize: 24, fontWeight: "bold", marginTop: 16, marginBottom: 32}}>Bookmarks</Text>
            {isLoading ? (
                <ActivityIndicator size="large" style={{ marginTop: 50 }} color={Colors.light.primary} />
            ) : (
                <PostGrid
                    posts={posts}
                    onPressPost={(post) => {
                        router.push({
                            pathname: "../authenticated/posts/viewposts",
                            params: {
                                postID: post.postID.toString(),
                                tab: subPage,
                                userID: post?.uuid,
                                posts: encodeURIComponent(JSON.stringify(posts)),
                                header: "Bookmarks",
                            },
                        });
                    }}
                />
            )}
        </View>
    );
}

export default Bookmarks;