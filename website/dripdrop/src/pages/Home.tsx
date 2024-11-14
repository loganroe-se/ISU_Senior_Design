// import React, { useEffect, useState } from 'react';
// import Box from '@mui/material/Box';
// import CssBaseline from '@mui/material/CssBaseline';
// import Container from '@mui/material/Container';
// import CircularProgress from '@mui/material/CircularProgress'; // Import CircularProgress
// import PostCard from '../components/PostCard';

// interface Post {
//   postID: number;
//   userID: string | null;
//   caption: string;
//   createdDate: string | null;
// }

// export default function Home() {
//   const [posts, setPosts] = useState<Post[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);

//   useEffect(() => {
//     const fetchPosts = async () => {
//       try {
//         const response = await fetch('https://api.dripdropco.com/posts/');
//         if (!response.ok) {
//           throw new Error('Network response was not ok');
//         }
//         const data: Post[] = await response.json();
//         setPosts(data);
//       } catch (err) {
//         setError('Failed to fetch posts');
//         console.error(err);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchPosts();
//   }, []);

//   if (loading) {
//     return (
//       <Box
//         sx={{
//           display: 'flex',
//           justifyContent: 'center',
//           alignItems: 'center',
//           height: '100vh',
//         }}
//       >
//         <CircularProgress /> {/* Circular loading indicator */}
//       </Box>
//     );
//   }

//   if (error) {
//     return <div>{error}</div>;
//   }

//   return (
//     <Box
//       id="feed"
//       sx={{
//         display: 'flex',
//         maxHeight: '95vh',
//         overflow: 'scroll',
//       }}
//     >
//       <CssBaseline />
//       <Container
//         component="main"
//         sx={{
//           justifyContent: 'center',
//           flexGrow: 1,
//           display: 'flex',
//         }}
//       >
//         <div className="post">
//           {posts.map((post, index) => (
//             <PostCard
//               key={post.postID || index}
//               image="/default_image.jpg"
//               username={post.userID || 'Anonymous'}
//               caption={post.caption || 'No caption provided'}
//             />
//           ))}
//         </div>
//       </Container>
//     </Box>
//   );
// }

import React from 'react';
import Box from '@mui/material/Box';
import CssBaseline from '@mui/material/CssBaseline';
import Container from '@mui/material/Container';
import Feed from '../components/Feed'; // Import the Feed component

export default function Home() {
  return (
    <Box
      id="feed"
      sx={{
        display: 'flex',
        maxHeight: '95vh',
        overflow: 'scroll',
      }}
    >
      <CssBaseline />
      <Container
        component="main"
        sx={{
          justifyContent: 'center',
          flexGrow: 1,
          display: 'flex',
        }}
      >
        <Feed /> {/* Include the Feed component */}
      </Container>
    </Box>
  );
}
