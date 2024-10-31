import { useState } from 'react';
import HomePage from './pages/Layout';
// import SignIn from './pages/signIn';
import Box from '@mui/material/Box';
import './styles/app.css';

function App() {
  const [isSignedIn] = useState(false);

  // const handleSignIn = () => {
  //   // This is where we can handle authentication logic
  //   setIsSignedIn(true);
  // };

  return (
    <Box sx={{
      margin: '0px !important'
    }}>
      {/* This is commented out for dev purposes.
       Uncomment this line and comment the line below it to have the sign and signup screens be present
      {isSignedIn ? <HomePage /> : <SignIn onSignIn={handleSignIn} />}  */}
      {isSignedIn ? <HomePage /> : <HomePage />}
    </Box>
  );
}

export default App;
