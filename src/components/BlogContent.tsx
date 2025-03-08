import { Box, Typography } from '@mui/material';
import DOMPurify from 'dompurify';
import { ReactNode } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { NODE_PARAGRAPH, render, RenderOptions } from 'storyblok-rich-text-react-renderer';
import { RichTextContent } from '../services/blogService';

interface BlogContentProps {
    content: string | RichTextContent;
}
const renderconfig: RenderOptions = {
    nodeResolvers: {
        [NODE_PARAGRAPH]: (children: ReactNode) => <p className="pt-2 pb-2">{children}</p>,
    },
};
export const BlogContent = ({ content }: BlogContentProps) => {
    // Sanitize content to prevent XSS attacks

    if (!content) {
        return (
            <Box sx={{ textAlign: 'center', py: 4 }}>
                <Typography variant="body1" color="text.primary">
                    İçerik bulunamadı.
                </Typography>
            </Box>
        );
    }
    if (typeof content === 'object' && content.type === 'doc') {
        return <div>{render(content, renderconfig)}</div>;
    }
    const sanitizedContent = DOMPurify.sanitize(content as string);

    return (
        <Box
            className="blog-content"
            sx={{
                color: 'text.primary',
                fontSize: '1.125rem',
                lineHeight: 1.6,
                '& img': {
                    maxWidth: '100%',
                    height: 'auto',
                    display: 'block',
                    margin: '1.5rem auto',
                    borderRadius: '4px',
                },
                '& h1': {
                    fontSize: '2rem',
                    mt: 4,
                    mb: 2,
                    color: 'text.primary',
                },
                '& h2': {
                    fontSize: '1.75rem',
                    mt: 3.5,
                    mb: 2,
                    color: 'text.primary',
                },
                '& h3': {
                    fontSize: '1.5rem',
                    mt: 3,
                    mb: 1.5,
                    color: 'text.primary',
                },
                '& h4, & h5, & h6': {
                    mt: 2.5,
                    mb: 1.5,
                    color: 'text.primary',
                },
                '& p': {
                    mb: 2,
                    color: 'text.primary',
                },
                '& ul, & ol': {
                    mb: 2,
                    pl: 3,
                    color: 'text.primary',
                },
                '& a': {
                    color: 'primary.main',
                    textDecoration: 'underline',
                    '&:hover': {
                        color: 'primary.dark',
                    },
                },
                '& blockquote': {
                    borderLeft: '4px solid',
                    borderColor: 'primary.light',
                    paddingLeft: 2,
                    fontStyle: 'italic',
                    mx: 0,
                    my: 2,
                    color: 'text.primary',
                },
                '& pre': {
                    backgroundColor: 'rgba(0, 0, 0, 0.05)',
                    padding: 2,
                    borderRadius: 1,
                    overflow: 'auto',
                },
                '& code': {
                    fontFamily: 'monospace',
                    backgroundColor: 'rgba(0, 0, 0, 0.05)',
                    padding: '2px 4px',
                    borderRadius: '3px',
                },
                '& table': {
                    width: '100%',
                    borderCollapse: 'collapse',
                    mb: 3,
                },
                '& th, & td': {
                    border: '1px solid rgba(0, 0, 0, 0.1)',
                    padding: '8px 12px',
                    textAlign: 'left',
                },
                '& th': {
                    backgroundColor: 'rgba(0, 0, 0, 0.05)',
                },
            }}
        >
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{sanitizedContent}</ReactMarkdown>
        </Box>
    );
};

export default BlogContent;
