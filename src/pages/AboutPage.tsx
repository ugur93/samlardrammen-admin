import { useStoryblok } from '@storyblok/react';
import React from 'react';
import ContentPageTemplate from '../components/ContentPageTemplate';
import LoadingState from '../components/LoadingState';
import { sbParams } from '../environment';

// Define the AboutusItem interface according to the actual data structure
export interface AboutusItem {
    content: {
        content: string;
        title: string;
        _uid: string;
        _editable: string;
    };
    published_at: string;
}

const AboutPage: React.FC = () => {
    // Use react-query to fetch data
    const story = useStoryblok('about-us', sbParams);

    if (!story?.content) {
        return <LoadingState message="Laster" />;
    }

    const content = story?.content;

    return (
        <ContentPageTemplate
            title={content.title}
            content={content.content}
            publishedAt={content.story?.published_at}
        />
    );
};

export default AboutPage;
