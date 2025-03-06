import { Box, Card, CardActionArea, CardContent, Typography } from '@mui/material';
import { format } from 'date-fns';
import { Link } from 'react-router';
import { BlogItem } from '../services/blogService';
import StoryblokImage from './StoryblokImage';

interface BlogCardProps {
    blog: BlogItem;
    elevation?: number;
}

export const BlogCard = ({ blog, elevation = 1 }: BlogCardProps) => {
    const publishedDate = blog.content.date_original_published
        ? format(new Date(blog.content.date_original_published), 'MMMM dd, yyyy')
        : format(new Date(blog.first_published_at), 'MMMM dd, yyyy');

    return (
        <Card
            elevation={elevation}
            sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out',
                '&:hover': {
                    transform: 'translateY(-8px)',
                    boxShadow: '0 10px 20px rgba(0,0,0,0.2)',
                },
            }}
        >
            <CardActionArea
                component={Link}
                to={`/blog/${blog.slug}`}
                sx={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'stretch' }}
            >
                <Box sx={{ position: 'relative', paddingTop: '56.25%' /* 16:9 aspect ratio */ }}>
                    <Box
                        sx={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            width: '100%',
                            height: '100%',
                        }}
                    >
                        <StoryblokImage
                            filename={blog.content.image.filename}
                            alt={blog.content.title}
                            style={{
                                objectFit: 'cover',
                                width: '100%',
                                height: '100%',
                            }}
                        />
                    </Box>
                </Box>
                <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                    <Typography gutterBottom variant="h5" component="h2" color="text.primary">
                        {blog.content.title}
                    </Typography>
                    <Typography variant="body2" color="text.primary" paragraph sx={{ flexGrow: 1 }}>
                        {blog.content.preview}
                    </Typography>
                    <Typography variant="caption" color="text.primary" sx={{ mt: 'auto' }}>
                        {publishedDate}
                    </Typography>
                </CardContent>
            </CardActionArea>
        </Card>
    );
};

export default BlogCard;
