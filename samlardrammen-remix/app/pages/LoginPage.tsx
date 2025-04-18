import { Button, Card, CardContent, Input } from '@mui/material';
import { type EmailOtpType } from '@supabase/supabase-js';
import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useLocation, useNavigate } from 'react-router';
import { changePasswordMutation, loginMutation } from '../api/usePersonsApi';
import { useGetSupabaseClient } from '../api/useSupabase';
import { supabaseClientLoader } from '../loaders/supabaseloader';
import type { ChangePasswordValues, LoginFormValues } from '../types/formTypes';
export async function loader() {
    const [supabaseloader] = await Promise.all([supabaseClientLoader()]);
    return { ...supabaseloader };
}

const LoginPage: React.FC = () => {
    const [showChangePassword, setShowChangePassword] = useState(false);
    const supabase = useGetSupabaseClient();

    const { register, handleSubmit, reset } = useForm<LoginFormValues>();
    const {
        register: registerChangePassword,
        handleSubmit: handleChangePasswordSubmit,
        reset: resetChangePassword,
    } = useForm<ChangePasswordValues>();
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        console.log('location.pathname', location.pathname);
        if (location.pathname == '/auth/confirm') {
            loginWithHash();
        }
    }, []);

    async function loginWithHash() {
        const queryParams = new URLSearchParams(location.search);
        const token_hash = queryParams.get('token_hash')!;
        const type = queryParams.get('type') as EmailOtpType;

        const { error } = await supabase.auth.verifyOtp({ token_hash, type });
        console.log('error', error);
    }

    const changePasswordMutationFn = changePasswordMutation();
    const loginMutationFn = loginMutation();

    const onLoginSubmit = (data: LoginFormValues) => {
        loginMutationFn.mutate(data, {
            onError: (error) => {
                alert(error);
            },
        });
    };

    async function signInWithEmail(formValues: LoginFormValues) {
        const { data, error } = await supabase.auth.signInWithPassword({
            email: formValues.email,
            password: formValues.password,
        });
        if (!error) {
            navigate('.', { replace: true });
        }
    }

    const onChangePasswordSubmit = (data: ChangePasswordValues) => {
        changePasswordMutationFn.mutate(data, {
            onSuccess: () => {
                setShowChangePassword(false);
                resetChangePassword();
            },
            onError: (error) => {
                alert(error);
                console.log('Det skjedde en feil ved innlogging', error);
            },
        });
    };

    return (
        <div className="flex justify-center items-center h-screen bg-gray-50">
            <div className="w-full max-w-md">
                <Card className="shadow-lg rounded-2xl">
                    <CardContent>
                        <h1 className="text-2xl font-bold mb-4 text-center text-blue-600">Login</h1>
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
                            <div className="mb-4">
                                <Input
                                    {...register('password')}
                                    type="password"
                                    placeholder="Password"
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

                        <Button
                            className="mt-4 w-full bg-gray-500 text-white py-2 rounded-md hover:bg-gray-600"
                            onClick={() => setShowChangePassword(!showChangePassword)}
                        >
                            {showChangePassword ? 'Cancel' : 'Change Password'}
                        </Button>

                        {showChangePassword && (
                            <div className="mt-4">
                                <h2 className="text-xl font-semibold text-gray-700">Change Password</h2>
                                <form onSubmit={handleChangePasswordSubmit(onChangePasswordSubmit)}>
                                    <div className="mb-4">
                                        <Input
                                            {...registerChangePassword('currentPassword')}
                                            type="password"
                                            placeholder="Current Password"
                                            required
                                            className="border rounded-md p-2 w-full"
                                        />
                                    </div>
                                    <div className="mb-4">
                                        <Input
                                            {...registerChangePassword('newPassword')}
                                            type="password"
                                            placeholder="New Password"
                                            required
                                            className="border rounded-md p-2 w-full"
                                        />
                                    </div>
                                    <div className="mb-4">
                                        <Input
                                            {...registerChangePassword('confirmPassword')}
                                            type="password"
                                            placeholder="Confirm New Password"
                                            required
                                            className="border rounded-md p-2 w-full"
                                        />
                                    </div>
                                    <Button
                                        type="submit"
                                        className="w-full bg-green-600 text-white py-2 rounded-md hover:bg-green-700"
                                    >
                                        Update Password
                                    </Button>
                                </form>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default LoginPage;
