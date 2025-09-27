import AnnouncementIcon from '@mui/icons-material/Announcement';
import ArticleIcon from '@mui/icons-material/Article';
import EventIcon from '@mui/icons-material/Event';
import FeedIcon from '@mui/icons-material/Feed';
import { Box, Chip, Container, Grid, Tab, Tabs, Typography, useMediaQuery, useTheme } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { compareDesc } from 'date-fns';
import { useEffect, useRef, useState } from 'react';
import { useLocation, useSearchParams } from 'react-router';
import BlogListingSkeleton from '../components/BlogListingSkeleton';
import BlogListItem from '../components/BlogListItem';
import { useBlogNavigation } from '../context/BlogNavigationContext';
import { BLOG_CATEGORIES, type BlogItem, blogQueryKeys, fetchBlogPostsByCategory } from '../services/blogService';

export const BlogListingPage = () => {
    const { activeCategory, setActiveCategory, scrollPosition, setScrollPosition } = useBlogNavigation();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'md'));
    const listRef = useRef<HTMLDivElement>(null);
    const [searchParams] = useSearchParams();
    const location = useLocation();
    const [hasRestored, setHasRestored] = useState(false);
    const scrollListenerRef = useRef<boolean>(false);

    // Check for category in URL params
    useEffect(() => {
        const categoryParam = searchParams.get('category');
        if (categoryParam && BLOG_CATEGORIES.some((cat) => cat.id === categoryParam)) {
            setActiveCategory(categoryParam);
        }
    }, [searchParams, setActiveCategory]);

    const { data, isLoading, error } = useQuery({
        queryKey: blogQueryKeys.list(activeCategory),
        queryFn: () => fetchBlogPostsByCategory(activeCategory === 'all' ? '' : activeCategory),
        staleTime: 5 * 60 * 1000, // 5 minutes
    });

    // Restore scroll position ONCE when component loads and data is ready
    useEffect(() => {
        if (!isLoading && !hasRestored && scrollPosition > 0 && data) {
            // Small delay to ensure DOM is fully rendered
            const timer = setTimeout(() => {
                window.scrollTo({
                    top: scrollPosition,
                    behavior: 'auto', // Use 'auto' instead of 'smooth' to prevent visual jitter
                });
                setHasRestored(true);
            }, 100);

            return () => clearTimeout(timer);
        }
    }, [isLoading, scrollPosition, hasRestored, data]);

    // Save scroll position before navigation, with throttling
    useEffect(() => {
        // Don't attach listener until we've restored scroll position (or if no need to restore)
        if (isLoading || (!hasRestored && scrollPosition > 0)) {
            return;
        }

        if (scrollListenerRef.current) return; // Prevent duplicate listeners

        scrollListenerRef.current = true;

        let ticking = false;
        const handleScroll = () => {
            if (!ticking) {
                // Use requestAnimationFrame to throttle updates
                window.requestAnimationFrame(() => {
                    setScrollPosition(window.scrollY);
                    ticking = false;
                });
                ticking = true;
            }
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => {
            window.removeEventListener('scroll', handleScroll);
            scrollListenerRef.current = false;
        };
    }, [isLoading, hasRestored, scrollPosition, setScrollPosition]);

    // Get icon component based on icon name
    const getIconComponent = (iconName?: string) => {
        switch (iconName) {
            case 'article':
                return <ArticleIcon fontSize="small" />;
            case 'news':
                return <FeedIcon fontSize="small" />;
            case 'event':
                return <EventIcon fontSize="small" />;
            case 'announcement':
                return <AnnouncementIcon fontSize="small" />;
            default:
                return <ArticleIcon fontSize="small" />;
        }
    };

    // Sort blog posts by published date (newest first)
    const sortedBlogPosts = data?.stories
        ? [...data.stories].sort((a: BlogItem, b: BlogItem) => {
              const dateA = a.content.date_original_published
                  ? new Date(a.content.date_original_published)
                  : new Date(a.first_published_at);
              const dateB = b.content.date_original_published
                  ? new Date(b.content.date_original_published)
                  : new Date(b.first_published_at);
              return compareDesc(dateA, dateB);
          })
        : [];

    // Separate featured (latest) post and the rest
    const featuredPost = sortedBlogPosts.length > 0 ? sortedBlogPosts[0] : null;
    const otherPosts = sortedBlogPosts.slice(1);

    // Reset scroll tracking when changing tabs - handle both Tabs and Chips
    const handleTabChange = (eventOrValue: React.SyntheticEvent | string, newValue?: string) => {
        const categoryId = typeof eventOrValue === 'string' ? eventOrValue : newValue!;
        setActiveCategory(categoryId);
        // Reset scroll tracking state
        setScrollPosition(0);
        setHasRestored(true);
        window.scrollTo(0, 0);
    };

    // Render category filters: Chips on mobile for touch-friendliness, Tabs on larger screens
    const renderCategoryFilters = () => {
        if (isMobile) {
            // Use Chips on mobile for better usability (no scrolling)
            return (
                <Grid container spacing={0.5} sx={{ mb: 2 }}>
                    {BLOG_CATEGORIES.map((category) => (
                        <Grid item xs={6} key={category.id}>
                            <Chip
                                label={category.name}
                                onClick={() => handleTabChange(category.id)}
                                color={activeCategory === category.id ? 'primary' : 'default'}
                                variant={activeCategory === category.id ? 'filled' : 'outlined'}
                                size="small"
                                icon={getIconComponent(category.icon)}
                                sx={{
                                    width: '100%',
                                    height: '32px',
                                    fontSize: '0.8rem',
                                    fontWeight: activeCategory === category.id ? 600 : 400,
                                    '& .MuiChip-icon': {
                                        marginLeft: 0.5,
                                        color:
                                            activeCategory === category.id ? 'inherit' : theme.palette.text.secondary,
                                    },
                                }}
                            />
                        </Grid>
                    ))}
                </Grid>
            );
        } else {
            // Use Tabs on tablet and desktop for modern look
            return (
                <Tabs
                    value={activeCategory}
                    onChange={handleTabChange}
                    variant="standard"
                    sx={{ mb: 2, borderBottom: 1, borderColor: 'divider' }}
                >
                    {BLOG_CATEGORIES.map((category) => (
                        <Tab
                            key={category.id}
                            value={category.id}
                            label={category.name}
                            icon={getIconComponent(category.icon)}
                            iconPosition="start"
                            sx={{ fontSize: '0.8rem', minHeight: 48 }}
                        />
                    ))}
                </Tabs>
            );
        }
    };

    return (
        <Container maxWidth="lg" sx={{ mb: 8, px: isMobile ? 2 : 3 }}>
            {/* Modern Category Filters as Tabs */}
            <Box sx={{ mb: 1, mt: 3 }}>{renderCategoryFilters()}</Box>

            {isLoading ? (
                <BlogListingSkeleton isList={true} />
            ) : error ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
                    <Typography color="error">
                        Blog yazıları yüklenemedi. Lütfen daha sonra tekrar deneyiniz.
                    </Typography>
                </Box>
            ) : (
                <>
                    {/* Featured Post - Full Width at Top */}
                    {featuredPost && (
                        <Box sx={{ mb: 0, pb: 0 }}>
                            <BlogListItem blog={featuredPost} isFeatured={true} />
                        </Box>
                    )}

                    {/* Other Posts in 2x2 Grid */}
                    {otherPosts.length > 0 && (
                        <Box>
                            <Typography variant="h6" sx={{ mb: 3, fontSize: '1.2rem', fontWeight: 600 }}>
                                Diğer Yazılar
                            </Typography>
                            <Grid container spacing={isMobile ? 2 : 3}>
                                {otherPosts.map((post) => (
                                    <Grid item xs={12} sm={6} md={6} key={post.id}>
                                        <BlogListItem blog={post} isGridItem={true} />
                                    </Grid>
                                ))}
                            </Grid>
                        </Box>
                    )}

                    {sortedBlogPosts.length === 0 && (
                        <Box sx={{ mt: 4, textAlign: 'center', color: 'black' }}>
                            <Typography variant="h6">Bu kategoride şu anda blog yazısı bulunmamaktadır.</Typography>
                        </Box>
                    )}
                </>
            )}
        </Container>
    );
};

export default BlogListingPage;


