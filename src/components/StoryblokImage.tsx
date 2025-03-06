import { Box } from '@mui/material';

interface StoryblokImageProps {
    filename: string;
    alt: string;
    width?: number;
    height?: number;
    className?: string;
    style?: React.CSSProperties;
}

export const StoryblokImage = ({ filename, alt, width, height, className = '', style = {} }: StoryblokImageProps) => {
    // Helper function to build optimized image URL from Storyblok
    const getOptimizedImage = (imageUrl: string): string => {
        // Skip processing if the URL isn't from Storyblok
        if (!imageUrl.includes('a.storyblok.com')) {
            return imageUrl;
        }

        // Start building query params for the image service
        const params: string[] = [];

        // Add dimensions for resizing if provided
        if (width) params.push(`width=${width}`);
        if (height) params.push(`height=${height}`);

        // If no params were added, return original URL
        if (params.length === 0) {
            return imageUrl;
        }

        // Add the image service filters to the URL
        const separator = imageUrl.includes('?') ? '&' : '?';
        return `${imageUrl}${separator}${params.join('&')}`;
    };

    return (
        <Box
            component="img"
            src={getOptimizedImage(filename)}
            alt={alt}
            className={className}
            style={{
                maxWidth: '100%',
                height: 'auto',
                ...style,
            }}
            loading="lazy"
        />
    );
};

export default StoryblokImage;
