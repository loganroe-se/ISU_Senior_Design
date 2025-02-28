import { Text, StyleSheet, View, Alert, Image, FlatList, ActivityIndicator, Dimensions } from 'react-native';
import React, { useState, useEffect } from "react";
import NavScreen from './NavScreen';
import AsyncStorage from '@react-native-async-storage/async-storage'; // Import AsyncStorage
import { getFeed } from '../../__lib/api';
import Icon from 'react-native-vector-icons/FontAwesome'

const windowWidth = Dimensions.get('window').width * 0.95;

export default function Home({ }) {
  const [email, setEmail] = useState<string | null>(null);
  const [username, setUsername] = useState<string | null>(null);
  const [userID, setUserID] = useState<number | null>(null);
  const [feedData, setFeedData] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [imageDimensions, setImageDimensions] = useState<{ [key: number]: number }>({});


  useEffect(() => {
    const getUserData = async () => {
      try {
        const storedEmail = await AsyncStorage.getItem('email');
        const storedUsername = await AsyncStorage.getItem('username');
        const storedUserID = await AsyncStorage.getItem('userID');

        // Set them to state if they exist
        if (storedEmail && storedUsername && storedUserID) {
          setEmail(storedEmail);
          setUsername(storedUsername);
          setUserID(parseInt(storedUserID));
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

  // Set the loading symbol
  if (loading) {
    return (
      <NavScreen>
        <View style={styles.container}>
          <ActivityIndicator size="large" color="#0000ff" />
        </View>
      </NavScreen>
    );
  }

  // Set the error if there is one
  if (error) {
    return (
      <NavScreen>
        <View style={styles.container}>
          <Text style={styles.text}>{error}</Text>
        </View>
      </NavScreen>
    );
  }

  // Handle a like
  const handleLike = (postID: number) => {
    // TODO
  };

  // Handle a comment
  const handleComment = (postID: number) => {
    // TODO
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
    });
  };

  return (
    <NavScreen>
      <View style={styles.container}>
          {/* Render the feed */}
          <FlatList 
            data={feedData}
            keyExtractor={(item) => item.postID.toString()}
            renderItem={({ item }) => {
              const imageHeight = imageDimensions[item.postID];

              return (
                <View style={styles.feedItem}>
                  {/* Display the poster's username */}
                  <Text style={styles.username}>{item.username}</Text>

                  {/* Display the post's image */}
                  {item.images && item.images[0]?.imageURL && (
                    <Image
                      source={{ uri: `https://cdn.dripdropco.com/${item.images[0].imageURL}?format=png` }}
                      style={[styles.image, { width: windowWidth, height: imageHeight || undefined, resizeMode: 'contain' }]}
                      onLoad={() => onImageLayout(item.postID, `https://cdn.dripdropco.com/${item.images[0].imageURL}?format=png`)}
                    />
                  )}

                  {/* Buttons for liking and commenting */}
                  <View style={styles.buttonContainer}>
                    <Icon 
                      name="heart"
                      size={30}
                      color={item.userHasLiked ? 'red' : 'gray'}
                      onPress={() => handleLike(item.postID)}
                      style={styles.button}
                    />
                    <Icon 
                      name="comment"
                      size={30}
                      color="gray"
                      onPress={() => handleComment(item.postID)}
                      style={styles.button}
                    />
                  </View>

                  {/* Display the caption */}
                  <Text style={styles.caption}>{item.caption}</Text>

                  {/* Display the post date */}
                  <Text style={styles.date}>{item.createdDate}</Text>
                </View>
              );
            }}
          />
      </View>
    </NavScreen>
  );
};


const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },
  text: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  username: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  feedItem: {
    marginBottom: 15,
    padding: 10,
    backgroundColor: '#f2f2f2',
    borderRadius: 8,
    width: '100%'
  },
  image: {
    borderRadius: 8,
    marginBottom: 10,
  },
  caption: {
    fontSize: 16,
    marginBottom: 5,
  },
  date: {
    fontSize: 14,
    color: 'gray',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    marginBottom: 10,
    marginLeft: 5,
  },
  button: {
    marginRight: 20,
  },
});