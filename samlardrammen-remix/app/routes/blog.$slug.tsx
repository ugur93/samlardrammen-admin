export function meta({}: Route.MetaArgs) {
    return [{ title: 'New React Router App' }, { name: 'description', content: 'Welcome to React Router!' }];
}

export function loader({ context }: Route.LoaderArgs) {
    return { message: 'Hello from Vercel' };
}

export default function Blog({ loaderData }: Route.ComponentProps) {
    return <div></div>;
}
