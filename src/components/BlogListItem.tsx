import { Box, Grid, Paper, Typography } from '@mui/material';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import { Link } from 'react-router';
import { BlogItem } from '../services/blogService';
import StoryblokImage from './StoryblokImage';

interface BlogListItemProps {
    blog: BlogItem;
}

export const BlogListItem = ({ blog }: BlogListItemProps) => {
    const publishedDate = blog.content.date_original_published
        ? format(new Date(blog.content.date_original_published), 'd MMMM yyyy', { locale: tr })
        : format(new Date(blog.first_published_at), 'd MMMM yyyy', { locale: tr });

    // Create a valid URL path from the full_slug
    const blogPath = `/blog/${blog.full_slug}`;

    return (
        <Paper
            component={Link}
            to={blogPath}
            elevation={0}
            sx={{
                width: '100%',
                p: 2,
                display: 'block',
                textDecoration: 'none',
                color: 'inherit',
                transition: 'background-color 0.3s',
                '&:hover': {
                    backgroundColor: 'rgba(0, 0, 0, 0.03)',
                },
            }}
        >
            <Grid container spacing={3}>
                <Grid item xs={12} md={4}>
                    <Box
                        sx={{
                            position: 'relative',
                            height: { xs: 200, md: '100%' },
                            minHeight: { md: 200 },
                            width: '100%',
                            borderRadius: 1,
                            overflow: 'hidden',
                        }}
                    >
                        <StoryblokImage
                            filename={blog.content.image.filename}
                            alt={blog.content.title}
                            style={{
                                width: '100%',
                                height: '100%',
                                objectFit: 'cover',
                            }}
                        />
                    </Box>
                </Grid>
                <Grid item xs={12} md={8}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                        <Typography variant="h5" component="h2" gutterBottom color="text.primary">
                            {blog.content.title}
                        </Typography>
                        <Typography
                            variant="body2"
                            color="text.primary"
                            paragraph
                            sx={{
                                flexGrow: 1,
                                fontSize: '0.9rem', // Smaller font size for preview
                                overflow: 'hidden',
                                display: '-webkit-box',
                                WebkitLineClamp: 3,
                                WebkitBoxOrient: 'vertical',
                                textOverflow: 'ellipsis',
                            }}
                        >
                            {blog.content.preview}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                            {publishedDate}
                        </Typography>
                    </Box>
                </Grid>
            </Grid>
        </Paper>
    );
};

export default BlogListItem;
