import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArticleIcon from '@mui/icons-material/Article';
import { Box, Breadcrumbs, Button, Container, Divider, Typography } from '@mui/material';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import { useMemo } from 'react';
import { Link, useLoaderData } from 'react-router';
import BlogContent from '../components/BlogContent';
import StoryblokImage from '../components/StoryblokImage';
import { useBlogNavigation } from '../context/BlogNavigationContext';
import { BLOG_CATEGORIES, getCategoryFromFullSlug } from '../services/blogService';

export const BlogDetailPage = () => {
    const { activeCategory } = useBlogNavigation();
    const { blogPost } = useLoaderData();

    // Get the category name for display in breadcrumbs and return link
    const categoryInfo = useMemo(() => {
        if (!blogPost)
            return {
                path: `/blog${activeCategory !== 'all' ? `?category=${activeCategory}` : ''}`,
                name: BLOG_CATEGORIES.find((c) => c.id === activeCategory)?.name || 'Blog',
            };

        const categorySlug = getCategoryFromFullSlug(blogPost.full_slug);
        const category = BLOG_CATEGORIES.find((c) => c.slug.toLowerCase() === categorySlug.toLowerCase());

        return {
            path: category
                ? `/blog?category=${category.id}`
                : `/blog${activeCategory !== 'all' ? `?category=${activeCategory}` : ''}`,
            name: category ? category.name : BLOG_CATEGORIES.find((c) => c.id === activeCategory)?.name || 'Blog',
        };
    }, [blogPost, activeCategory]);

    if (!blogPost) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '70vh' }}>
                <Typography color="error">Blog yazısı yüklenemedi. Lütfen daha sonra tekrar deneyiniz.</Typography>
            </Box>
        );
    }

    const publishedDate = blogPost.content.date_original_published
        ? format(new Date(blogPost.content.date_original_published), 'd MMMM yyyy', { locale: tr })
        : format(new Date(blogPost.first_published_at), 'd MMMM yyyy', { locale: tr });

    // Check if the article has a valid image
    const hasImage = blogPost?.content?.image?.filename;

    return (
        <Container maxWidth="md" sx={{ mt: 4, mb: 8 }}>
            <Box sx={{ mb: 4 }}>
                <Breadcrumbs separator="›" aria-label="breadcrumb">
                    <Link to="/blog" style={{ textDecoration: 'none', color: 'inherit' }}>
                        Blog
                    </Link>
                    <Link to={categoryInfo.path} style={{ textDecoration: 'none', color: 'inherit' }}>
                        {categoryInfo.name}
                    </Link>
                    <Typography color="text.primary">{blogPost.content.title}</Typography>
                </Breadcrumbs>
            </Box>

            <Button component={Link} to={categoryInfo.path} startIcon={<ArrowBackIcon />} sx={{ mb: 3 }}>
                {categoryInfo.name} Yazılarına Dön
            </Button>

            {/* Image at the top - only if there is an image */}
            {hasImage ? (
                <Box sx={{ mb: 4, width: '100%', borderRadius: 2, overflow: 'hidden' }}>
                    <StoryblokImage
                        filename={blogPost.content.image.filename}
                        alt={blogPost.content.title}
                        style={{
                            width: '100%',
                            height: 'auto',
                            display: 'block',
                        }}
                    />
                </Box>
            ) : (
                <Box
                    sx={{
                        mb: 4,
                        width: '100%',
                        height: '200px',
                        borderRadius: 2,
                        bgcolor: 'action.hover',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}
                >
                    <ArticleIcon sx={{ fontSize: 60, color: 'text.secondary' }} />
                    <Typography variant="caption" color="text.secondary" sx={{ mt: 1 }}>
                        Bu yazı için görsel bulunmamaktadır
                    </Typography>
                </Box>
            )}

            {/* Published date below image */}
            <Typography variant="subtitle1" color="text.primary" paragraph sx={{ mb: 3 }}>
                Yayın tarihi: {publishedDate}
            </Typography>

            <Typography variant="h3" component="h1" gutterBottom color="text.primary">
                {blogPost.content.title}
            </Typography>

            {/* Preview with smaller font size */}
            <Typography
                variant="subtitle1"
                gutterBottom
                sx={{
                    fontWeight: 'normal',
                    fontStyle: 'italic',
                    mb: 4,
                    fontSize: '1rem', // Smaller font size for preview
                }}
                color="text.primary"
            >
                {blogPost.content.preview}
            </Typography>

            <Divider sx={{ my: 3 }} />

            {/* Content with markdown rendering */}
            <Box sx={{ my: 4, color: 'text.primary' }}>
                <BlogContent content={blogPost.content.content} />
            </Box>

            <Divider sx={{ my: 4 }} />

            <Box sx={{ textAlign: 'center', mt: 6 }}>
                <Button
                    component={Link}
                    to={categoryInfo.path}
                    variant="contained"
                    startIcon={<ArrowBackIcon />}
                    sx={{ mt: 3 }}
                >
                    {categoryInfo.name} Yazılarına Dön
                </Button>
            </Box>
        </Container>
    );
};

export default BlogDetailPage;
