import { Box, Container, Divider, Fade, Paper, Typography } from '@mui/material';
import React from 'react';
import { SbRichText } from './StorybBlokComponents';

interface ContentPageTemplateProps {
    title: string;
    content: string;
    publishedAt?: string | null;
    image?: {
        filename: string;
    };
    children?: React.ReactNode;
}

const ContentPageTemplate: React.FC<ContentPageTemplateProps> = ({ title, content, publishedAt, image, children }) => {
    return (
        <Fade in timeout={800}>
            <Container maxWidth="lg" sx={{ py: 8 }}>
                <Paper
                    elevation={2}
                    sx={{
                        p: { xs: 3, md: 6 },
                        borderRadius: 2,
                        backgroundColor: 'background.paper',
                        position: 'relative',
                        overflow: 'hidden',
                    }}
                >
                    <Box
                        sx={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            width: '100%',
                            height: '4px',
                            background: 'linear-gradient(90deg, primary.main, secondary.main)',
                        }}
                    />

                    <Box mb={4}>
                        <Typography
                            variant="h2"
                            component="h1"
                            fontWeight="bold"
                            sx={{
                                mb: 2,
                                color: 'primary.main',
                                fontSize: { xs: '2.5rem', md: '3.5rem' },
                            }}
                        >
                            {title}
                        </Typography>

                        <Divider sx={{ mb: 4 }} />

                        {/* Display the featured image if available */}
                        {image && image.filename && (
                            <Box sx={{ my: 4, textAlign: 'center' }}>
                                <img
                                    src={image.filename}
                                    alt={title}
                                    style={{
                                        maxWidth: '100%',
                                        borderRadius: '8px',
                                        boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
                                    }}
                                />
                            </Box>
                        )}

                        {/* Additional content - can be used for custom elements */}
                        {children}

                        {/* Render content as HTML or as structured by Storyblok */}
                        <Box
                            sx={{
                                mt: 4,
                                typography: 'body1',
                                '& img': {
                                    maxWidth: '100%',
                                    borderRadius: 1,
                                    my: 2,
                                },
                                '& h1, & h2, & h3, & h4, & h5': {
                                    color: 'primary.main',
                                    mt: 4,
                                    mb: 2,
                                },
                                '& a': {
                                    color: 'secondary.main',
                                    textDecoration: 'none',
                                    '&:hover': {
                                        textDecoration: 'underline',
                                    },
                                },
                                '& blockquote': {
                                    borderLeft: '4px solid',
                                    borderColor: 'primary.light',
                                    pl: 2,
                                    py: 0.5,
                                    my: 2,
                                    fontStyle: 'italic',
                                    bgcolor: 'background.default',
                                    borderRadius: 1,
                                },
                            }}
                        >
                            <SbRichText content={content} />
                        </Box>
                    </Box>

                    {/* Display published date if available */}
                    {publishedAt && (
                        <Box
                            mt={6}
                            pt={2}
                            sx={{
                                color: 'text.secondary',
                                borderTop: '1px solid',
                                borderColor: 'divider',
                            }}
                        >
                            <Typography variant="caption" sx={{ fontStyle: 'italic' }}>
                                Sist oppdatert: {new Date(publishedAt).toLocaleDateString()}
                            </Typography>
                        </Box>
                    )}
                </Paper>
            </Container>
        </Fade>
    );
};

export default ContentPageTemplate;
