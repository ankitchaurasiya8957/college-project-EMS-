import React, { createContext, useState, useEffect } from 'react';
import api from '../utils/axios';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const userInfo = localStorage.getItem('userInfo');
        if (userInfo) {
            setUser(JSON.parse(userInfo));
        }
        setLoading(false);
    }, []);

    const login = async (email, password) => {
        try {
            const { data } = await api.post('/auth/login', { email, password });
            setUser(data);
            localStorage.setItem('userInfo', JSON.stringify(data));
            localStorage.setItem('token', data.token);
            return data;
        } catch (error) {
            if (!error.response) {
                throw 'Cannot connect to the server. Make sure the backend is running on port 5000.';
            }
            if (error.response?.data?.needsVerification) throw error.response.data;
            throw error.response?.data?.message || 'Login failed';
        }
    };

    const register = async (name, email, password) => {
        try {
            const { data } = await api.post('/auth/register', { name, email, password });
            return data; // Returns { message, email }
        } catch (error) {
            if (!error.response) {
                throw 'Cannot connect to the server. Make sure the backend is running on port 5000.';
            }
            throw error.response?.data?.message || 'Registration failed';
        }
    };

    const verifyOTP = async (email, otp) => {
        try {
            const { data } = await api.post('/auth/verify-otp', { email, otp });
            setUser(data);
            localStorage.setItem('userInfo', JSON.stringify(data));
            localStorage.setItem('token', data.token);
            return data;
        } catch (error) {
            if (!error.response) {
                throw 'Cannot connect to the server. Make sure the backend is running on port 5000.';
            }
            throw error.response?.data?.message || 'OTP verification failed';
        }
    };

    const resendOTP = async (email) => {
        try {
            const { data } = await api.post('/auth/resend-otp', { email });
            return data;
        } catch (error) {
            if (!error.response) {
                throw 'Cannot connect to the server.';
            }
            throw error.response?.data?.message || 'Failed to resend OTP';
        }
    };

    const forgotPassword = async (email) => {
        try {
            const { data } = await api.post('/auth/forgot-password', { email });
            return data;
        } catch (error) {
            if (!error.response) {
                throw 'Cannot connect to the server.';
            }
            throw error.response?.data?.message || 'Failed to send reset OTP';
        }
    };

    const verifyResetOTP = async (email, otp) => {
        try {
            const { data } = await api.post('/auth/verify-reset-otp', { email, otp });
            return data; // Returns { message, resetToken }
        } catch (error) {
            if (!error.response) {
                throw 'Cannot connect to the server.';
            }
            throw error.response?.data?.message || 'OTP verification failed';
        }
    };

    const resetPassword = async (resetToken, newPassword) => {
        try {
            const { data } = await api.post('/auth/reset-password', { resetToken, newPassword });
            return data;
        } catch (error) {
            if (!error.response) {
                throw 'Cannot connect to the server.';
            }
            throw error.response?.data?.message || 'Password reset failed';
        }
    };

    const updateProfile = async (name) => {
        try {
            const { data } = await api.put('/auth/profile', { name });
            setUser(data);
            localStorage.setItem('userInfo', JSON.stringify(data));
            localStorage.setItem('token', data.token);
            return data;
        } catch (error) {
            if (!error.response) {
                throw 'Cannot connect to the server.';
            }
            throw error.response?.data?.message || 'Profile update failed';
        }
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('userInfo');
        localStorage.removeItem('token');
    };

    return (
        <AuthContext.Provider value={{
            user,
            login,
            register,
            verifyOTP,
            resendOTP,
            forgotPassword,
            verifyResetOTP,
            resetPassword,
            updateProfile,
            logout,
            loading
        }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};
