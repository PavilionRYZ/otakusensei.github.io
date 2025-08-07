import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { initiatePayment, verifyPayment, clearPaymentState } from "../../Redux/Slices/paymentSlice";
import { getSubscriptionPlans } from "../../Redux/Slices/subscriptionSlice";
import { toast } from "react-toastify";

// Initialize Stripe with your publishable key
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

const PaymentForm = ({ clientSecret, plan, paymentId }) => {
    const stripe = useStripe();
    const elements = useElements();
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [isProcessing, setIsProcessing] = useState(false);
    const { user } = useSelector((state) => state.auth);

    // State for address form
    const [address, setAddress] = useState({
        line1: "",
        city: "",
        state: "",
        postal_code: "",
        country: "IN", // Default to India
    });

    const handleAddressChange = (event) => {
        const { name, value } = event.target;
        setAddress((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        if (!stripe || !elements) return;

        // Validate address fields
        if (!address.line1 || !address.city || !address.state || !address.postal_code || !address.country) {
            toast.error("Please fill in all address fields.");
            return;
        }

        setIsProcessing(true);

        const cardElement = elements.getElement(CardElement);

        try {
            const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
                payment_method: {
                    card: cardElement,
                    billing_details: {
                        name: `${user?.firstName || ""} ${user?.lastName || ""}`.trim() || "Customer",
                        email: user?.email || "unknown@example.com",
                        address: {
                            line1: address.line1,
                            city: address.city,
                            state: address.state,
                            postal_code: address.postal_code,
                            country: address.country,
                        },
                    },
                },
            });

            if (error) {
                // Check if the error is related to r.stripe.com being blocked
                if (error.message.includes("r.stripe.com")) {
                    toast.warn(
                        "Some Stripe services are being blocked by your browser (e.g., ad blocker). The payment may still succeed. Please wait."
                    );
                } else {
                    toast.error(error.message);
                    setIsProcessing(false);
                    return;
                }
            }

            // Proceed with verification even if r.stripe.com requests fail
            if (!error || paymentIntent?.status === "succeeded") {
                try {
                    await dispatch(verifyPayment({ paymentId }))
                        .unwrap()
                        .then(() => {
                            toast.success("Payment successful! You are now a premium user.");
                            dispatch(clearPaymentState());
                            navigate("/");
                        })
                        .catch((err) => {
                            toast.error(err || "Failed to verify payment");
                        });
                } catch (verifyError) {
                    toast.error("Payment verification failed. Please contact support.");
                }
            }
        } catch (err) {
            // Handle generic errors, including FetchError from r.stripe.com
            if (err.message && err.message.includes("r.stripe.com")) {
                toast.warn(
                    "Stripe telemetry is being blocked by your browser (e.g., ad blocker). The payment may still succeed. Verifying..."
                );
                // Attempt to verify the payment anyway
                try {
                    await dispatch(verifyPayment({ paymentId }))
                        .unwrap()
                        .then(() => {
                            toast.success("Payment successful! You are now a premium user.");
                            dispatch(clearPaymentState());
                            navigate("/");
                        })
                        .catch((verifyErr) => {
                            toast.error(verifyErr || "Failed to verify payment");
                        });
                } catch (verifyError) {
                    toast.error("Payment verification failed. Please contact support.");
                }
            } else {
                toast.error("Payment failed. Please try again.");
            }
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="mt-4">
            <h3 className="text-lg font-semibold mb-2">Pay for {plan.planType} Plan</h3>
            <p className="mb-4">Amount: ${plan.price}</p>

            {/* Address Form */}
            <div className="mb-4">
                <h4 className="text-md font-medium mb-2">Billing Address</h4>
                <div className="space-y-3">
                    <div>
                        <label className="block text-sm font-medium mb-1">Address Line 1</label>
                        <input
                            type="text"
                            name="line1"
                            value={address.line1}
                            onChange={handleAddressChange}
                            className="w-full p-2 border rounded"
                            placeholder="Street address"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">City</label>
                        <input
                            type="text"
                            name="city"
                            value={address.city}
                            onChange={handleAddressChange}
                            className="w-full p-2 border rounded"
                            placeholder="City"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">State</label>
                        <input
                            type="text"
                            name="state"
                            value={address.state}
                            onChange={handleAddressChange}
                            className="w-full p-2 border rounded"
                            placeholder="State"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Postal Code</label>
                        <input
                            type="text"
                            name="postal_code"
                            value={address.postal_code}
                            onChange={handleAddressChange}
                            className="w-full p-2 border rounded"
                            placeholder="Postal Code"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Country</label>
                        <input
                            type="text"
                            name="country"
                            value={address.country}
                            onChange={handleAddressChange}
                            className="w-full p-2 border rounded"
                            placeholder="Country"
                            required
                            disabled
                        />
                    </div>
                </div>
            </div>

            {/* Card Element */}
            <CardElement
                options={{
                    style: {
                        base: {
                            fontSize: "16px",
                            color: "#424770",
                            "::placeholder": {
                                color: "#aab7c4",
                            },
                        },
                        invalid: {
                            color: "#9e2146",
                        },
                    },
                }}
            />
            <button
                type="submit"
                disabled={!stripe || isProcessing}
                className="mt-4 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition"
            >
                {isProcessing ? "Processing..." : "Pay Now"}
            </button>
        </form>
    );
};

const PaymentPage = () => {
    const { planType } = useParams();
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { plans } = useSelector((state) => state.subscription);
    const { isAuthenticated } = useSelector((state) => state.auth);
    const { clientSecret, paymentId, isLoading, error, message } = useSelector(
        (state) => state.payment
    );

    // Find the selected plan
    const selectedPlan = plans.find((plan) => plan.planType === planType);

    useEffect(() => {
        if (!isAuthenticated) {
            navigate(`/signin?redirect=/payment/${planType}`);
            toast.info("Please sign in to proceed with payment.");
            return;
        }

        // Fetch subscription plans if not already loaded
        if (plans.length === 0) {
            dispatch(getSubscriptionPlans())
                .unwrap()
                .catch((err) => {
                    toast.error(err || "Failed to fetch subscription plans");
                    navigate("/");
                });
        }

        // Initiate payment if plan is found and payment hasn't been initiated
        if (selectedPlan && !clientSecret && !isLoading) {
            dispatch(initiatePayment({ planType }))
                .unwrap()
                .catch((err) => {
                    toast.error(err || "Failed to initiate payment");
                    navigate("/");
                });
        }
    }, [dispatch, navigate, planType, selectedPlan, clientSecret, isLoading, plans, isAuthenticated]);

    if (!selectedPlan) {
        return <p className="text-red-500">Plan not found. Please select a valid plan.</p>;
    }

    return (
        <div className="p-6 max-w-md mx-auto">
            <h2 className="text-2xl font-bold mb-4">Complete Your Payment</h2>
            {isLoading && <p>Loading...</p>}
            {error && <p className="text-red-500">{error}</p>}
            {message && <p className="text-green-500">{message}</p>}
            {clientSecret && (
                <Elements stripe={stripePromise}>
                    <PaymentForm clientSecret={clientSecret} plan={selectedPlan} paymentId={paymentId} />
                </Elements>
            )}
        </div>
    );
};

export default PaymentPage;