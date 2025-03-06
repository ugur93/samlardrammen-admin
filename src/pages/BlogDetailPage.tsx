import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { Box, Breadcrumbs, Button, CircularProgress, Container, Divider, Typography } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import { useMemo } from 'react';
import { Link, useLocation } from 'react-router';
import BlogContent from '../components/BlogContent';
import StoryblokImage from '../components/StoryblokImage';
import { BLOG_CATEGORIES, blogQueryKeys, fetchBlogPostBySlug, getCategoryFromFullSlug } from '../services/blogService';
import PageTemplate from './PageTemplate';

export const BlogDetailPage = () => {
    // Use location to get the full path after /blog/
    const location = useLocation();

    // Extract the fullSlug from the pathname (remove the leading /blog/)
    const pathSegments = location.pathname.split('/');
    // Remove the first two segments ('/' and 'blog') and join the rest
    const fullSlug = pathSegments.slice(2).join('/');

    const {
        data: blogPost,
        isLoading,
        error,
    } = useQuery({
        queryKey: blogQueryKeys.detail(fullSlug || ''),
        queryFn: () => fetchBlogPostBySlug(fullSlug || ''),
        enabled: !!fullSlug,
        staleTime: 5 * 60 * 1000, // 5 minutes
    });

    // Get the category name for display in breadcrumbs and return link
    const categoryInfo = useMemo(() => {
        if (!blogPost) return { path: '/blog', name: 'Blog' };

        const categorySlug = getCategoryFromFullSlug(blogPost.full_slug);
        console.log(categorySlug);
        const category = BLOG_CATEGORIES.find((c) => c.slug.toLowerCase() === categorySlug.toLowerCase());

        return {
            path: category ? `/blog?category=${category.id}` : '/blog',
            name: category ? category.name : 'Blog',
        };
    }, [blogPost]);

    console.log(JSON.stringify(categoryInfo, null, 2));
    if (isLoading) {
        return (
            <PageTemplate>
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '70vh' }}>
                    <CircularProgress />
                </Box>
            </PageTemplate>
        );
    }

    if (error || !blogPost) {
        return (
            <PageTemplate>
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '70vh' }}>
                    <Typography color="error">Blog yazısı yüklenemedi. Lütfen daha sonra tekrar deneyiniz.</Typography>
                </Box>
            </PageTemplate>
        );
    }

    const publishedDate = blogPost.content.date_original_published
        ? format(new Date(blogPost.content.date_original_published), 'd MMMM yyyy', { locale: tr })
        : format(new Date(blogPost.first_published_at), 'd MMMM yyyy', { locale: tr });

    return (
        <PageTemplate>
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

                {/* Image at the top */}
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
        </PageTemplate>
    );
};

export default BlogDetailPage;
