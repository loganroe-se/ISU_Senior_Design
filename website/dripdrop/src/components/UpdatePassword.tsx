import React, { useState } from 'react';
import { TextField, Box, Button, CircularProgress } from '@mui/material';

interface UpdatePasswordProps {
    loading: boolean;
    onPasswordChange: (oldPassword: string, newPassword: string) => void;
    feedback?: { message: string; type: 'error' | 'success' | 'info' | 'warning' | undefined };
    setFeedback?: React.Dispatch<React.SetStateAction<{ message: string; type: 'error' | 'success' | 'info' | 'warning' | undefined }>>;
}

const UpdatePassword: React.FC<UpdatePasswordProps> = ({ loading, onPasswordChange, feedback, setFeedback }) => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [oldPassword, setOldPassword] = useState('');
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [passwordError, setPasswordError] = useState('');

    const handlePasswordChange = () => {
        if (newPassword !== confirmPassword) {
            setPasswordError('Passwords do not match.');
            if (setFeedback) setFeedback({ message: 'Passwords do not match.', type: 'error' });
            return;
        }
        setPasswordError('');
        onPasswordChange(oldPassword, newPassword);
        if (setFeedback) setFeedback({ message: 'Password updated successfully.', type: 'success' });
    };

    const handleInputChange = (field: string, value: string) => {
        if (field === 'confirmPassword') setConfirmPassword(value);
    };

    const isFormValid = oldPassword.trim() !== '' && newPassword.trim() !== '' && confirmPassword.trim() !== '' && newPassword === confirmPassword;

    return (
        <Box>
            <TextField
                label="Old Password"
                type="password"
                fullWidth
                margin="normal"
                value={oldPassword}
                onChange={(e) => handleInputChange('oldPassword', e.target.value)}
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
                error={!!passwordError}
                helperText={passwordError}
            />

            <Box mt={2} display="flex" alignItems="center">
                <Button
                    variant="contained"
                    color="primary"
                    onClick={handlePasswordChange}
                    disabled={loading || !isFormValid}
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
