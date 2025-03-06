import { Box, CircularProgress, Container, Typography } from '@mui/material';
import React from 'react';
import PageTemplate from '../pages/PageTemplate';

interface LoadingStateProps {
    message?: string;
}

const LoadingState: React.FC<LoadingStateProps> = ({ message = 'Laster' }) => {
    return (
        <PageTemplate>
            <Container sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
                <Box textAlign="center">
                    <CircularProgress size={60} thickness={4} />
                    <Typography variant="h6" sx={{ mt: 2, color: 'text.secondary' }}>
                        {message}
                    </Typography>
                </Box>
            </Container>
        </PageTemplate>
    );
};

export default LoadingState;
