import React from "react";
import Link from "next/link";
import AdminAuthWrapper from "@/components/Admin/AdminAuthWrapper";

const AdminPage: React.FC = () => {
    return (
        <AdminAuthWrapper>
            <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100">

                {/* Main Content */}
                <div className="container mx-auto px-4 py-8">

                    {/* Cards Section */}
                    <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {/* Card 1 */}
                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                            <h2 className="text-lg font-semibold mb-2">Reports</h2>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                View and manage reported posts.
                            </p>
                            <Link href="/admin/reports/"
                                  className="mt-4 px-4 py-2 bg-indigo-500 text-white rounded-md hover:bg-indigo-600 inline-block">
                                View Reports
                            </Link>
                        </div>

                        {/* Card 2 */}
                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                            <h2 className="text-lg font-semibold mb-2">Users</h2>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                Manage user accounts and permissions.
                            </p>
                            <button className="mt-4 px-4 py-2 bg-indigo-500 text-white rounded-md hover:bg-indigo-600">
                                Manage Users
                            </button>
                        </div>

                        {/* Card 3 */}
                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                            <h2 className="text-lg font-semibold mb-2">Analytics</h2>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                Track site metrics and performance.
                            </p>
                            <button className="mt-4 px-4 py-2 bg-indigo-500 text-white rounded-md hover:bg-indigo-600">
                                View Analytics
                            </button>
                        </div>
                    </section>

                    {/* Quick Stats */}
                    <section className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 text-center">
                            <h3 className="text-2xl font-bold text-indigo-500">120</h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Total Reports</p>
                        </div>
                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 text-center">
                            <h3 className="text-2xl font-bold text-indigo-500">1,250</h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Total Users</p>
                        </div>
                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 text-center">
                            <h3 className="text-2xl font-bold text-indigo-500">342</h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400">New Posts This Week</p>
                        </div>
                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 text-center">
                            <h3 className="text-2xl font-bold text-indigo-500">95%</h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Positive Feedback</p>
                        </div>
                    </section>
                </div>

            </div>
        </AdminAuthWrapper>
    );
};

export default AdminPage;