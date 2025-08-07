import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import {
    FaUser,
    FaUsers,
    FaChartLine,
    FaCog,
    FaBars,
    FaTimes,
    FaBook,
    FaCreditCard,
    FaHome,
    FaSignOutAlt
} from "react-icons/fa";
import { toast } from "react-toastify";
import { clearAuthState, loadUser } from "../../Redux/Slices/authSlice";
import { getUsers } from "../../Redux/Slices/adminSlice";
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
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const { isAuthenticated, user, isLoading: authLoading, error: authError } = useSelector((state) => state.auth);
    const { users, isLoading: adminLoading, error: adminError, pagination } = useSelector((state) => state.admin);
    const { totalComics, isLoading: comicLoading, error: comicError } = useSelector((state) => state.comic);
    const { premiumUsers } = useSelector((state) => state.subscription);
    // Navigation items for the sidebar
    const navigationItems = [
        { name: "Dashboard", href: "/admin", icon: FaHome },
        { name: "Users", href: "/admin/users", icon: FaUsers },
        { name: "Comics", href: "/admin/comics", icon: FaBook },
        { name: "Subscriptions", href: "/admin-subscriptions", icon: FaCreditCard },
    ];

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
        dispatch(getUsers({ page: 1, limit: 5 }));
        return () => {
            dispatch(clearAuthState());
        };
    }, [dispatch, isAuthenticated, navigate, user, totalComics]);

    const toggleSidebar = () => {
        setSidebarOpen(!sidebarOpen);
    };

    if (authLoading || adminLoading || comicLoading) {
        return (
            <div className="bg-gray-900 min-h-screen flex items-center justify-center">
                <AnimeLoadingPage />
            </div>
        );
    }

    if (authError || adminError || comicError) {
        toast.error(authError || adminError || comicError || "Failed to load admin dashboard", { position: "top-right", autoClose: 3000 });
        return (
            <div className="min-h-screen bg-gray-900 dark:bg-gray-100 font-['Bubblegum_Sans']">
                <div className="container mx-auto px-6 py-8">
                    <div className="max-w-4xl mx-auto">
                        <p className="text-red-500 text-center py-8">An error occurred. Please try again.</p>
                        <button
                            onClick={() => {
                                dispatch(getUsers({ page: 1, limit: 5 }));
                                dispatch(totalComics()); // Retry fetching total comics
                            }}
                            className="mx-auto block bg-red-300 hover:bg-red-400 text-gray-100 px-4 py-2 rounded-lg"
                        >
                            Retry
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-900 dark:bg-gray-100 font-['Bubblegum_Sans'] flex">
            {/* Sidebar */}
            <AnimatePresence>
                {sidebarOpen && (
                    <>
                        {/* Overlay for mobile */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setSidebarOpen(false)}
                            className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
                        />

                        {/* Sidebar */}
                        <motion.div
                            initial={{ x: -300, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            exit={{ x: -300, opacity: 0 }}
                            transition={{ duration: 0.3 }}
                            className="fixed left-0 top-0 h-full w-64 bg-gray-800 dark:bg-gray-200 shadow-2xl z-50 lg:relative lg:translate-x-0"
                        >
                            {/* Sidebar Header */}
                            <div className="p-6 border-b border-gray-700 dark:border-gray-300">
                                <div className="flex items-center justify-between">
                                    <h2 className="text-xl font-bold text-gray-100 dark:text-gray-900">Admin Panel</h2>
                                    <button
                                        onClick={toggleSidebar}
                                        className="lg:hidden text-gray-100 dark:text-gray-900 hover:text-red-400 transition-colors"
                                    >
                                        <FaTimes size={20} />
                                    </button>
                                </div>
                                {user && (
                                    <div className="mt-4 p-3 bg-gray-700 dark:bg-gray-300 rounded-lg">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-red-400 rounded-full flex items-center justify-center">
                                                <FaUser className="text-white" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-gray-100 dark:text-gray-900">
                                                    {user.firstName} {user.lastName || ""}
                                                </p>
                                                <p className="text-xs text-gray-300 dark:text-gray-700">{user.email}</p>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Navigation */}
                            <nav className="p-4 space-y-2">
                                {navigationItems.map((item) => (
                                    <Link
                                        key={item.name}
                                        to={item.href}
                                        onClick={() => setSidebarOpen(false)}
                                        className="flex items-center gap-3 px-4 py-3 text-gray-100 dark:text-gray-900 hover:bg-gray-700 dark:hover:bg-gray-300 rounded-lg transition-colors group"
                                    >
                                        <item.icon className="text-red-400 group-hover:text-red-500 transition-colors" />
                                        <span className="font-medium">{item.name}</span>
                                    </Link>
                                ))}
                            </nav>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            {/* Main Content */}
            <div className="flex-1 flex flex-col">
                {/* Top Bar */}
                <div className="bg-gray-800 dark:bg-gray-200 shadow-lg border-b border-gray-700 dark:border-gray-300">
                    <div className="px-6 py-4 flex items-center justify-between">
                        <button
                            onClick={toggleSidebar}
                            className="text-gray-100 dark:text-gray-900 hover:text-red-400 transition-colors"
                        >
                            <FaBars size={24} />
                        </button>
                        <h1 className="text-2xl font-bold text-gray-100 dark:text-gray-900">Admin Dashboard</h1>
                        <div className="w-6"></div> {/* Spacer for centering */}
                    </div>
                </div>

                {/* Dashboard Content */}
                <div className="flex-1 p-6 overflow-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="max-w-6xl mx-auto"
                    >
                        {/* Welcome Section */}
                        <div className="mb-8">
                            <h2 className="text-3xl font-bold text-gray-100 dark:text-gray-900 mb-2">
                                Welcome back, {user?.firstName || "Admin"}!
                            </h2>
                            <p className="text-gray-400 dark:text-gray-600">
                                Here's what's happening with your platform today.
                            </p>
                        </div>

                        {/* Stats Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                            <Card className="bg-gray-800 dark:bg-gray-200 text-gray-100 dark:text-gray-900 shadow-lg hover:shadow-xl transition-all hover:scale-105">
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                                    <FaUsers className="h-4 w-4 text-red-400" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">{pagination?.total || 0}</div>
                                    <p className="text-xs text-gray-400 dark:text-gray-600">
                                        Active platform users
                                    </p>
                                </CardContent>
                            </Card>

                            <Card className="bg-gray-800 dark:bg-gray-200 text-gray-100 dark:text-gray-900 shadow-lg hover:shadow-xl transition-all hover:scale-105">
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">Comics</CardTitle>
                                    <FaBook className="h-4 w-4 text-red-400" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">{totalComics || 0}</div>
                                    <p className="text-xs text-gray-400 dark:text-gray-600">
                                        Published comics
                                    </p>
                                </CardContent>
                            </Card>

                            <Card className="bg-gray-800 dark:bg-gray-200 text-gray-100 dark:text-gray-900 shadow-lg hover:shadow-xl transition-all hover:scale-105">
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">Subscriptions</CardTitle>
                                    <FaCreditCard className="h-4 w-4 text-red-400" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">{premiumUsers || 0}</div>
                                    <p className="text-xs text-gray-400 dark:text-gray-600">
                                        Active subscriptions
                                    </p>
                                </CardContent>
                            </Card>

                            <Card className="bg-gray-800 dark:bg-gray-200 text-gray-100 dark:text-gray-900 shadow-lg hover:shadow-xl transition-all hover:scale-105">
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">Revenue</CardTitle>
                                    <FaChartLine className="h-4 w-4 text-red-400" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">$12,345</div>
                                    <p className="text-xs text-gray-400 dark:text-gray-600">
                                        This month
                                    </p>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Quick Actions */}
                        <Card className="bg-gray-800 dark:bg-gray-200 text-gray-100 dark:text-gray-900 shadow-lg">
                            <CardHeader className="border-b border-gray-700 dark:border-gray-300 pb-4">
                                <CardTitle className="text-2xl">Quick Actions</CardTitle>
                                <p className="text-gray-400 dark:text-gray-600">
                                    Manage your platform with these quick actions
                                </p>
                            </CardHeader>
                            <CardContent className="p-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    <Link
                                        to="/admin/users"
                                        className="group bg-gradient-to-r from-red-400 to-red-500 hover:from-red-500 hover:to-red-600 text-white px-6 py-4 rounded-lg text-center transition-all hover:shadow-lg hover:scale-105 flex items-center gap-3"
                                    >
                                        <FaUsers className="text-xl" />
                                        <span className="font-medium">Manage Users</span>
                                    </Link>
                                    <Link
                                        to="/admin/comics"
                                        className="group bg-gradient-to-r from-blue-400 to-blue-500 hover:from-blue-500 hover:to-blue-600 text-white px-6 py-4 rounded-lg text-center transition-all hover:shadow-lg hover:scale-105 flex items-center gap-3"
                                    >
                                        <FaBook className="text-xl" />
                                        <span className="font-medium">Manage Comics</span>
                                    </Link>
                                    <Link
                                        to="/admin-subscriptions"
                                        className="group bg-gradient-to-r from-green-400 to-green-500 hover:from-green-500 hover:to-green-600 text-white px-6 py-4 rounded-lg text-center transition-all hover:shadow-lg hover:scale-105 flex items-center gap-3"
                                    >
                                        <FaCreditCard className="text-xl" />
                                        <span className="font-medium">Manage Subscriptions</span>
                                    </Link>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;