import { apiPlugin, getStoryblokApi, storyblokInit } from '@storyblok/react';

export interface BlogItems {
    stories: BlogItem[];
}
export interface RichTextContent {
    type: string;
    text?: string;
    attrs?: {
        href?: string;
        target?: string;
    };
    content?: RichTextContent[];
}
export interface BlogItemContent {
    content: string;
    image: {
        filename: string;
    };
    preview: string;
    title: string;
    date_original_published?: string;
}

export interface BlogItemQueryResult {
    story: BlogItem;
}

export interface BlogItem {
    id: string;
    slug: string;
    first_published_at: string;
    full_slug: string;
    content: BlogItemContent;
}

export interface BlogCategory {
    id: string;
    name: string;
    slug: string;
    icon?: string; // Icon name for Material UI icons
}

export const BLOG_CATEGORIES: BlogCategory[] = [
    { id: 'all', name: 'Tüm Yazılar', slug: '', icon: 'article' },
    { id: 'blog', name: 'Haberler', slug: 'Blog', icon: 'feed' },
    { id: 'events', name: 'Etkinlikler', slug: 'events', icon: 'event' },
    { id: 'announcements', name: 'Duyurular', slug: 'announcements', icon: 'announcement' },
    { id: 'transfered_blogs', name: 'Eski yazilar', slug: 'transfered_blogs', icon: 'announcement' },
];

const storyBlokToken = 'rypNe7npaknPmrlwS8QHOQtt';

// Initialize the Storyblok SDK
storyblokInit({
    accessToken: storyBlokToken,
    use: [apiPlugin],
});

// Blog post query keys for React Query
export const blogQueryKeys = {
    all: ['blogs'] as const,
    lists: () => [...blogQueryKeys.all, 'list'] as const,
    detail: (slug: string) => [...blogQueryKeys.all, 'detail', slug] as const,
    list: (filters: string) => [...blogQueryKeys.lists(), { filters }] as const,
};

export const fetchBlogPosts = async (): Promise<BlogItems> => {
    try {
        const storyblokApi = getStoryblokApi();
        const { data } = await storyblokApi.get('cdn/stories', {
            starts_with: 'blog/',
            version: 'published',
        });

        return data;
    } catch (error) {
        console.error('Error fetching blog posts:', error);
        throw error;
    }
};

export const fetchBlogPostBySlug = async (slug: string): Promise<BlogItem> => {
    try {
        const storyblokApi = getStoryblokApi();

        // If it's already a full slug (contains /)
        if (slug.includes('/')) {
            const { data } = await storyblokApi.get(`cdn/stories/${slug}`, {
                version: 'published',
            });
            return data.story;
        } else {
            // Fallback to the old behavior (prepending 'blog/')
            const { data } = await storyblokApi.get(`cdn/stories/${slug}`, {
                version: 'published',
            });
            return data.story;
        }
    } catch (error) {
        console.error(`Error fetching blog post with slug ${slug}:`, error);
        throw error;
    }
};

// New function to determine the proper return path from a full slug
export const getCategoryFromFullSlug = (fullSlug: string): string => {
    // Extract the category from the full slug (e.g., 'blog/post-title' -> 'blog')
    const parts = fullSlug.split('/');
    if (parts.length >= 1) {
        return parts[0];
    }
    return 'blog'; // Default to 'blog' if no category found
};

export const fetchBlogPostsByCategory = async (category: string): Promise<BlogItems> => {
    try {
        const storyblokApi = getStoryblokApi();
        const path = category ? `${category}/` : 'blog/';

        const { data } = await storyblokApi.get(`cdn/stories`, {
            version: 'published',
            starts_with: path,
            sort_by: 'first_published_at:desc:string',
            per_page: 10,
            page: 1,
            filter_query: {
                component: { in: 'Blog' },
            },
        });

        return data;
    } catch (error) {
        console.error('Error fetching blog posts by category:', error);
        throw new Error('Failed to fetch blog posts by category');
    }
};
