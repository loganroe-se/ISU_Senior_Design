import { useState } from 'react';
import HomePage from './pages/Home';
import SignIn from './pages/signIn';
import Box from '@mui/material/Box';

function App() {
  const [isSignedIn, setIsSignedIn] = useState(false);

  const handleSignIn = () => {
    // This is where we can handle authentication logic
    setIsSignedIn(true);
  };

  return (
    <Box>
      {isSignedIn ? <HomePage /> : <SignIn onSignIn={handleSignIn} />}
    </Box>
  );
}

export default App;
