import { createServerClient, parseCookieHeader, serializeCookieHeader } from '@supabase/ssr';

function getSupabaseServerClient(request: Request, params = { admin: false }) {
    const headers = new Headers();

    const supabase = createServerClient(process.env.SUPABASE_URL!, process.env.SUPABASE_ANON_KEY!, {
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

    return supabase;
}

export default getSupabaseServerClient;
