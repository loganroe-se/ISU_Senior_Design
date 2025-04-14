import { Text, View, Alert, Image, FlatList, ActivityIndicator, Dimensions, TouchableOpacity, TextInput, NativeSyntheticEvent, NativeScrollEvent, LayoutChangeEvent, Button, AppState, Switch } from "react-native";
import React, { useState, useEffect, useRef } from "react";
import { useUserContext } from "@/context/UserContext";
import { getFeed } from "@/api/feed";
import { markPostsAsSeen, resetSeenPosts } from "@/api/has_seen";
import { FeedPost } from "@/types/post";
import { Comment } from "@/types/Comment";
import { profileStyle } from "@/styles/profile";
import { feedStyle } from "@/styles/feed";
import { Marker } from "@/types/Marker";
import { fetchMarkers, getItemDetails } from "@/api/items";
import { Item } from "@/types/Item";
import LikeCommentBar from "@/components/LikeCommentBar";
import CommentModal from "@/components/CommentModal";
import DraggableItemModal from "@/components/DraggableItemModal";
import { Colors } from "@/constants/Colors";

const windowWidth = Dimensions.get('window').width * 0.95;
const windowHeight = Dimensions.get('window').height;
const navbarHeight = 40; // TODO: change this to either dynamic or change it when the navbar is changed
const headerHeight = 40;

