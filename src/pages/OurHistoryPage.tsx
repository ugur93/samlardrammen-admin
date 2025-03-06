import { useStoryblok } from '@storyblok/react';
import React from 'react';
import ContentPageTemplate from '../components/ContentPageTemplate';
import LoadingState from '../components/LoadingState';
import { sbParams } from '../environment';

// Define the SimpleItem interface according to the data structure
export interface SimpleItem {
    id: string;
    slug: string;
    first_published_at: string;
    content: {
        content: string;
        image: {
            filename: string;
        };
    };
}

const OurHistoryPage: React.FC = () => {
    // Use Storyblok hook to fetch data
    const story = useStoryblok('tarihimiz', sbParams);

    if (!story?.content) {
        return <LoadingState message="Laster" />;
    }

    const content = story?.content;

    return (
        <ContentPageTemplate
            title="Tarihimiz"
            content={content.content}
            image={content.image}
            publishedAt={story.first_published_at}
        />
    );
};

export default OurHistoryPage;
