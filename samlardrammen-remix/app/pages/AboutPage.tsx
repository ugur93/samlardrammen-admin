import React from 'react';
import { useLoaderData } from 'react-router';
import ContentPageTemplate from '../components/ContentPageTemplate';
import type { loader } from '../routes/aboutus';

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
    const { story } = useLoaderData<typeof loader>();

    const content = story.content;

    return (
        <ContentPageTemplate
            title={content.title}
            content={content.content}
            publishedAt={content.story?.published_at}
        />
    );
};

export default AboutPage;
