import ArrowForwardIcon from '@mui/icons-material/ArrowForward'; // Add this import
import ArticleIcon from '@mui/icons-material/Article';
import FeedIcon from '@mui/icons-material/Feed';
import { Box, Button, Grid, Paper, Typography } from '@mui/material'; // Add Button import
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import { Link } from 'react-router';
import { type BlogItem } from '../services/blogService';
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

    // Check if the article has a valid image
    const hasImage = blog.content.image && blog.content.image.filename;

    // Determine which icon to display based on the blog category
    const getPlaceholderIcon = () => {
        const category = blog.full_slug.split('/')[0].toLowerCase();

        if (category === 'blog') return <FeedIcon sx={{ fontSize: 60 }} />;
        return <ArticleIcon sx={{ fontSize: 60 }} />;
    };

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
                transition: 'all 0.3s',
                '&:hover': {
                    backgroundColor: 'rgba(0, 0, 0, 0.03)',
                    boxShadow: '0 4px 8px rgba(0,0,0,0.08)',
                    transform: 'translateY(-2px)',
                },
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 2,
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
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            bgcolor: hasImage ? 'transparent' : 'action.hover',
                        }}
                    >
                        {hasImage ? (
                            <StoryblokImage
                                filename={blog.content.image.filename}
                                alt={blog.content.title}
                                style={{
                                    width: '100%',
                                    height: '100%',
                                    objectFit: 'cover',
                                }}
                            />
                        ) : (
                            <Box
                                sx={{
                                    textAlign: 'center',
                                    color: 'text.secondary',
                                    p: 2,
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    height: '100%',
                                }}
                            >
                                {getPlaceholderIcon()}
                                <Typography variant="caption" sx={{ mt: 1 }}>
                                    {blog.content.title.substring(0, 30)}
                                    {blog.content.title.length > 30 ? '...' : ''}
                                </Typography>
                            </Box>
                        )}
                    </Box>
                </Grid>
                <Grid item xs={12} md={hasImage ? 8 : 8}>
                    <Box
                        sx={{
                            display: 'flex',
                            flexDirection: 'column',
                            height: '100%',
                            justifyContent: 'space-between',
                        }}
                    >
                        <div>
                            <Typography variant="h5" component="h2" gutterBottom color="text.primary">
                                {blog.content.title}
                            </Typography>
                            <Typography
                                variant="body2"
                                color="text.primary"
                                paragraph
                                sx={{
                                    flexGrow: 1,
                                    fontSize: '0.9rem',
                                    overflow: 'hidden',
                                    display: '-webkit-box',
                                    WebkitLineClamp: 3,
                                    WebkitBoxOrient: 'vertical',
                                    textOverflow: 'ellipsis',
                                    mb: 2,
                                }}
                            >
                                {blog.content.preview}
                            </Typography>
                        </div>

                        <Box
                            sx={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                mt: 2,
                            }}
                        >
                            <Typography variant="caption" color="text.secondary">
                                {publishedDate}
                            </Typography>

                            <Button
                                variant="text"
                                color="primary"
                                size="small"
                                endIcon={<ArrowForwardIcon fontSize="small" />}
                                onClick={(e) => {
                                    e.stopPropagation();
                                }}
                                disableRipple
                                sx={{
                                    minWidth: 'auto',
                                    padding: '4px 8px',
                                    textTransform: 'none',
                                    fontWeight: 400,
                                    fontSize: '0.875rem',
                                    '&:hover': {
                                        backgroundColor: 'transparent',
                                        textDecoration: 'underline',
                                        transform: 'translateX(4px)',
                                    },
                                    transition: 'transform 0.2s ease',
                                }}
                            >
                                Devamını Oku
                            </Button>
                        </Box>
                    </Box>
                </Grid>
            </Grid>
        </Paper>
    );
};

export default BlogListItem;
