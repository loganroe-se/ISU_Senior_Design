// components/PostGrid.tsx
import React from "react";
import { FlatList, Image, TouchableOpacity } from "react-native";
import { Post } from "@/types/post";
import { profileStyle } from "./profileStyle";

interface Props {
  posts: Post[];
  onPressPost?: (post: Post) => void;
}

export const PostGrid: React.FC<Props> = ({ posts, onPressPost }) => (
  <FlatList
    data={posts}
    keyExtractor={(item) => item.postID.toString()}
    numColumns={3}
    contentContainerStyle={profileStyle.gridContainer}
    renderItem={({ item }) =>
      item.images[0]?.imageURL ? (
        <TouchableOpacity
          style={profileStyle.postContainer}
          onPress={() => onPressPost?.(item)}
        >
          <Image
            source={{ uri: `https://cdn.dripdropco.com/${item.images[0].imageURL}?format=png` }}
            style={profileStyle.postImage}
          />
        </TouchableOpacity>
      ) : null
    }
  />
);
