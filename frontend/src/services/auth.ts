import { api } from '../lib/axios';

export interface User {
    id: number;
    email: string;
    is_active: boolean;
    is_superuser: boolean;
}

export interface LoginResponse {
    access_token: string;
    token_type: string;
}

export const authService = {
    login: async (credentials: any) => {
        // Support both form-data (standard OAuth2) and JSON login
        // Using form-data as per the backend's primary login endpoint
        const formData = new FormData();
        formData.append('username', credentials.email);
        formData.append('password', credentials.password);

        const response = await api.post<LoginResponse>('/auth/login', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    },

    getMe: async () => {
        const response = await api.get<User>('/auth/me');
        return response.data;
    },
};
