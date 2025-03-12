import React from 'react';
import { useLoaderData } from 'react-router';
import ContentPageTemplate from '../components/ContentPageTemplate';
import type { loader } from '../routes/ourhistory';

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
    const { story } = useLoaderData<typeof loader>();

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
