import { render } from 'storyblok-rich-text-react-renderer';

export function SbRichText({ content }: { content: any }) {
    return <div className="prose prose-lg">{render(content)}</div>;
}
