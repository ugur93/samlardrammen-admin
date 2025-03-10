import { Button, Card, CardContent, Input } from '@mui/material';
import { type EmailOtpType } from '@supabase/supabase-js';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useLocation } from 'react-router';
import { QueryKeys, useGetSupabaseClient } from '../api/usePersonsApi';
import type { LoginFormValues } from '../types/formTypes';

const LoginMagicLinkPage: React.FC = () => {
    const { register, handleSubmit, reset } = useForm<LoginFormValues>();
    const supabase = useGetSupabaseClient();

    const location = useLocation();
    const qc = useQueryClient();
    const sendMagicLinkMutationFn = useMutation({
        mutationFn: async ({ email }: { email: string }) => {
            const { data, error } = await supabase.auth.signInWithOtp({
                email: email,
                options: {
                    // set this to false if you do not want the user to be automatically signed up
                    shouldCreateUser: true,
                },
            });

            console.log('data', data, error);
            if (error) {
                console.error('Det skjeddde en feil', error);
                throw new Error('Det skjeddde en feil');
            }
        },
    });

    useEffect(() => {
        if (location.pathname == '/auth/confirm') {
            loginWithHash();
        }
    }, []);

    async function loginWithHash() {
        const queryParams = new URLSearchParams(location.search);
        const token_hash = queryParams.get('token_hash')!;
        const type = queryParams.get('type') as EmailOtpType;
        if (!token_hash || !type) return;

        const { error } = await supabase.auth.verifyOtp({ token_hash, type });
        await qc.refetchQueries({ queryKey: QueryKeys.loggedInUser });
    }

    async function signInWithEmail(formValues: LoginFormValues) {
        sendMagicLinkMutationFn.mutate({ email: formValues.email });
    }

    return (
        <div className="flex justify-center items-center h-screen bg-gray-50">
            <div className="w-full max-w-md">
                <Card className="shadow-lg rounded-2xl">
                    <CardContent>
                        <h1 className="text-2xl font-bold mb-4 text-center text-blue-600">Login</h1>
                        {sendMagicLinkMutationFn.isIdle ? (
                            <form onSubmit={handleSubmit(signInWithEmail)}>
                                <div className="mb-4">
                                    <Input
                                        {...register('email')}
                                        placeholder="Email"
                                        type="email"
                                        required
                                        className="border rounded-md p-2 w-full"
                                    />
                                </div>
                                <Button
                                    type="submit"
                                    className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700"
                                >
                                    Login
                                </Button>
                            </form>
                        ) : (
                            <div>Innloggingslenke er sendt til din epost</div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default LoginMagicLinkPage;
