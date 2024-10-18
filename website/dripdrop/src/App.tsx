import { useState } from 'react';
import HomePage from './pages/Layout';
import SignIn from './pages/signIn';
import Box from '@mui/material/Box';
import './styles/app.css';

function App() {
  const [isSignedIn, setIsSignedIn] = useState(false);

  const handleSignIn = () => {
    // This is where we can handle authentication logic
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
