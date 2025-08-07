import React, { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { motion } from "framer-motion";
import { FaUser } from "react-icons/fa";
import { toast } from "react-toastify";
import { clearAuthState, loadUser } from "../../Redux/Slices/authSlice";
import {
    Card,
    CardHeader,
    CardTitle,
    CardContent,
} from "../ui/card";
import AnimeLoadingPage from "../Loading/AnimeLoadingPage";

const AdminDashboard = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { isAuthenticated, user, isLoading, error } = useSelector((state) => state.auth);

    useEffect(() => {
        if (!isAuthenticated) {
            toast.error("Please log in to view your admin profile", { position: "top-right", autoClose: 3000 });
            navigate("/signin");
            return;
        }
        if (!user || !user._id) {
            dispatch(loadUser());
        }
        if (user && user.role !== "admin") {
            toast.error("Access denied: Admin role required", { position: "top-right", autoClose: 3000 });
            navigate("/profile");
            return;
        }
        return () => {
            dispatch(clearAuthState());
        };
    }, [dispatch, isAuthenticated, navigate, user]);

    if (isLoading) {
        return (
            <div className="bg-gray-900 min-h-screen flex items-center justify-center">
                <AnimeLoadingPage />
            </div>
        );
    }

    if (error || !user) {
        return (
            <div className="bg-gray-900 min-h-screen flex items-center justify-center">
                <p className="text-red-500">{error || "Admin profile not found"}</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-900 dark:bg-gray-100 font-['Bubblegum_Sans']">
            <div className="container mx-auto px-6 py-8">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="max-w-2xl mx-auto"
                >
                    <Card className="bg-gray-800 dark:bg-gray-200 text-gray-100 dark:text-gray-900 shadow-lg">
                        <CardHeader className="text-center border-b border-gray-700 dark:border-gray-300 pb-6">
                            <CardTitle className="text-3xl font-bold">Admin Profile</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6 p-6">
                            <div className="bg-gray-700 dark:bg-gray-100 p-4 rounded-lg">
                                <h3 className="text-xl font-semibold text-gray-100 dark:text-gray-900 flex items-center gap-2 mb-2">
                                    <FaUser /> Admin Details
                                </h3>
                                <p className="text-gray-300 dark:text-gray-700">Name: {user.firstName} {user.lastName || ""}</p>
                                <p className="text-gray-300 dark:text-gray-700">Email: {user.email || "N/A"}</p>
                                <p className="text-gray-300 dark:text-gray-700">Role: {user.role || "admin"}</p>
                                {/* Add admin-specific content, e.g., management tools */}
                                <p className="text-gray-300 dark:text-gray-700 mt-4">Admin Dashboard: Manage users, comics, and subscriptions.</p>
                                {/* Example links */}
                                <div className="mt-4 space-y-2">
                                    <Link to="/admin/users" className="text-blue-400 hover:underline">Manage Users</Link>
                                    <Link to="/admin/comics" className="text-blue-400 hover:underline">Manage Comics</Link>
                                    <Link to="/admin/subscriptions" className="text-blue-400 hover:underline">Manage Subscriptions</Link>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
            </div>
        </div>
    );
};

export default AdminDashboard;