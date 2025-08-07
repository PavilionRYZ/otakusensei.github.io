import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { getSubscriptionPlans, clearSubscriptionState } from "../../Redux/Slices/subscriptionSlice";
import { toast } from "react-toastify";
import AnimeLoadingPage from "../Loading/AnimeLoadingPage";

const SubscriptionPlans = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { plans, isLoading, error } = useSelector((state) => state.subscription);
    const { isAuthenticated, user } = useSelector((state) => state.auth);

    useEffect(() => {
        dispatch(getSubscriptionPlans())
            .unwrap()
            .catch((err) => {
                toast.error(err || "Failed to fetch subscription plans");
            });

        return () => {
            dispatch(clearSubscriptionState());
        };
    }, [dispatch]);

    const handlePurchase = (planType) => {
        if (user?.role === "admin") {
            toast.info("Admin users cannot purchase subscription plans.");
            return;
        }
        if (isAuthenticated) {
            navigate(`/payment/${planType}`);
        } else {
            toast.info("Please sign in to purchase a subscription plan.");
            navigate(`/signin?redirect=/payment/${planType}`);
        }
    };


    const getPlanFeatures = (planType) => {
        switch (planType?.toLowerCase()) {
            case "basic":
                return [
                    "Access to 1000+ comics",
                    "Ad-supported reading",
                ];
            case "premium":
                return [
                    "Unlimited comic access",
                    "Exclusive content",
                    "Ad-free reading",
                ];
            case "ultimate":
                return [
                    "All Premium features",
                    "Early access to new releases",
                    "Offline reading",
                ];
            default:
                return [];
        }
    };

    const isBestValue = (planType) => {
        return planType?.toLowerCase() === "premium";
    };

    return (
        <div className="min-h-screen bg-[#121A21] dark:bg-gray-50 py-12 px-4">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="text-center mb-12">
                    <h1 className="text-4xl md:text-5xl font-bold text-white dark:text-gray-900 mb-6">
                        Unlock the Full OtakuSensei Experience
                    </h1>
                    <p className="text-lg text-gray-100 dark:text-gray-600 max-w-4xl mx-auto leading-relaxed">
                        Go premium and enjoy unlimited access to thousands of comics, exclusive content, and an ad-free reading experience.
                        Choose the plan that's right for you and start your premium journey today.
                    </p>
                </div>

                {/* Loading */}
                {isLoading && <AnimeLoadingPage />}

                {/* User Subscription Status Message */}
                {!isLoading && (
                    <div className="mb-8 max-w-4xl mx-auto">
                        {isAuthenticated ? (
                            user.role === "admin" ? (
                                <div className="relative overflow-hidden bg-gradient-to-r from-indigo-50 to-blue-50 border border-indigo-200 rounded-xl p-6 shadow-sm">
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-100 rounded-full -mr-16 -mt-16 opacity-50"></div>
                                    <div className="relative flex items-center space-x-3">
                                        <div className="flex-shrink-0">
                                            <div className="w-10 h-10 bg-indigo-500 rounded-full flex items-center justify-center">
                                                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                                </svg>
                                            </div>
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-semibold text-indigo-900 mb-1">Admin Access</h3>
                                            <p className="text-indigo-700 text-sm">You have unlimited access to all comics — no subscription needed!</p>
                                        </div>
                                    </div>
                                </div>
                            ) : user?.subscription?.plan === "premium" ? (
                                <div className="relative overflow-hidden bg-gradient-to-r from-emerald-50 to-green-50 border border-emerald-200 rounded-xl p-6 shadow-sm">
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-100 rounded-full -mr-16 -mt-16 opacity-50"></div>
                                    <div className="relative flex items-center space-x-3">
                                        <div className="flex-shrink-0">
                                            <div className="w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center">
                                                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                                </svg>
                                            </div>
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-semibold text-emerald-900 mb-1">Premium Reader</h3>
                                            <p className="text-emerald-700 text-sm">Enjoy exclusive comics and early releases!</p>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="relative overflow-hidden bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow duration-200">
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-amber-100 rounded-full -mr-16 -mt-16 opacity-50"></div>
                                    <div className="relative flex items-center justify-between">
                                        <div className="flex items-center space-x-3">
                                            <div className="flex-shrink-0">
                                                <div className="w-10 h-10 bg-amber-500 rounded-full flex items-center justify-center">
                                                    <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                                                        <path fillRule="evenodd" d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z" clipRule="evenodd" />
                                                    </svg>
                                                </div>
                                            </div>
                                            <div>
                                                <h3 className="text-lg font-semibold text-amber-900 mb-1">Unlock Premium</h3>
                                                <p className="text-amber-700 text-sm">Get exclusive comics and early releases!</p>
                                            </div>
                                        </div>
                                        <button className="bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-lg font-medium text-sm transition-colors duration-200">
                                            Subscribe Now
                                        </button>
                                    </div>
                                </div>
                            )
                        ) : (
                            <div className="relative overflow-hidden bg-gradient-to-r from-slate-50 to-gray-50 border border-slate-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow duration-200">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-slate-100 rounded-full -mr-16 -mt-16 opacity-50"></div>
                                <div className="relative flex items-center justify-between">
                                    <div className="flex items-center space-x-3">
                                        <div className="flex-shrink-0">
                                            <div className="w-10 h-10 bg-slate-500 rounded-full flex items-center justify-center">
                                                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M18 8a6 6 0 01-7.743 5.743L10 14l-1 1-1 1H6v2H2v-4l4.257-4.257A6 6 0 1118 8zm-6-4a1 1 0 100 2 2 2 0 012 2 1 1 0 102 0 4 4 0 00-4-4z" clipRule="evenodd" />
                                                </svg>
                                            </div>
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-semibold text-slate-900 mb-1">Access Required</h3>
                                            <p className="text-slate-700 text-sm">Log in to access subscriptions and exclusive comics</p>
                                        </div>
                                    </div>
                                    <button className="bg-slate-500 hover:bg-slate-600 text-white px-4 py-2 rounded-lg font-medium text-sm transition-colors duration-200">
                                        Log In
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Subscription Plans */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
                    {Array.isArray(plans) && plans.length > 0 ? (
                        plans.map((plan) => {
                            const features = getPlanFeatures(plan.planType) || [];
                            const price = plan.price;
                            const bestValue = isBestValue(plan.planType);
                            const duration = plan.durationDays;
                            return (
                                <div
                                    key={plan.planType}
                                    className="bg-gray-900 dark:bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden relative"
                                >
                                    {/* Best Value Badge */}
                                    {bestValue && (
                                        <div className="absolute top-4 right-4">
                                            <span className="bg-pink-200 text-pink-800 px-3 py-1 rounded-full text-sm font-medium">
                                                Best Value
                                            </span>
                                        </div>
                                    )}

                                    <div className="p-8">
                                        <h3 className="text-2xl font-semibold text-white dark:text-gray-900 mb-4 capitalize">
                                            {plan.planType}
                                        </h3>

                                        <div className="mb-6">
                                            <div className="flex flex-col items-baseline">
                                                <span className="text-4xl font-bold text-white dark:text-gray-900">
                                                    ${price}
                                                </span>
                                                <span className="text-gray-100 dark:text-gray-500 ml-2">For {duration} days</span>
                                            </div>
                                        </div>

                                        <button
                                            onClick={() => handlePurchase(plan.planType)}
                                            disabled={
                                                user?.role === "admin" ||
                                                user?.subscription?.plan === "premium"
                                            }
                                            className={`w-full ${user?.role === "admin" || user?.subscription?.plan === "premium"
                                                    ? "bg-gray-600 cursor-not-allowed dark:bg-gray-400 dark:text-gray-700"
                                                    : "bg-[#243647] dark:bg-[#E8B5B8] dark:hover:bg-[#e59ea3] hover:bg-gray-800 dark:text-gray-900 text-gray-100"
                                                } font-medium py-3 px-6 rounded-lg transition-colors duration-200 mb-6`}
                                        >
                                            {user?.role === "admin"
                                                ? "You Have Admin Privileges"
                                                : user?.subscription?.plan === "premium"
                                                    ? "Alrady a Premium User"
                                                    : "Subscribe"}
                                        </button>


                                        <div className="space-y-3">
                                            {features.map((feature, index) => (
                                                <div key={index} className="flex items-center">
                                                    <svg
                                                        className="w-5 h-5 text-green-500 mr-3 flex-shrink-0"
                                                        fill="none"
                                                        stroke="currentColor"
                                                        viewBox="0 0 24 24"
                                                    >
                                                        <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            strokeWidth={2}
                                                            d="M5 13l4 4L19 7"
                                                        />
                                                    </svg>
                                                    <span className="text-gray-300 dark:text-gray-700">{feature}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    ) : (
                        !isLoading && (
                            <div className="col-span-full text-center text-gray-500">
                                No subscription plans available.
                            </div>
                        )
                    )}
                </div>
            </div>
        </div>
    );
};

export default SubscriptionPlans;
