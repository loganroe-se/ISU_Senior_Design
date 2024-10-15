import React, { useState } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import IconButton from '@mui/material/IconButton';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import SignUp from '../pages/signUp';

// Define the type for the component's props
interface SignInProps {
    onSignIn: (email: string, password: string) => void;
}

const SignIn: React.FC<SignInProps> = ({ onSignIn }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isSigningUp, setIsSigningUp] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const handleSignIn = () => {
        onSignIn(email, password);
    };

    const handleSignUp = (email: string, password: string) => {
        console.log('User signed up with:', email, password);
        setIsSigningUp(false); // Go back to sign-in after sign-up
    };

    const handleClickShowPassword = () => {
        setShowPassword((prev) => !prev); // Toggle password visibility
    };

    return (
        <Box
            sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100vh',
                bgcolor: '#185197'
            }}
        >
            {isSigningUp ? (
                <SignUp onSignUp={handleSignUp} />
            ) : (
                <>
                    <img src={require('../images/logo.png')} style={{'width':'100px'}} />
                    <Typography variant="h4" gutterBottom>
                        Welcome to DripDrop
                    </Typography>
                    <TextField
                        label="Email"
                        variant="outlined"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        sx={{ mb: 2, width: '300px' }} // Set uniform width
                    />
                    <TextField
                        label="Password"
                        type={showPassword ? 'text' : 'password'} // Toggle password visibility
                        variant="outlined"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        sx={{ mb: 2, width: '300px' }} // Set uniform width
                        InputProps={{
                            endAdornment: (
                                <InputAdornment position="end">
                                    <IconButton
                                        aria-label="toggle password visibility"
                                        onClick={handleClickShowPassword}
                                        edge="end"
                                    >
                                        {showPassword ? <VisibilityOff /> : <Visibility />}
                                    </IconButton>
                                </InputAdornment>
                            ),
                        }}
                    />
                    <Button variant="contained" onClick={handleSignIn} sx={{ mb: 2 }}>
                        Sign In
                    </Button>
                    <Button variant="outlined" onClick={() => setIsSigningUp(true)}>
                        Sign Up
                    </Button>
                </>
            )}
        </Box>
    );
};

export default SignIn;
