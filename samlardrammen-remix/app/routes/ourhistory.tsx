import { getStoryblokApi, type StoryblokClient } from '@storyblok/react';
import { sbParams } from '../environment';
import { supabaseClientLoader } from '../loaders/supabaseloader';
import OurHistoryPage from '../pages/OurHistoryPage';

export function meta({ data: { story } }: Route.MetaArgs<typeof loader>) {
    console.log(story);
    return [
        {
            title: story.name,
        },
        {
            property: 'og:title',
            content: story.name,
        },
        {
            property: 'og:image',
            content: story.content.image?.filename,
        },
        { name: 'og:locale', content: 'tr' },
    ];
}

export async function loader() {
    const storyblokApi: StoryblokClient = getStoryblokApi();

    const response = await storyblokApi.get(`cdn/stories/tarihimiz`, sbParams, {
        cache: 'no-store',
    });

    const [supabaseloader] = await Promise.all([supabaseClientLoader()]);
    return { ...supabaseloader, story: response.data.story };
}

export default function OurHistory() {
    return <OurHistoryPage />;
}
