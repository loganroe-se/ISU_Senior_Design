import React, { useState } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import IconButton from '@mui/material/IconButton';
import CircularProgress from '@mui/material/CircularProgress';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import SignUp from '../pages/signUp';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';


interface SignInProps {
    onSignIn: (email: string, password: string) => void;
}

const SignIn: React.FC<SignInProps> = ({ onSignIn }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isSigningUp, setIsSigningUp] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [showSignUpSuccess, setShowSignUpSuccess] = useState(false); 

    const handleSignIn = async () => {
        if (!email || !password) {
            setError('Email and password fields cannot be empty.');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const response = await fetch(`https://api.dripdropco.com/users`);

            if (response.ok) {
                const data = await response.json();
                console.log("Fetched user data:", data);

                const userExists = data.some((user: { email: string, username: string }) => user.email === email);
                if (userExists) {
                    const user = data.find((user: { email: string }) => user.email === email);
                    if (user) {
                        sessionStorage.setItem("username", user.username);
                        sessionStorage.setItem("email", user.email);
                        sessionStorage.setItem("password", password);
                        sessionStorage.setItem("id", user.id);
                    }

                    onSignIn(email, password);
                } else {
                    setError('User not found. Please sign up first.');
                }
            } else {
                setError('Error verifying user. Please try again.');
            }
        } catch (error) {
            setError('Network error. Please try again later.');
        } finally {
            setLoading(false);
        }
    };



    const handleAutoLogin = async () => {
        setEmail("test");
        setPassword("test");
        handleSignIn();
    };



    const handleClickShowPassword = () => {
        setShowPassword((prev) => !prev);
    };

    return (
        <Box sx={{
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            height: '100vh', bgcolor: '#185197'
        }}>
            <Snackbar open={showSignUpSuccess} autoHideDuration={6000} onClose={() => setShowSignUpSuccess(false)}>
                <Alert onClose={() => setShowSignUpSuccess(false)} severity="success" sx={{ width: '100%' }}>
                    User created successfully! You can now sign in.
                </Alert>
            </Snackbar>
            <Box sx={{
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                height: '70vh', width: '25vw', padding: '0 3rem', bgcolor: '#FAFAFA', borderRadius: '20px'
            }}>
                <img src={'/images/logo.svg'} alt="logo" style={{ width: '50px' }} />
                {isSigningUp ? (
                    <SignUp
                        onSignUp={onSignIn}
                        setIsSigningUp={setIsSigningUp}
                        onSuccessfulSignUp={() => setShowSignUpSuccess(true)} // Call on successful sign-up
                    />
                ) : (
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <Typography variant="h4" gutterBottom sx={{ color: '#0073FF', fontSize: '64px' }}>dripdrop</Typography>
                        {error && (
                            <Typography color="error" sx={{ mb: 2 }}>{error}</Typography>
                        )}
                        <TextField label="Email" variant="outlined" value={email} onChange={(e) => setEmail(e.target.value)} sx={{ mb: 2, width: '80%' }} />
                        <TextField label="Password" type={showPassword ? 'text' : 'password'} variant="outlined" value={password} onChange={(e) => setPassword(e.target.value)} sx={{ mb: 2, width: '80%' }}
                            InputProps={{
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <IconButton aria-label="toggle password visibility" onClick={handleClickShowPassword} edge="end">
                                            {showPassword ? <VisibilityOff /> : <Visibility />}
                                        </IconButton>
                                    </InputAdornment>
                                ),
                            }}
                        />
                        {loading ? (
                            <CircularProgress sx={{ mb: 2 }} />
                        ) : (
                            <>
                                <Button onClick={handleSignIn} sx={{ mb: 2, bgcolor: '#0073FF', color: 'white', borderRadius: '40px', width: '50%', fontSize: '20px', fontWeight: 600, padding: '0.8rem 1.5rem', '&:hover': { bgcolor: '#005BB5' } }}>
                                    Login
                                </Button>
                                <Button onClick={handleAutoLogin} sx={{ mb: 2, color: '#0073FF' }}>Auto Login with Test Account</Button>
                            </>
                        )}
                        <Button onClick={() => setIsSigningUp(true)} sx={{ background: "none", color: "#AFAFAF" }}>
                            Or sign up <Typography sx={{ textDecoration: "underline", color: "#9D9D9D", marginLeft: ".2rem" }}>here</Typography>
                        </Button>
                    </Box>
                )}
            </Box>
        </Box>
    );
};

export default SignIn;