import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { motion } from "framer-motion";
import { FaEnvelope, FaLock } from "react-icons/fa";
import { verifyOtp, clearAuthState } from "../../Redux//Slices/authSlice";
import { toast } from "react-toastify";

const OtpVerificationPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const dispatch = useDispatch();
    const { isLoading, error } = useSelector((state) => state.auth);

    const [formData, setFormData] = useState({
        email: location.state?.email || "",
        otp: "",
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!formData.email) {
            toast.error("Email is required", {
                position: "top-right",
                autoClose: 3000,
            });
            navigate("/signup");
            return;
        }

        dispatch(verifyOtp(formData))
            .unwrap()
            .then(() => {
                toast.success("OTP verified successfully", {
                    position: "top-right",
                    autoClose: 3000,
                });
                navigate("/");
            })
            .catch((err) => {
                toast.error(err.message || "Failed to verify OTP", {
                    position: "top-right",
                    autoClose: 5000,
                });
            });
    };

    useEffect(() => {
        dispatch(clearAuthState()); // Clear previous state on component mount
        if (!location.state?.email) {
            toast.error("Please sign up first", {
                position: "top-right",
                autoClose: 3000,
            });
            navigate("/signup");
        }
        return () => {
            dispatch(clearAuthState()); // Clear state on unmount
        };
    }, [dispatch, location.state, navigate]);

    const containerVariants = {
        hidden: { opacity: 0, y: 50 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
    };

    const buttonVariants = {
        hover: { scale: 1.05 },
        tap: { scale: 0.95 },
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white">
            <motion.div
                className="w-full max-w-md p-8 bg-white dark:bg-gray-800 rounded-lg shadow-lg"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
            >
                <h2 className="text-3xl font-bold text-center mb-6 text-gray-800 dark:text-white">Verify OTP</h2>
                {error && (
                    <p className="text-red-500 text-center mb-4">{error}</p>
                )}
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Email</label>
                        <div className="relative">
                            <FaEnvelope className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                className="w-full pl-10 py-3 rounded-full border border-gray-200 dark:border-gray-600 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none transition duration-300"
                                readOnly
                            />
                        </div>
                    </div>
                    <div className="mb-4">
                        <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">OTP</label>
                        <div className="relative">
                            <FaLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
                            <input
                                type="text"
                                name="otp"
                                value={formData.otp}
                                onChange={handleChange}
                                className="w-full pl-10 py-3 rounded-full border border-gray-200 dark:border-gray-600 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-300"
                                placeholder="Enter your OTP"
                                maxLength={6}
                                required
                            />
                        </div>
                    </div>
                    <div className="flex justify-end mb-4">
                        <button
                            type="button"
                            onClick={() => alert("Resend OTP functionality not implemented")}
                            className="text-blue-600 dark:text-blue-400 hover:underline text-sm"
                        >
                            Resend OTP
                        </button>
                    </div>
                    <motion.button
                        type="submit"
                        variants={buttonVariants}
                        whileHover="hover"
                        whileTap="tap"
                        className="w-full py-3 rounded-full bg-blue-600 text-white hover:bg-blue-700 transition duration-300"
                        disabled={isLoading}
                    >
                        {isLoading ? "Verifying..." : "Verify OTP"}
                    </motion.button>
                </form>
            </motion.div>
        </div>
    );
};

export default OtpVerificationPage;