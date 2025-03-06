import {
    Box,
    Chip,
    Container,
    Divider,
    Grid,
    List,
    ListItem,
    Stack,
    Typography,
    useMediaQuery,
    useTheme,
} from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { compareDesc } from 'date-fns';
import { useState } from 'react';
import BlogListingSkeleton from '../components/BlogListingSkeleton';
import BlogListItem from '../components/BlogListItem';
import { BLOG_CATEGORIES, BlogItem, blogQueryKeys, fetchBlogPostsByCategory } from '../services/blogService';
import PageTemplate from './PageTemplate';
// Import Material icons
import AnnouncementIcon from '@mui/icons-material/Announcement';
import ArticleIcon from '@mui/icons-material/Article';
import EventIcon from '@mui/icons-material/Event';
import FeedIcon from '@mui/icons-material/Feed';

export const BlogListingPage = () => {
    const [activeTab, setActiveTab] = useState<string>('all');
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'md'));

    const { data, isLoading, error } = useQuery({
        queryKey: blogQueryKeys.list(activeTab),
        queryFn: () => fetchBlogPostsByCategory(activeTab === 'all' ? '' : activeTab),
        staleTime: 5 * 60 * 1000, // 5 minutes
    });

    // Get icon component based on icon name
    const getIconComponent = (iconName?: string) => {
        switch (iconName) {
            case 'article':
                return <ArticleIcon fontSize="small" />;
            case 'feed':
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

    const handleTabChange = (categoryId: string) => {
        setActiveTab(categoryId);
    };

    // Render category chips based on screen size
    const renderCategoryFilters = () => {
        if (isMobile) {
            // More compact grid layout for mobile
            return (
                <Grid container spacing={0.5} sx={{ mb: 2 }}>
                    {BLOG_CATEGORIES.map((category) => (
                        <Grid item xs={6} key={category.id}>
                            <Chip
                                label={category.name}
                                onClick={() => handleTabChange(category.id)}
                                color={activeTab === category.id ? 'primary' : 'default'}
                                variant={activeTab === category.id ? 'filled' : 'outlined'}
                                size="small"
                                icon={getIconComponent(category.icon)}
                                sx={{
                                    width: '100%',
                                    height: '32px',
                                    fontSize: '0.8rem',
                                    fontWeight: activeTab === category.id ? 600 : 400,
                                    '& .MuiChip-icon': {
                                        marginLeft: 0.5,
                                        color: activeTab === category.id ? 'inherit' : theme.palette.text.secondary,
                                    },
                                }}
                            />
                        </Grid>
                    ))}
                </Grid>
            );
        } else {
            // Compact horizontal layout for tablet and desktop
            return (
                <Stack
                    direction="row"
                    spacing={0.5}
                    sx={{
                        pb: 1,
                        justifyContent: 'center',
                        flexWrap: isTablet ? 'wrap' : 'nowrap',
                        gap: isTablet ? 0.5 : 0,
                    }}
                >
                    {BLOG_CATEGORIES.map((category) => (
                        <Chip
                            key={category.id}
                            label={category.name}
                            onClick={() => handleTabChange(category.id)}
                            color={activeTab === category.id ? 'primary' : 'default'}
                            variant={activeTab === category.id ? 'filled' : 'outlined'}
                            size="small"
                            icon={getIconComponent(category.icon)}
                            sx={{
                                fontWeight: activeTab === category.id ? 600 : 400,
                                px: 0.5,
                                mb: isTablet ? 0.5 : 0,
                                fontSize: '0.8rem',
                                '& .MuiChip-icon': {
                                    marginLeft: 0.5,
                                    color: activeTab === category.id ? 'inherit' : theme.palette.text.secondary,
                                },
                            }}
                        />
                    ))}
                </Stack>
            );
        }
    };

    return (
        <PageTemplate>
            <Container maxWidth="lg" sx={{ mb: 8 }}>
                {/* Responsive Category Filters - more compact */}
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
                        <List sx={{ width: '100%', bgcolor: 'background.paper' }}>
                            {sortedBlogPosts.map((post, index) => (
                                <Box key={post.id}>
                                    <ListItem disablePadding sx={{ py: 2 }}>
                                        <BlogListItem blog={post} />
                                    </ListItem>
                                    {index < sortedBlogPosts.length - 1 && <Divider component="li" />}
                                </Box>
                            ))}
                        </List>

                        {sortedBlogPosts.length === 0 && (
                            <Box sx={{ mt: 4, textAlign: 'center' }}>
                                <Typography variant="h6">Bu kategoride şu anda blog yazısı bulunmamaktadır.</Typography>
                            </Box>
                        )}
                    </>
                )}
            </Container>
        </PageTemplate>
    );
};

export default BlogListingPage;
