import React, { useState } from 'react';
import { TextField, Box, Button, CircularProgress } from '@mui/material';

interface UpdatePasswordProps {
    loading: boolean;
    onPasswordChange: (oldPassword: string, newPassword: string) => void;
    feedback?: { message: string; type: 'error' | 'success' | 'info' | 'warning' | undefined };
    setFeedback?: React.Dispatch<React.SetStateAction<{ message: string; type: 'error' | 'success' | 'info' | 'warning' | undefined }>>;
}

const UpdatePassword: React.FC<UpdatePasswordProps> = ({ loading, onPasswordChange, feedback, setFeedback }) => {
    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [oldPasswordError, setOldPasswordError] = useState('');
    const [confirmPasswordError, setConfirmPasswordError] = useState('');

    const handlePasswordChange = () => {
        const storedPassword = sessionStorage.getItem('password');

        // Check if the old password matches the stored password
        if (oldPassword !== storedPassword) {
            setOldPasswordError('Old password is incorrect.');
            setConfirmPasswordError(''); // Clear any confirm password error
            if (setFeedback) setFeedback({ message: 'Old password is incorrect.', type: 'error' });
            return;
        }

        // Check if new password matches confirm password
        if (newPassword !== confirmPassword) {
            setConfirmPasswordError('Passwords do not match.');
            if (setFeedback) setFeedback({ message: 'Passwords do not match.', type: 'error' });
            return; // Exit here if passwords don't match
        }

        // Clear errors if all checks pass
        setOldPasswordError('');
        setConfirmPasswordError('');
        onPasswordChange(oldPassword, newPassword);

        // Update the stored password
        sessionStorage.setItem('password', newPassword);
        if (setFeedback) setFeedback({ message: 'Password updated successfully.', type: 'success' });
    };

    const handleInputChange = (field: string, value: string) => {
        if (field === 'oldPassword') setOldPassword(value);
        else if (field === 'newPassword') setNewPassword(value);
        else if (field === 'confirmPassword') setConfirmPassword(value);
    };

    const isFormValid = oldPassword.trim() !== '' && newPassword.trim() !== '' && confirmPassword.trim() !== '';

    return (
        <Box>
            <TextField
                label="Old Password"
                type="password"
                fullWidth
                margin="normal"
                value={oldPassword}
                onChange={(e) => handleInputChange('oldPassword', e.target.value)}
                error={!!oldPasswordError}
                helperText={oldPasswordError}
            />
            <TextField
                label="New Password"
                type="password"
                fullWidth
                margin="normal"
                value={newPassword}
                onChange={(e) => handleInputChange('newPassword', e.target.value)}
            />
            <TextField
                label="Confirm New Password"
                type="password"
                fullWidth
                margin="normal"
                value={confirmPassword}
                onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                error={!!confirmPasswordError}
                helperText={confirmPasswordError}
            />

            <Box mt={2} display="flex" alignItems="center">
                <Button
                    variant="contained"
                    color="primary"
                    onClick={handlePasswordChange}
                    disabled={loading || !isFormValid} // Allow submission if both newPassword and confirmPassword have input
                >
                    {loading ? <CircularProgress size={20} color="inherit" /> : 'Update Password'}
                </Button>
            </Box>

            {feedback?.message && (
                <Box mt={2} color={feedback?.type === 'error' ? 'red' : 'green'}>
                    {feedback?.message}
                </Box>
            )}
        </Box>
    );
};

export default UpdatePassword;
