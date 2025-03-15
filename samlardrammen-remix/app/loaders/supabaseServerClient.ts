import { createServerClient, parseCookieHeader, serializeCookieHeader } from '@supabase/ssr';
import { jwtDecode, type JwtPayload } from 'jwt-decode';
type JwtCustomPayload = JwtPayload & {
    user_roles: string[];
};
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

export async function getUserRoles(request: Request) {
    const client = getSupabaseServerClient(request);
    const session = await client.auth.getSession();
    const jwtToken = session.data.session?.access_token;
    if (jwtToken) {
        const jwtTokenParsed = jwtDecode<JwtCustomPayload>(jwtToken);
        const roles = jwtTokenParsed.user_roles;
        return roles ?? [];
    }
    return null;
}
export default getSupabaseServerClient;
