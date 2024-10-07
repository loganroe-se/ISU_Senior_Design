// src/pages/SignUp.tsx
import React, { useState } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import IconButton from '@mui/material/IconButton';
import { Visibility, VisibilityOff } from '@mui/icons-material'; // Import the icons

// Define the type for the component's props
interface SignUpProps {
    onSignUp: (email: string, password: string) => void; // Callback for signing up
}

const SignUp: React.FC<SignUpProps> = ({ onSignUp }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false); // State for password visibility
    const [showConfirmPassword, setShowConfirmPassword] = useState(false); // State for confirm password visibility

    const handleSignUp = () => {
        // We can add validation here before calling onSignUp
        if (password === confirmPassword) {
            onSignUp(email, password);
        } else {
            alert("Passwords do not match!");
        }
    };

    const handleClickShowPassword = () => {
        setShowPassword((prev) => !prev); // Toggle password visibility
    };

    const handleClickShowConfirmPassword = () => {
        setShowConfirmPassword((prev) => !prev); // Toggle confirm password visibility
    };

    return (
        <Box
            sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100vh',
                bgcolor: 'background.default',
            }}
        >
            <Typography variant="h4" gutterBottom>
                Create an Account
            </Typography>
            <TextField
                label="Email"
                variant="outlined"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                sx={{ mb: 2, width: '300px' }} // Set width for uniformity
            />
            <TextField
                label="Password"
                type={showPassword ? 'text' : 'password'} // Toggle password visibility
                variant="outlined"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                sx={{ mb: 2, width: '300px' }} // Set width for uniformity
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
            <TextField
                label="Confirm Password"
                type={showConfirmPassword ? 'text' : 'password'} // Toggle confirm password visibility
                variant="outlined"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                sx={{ mb: 2, width: '300px' }} // Set width for uniformity
                InputProps={{
                    endAdornment: (
                        <InputAdornment position="end">
                            <IconButton
                                aria-label="toggle confirm password visibility"
                                onClick={handleClickShowConfirmPassword}
                                edge="end"
                            >
                                {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                            </IconButton>
                        </InputAdornment>
                    ),
                }}
            />
            <Button variant="contained" onClick={handleSignUp} sx={{ mb: 2 }}>
                Sign Up
            </Button>
        </Box>
    );
};

export default SignUp;
