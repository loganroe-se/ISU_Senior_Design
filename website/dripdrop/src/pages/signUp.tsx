import React, { useState } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import InputAdornment from '@mui/material/InputAdornment';
import IconButton from '@mui/material/IconButton';
import CircularProgress from '@mui/material/CircularProgress';
import { Visibility, VisibilityOff } from '@mui/icons-material';

interface SignUpProps {
    onSignUp: (email: string, password: string) => void;
    setIsSigningUp: (isSigningUp: boolean) => void;
    onSuccessfulSignUp: () => void; // New prop to indicate successful sign-up
}


const SignUp: React.FC<SignUpProps> = ({ onSignUp, setIsSigningUp, onSuccessfulSignUp }) => {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [snackbarOpen, setSnackbarOpen] = useState(false); // Snackbar state

    const handleSignUp = async () => {
        setErrorMessage(null);
        setLoading(true);

        if (!username || !email || !password || !confirmPassword) {
            setErrorMessage("All fields are required!");
            setLoading(false);
            return;
        }
        if (password !== confirmPassword) {
            setErrorMessage("Passwords do not match!");
            setLoading(false);
            return;
        }

        try {
            const response = await fetch('https://api.dripdropco.com/users', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, email, password }),
            });
            if (response.ok) {
                onSuccessfulSignUp(); // Notify SignIn of successful sign-up
                setIsSigningUp(false);
            } else {
                const errorData = await response.json();
                setErrorMessage(
                    errorData.error && errorData.error.includes("Duplicate entry")
                        ? "An account with this email or username already exists."
                        : "Failed to create user. Please try again."
                );
            }
        } catch (error) {
            setErrorMessage("An error occurred. Please try again.");
        } finally {
            setLoading(false);
        }

    };

    const handleSnackbarClose = () => {
        setSnackbarOpen(false); // Close Snackbar
        setIsSigningUp(false);
    };


    const handleClickShowPassword = () => setShowPassword((prev) => !prev);
    const handleClickShowConfirmPassword = () => setShowConfirmPassword((prev) => !prev);


    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <Typography variant="h4" gutterBottom sx={{ color: '#0073FF', fontSize: '64px' }}>dripdrop</Typography>
            {errorMessage && <Typography color="error" sx={{ mb: 2 }}>{errorMessage}</Typography>}
            <TextField label="Username" variant="outlined" value={username} onChange={(e) => setUsername(e.target.value)} sx={{ mb: 2, width: '80%' }} />
            <TextField label="Email" variant="outlined" value={email} onChange={(e) => setEmail(e.target.value)} sx={{ mb: 2, width: '80%' }} />
            <TextField
                label="Password"
                type={showPassword ? 'text' : 'password'}
                variant="outlined"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                sx={{ mb: 2, width: '80%' }}
                InputProps={{
                    endAdornment: (
                        <InputAdornment position="end">
                            <IconButton onClick={handleClickShowPassword} edge="end">
                                {showPassword ? <VisibilityOff /> : <Visibility />}
                            </IconButton>
                        </InputAdornment>
                    ),
                }}
            />
            <TextField
                label="Confirm Password"
                type={showConfirmPassword ? 'text' : 'password'}
                variant="outlined"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                sx={{ mb: 2, width: '80%' }}
                InputProps={{
                    endAdornment: (
                        <InputAdornment position="end">
                            <IconButton onClick={handleClickShowConfirmPassword} edge="end">
                                {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                            </IconButton>
                        </InputAdornment>
                    ),
                }}
            />
            {loading ? (
                <CircularProgress sx={{ mb: 2 }} />
            ) : (
                <Button
                    onClick={handleSignUp}
                    sx={{
                        mb: 2, bgcolor: '#0073FF', color: 'white', borderRadius: '40px', width: '50%', fontSize: '20px',
                        fontFamily: 'Roboto, sans-serif', fontWeight: 600, padding: '0.8rem 1.5rem',
                        '&:hover': { bgcolor: '#005BB5', boxShadow: '0px 4px 12px rgba(0, 115, 255, 0.3)' }
                    }}
                >
                    Sign Up
                </Button>
            )}
            <Button onClick={() => setIsSigningUp(false)} sx={{ background: "none", color: "#AFAFAF" }}>
                Have an account? <Typography sx={{ textDecoration: "underline", color: "#9D9D9D", marginLeft: ".2rem" }}>Sign in here</Typography>
            </Button>

            {/* Snackbar for success message */}
            <Snackbar open={snackbarOpen} autoHideDuration={6000} onClose={handleSnackbarClose}>
                <Alert onClose={handleSnackbarClose} severity="success" sx={{ width: '100%' }}>
                    User created successfully!
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default SignUp;
