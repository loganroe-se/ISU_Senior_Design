import { useState } from 'react';
import HomePage from './pages/Layout';
import SignIn from './pages/signIn';
import Box from '@mui/material/Box';

function App() {
  const [isSignedIn, setIsSignedIn] = useState(false);

  const handleSignIn = () => {

    setIsSignedIn(true);
  };

  return (
    <Box sx={{
      margin: '0px !important'
    }}>
      {isSignedIn ? <HomePage /> : <SignIn onSignIn={handleSignIn} />} 
    </Box>
  );
}

export default App;
