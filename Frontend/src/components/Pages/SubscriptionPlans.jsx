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
        if (isAuthenticated) {
            navigate(`/payment/${planType}`);
        } else {
            navigate(`/signin?redirect=/payment/${planType}`);
            toast.info("Please sign in to purchase a subscription plan.");
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
                    <div className="mb-8 p-4 rounded-lg text-center">
                        {isAuthenticated ? (
                            user?.subscription?.plan === "premium" ? (
                                <p className="text-green-600 bg-green-50 border border-green-200">
                                    You are already a premium user.
                                </p>
                            ) : (
                                <p className="text-red-600 bg-red-50 border border-red-200">
                                    Purchase any subscription to be a premium user.
                                </p>
                            )
                        ) : (
                            <p className="text-red-600 bg-red-50 border border-red-200">
                                Please login to purchase any plan.
                            </p>
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
                                            className="w-full bg-[#243647] dark:bg-[#E8B5B8] dark:hover:bg-[#e59ea3] hover:bg-gray-800 dark:text-gray-900 text-gray-100 font-medium py-3 px-6 rounded-lg transition-colors duration-200 mb-6"
                                        >
                                            Subscribe
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
