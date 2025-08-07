import React, { useEffect, useState, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { motion } from "framer-motion";
import { FaUser, FaLock, FaCrown } from "react-icons/fa";
import { loadUser, clearAuthState, updateProfile, updatePassword } from "../../Redux/Slices/authSlice";
import { toast } from "react-toastify";
import {
    Card,
    CardHeader,
    CardTitle,
    CardContent,
} from "../ui/card";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import AnimeLoadingPage from "../Loading/AnimeLoadingPage";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "../../storage/fireBase";
import { v4 as uuidv4 } from "uuid";

const ProfilePage = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { isAuthenticated, user, isLoading, error, message } = useSelector((state) => state.auth);
    const [passwordData, setPasswordData] = useState({ oldPassword: "", newPassword: "" });
    const [file, setFile] = useState(null);
    const [uploadError, setUploadError] = useState('');
    const [isUploading, setIsUploading] = useState(false);
    const [previewUrl, setPreviewUrl] = useState(null);
    const fileInputRef = useRef(null);
    const [daysLeft, setDaysLeft] = useState(null);

    useEffect(() => {
        if (!isAuthenticated) {
            toast.error("Please log in to view your profile", { position: "top-right", autoClose: 3000 });
            navigate("/signin");
            return;
        }
        if (!user || !user._id) {
            dispatch(loadUser());
        }
        return () => {
            dispatch(clearAuthState());
        };
    }, [dispatch, isAuthenticated, navigate, user]);

    const handlePasswordChange = (e) => {
        const { name, value } = e.target;
        setPasswordData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmitPassword = (e) => {
        e.preventDefault();
        if (!passwordData.oldPassword || !passwordData.newPassword) {
            toast.error("Both old and new passwords are required", { position: "top-right", autoClose: 3000 });
            return;
        }
        if (passwordData.newPassword.length < 6) {
            toast.error("New password must be at least 6 characters", { position: "top-right", autoClose: 3000 });
            return;
        }
        dispatch(updatePassword({ oldPassword: passwordData.oldPassword, newPassword: passwordData.newPassword }))
            .unwrap()
            .then(() => {
                toast.success("Password updated successfully", { position: "top-right", autoClose: 3000 });
                setPasswordData({ oldPassword: "", newPassword: "" });
            })
            .catch((err) => {
                const msg = typeof err === "string"
                    ? err
                    : err?.message || err?.error || "Failed to update password";
                toast.error(msg, { position: "top-right", autoClose: 3000 });
            });
    };

    const handleAvatarClick = () => {
        fileInputRef.current.click();
    };

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) {
            if (isUploading) {
                toast.error('An upload is already in progress. Please wait.', { position: "top-right", autoClose: 3000 });
                return;
            }
            const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
            if (!validTypes.includes(selectedFile.type)) {
                setUploadError('Please select an image file (JPEG, PNG, GIF, or WebP)');
                toast.error('Please select an image file (JPEG, PNG, GIF, or WebP)', { position: "top-right", autoClose: 3000 });
                return;
            }
            if (selectedFile.size > 2 * 1024 * 1024) {
                setUploadError('File size must be less than 2MB');
                toast.error('File size must be less than 2MB', { position: "top-right", autoClose: 3000 });
                return;
            }
            if (!user || !user._id || !user.email) {
                setUploadError('User data is not available. Please try logging in again.');
                toast.error('User data is not available. Please try logging in again.', { position: "top-right", autoClose: 3000 });
                navigate('/signin');
                return;
            }

            const reader = new FileReader();
            reader.onload = (e) => {
                setPreviewUrl(e.target.result);
            };
            reader.readAsDataURL(selectedFile);

            setFile(selectedFile);
            setUploadError('');
            handleAvatarUpload(selectedFile);
        }
    };

    const handleAvatarUpload = async (selectedFile) => {
        setIsUploading(true);
        const maxRetries = 3;
        let attempt = 0;

        while (attempt < maxRetries) {
            try {
                const uuid = uuidv4();
                const extension = selectedFile.name.split('.').pop();
                const fileName = `${user._id}.${uuid}.${extension}`;
                const storageRef = ref(storage, `otakuavatars/${user._id}/${fileName}`);
                const metadata = {
                    contentType: selectedFile.type,
                    customMetadata: {
                        uploadedAt: new Date().toISOString(),
                        userId: user._id,
                    },
                };
                const snapshot = await uploadBytes(storageRef, selectedFile, metadata);
                const downloadURL = await getDownloadURL(snapshot.ref);

                const result = await dispatch(updateProfile({ avatar: downloadURL }));
                if (result.meta.requestStatus === 'fulfilled') {
                    toast.success('Avatar updated successfully', { position: "top-right", autoClose: 3000 });
                    setFile(null);
                    setPreviewUrl(null);
                    setIsUploading(false);
                    return;
                } else {
                    throw new Error('Failed to update profile');
                }
            } catch (err) {
                attempt++;
                console.error(`Attempt ${attempt} failed:`, err);
                if (attempt === maxRetries) {
                    const errorMessage = `Failed to upload avatar after ${maxRetries} attempts: ${err.message}`;
                    setUploadError(errorMessage);
                    toast.error(errorMessage, { position: "top-right", autoClose: 3000 });
                    setPreviewUrl(null);
                    setIsUploading(false);
                    break;
                }
                await new Promise((resolve) => setTimeout(resolve, 1000 * attempt));
            }
        }
        setIsUploading(false);
    };

    const hasActivePremiumSubscription = () => {
        if (!user || user.role === "admin") return true;
        if (!user.subscription || user.subscription.plan !== "premium") return false;
        const now = new Date();
        const startDate = user.subscription.startDate ? new Date(user.subscription.startDate) : null;
        const endDate = user.subscription.endDate ? new Date(user.subscription.endDate) : null;
        return startDate && startDate <= now && (!endDate || endDate >= now);
    };

    const hasPremium = hasActivePremiumSubscription();

    useEffect(() => {
        if (hasPremium && user.subscription?.endDate) {
            const endDate = new Date(user.subscription.endDate);
            const now = new Date();
            let diffTime = endDate.getTime() - now.getTime();
            let diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            setDaysLeft(diffDays > 0 ? diffDays : 0);
        } else {
            setDaysLeft(null);
        }
    }, [user, hasPremium]);

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
                <p className="text-red-500">{error || "Profile not found"}</p>
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
                            <motion.div
                                whileHover={{ scale: 1.1, cursor: "pointer" }}
                                onClick={handleAvatarClick}
                                className="relative mx-auto group"
                            >
                                <img
                                    src={previewUrl || user.avatar || "https://i.pinimg.com/736x/3f/dd/e4/3fdde421b22a34874e9be56a4277e04c.jpg"}
                                    alt={`${user.firstName || "User"}'s avatar`}
                                    className="w-32 h-32 rounded-full object-cover border-4 border-red-300 mx-auto"
                                />
                                {isUploading && (
                                    <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-2xl">
                                        <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
                                    </div>
                                )}
                                <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-t from-black/60 via-transparent to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-all duration-300">
                                    <span className="text-white text-sm font-medium">Change Photo</span>
                                </div>
                                {hasPremium && (
                                    <div className="absolute -bottom-2 -right-2 bg-yellow-400 text-yellow-900 px-2 py-1 rounded-full text-xs flex items-center gap-1">
                                        <FaCrown size={12} /> Premium
                                    </div>
                                )}
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    accept="image/jpeg,image/png,image/gif,image/webp"
                                    onChange={handleFileChange}
                                    className="hidden"
                                    disabled={isUploading}
                                />
                            </motion.div>
                            <CardTitle className="text-3xl font-bold mt-4">{user.firstName} {user.lastName || ""}</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6 p-6">
                            {message && (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    className="bg-gradient-to-r from-green-100 to-emerald-100 border border-green-200 text-green-800 p-4 rounded-xl mb-6 shadow-sm"
                                >
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                        {message}
                                    </div>
                                </motion.div>
                            )}
                            {uploadError && (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    className="bg-gradient-to-r from-red-100 to-rose-100 border border-red-200 text-red-800 p-4 rounded-xl mb-6 shadow-sm"
                                >
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                                        {uploadError}
                                    </div>
                                </motion.div>
                            )}
                            <div className="bg-gray-700 dark:bg-gray-100 p-4 rounded-lg">
                                <h3 className="text-xl font-semibold text-gray-100 dark:text-gray-900 flex items-center gap-2 mb-2"><FaUser /> Profile Details</h3>
                                <p className="text-gray-300 dark:text-gray-700">Email: {user.email || "N/A"}</p>
                                <p className="text-gray-300 dark:text-gray-700">Phone: {user.phone || "Not provided"}</p>
                                <p className="text-gray-300 dark:text-gray-700">Role: {user.role || "user"}</p>
                            </div>
                            {user.role !== "admin" ? (
                                <div className="bg-gray-700 dark:bg-gray-100 p-4 rounded-lg">
                                    <h3 className="text-xl font-semibold text-gray-100 dark:text-gray-900 flex items-center gap-2 mb-2">
                                        <FaCrown /> Subscription
                                    </h3>
                                    <p className="text-gray-300 dark:text-gray-700">Plan: {user.subscription?.plan || "none"}</p>
                                    {hasPremium && (
                                        <>
                                            <p className="text-gray-300 dark:text-gray-700">
                                                Start Date: {user.subscription.startDate ? new Date(user.subscription.startDate).toLocaleDateString() : "N/A"}
                                            </p>
                                            <p className="text-gray-300 dark:text-gray-700">
                                                End Date: {user.subscription.endDate ? new Date(user.subscription.endDate).toLocaleDateString() : "N/A"}
                                            </p>
                                            <p className="text-gray-300 dark:text-gray-700">Status: {daysLeft > 0 ? "Active" : "Expired"}</p>
                                            {daysLeft > 0 && (
                                                <p className="text-yellow-400 mt-2 font-semibold">
                                                    {daysLeft} day{daysLeft > 1 ? "s" : ""} left until expiration
                                                </p>
                                            )}
                                        </>
                                    )}
                                    {user.role !== "admin" && !hasPremium && (
                                        <>
                                            {user.subscription?.plan && user.subscription.plan !== "none" ? (
                                                <p className="text-yellow-400 mt-2">
                                                    <Link to="/upgrade" className="underline">
                                                        Renew your premium subscription
                                                    </Link>
                                                </p>
                                            ) : (
                                                <p className="text-yellow-400 mt-2">
                                                    <Link to="/upgrade" className="underline">
                                                        Subscribe to Premium for exclusive content
                                                    </Link>
                                                </p>
                                            )}
                                        </>
                                    )}
                                </div>
                            ) : (
                                <div className="bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-500 dark:to-purple-500 p-4 rounded-lg border border-indigo-500/20">
                                    <h3 className="text-xl font-semibold text-white flex items-center gap-2 mb-3">
                                        <svg className="w-6 h-6 text-yellow-300" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                        </svg>
                                        Admin Access
                                    </h3>
                                    <div className="space-y-2">
                                        <p className="text-indigo-100 flex items-center gap-2">
                                            <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                                            Plan: <span className="font-semibold text-white">Administrator</span>
                                        </p>
                                        <p className="text-indigo-100 flex items-center gap-2">
                                            <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                                            Status: <span className="font-semibold text-green-300">Unlimited Access</span>
                                        </p>
                                        <p className="text-indigo-100 flex items-center gap-2">
                                            <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                                            Permissions: <span className="font-semibold text-white">Full Site Access</span>
                                        </p>
                                    </div>
                                    <div className="mt-4 pt-3 border-t border-indigo-400/30">
                                        <p className="text-indigo-200 text-sm flex items-center gap-2">
                                            <svg className="w-4 h-4 text-yellow-300" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                            </svg>
                                            No subscription required - enjoy all premium features
                                        </p>
                                    </div>
                                </div>
                            )}
                            <div className="bg-gray-700 dark:bg-gray-100 p-4 rounded-lg">
                                <h3 className="text-xl font-semibold text-gray-100 dark:text-gray-900 flex items-center gap-2 mb-2"><FaLock /> Update Password</h3>
                                <form onSubmit={handleSubmitPassword} className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 dark:text-gray-700">Old Password</label>
                                        <Input
                                            type="password"
                                            name="oldPassword"
                                            value={passwordData.oldPassword}
                                            onChange={handlePasswordChange}
                                            placeholder="Enter old password"
                                            autocomplete="current-password"
                                            className="mt-1 w-full"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 dark:text-gray-700">New Password</label>
                                        <Input
                                            type="password"
                                            name="newPassword"
                                            value={passwordData.newPassword}
                                            onChange={handlePasswordChange}
                                            placeholder="Enter new password"
                                            autocomplete="new-password"
                                            className="mt-1 w-full"
                                        />
                                    </div>
                                    {error && (
                                        <p className="text-red-500 text-sm">
                                            {typeof error === "string" ? error : error?.message || "An error occurred"}
                                        </p>
                                    )}
                                    {message && <p className="text-green-500 text-sm">{message}</p>}
                                    <Button
                                        type="submit"
                                        disabled={isLoading}
                                        className="w-full bg-red-300 hover:bg-red-400 text-gray-100 dark:text-gray-900 mt-2"
                                    >
                                        {isLoading ? "Updating..." : "Update Password"}
                                    </Button>
                                </form>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
            </div>
        </div>
    );
};

export default ProfilePage;