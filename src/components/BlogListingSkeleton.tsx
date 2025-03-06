import { Box, Card, CardContent, Divider, Grid, Paper, Skeleton, Stack } from '@mui/material';

interface BlogListingSkeletonProps {
    count?: number;
    isList?: boolean;
}

export const BlogListingSkeleton = ({ count = 6, isList = false }: BlogListingSkeletonProps) => {
    if (isList) {
        return (
            <Stack spacing={1} width="100%">
                {[...Array(count)].map((_, index) => (
                    <Box key={index}>
                        <Paper sx={{ width: '100%', p: 2 }} elevation={0}>
                            <Grid container spacing={3}>
                                <Grid item xs={12} md={4}>
                                    <Skeleton variant="rectangular" height={200} width="100%" animation="wave" />
                                </Grid>
                                <Grid item xs={12} md={8}>
                                    <Skeleton animation="wave" height={40} width="80%" sx={{ mb: 1.5 }} />
                                    <Skeleton animation="wave" height={20} width="100%" />
                                    <Skeleton animation="wave" height={20} width="100%" />
                                    <Skeleton animation="wave" height={20} width="60%" />
                                    <Box sx={{ mt: 1 }}>
                                        <Skeleton animation="wave" height={16} width="30%" />
                                    </Box>
                                </Grid>
                            </Grid>
                        </Paper>
                        {index < count - 1 && <Divider sx={{ my: 1 }} />}
                    </Box>
                ))}
            </Stack>
        );
    }

    return (
        <Grid container spacing={4}>
            {[...Array(count)].map((_, index) => (
                <Grid item xs={12} sm={6} md={4} key={index}>
                    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                        <Skeleton variant="rectangular" height={200} animation="wave" />
                        <CardContent>
                            <Skeleton animation="wave" height={32} width="80%" sx={{ mb: 1 }} />
                            <Box sx={{ mb: 2 }}>
                                <Skeleton animation="wave" height={20} />
                                <Skeleton animation="wave" height={20} />
                                <Skeleton animation="wave" height={20} width="60%" />
                            </Box>
                            <Skeleton animation="wave" height={16} width="40%" />
                        </CardContent>
                    </Card>
                </Grid>
            ))}
        </Grid>
    );
};

export default BlogListingSkeleton;
