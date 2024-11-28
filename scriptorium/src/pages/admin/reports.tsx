import React from "react";

const ReportsPage: React.FC = () => {
    return (
        <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
            <div className="container mx-auto px-4 py-8">
                {/* Header */}
                <header className="mb-8">
                    <h1 className="text-3xl font-bold">Reports</h1>
                    <p className="text-gray-600 dark:text-gray-400 mt-2">
                        Manage and review reported posts.
                    </p>
                </header>

                {/* Placeholder for Top Reports */}
                <section className="mb-12">
                    <h2 className="text-2xl font-semibold mb-4">Top Reports</h2>
                    {/* Insert TopReports component here */}
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                        <p className="text-gray-500 dark:text-gray-400 italic">
                            Placeholder for Top Reports component.
                        </p>
                    </div>
                </section>

                {/* General Reports Section */}
                <section>
                    <h2 className="text-2xl font-semibold mb-4">All Reports</h2>
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                        <p className="text-gray-500 dark:text-gray-400 italic">
                            This section can be used to show general reports or provide additional details.
                        </p>
                    </div>
                </section>
            </div>
        </div>
    );
};

export default ReportsPage;