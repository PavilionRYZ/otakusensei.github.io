import React, { useContext, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { FaSun, FaMoon, FaBars, FaTimes, FaHome, FaBook, FaUser, FaSignInAlt, FaUserPlus, FaSignOutAlt, FaCrown } from "react-icons/fa";
import { logout } from "../../Redux/Slices/authSlice";
import { ThemeContext } from "../../lib/ThemeProvider";

const Header = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { isAuthenticated, user } = useSelector((state) => state.auth);
    const { theme, toggleTheme } = useContext(ThemeContext);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const handleLogout = () => {
        dispatch(logout()).then(() => {
            navigate("/");
        });
        setIsMobileMenuOpen(false);
    };

    const navVariants = {
        hover: { scale: 1.1, transition: { duration: 0.3 } },
    };

    const iconVariants = {
        initial: { rotate: 0, opacity: 0 },
        animate: { rotate: 360, opacity: 1 },
    };

    const mobileMenuVariants = {
        hidden: {
            opacity: 0,
            x: "100%",
            transition: { duration: 0.3 }
        },
        visible: {
            opacity: 1,
            x: 0,
            transition: { duration: 0.3 }
        }
    };

    const toggleMobileMenu = () => {
        setIsMobileMenuOpen(!isMobileMenuOpen);
    };

    const closeMobileMenu = () => {
        setIsMobileMenuOpen(false);
    };

    return (
        <header className="sticky top-0 left-0 right-0 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 py-3 shadow-lg z-50">
            <div className="container mx-auto flex justify-between items-center px-4">
                {/* Logo */}
                <Link to="/">
                    <motion.h1
                        className="text-2xl font-bold"
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        OtakuSensei
                    </motion.h1>
                </Link>

                {/* Desktop Navigation */}
                <nav className="hidden md:flex items-center space-x-6">
                    <Link to="/">
                        <motion.span
                            className="text-md hover:text-blue-400 dark:hover:text-[#f19ba1] flex items-center space-x-2"
                            variants={navVariants}
                            whileHover="hover"
                        >
                            <FaHome />
                            <span>Home</span>
                        </motion.span>
                    </Link>
                    <Link to="/comics">
                        <motion.span
                            className="text-md hover:text-blue-400 dark:hover:text-[#f19ba1] flex items-center space-x-2"
                            variants={navVariants}
                            whileHover="hover"
                        >
                            <FaBook />
                            <span>Comics</span>
                        </motion.span>
                    </Link>
                    <Link to="/upgrade">
                        <motion.span
                            className="text-md bg-yellow-400 text-yellow-900 px-2 py-1 rounded-lg flex items-center space-x-2"
                            variants={navVariants}
                            whileHover="hover"
                        >
                            <FaCrown />
                            <span>Subscribe</span>
                        </motion.span>
                    </Link>

                    {/* Theme Toggle */}
                    <motion.button
                        onClick={toggleTheme}
                        className="focus:outline-none"
                        whileTap={{ scale: 0.9 }}
                    >
                        <motion.div
                            key={theme}
                            variants={iconVariants}
                            initial="initial"
                            animate="animate"
                            transition={{ duration: 0.5 }}
                        >
                            {theme === "dark" ? (
                                <FaSun className="h-5 w-5 text-yellow-400" />
                            ) : (
                                <FaMoon className="h-5 w-5 text-white" />
                            )}
                        </motion.div>
                    </motion.button>

                    {/* Conditional Rendering Based on Auth Status */}
                    {isAuthenticated ? (
                        <DropdownMenu>
                            <DropdownMenuTrigger>
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ duration: 0.3 }}
                                >
                                    <Avatar>
                                        <AvatarImage src={user?.avatar} alt={user?.firstName} />
                                        <AvatarFallback>
                                            {user?.firstName?.charAt(0)}
                                        </AvatarFallback>
                                    </Avatar>
                                </motion.div>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="bg-gray-800 dark:bg-gray-200 text-white dark:text-gray-900 border-gray-700 dark:border-gray-300">
                                <DropdownMenuLabel>
                                    {user?.firstName} {user?.lastName}
                                </DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                    className="hover:bg-gray-700 dark:hover:bg-gray-300"
                                    onClick={() => navigate("/profile")}
                                >
                                    <FaUser className="mr-2" />
                                    Profile
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                    className="hover:bg-gray-700 dark:hover:bg-gray-300"
                                    onClick={handleLogout}
                                >
                                    <FaSignOutAlt className="mr-2" />
                                    Logout
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    ) : (
                        <div className="space-x-4 flex">
                            <Link to="/signin">
                                <Button className="bg-[#243647] dark:bg-[#E8B5B8] dark:hover:bg-[#e59ea3] text-white dark:text-gray-900 flex items-center space-x-2">
                                    <FaSignInAlt />
                                    <span>SignIn</span>
                                </Button>
                            </Link>
                            <Link to="/signup">
                                <Button className="bg-[#243647] hover:bg-[#3d424d]  dark:bg-[#E8B5B8] dark:hover:bg-[#e59ea3] text-white dark:text-gray-900 flex items-center space-x-2">
                                    <FaUserPlus />
                                    <span>Signup</span>
                                </Button>
                            </Link>
                        </div>
                    )}
                </nav>

                {/* Mobile Menu Button */}
                <motion.button
                    className="md:hidden focus:outline-none z-50 relative"
                    onClick={toggleMobileMenu}
                    whileTap={{ scale: 0.9 }}
                >
                    {isMobileMenuOpen ? (
                        <FaTimes className="h-6 w-6" />
                    ) : (
                        <FaBars className="h-6 w-6" />
                    )}
                </motion.button>
            </div>

            {/* Mobile Menu Overlay */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <>
                        {/* Backdrop */}
                        <motion.div
                            className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={closeMobileMenu}
                        />

                        {/* Mobile Menu */}
                        <motion.div
                            className="fixed top-0 right-0 h-full w-80 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 z-50 md:hidden shadow-2xl"
                            variants={mobileMenuVariants}
                            initial="hidden"
                            animate="visible"
                            exit="hidden"
                        >
                            <div className="p-6 pt-20">
                                {/* User Section */}
                                {isAuthenticated && (
                                    <div className="mb-8 pb-6 border-b border-gray-700 dark:border-gray-300">
                                        <div className="flex items-center space-x-3 mb-4">
                                            <Avatar>
                                                <AvatarImage src={user?.avatar} alt={user?.firstName} />
                                                <AvatarFallback>
                                                    {user?.firstName?.charAt(0)}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <h3 className="font-semibold">{user?.firstName} {user?.lastName}</h3>
                                                <p className="text-sm text-gray-400 dark:text-gray-600">{user?.email}</p>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Navigation Links */}
                                <nav className="space-y-4">
                                    <Link
                                        to="/"
                                        onClick={closeMobileMenu}
                                        className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors"
                                    >
                                        <FaHome className="h-5 w-5" />
                                        <span className="text-lg">Home</span>
                                    </Link>

                                    <Link
                                        to="/comics"
                                        onClick={closeMobileMenu}
                                        className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors"
                                    >
                                        <FaBook className="h-5 w-5" />
                                        <span className="text-lg">Comics</span>
                                    </Link>

                                    <Link
                                        to="/upgrade"
                                        onClick={closeMobileMenu}
                                        className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors"
                                    >
                                        <FaCrown className="h-5 w-5" />
                                        <span className="text-lg">Subscribe</span>
                                    </Link>



                                    {/* Theme Toggle */}
                                    <button
                                        onClick={() => {
                                            toggleTheme();
                                            closeMobileMenu();
                                        }}
                                        className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors w-full text-left"
                                    >
                                        {theme === "dark" ? (
                                            <FaSun className="h-5 w-5 text-yellow-400" />
                                        ) : (
                                            <FaMoon className="h-5 w-5" />
                                        )}
                                        <span className="text-lg">
                                            {theme === "dark" ? "Light Mode" : "Dark Mode"}
                                        </span>
                                    </button>

                                    {/* Auth Section */}
                                    {isAuthenticated ? (
                                        <>
                                            <Link
                                                to="/profile"
                                                onClick={closeMobileMenu}
                                                className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors"
                                            >
                                                <FaUser className="h-5 w-5" />
                                                <span className="text-lg">Profile</span>
                                            </Link>

                                            <button
                                                onClick={handleLogout}
                                                className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors w-full text-left"
                                            >
                                                <FaSignOutAlt className="h-5 w-5" />
                                                <span className="text-lg">Logout</span>
                                            </button>
                                        </>
                                    ) : (
                                        <>
                                            <Link
                                                to="/signin"
                                                onClick={closeMobileMenu}
                                                className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors"
                                            >
                                                <FaSignInAlt className="h-5 w-5" />
                                                <span className="text-lg">Sign In</span>
                                            </Link>

                                            <Link
                                                to="/signup"
                                                onClick={closeMobileMenu}
                                                className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors"
                                            >
                                                <FaUserPlus className="h-5 w-5" />
                                                <span className="text-lg">Sign Up</span>
                                            </Link>
                                        </>
                                    )}
                                </nav>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </header>
    );
};

export default Header;