import React, { useState } from 'react';
import { Box, Button, TextField, Typography, Paper, IconButton, CircularProgress, Tabs, Tab } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useNavigate } from 'react-router-dom';
import UpdatePassword from '../components/UpdatePassword';

const EditProfile = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [email, setEmail] = useState('');
    const [currentTab, setCurrentTab] = useState(0); // To control the active tab
    const [loading, setLoading] = useState(false);
    const [feedback, setFeedback] = useState<{ message: string; type: 'error' | 'success' | 'info' | 'warning' | undefined }>({ message: '', type: undefined });
    const [touchedFields, setTouchedFields] = useState<{ username: boolean, email: boolean, password: boolean }>({
        username: false,
        email: false,
        password: false
    });
    const navigate = useNavigate();

    const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
        setCurrentTab(newValue); // Update the current tab state
    };

    const handleBack = () => {
        navigate(-1);
    };

    const isValidEmail = (email: string) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    const handleInputChange = (field: string, value: string) => {
        setTouchedFields(prevState => ({ ...prevState, [field]: true })); // Mark field as touched
        if (field === 'username') setUsername(value);
        if (field === 'email') setEmail(value);
        if (field === 'password') setPassword(value);
    };

    const handlePasswordChange = (oldPassword: string, newPassword: string) => {
        setPassword(newPassword);  // Assuming password update happens here.
        setFeedback({ message: 'Password updated successfully', type: 'success' });
    };

    const isSaveButtonDisabled = () => {
        if (currentTab === 0) {
            return !username.trim();
        }
        if (currentTab === 1) {
            return !email.trim() || !isValidEmail(email);
        }
        return false;
    };

    return (
        <Paper sx={{ minHeight: '100vh', padding: '32px' }}>
            <Box display="flex" alignItems="center" mb={4}>
                <IconButton onClick={handleBack} aria-label="Back">
                    <ArrowBackIcon />
                </IconButton>
                <Typography variant="h4" component="h1" textAlign="center" flexGrow={1}>
                    Edit Profile
                </Typography>
            </Box>

            <Tabs value={currentTab} onChange={handleTabChange} centered>
                <Tab label="Username" />
                <Tab label="Email" />
                <Tab label="Password" />
            </Tabs>

            {currentTab === 0 && (
                <TextField
                    label="Username"
                    variant="outlined"
                    fullWidth
                    margin="normal"
                    value={username}
                    onChange={(e) => handleInputChange('username', e.target.value)}
                    onBlur={() => setTouchedFields(prevState => ({ ...prevState, username: true }))} // Mark as touched on blur
                    helperText={touchedFields.username && username.trim() === '' ? 'Username cannot be empty' : ''}
                    error={touchedFields.username && username.trim() === ''}
                />
            )}

            {currentTab === 1 && (
                <TextField
                    label="Email"
                    type="email"
                    variant="outlined"
                    fullWidth
                    margin="normal"
                    value={email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    onBlur={() => setTouchedFields(prevState => ({ ...prevState, email: true }))} // Mark as touched on blur
                    helperText={
                        touchedFields.email
                            ? email.trim() === ''
                                ? 'Email cannot be empty'
                                : !isValidEmail(email)
                                    ? 'Invalid email format'
                                    : ''
                            : ''
                    }
                    error={touchedFields.email && (email.trim() === '' || !isValidEmail(email))}
                />
            )}

            {currentTab === 2 && (
                <UpdatePassword
                    loading={loading}
                    onPasswordChange={handlePasswordChange}
                    feedback={feedback}
                    setFeedback={setFeedback}
                />
            )}

            {(currentTab === 0 || currentTab === 1) && (
                <Box mt={2} display="flex" alignItems="center">
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={() => { /* Save changes logic here */ }}
                        disabled={loading || isSaveButtonDisabled()}
                    >
                        {loading ? <CircularProgress size={20} color="inherit" /> : 'Save Changes'}
                    </Button>
                </Box>
            )}
        </Paper>
    );
};

export default EditProfile;
