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
    const [width, setWidth] = useState(window.innerWidth);

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

                const userExists = data.some((user: { id: string, email: string, username: string }) => user.email === email);
                if (userExists) {
                    const user = data.find((user: { email: string }) => user.email === email);

                    if (user) {
                        sessionStorage.setItem("username", user.username);
                        sessionStorage.setItem("email", user.email);
                        sessionStorage.setItem("id", user.id);
                        sessionStorage.setItem("password", password);

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
            height: '100vh', bgcolor: '#f5f7fe'
        }}>
            <Snackbar open={showSignUpSuccess} autoHideDuration={6000} onClose={() => setShowSignUpSuccess(false)}>
                <Alert onClose={() => setShowSignUpSuccess(false)} severity="success" sx={{ width: '100%' }}>
                    User created successfully! You can now sign in.
                </Alert>
            </Snackbar>
            { width > 400 ? 
                <Box sx={{
                    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                    height: 'fit-content', padding: '3rem 8rem', borderRadius: '20px', backgroundColor: 'white', boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.1)'
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
                                    <Button onClick={handleAutoLogin} sx={{ color: '#0073FF' }}>Auto Login with Test Account</Button>
                                </>
                            )}
                            <Button onClick={() => setIsSigningUp(true)} sx={{ background: "none", color: "#AFAFAF", fontSize: '.75rem' }}>
                                Or sign up <Typography sx={{ textDecoration: "underline", color: "#9D9D9D", marginLeft: ".2rem", fontSize: '.75rem' }}>here</Typography>
                            </Button>
                        </Box>
                    )}
                </Box>
                :
                <Box sx={{ width: '100vw' }}>
                    <Box sx={{ width: '100vw', display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: '2rem'}}>
                        <img src={'/images/logo.svg'} alt="logo" style={{ width: '8rem' }} />
                    </Box>
                    <Typography variant="h4" sx={{ color: '#0073FF', fontSize: '1.5rem', textAlign: 'center' }}>Mobile app coming soon</Typography>
                </Box>
            }
        </Box>
    );
};

export default SignIn;