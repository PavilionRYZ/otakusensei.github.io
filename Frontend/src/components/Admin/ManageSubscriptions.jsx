import React, { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import {
    FaBars,
    FaTimes,
    FaHome,
    FaUsers,
    FaBook,
    FaCreditCard,
    FaUser,
} from "react-icons/fa";
import { toast } from "react-toastify";
import { clearAuthState, loadUser } from "../../Redux/Slices/authSlice";
import { getUsers, setSubscriptionPlan } from "../../Redux/Slices/adminSlice";
import { getSubscriptionPlans, getPremiumUsersCount } from "../../Redux/Slices/subscriptionSlice";
import { Button, Table, InputNumber, Form, Modal, message, Card } from "antd";
import AnimeLoadingPage from "../Loading/AnimeLoadingPage";
import { CardContent, CardHeader, CardTitle } from "../ui/card";

const { Column } = Table;

const ManageSubscriptions = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const [form] = Form.useForm();
    const [isModalVisible, setIsModalVisible] = React.useState(false);
    const [editingPlan, setEditingPlan] = React.useState(null);

    const { isAuthenticated, user, isLoading: authLoading, error: authError } = useSelector((state) => state.auth);
    const { users, isLoading: adminLoading, error: adminError } = useSelector((state) => state.admin);
    const { plans, isLoading: subLoading, error: subError, premiumUsers } = useSelector((state) => state.subscription);

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
        dispatch(getSubscriptionPlans());
        dispatch(getPremiumUsersCount());
        return () => {
            dispatch(clearAuthState());
        };
    }, [dispatch, isAuthenticated, navigate, user]);

    const [sidebarOpen, setSidebarOpen] = React.useState(false);

    const toggleSidebar = () => {
        setSidebarOpen(!sidebarOpen);
    };

    const showModal = (record) => {
        setEditingPlan(record);
        form.setFieldsValue({
            planType: record.planType,
            price: record.price,
            durationDays: record.durationDays,
        });
        setIsModalVisible(true);
    };

    const handleOk = () => {
        form.validateFields().then((values) => {
            dispatch(setSubscriptionPlan(values)).then(() => {
                setIsModalVisible(false);
                form.resetFields();
                toast.success("Subscription plan updated successfully");
            }).catch(() => {
                toast.error("Failed to update subscription plan");
            });
        });
    };

    const handleCancel = () => {
        setIsModalVisible(false);
        form.resetFields();
        setEditingPlan(null);
    };

    if (authLoading || adminLoading || subLoading) {
        return (
            <div className="bg-gray-900 min-h-screen flex items-center justify-center">
                <AnimeLoadingPage />
            </div>
        );
    }

    if (authError || adminError || subError) {
        toast.error(authError || adminError || subError || "Failed to load subscriptions", { position: "top-right", autoClose: 3000 });
        return (
            <div className="min-h-screen bg-gray-900 dark:bg-gray-100 font-['Bubblegum_Sans']">
                <div className="container mx-auto px-6 py-8">
                    <div className="max-w-4xl mx-auto">
                        <p className="text-red-500 text-center py-8">An error occurred. Please try again.</p>
                        <button
                            onClick={() => {
                                dispatch(getUsers({ page: 1, limit: 5 }));
                                dispatch(getSubscriptionPlans());
                                dispatch(getPremiumUsersCount());
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

    const navigationItems = [
        { name: "Dashboard", href: "/admin", icon: FaHome },
        { name: "Users", href: "/admin/users", icon: FaUsers },
        { name: "Comics", href: "/admin/comics", icon: FaBook },
        { name: "Subscriptions", href: "/admin/subscriptions", icon: FaCreditCard },
    ];

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
                        <h1 className="text-2xl font-bold text-gray-100 dark:text-gray-900">Manage Subscriptions</h1>
                        <div className="w-6"></div>
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
                                Manage Subscription Plans
                            </h2>
                            <p className="text-gray-400 dark:text-gray-600">
                                View and update subscription plans and premium user stats.
                            </p>
                        </div>

                        {/* Premium Users Card */}
                        <div className="mb-6">
                            <Card className="bg-gray-800 dark:bg-gray-200 text-gray-100 dark:text-gray-900 shadow-lg">
                                <CardHeader className="border-b border-gray-700 dark:border-gray-300 pb-4">
                                    <CardTitle className="text-xl">Premium Users</CardTitle>
                                </CardHeader>
                                <CardContent className="p-4">
                                    <p className="text-2xl font-bold">{premiumUsers || 0}</p>
                                    <p className="text-gray-400 dark:text-gray-600">Active premium users</p>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Subscription Plans Table */}
                        <Card className="bg-gray-800 dark:bg-gray-200 text-gray-100 dark:text-gray-900 shadow-lg">
                            <CardHeader className="border-b border-gray-700 dark:border-gray-300 pb-4">
                                <CardTitle className="text-2xl">Subscription Plans</CardTitle>
                            </CardHeader>
                            <CardContent className="p-4">
                                <Table
                                    dataSource={plans}
                                    rowKey="planType"
                                    pagination={false}
                                    className="custom-ant-table"
                                    style={{ background: "transparent" }}
                                >
                                    <Column
                                        title="Plan Type"
                                        dataIndex="planType"
                                        key="planType"
                                        sorter={(a, b) => a.planType.localeCompare(b.planType)}
                                    />
                                    <Column
                                        title="Price ($)"
                                        dataIndex="price"
                                        key="price"
                                        sorter={(a, b) => a.price - b.price}
                                    />
                                    <Column
                                        title="Duration (Days)"
                                        dataIndex="durationDays"
                                        key="durationDays"
                                        sorter={(a, b) => a.durationDays - b.durationDays}
                                    />
                                    <Column
                                        title="Action"
                                        key="action"
                                        render={(_, record) => (
                                            <Button
                                                type="primary"
                                                onClick={() => showModal(record)}
                                                style={{ background: "#f87171", borderColor: "#f87171" }}
                                            >
                                                Edit
                                            </Button>
                                        )}
                                    />
                                </Table>
                            </CardContent>
                        </Card>

                        {/* Edit Modal */}
                        <Modal
                            title="Edit Subscription Plan"
                            open={isModalVisible}
                            onOk={handleOk}
                            onCancel={handleCancel}
                            footer={[
                                <Button key="back" onClick={handleCancel}>
                                    Cancel
                                </Button>,
                                <Button
                                    key="submit"
                                    type="primary"
                                    onClick={handleOk}
                                    style={{ background: "#f87171", borderColor: "#f87171" }}
                                >
                                    Save
                                </Button>,
                            ]}
                        >
                            <Form
                                form={form}
                                layout="vertical"
                                name="subscription_form"
                                initialValues={{ planType: editingPlan?.planType, price: editingPlan?.price, durationDays: editingPlan?.durationDays }}
                            >
                                <Form.Item
                                    name="planType"
                                    label="Plan Type"
                                    rules={[{ required: true, message: "Please select a plan type!" }]}
                                >
                                    <InputNumber disabled />
                                </Form.Item>
                                <Form.Item
                                    name="price"
                                    label="Price ($)"
                                    rules={[{ required: true, message: "Please enter a price!" }]}
                                >
                                    <InputNumber min={0} />
                                </Form.Item>
                                <Form.Item
                                    name="durationDays"
                                    label="Duration (Days)"
                                    rules={[{ required: true, message: "Please enter duration!" }]}
                                >
                                    <InputNumber min={1} />
                                </Form.Item>
                            </Form>
                        </Modal>
                    </motion.div>
                </div>
            </div>
        </div>
    );
};

export default ManageSubscriptions;