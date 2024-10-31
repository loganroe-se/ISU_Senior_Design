
import Box from '@mui/material/Box';
import CssBaseline from '@mui/material/CssBaseline';
import Container from '@mui/material/Container';
import PostCard from '../components/PostCard';


export default function Home() {

  const posts = [
    {
      image: "/outfit_1.jpg",
      username: "This is a test brancffdddh",
      caption: "New fall outfit!",
    },
    {
      image: "/outfit_2.jpeg",
      username: "JohnDoe",
      caption: "Ready for winter!",
    },
  
  ];

  return (
    <Box id="feed" sx={{
      display: "flex",
      maxHeight: "95vh",
      overflow: "scroll"
    }}>
      <CssBaseline />

      <Container
        component="main"
        sx={{
          justifyContent: "center",
          flexGrow: 1,
          display: "flex"
        }}
      >
        <div className="post">
          {posts.map((post, index) => (
            <PostCard
              key={index}
              image={post.image}
              username={post.username}
              caption={post.caption}
            />
          ))}
        </div>
      </Container>


    </Box>
  );
}
