import { createServerClient, parseCookieHeader, serializeCookieHeader } from '@supabase/ssr';
import type { LoaderFunctionArgs } from 'react-router';
export async function supabaseLoader({ request }: LoaderFunctionArgs) {
    const headers = new Headers();

    const supabase = useSupabaseServerClient(request, headers);
    return new Response('...', {
        headers,
    });
}

export function useSupabaseServerClient(request: Request, headers: Headers) {
    return createServerClient(process.env.SUPABASE_URL!, process.env.SUPABASE_ANON_KEY!, {
        cookies: {
            getAll() {
                return parseCookieHeader(request.headers.get('Cookie') ?? '');
            },
            setAll(cookiesToSet) {
                cookiesToSet.forEach(({ name, value, options }) =>
                    headers.append('Set-Cookie', serializeCookieHeader(name, value, options))
                );
            },
        },
    });
}

export function supabaseClientLoader() {
    return {
        env: {
            SUPABASE_URL: process.env.SUPABASE_URL!,
            SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY!,
        },
    };
}
