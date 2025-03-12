import { getStoryblokApi, type StoryblokClient } from '@storyblok/react';
import { sbParams } from '../environment';
import { supabaseClientLoader } from '../loaders/supabaseloader';
import AboutPage from '../pages/AboutPage';

export function meta({ data: { story } }: Route.MetaArgs<typeof loader>) {
    return [
        {
            title: story.name,
        },
        {
            property: 'og:title',
            content: story.name,
        },

        { name: 'og:locale', content: 'tr' },
    ];
}

export async function loader() {
    const storyblokApi: StoryblokClient = getStoryblokApi();

    const response = await storyblokApi.get(`cdn/stories/about-us`, sbParams, {
        cache: 'no-store',
    });

    const [supabaseloader] = await Promise.all([supabaseClientLoader()]);
    return { ...supabaseloader, story: response.data.story };
}

export default function AboutUs() {
    return <AboutPage />;
}
