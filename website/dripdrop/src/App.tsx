import { useState } from 'react';
import HomePage from './pages/homePage';
import SignIn from './pages/signIn';
import Box from '@mui/material/Box';

function App() {
  const [isSignedIn, setIsSignedIn] = useState(false);

  const handleSignIn = () => {
    // This is where you would handle authentication logic
    setIsSignedIn(true); // Set to true to show the HomePage
  };

  return (
    <Box>
      {isSignedIn ? <HomePage /> : <SignIn onSignIn={handleSignIn} />}
    </Box>
  );
}

export default App;
