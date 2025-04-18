import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import { Box, Button, Paper, Typography } from '@mui/material';
import { Link } from 'react-router';

export default function NoAccessPage() {
    return (
        <Box className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-6 text-center">
            <Paper elevation={3} className="max-w-lg p-8 md:p-10 rounded-xl">
                <Box className="flex justify-center mb-6">
                    <LockOutlinedIcon className="text-red-500" sx={{ fontSize: 64 }} />
                </Box>

                <Typography variant="h4" component="h1" className="font-bold mb-4 text-gray-800">
                    Ingen tilgang
                </Typography>

                <Typography variant="body1" className="mb-2 text-gray-600">
                    Beklager, du har ikke tilgang til denne siden.
                </Typography>

                <Button component={Link} to="/" variant="outlined" className="!mt-4">
                    Tilbake til forsiden
                </Button>
            </Paper>
        </Box>
    );
}
