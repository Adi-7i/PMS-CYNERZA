import { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { authService } from "../services/auth";
import { Loader2 } from "lucide-react";

export default function Login() {
    const { login } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    // @ts-ignore
    const from = location.state?.from?.pathname || "/";

    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const { register, handleSubmit, formState: { errors } } = useForm({
        defaultValues: {
            email: "",
            password: ""
        }
    });

    const onSubmit = async (data: any) => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await authService.login(data);
            login(response.access_token);
            navigate(from, { replace: true });
        } catch (err: any) {
            console.error(err);
            if (err.response?.status === 401) {
                setError("Invalid email or password");
            } else {
                setError("Something went wrong. Please try again.");
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
            <div className="max-w-md w-full p-8 bg-white rounded-2xl shadow-2xl">
                <div className="text-center mb-8">
                    <div className="mx-auto h-12 w-12 bg-blue-600 rounded-lg flex items-center justify-center mb-4 shadow-lg transform rotate-3">
                        <svg className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Hotel PMS</h1>
                    <p className="text-gray-500 mt-2">Welcome back! Please sign in.</p>
                </div>

                {error && (
                    <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-6 text-sm flex items-center justify-center border border-red-100">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1.5 ml-1">Email</label>
                        <input
                            {...register("email", { required: "Email is required" })}
                            type="email"
                            className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all bg-gray-50 focus:bg-white"
                            placeholder="admin@hotel.com"
                        />
                        {errors.email && <span className="text-red-500 text-xs mt-1 ml-1">{errors.email.message}</span>}
                    </div>

                    <div>
                        <div className="flex justify-between items-center mb-1.5 ml-1">
                            <label className="block text-sm font-semibold text-gray-700">Password</label>
                            <a href="#" className="text-xs text-blue-600 hover:text-blue-800 font-medium">Forgot password?</a>
                        </div>
                        <input
                            {...register("password", { required: "Password is required" })}
                            type="password"
                            className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all bg-gray-50 focus:bg-white"
                            placeholder="••••••••"
                        />
                        {errors.password && <span className="text-red-500 text-xs mt-1 ml-1">{errors.password.message}</span>}
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center font-medium shadow-lg shadow-blue-600/30 hover:shadow-blue-600/40 relative top-0 hover:-top-0.5"
                    >
                        {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Sign In to Dashboard"}
                    </button>

                    <div className="text-center mt-6">
                        <p className="text-xs text-gray-400">© 2025 Hotel Management System. All rights reserved.</p>
                    </div>
                </form>
            </div>
        </div>
    );
}
