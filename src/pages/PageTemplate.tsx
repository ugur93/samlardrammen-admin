import { AppBar, Box } from "@mui/material";
import { Query, QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { PropsWithChildren } from "react";
export const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            refetchOnWindowFocus: false,
            gcTime: 1000 * 60 * 60 * 24, // 24 hours
            staleTime: 2000,
            retry: 0,
        },
    },
});
export default function PageTemplate({ children }: PropsWithChildren<unknown>) {
    return (
        <QueryClientProvider client={queryClient}>
            <AppBar position="static">{children}</AppBar>
        </QueryClientProvider>
    );
}