const Page = () => {
  const { user } = useUserContext();
  const [userID, setUserID] = useState<string | null>(null);
  const [feedData, setFeedData] = useState<FeedPost[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [loadingComments, setLoadingComments] = useState<boolean>(false);
  const [loadingAddComment, setLoadingAddComment] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [imageDimensions, setImageDimensions] = useState<{ [key: number]: number }>({});
  const [imageErrors, setImageErrors] = useState< { [key: number]: boolean }>({});
  const [commentModalVisible, setCommentModalVisible] = useState(false);
  const [currentPostID, setCurrentPostID] = useState<number | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentText, setCommentText] = useState("");
  const commentInputRef = useRef<TextInput | null>(null);
  const [seenPosts, setSeenPosts] = useState(new Set<number>());
  const [postPositions, setPostPositions] = useState<{ [postID: number]: { y: number; height: number } }>({});
  const [isFetching, setIsFetching] = useState(false);
  const [hasSeenPosts, setHasSeenPosts] = useState(false);
  const [noMorePosts, setNoMorePosts] = useState(false);
  const [expandedCaptions, setExpandedCaptions] = useState<{ [key: number]: boolean }>({});
  const [areMarkersVisible, setAreMarkersVisible] = useState<{ [postID: number]: boolean }>({});
  const [markersMap, setMarkersMap] = useState<Record<number, Marker[]>>({});
  const [itemDetailsMap, setItemDetailsMap] = useState<Record<number, Item>>({});
  const [visibleItemModal, setVisibleItemModal] = useState<{ postID: number; clothingItemID: number } | null>(null);
  const [activeClothingItemID, setActiveClothingItemID] = useState<number>(0);


  useEffect(() => {
    const getUserData = async () => {
      try {
        const storedUserID = user?.uuid;

        // Set them to state if they exist
        if (storedUserID) {
          setUserID(storedUserID);
        } else {
          Alert.alert("No user data", "User is not logged in.");
        }
      } catch (error) {
        console.error("Error retrieving data", error);
        Alert.alert("Error", "Failed to load user data.");
      }
    };

    getUserData();
  }, []); // Empty array ensures this effect runs only once when the component mounts

  // Get the feed data
  useEffect(() => {
    if (userID) {
      setLoading(true);
      getFeed(userID)
        .then((data) => {
          if (data) {
            setFeedData(data);
          } else {
            setError('Failed to fetch feed');
          }
          setLoading(false);
        }).catch(() => {
          setError('Failed to fetch feed');
          setLoading(false);
        });
    }
  }, [userID]);

  // Update markers when feed data is changed
  useEffect(() => {
    const loadMarkers = async () => {
      const newMarkersMap: Record<number, Marker[]> = {};
      const allItemIDs = new Set<number>();

      await Promise.all(feedData.map(async (post) => {
        try {
          const markers = await fetchMarkers(post.postID);
          if (markers.length > 0) {
            newMarkersMap[post.postID] = markers;
          }

          markers.forEach(marker => allItemIDs.add(marker.clothingItemID));
        } catch (error) {
          console.error("Failed to fetch markers for post ", post.postID);
        }
      }));
      
      setMarkersMap(newMarkersMap);

      // Fetch item details for all unique IDs that aren't already in the map
      const idsToFetch = Array.from(allItemIDs).filter(id => !itemDetailsMap[id]);
  
      if (idsToFetch.length > 0) {
        try {
          const fetched = await getItemDetails(idsToFetch);
    
          if (fetched) {
            const newMap = { ...itemDetailsMap };
            if (Array.isArray(fetched)) {
              fetched.forEach(item => {
                newMap[item.clothingItemID] = item;
              });
            }
            setItemDetailsMap(newMap);
          }
        } catch (error) {
          console.error("Failed to fetch item details: ", error);
        }
      }
    };
    
    if (feedData.length > 0) loadMarkers();
  }, [feedData]);

  // // Ensure posts get marked as seen once the app is closed/minimized --- TODO: Does not properly track posts seen so this does not work yet
  // useEffect(() => {
  //   const appStateListener = AppState.addEventListener('change', (nextAppState) => {
  //     console.log(nextAppState);
  //     if (nextAppState === 'background' || nextAppState === 'inactive') {
  //       if (seenPosts.size > 0) {
  //         console.log(Array.from(seenPosts));
  //         markPostsAsSeen({ userID: Number(userID), postIDs: Array.from(seenPosts) });
  //       }
  //     }
  //   });

  //   return () => {
  //     appStateListener.remove();
  //   };
  // }, [seenPosts]);

  // See more/less of a caption
  const toggleCaption = (postID: number) => {
    setExpandedCaptions(prev => ({
      ...prev,
      [postID]: !prev[postID]
    }));
  };

  // Keep track of seen posts
  const onScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const scrollY = event.nativeEvent.contentOffset.y;
    const screenHeight = event.nativeEvent.layoutMeasurement.height;

    Object.entries(postPositions).forEach(([postID, { y, height }]) => {
      const postBottom = y + height;
      if (postBottom <= scrollY + screenHeight) {
        setSeenPosts((prev) => new Set(prev).add(Number(postID)));
      }
    });

    // Check if at the bottom
    const contentHeight = event.nativeEvent.contentSize.height;
    if (scrollY + screenHeight >= contentHeight - 50 && !isFetching && !hasSeenPosts) {
      if (seenPosts.size > 0 && userID) {
        markPostsAsSeen({ postIDs: Array.from(seenPosts) });
        setHasSeenPosts(true);
      }
      getNewPosts();
    }
  };

  // Get new posts
  const getNewPosts = async () => {
    if (isFetching) return;
    if ((userID ?? 0) === 0) return;

    setIsFetching(true);

    try {
      if (userID) {
        getFeed(userID)
          .then((data) => {
            if (data) {
              setFeedData((prev) => {
                const newPostIDs = data.map((p) => p.postID);
                const existingPostIDs = prev.map((p) => p.postID);
                if (newPostIDs.length > 0 && !newPostIDs.every(id => existingPostIDs.includes(id))) {
                  setNoMorePosts(false);
                  setHasSeenPosts(false)
                } else {
                  setNoMorePosts(true);
                }
                const uniquePosts = [
                  ...prev,
                  ...data.filter((newPost) => !existingPostIDs.includes(newPost.postID)),
                ];
                return uniquePosts
              });
              setLoading(false);
            } else {
              setError('Failed to fetch feed');
            }
          }).catch(() => {
            setError('Failed to fetch feed');
          });
      }
    } catch (error) {
      console.error("Error fetching new posts:", error);
    }

    setIsFetching(false);
  };

  // Get image dimensions dynamically
  const onImageLayout = (postID: number, imageURL: string) => {
    Image.getSize(imageURL, (width, height) => {
      const ratio = windowWidth / width;
      const calculatedHeight = height * ratio;

      setImageDimensions(prevState => ({
        ...prevState,
        [postID]: calculatedHeight,
      }));
    }, () => {
      // If it fails to get a size, there was an error
      setImageErrors(prevState => ({
        ...prevState,
        [postID]: true,
      }));
    });
  };

  // Define an onImageError function
  const onImageError = (postID: number) => {
    setImageErrors(prevState => ({
      ...prevState,
      [postID]: true,
    }));
  };

  // Handle the post layout
  const handleLayout = (postID: number, event: LayoutChangeEvent) => {
    event.persist();
    if (!event.nativeEvent.layout) return;

    setPostPositions((prev) => ({
      ...prev,
      [postID]: {
        y: event.nativeEvent.layout.y,
        height: event.nativeEvent.layout.height,
      },
    }));
  };

  // Toggle markers on/off for a given post
  const toggleMarkers = (postID: number) => {
    setAreMarkersVisible(prev => ({
      ...prev,
      [postID]: !prev[postID],
    }));
  };

  // Show the clothing item details
  const showItemDetails = async (postID: number, clothingItemID: number) => {
    if (itemDetailsMap[clothingItemID]) {
      setVisibleItemModal({ postID, clothingItemID });
      setActiveClothingItemID(clothingItemID);
    }
  };

  // Reset feed
  const resetFeed = async () => {
    if (!userID) return;
    setFeedData([]);
    setHasSeenPosts(false);
    setNoMorePosts(false);
    setLoading(true);

    try {
      await resetSeenPosts(userID);
      setExpandedCaptions({});
      setSeenPosts(new Set());
      setPostPositions({});

      getNewPosts();
    } catch (error) {
      console.error("Error resetting feed:", error);
    }
  };

  return (
    <View style={profileStyle.feedContainer}>
      {/* Header */}
      <View style={[feedStyle.header, {height: headerHeight}]}>
        <Text style={feedStyle.headerText}>dripdrop</Text>
      </View>

      {loading  ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : error ? (
        <Text style={feedStyle.text}>{error}</Text>
      ) : (
        <View style={{ flex: 1 }}>
          <FlatList 
            contentContainerStyle={{ paddingTop: headerHeight, paddingBottom: navbarHeight }}
            data={feedData}
            keyExtractor={(item) => item.postID.toString()}
            onScroll={onScroll}
            scrollEventThrottle={16}
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) => {
              const imageHeight = imageDimensions[item.postID];
              const imageURL = item.images && item.images[0]?.imageURL ? `https://cdn.dripdropco.com/${item.images[0].imageURL}?format=png`: "";
  
              return (
                <View style={feedStyle.feedItem} onLayout={(event) => handleLayout(item.postID, event)}>
                  {/* Display the poster's username */}
                  <Text style={feedStyle.username}>{item.username}</Text>
  
                  {/* Display the post's image */}
                  {imageErrors[item.postID] || !(item.images && item.images[0]?.imageURL) ? (
                    <View style={feedStyle.imageErrorBox}>
                      <Text style={feedStyle.imageErrorText}>There was an error loading the image.</Text>
                    </View>
                  ) : (
                    item.images && item.images[0]?.imageURL && (
                      <View style={{ position: 'relative' }}>
                        <Image
                          source={{ uri: imageURL }}
                          style={[feedStyle.image, { width: windowWidth, height: imageHeight || undefined, resizeMode: 'contain' }]}
                          onLoad={() => onImageLayout(item.postID, imageURL)}
                          onError={() => onImageError(item.postID)}
                        />

                        {/* Toggle Markers Button */}
                        {markersMap[item.postID] && (
                          <View style={feedStyle.markerToggleContainer}>
                            <Switch 
                              value={!!areMarkersVisible[item.postID]}
                              onValueChange={() => toggleMarkers(item.postID)}
                              trackColor={{ false: "black", true: "blue" }}
                            />
                          </View>
                        )}

                        {/* Display the markers on each post */}
                        {areMarkersVisible[item.postID] && markersMap[item.postID]?.filter(marker => itemDetailsMap[marker.clothingItemID]).map((marker) => {
                          const scaleX = windowWidth;
                          const scaleY = imageHeight || 1;
                          
                          const x = marker.xCoord * scaleX;
                          const y = marker.yCoord * scaleY;

                          return (
                            <TouchableOpacity
                              key={`${item.postID}-${marker.clothingItemID}`}
                              onPress={() => {showItemDetails(item.postID, marker.clothingItemID)}}
                              style={[feedStyle.marker, {left: x, top: y, backgroundColor: marker.clothingItemID === activeClothingItemID ? Colors.light.primary : "rgba(255, 255, 255, 0.8)"}]}
                            >
                              <Text style={{ fontSize: 16 }}>•</Text>
                            </TouchableOpacity>
                          );
                        })}
                      </View>
                    )
                  )}
  
                  {/* Buttons for liking and commenting */}
                  <LikeCommentBar 
                    feedData={feedData}
                    setFeedData={setFeedData}
                    userID={userID ? userID : ""}
                    item={item}
                    setCurrentPostID={setCurrentPostID}
                    setCommentModalVisible={setCommentModalVisible}
                    setLoadingComments={setLoadingComments}
                    setComments={setComments}
                  />
  
                  {/* Display the username & caption */}
                  <Text style={feedStyle.caption} numberOfLines={expandedCaptions[item.postID] ? undefined : 3} ellipsizeMode="tail">
                    <Text style={feedStyle.usernameInline}>{item.username}</Text> {item.caption}
                  </Text>
                  {item.caption.length > 100 && (
                    <TouchableOpacity onPress={() => toggleCaption(item.postID)}>
                      <Text style={feedStyle.showMoreText}>
                        {expandedCaptions[item.postID] ? "Show less" : "Show more"}
                      </Text>
                    </TouchableOpacity>
                  )}
  
                  {/* Display the post date */}
                  <Text style={feedStyle.date}>{item.createdDate}</Text>
                </View>
              );
            }}
            ListFooterComponent={
              noMorePosts ? (
                <View style={feedStyle.noMorePostsMessage}>
                  <Text style={feedStyle.noMorePostsMessageText}>There are no more new posts to view. Would you like to reset your feed?</Text>
                  <Button title="Reset Feed" onPress={resetFeed} />
                </View>
              ) : null
            }
          />

          {/* There are no posts, ask if the user wants to reset feed */}
          {feedData.length === 0 && <View
            style={{ justifyContent: "center", alignItems: "center", minHeight: windowHeight }}
          >
            <Text style={feedStyle.noMorePostsMessageText}>There are no more new posts to view. Would you like to reset your feed?</Text>
            <Button title="Reset Feed" onPress={resetFeed} />
          </View>}

          {/* Comment Modal */}
          <CommentModal 
            userID={userID ? userID : ""}
            commentInputRef={commentInputRef}
            commentText={commentText}
            setCommentText={setCommentText}
            currentPostID={currentPostID}
            setCurrentPostID={setCurrentPostID}
            commentModalVisible={commentModalVisible}
            setCommentModalVisible={setCommentModalVisible}
            loadingComments={loadingComments}
            setLoadingComments={setLoadingComments}
            comments={comments}
            setComments={setComments}
            loadingAddComment={loadingAddComment}
            setLoadingAddComment={setLoadingAddComment}
            setFeedData={setFeedData}
          />

          {/* Draggable Item Modal */}
          <DraggableItemModal 
            visibleItemModal={visibleItemModal}
            onClose={() => {setVisibleItemModal(null); setActiveClothingItemID(0)}}
            onChangeIndex={(newClothingItemID) => {
              setActiveClothingItemID(newClothingItemID)
              setVisibleItemModal((prev) => 
                prev ? { postID: prev.postID, clothingItemID: newClothingItemID } : null
              )
            }}
            markersMap={markersMap}
            itemDetailsMap={itemDetailsMap}
          />
        </View>
      )}
    </View>
  );
};

export default Page;