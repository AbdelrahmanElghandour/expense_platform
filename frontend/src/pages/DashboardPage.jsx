import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import api from "../api/api";
import { useAuth } from "../context/AuthContext";

function DashboardPage() {
    const { logout } = useAuth();
    const navigate = useNavigate();

    const [summary, setSummary] = useState(null);
    const [categoryAnalytics, setCategoryAnalytics] = useState(null);
    const [trends, setTrends] = useState([]);
    const [error, setError] = useState("");

    useEffect(() => {
        async function fetchDashboardData() {
            try {
                setError("");

                // Summary
                const summaryResponse = await api.get(
                    "/analytics/summary"
                );

                setSummary(summaryResponse.data);

                // Expenses by category
                const categoryResponse = await api.get(
                    "/analytics/categories"
                );

                setCategoryAnalytics(categoryResponse.data);

                // Monthly trends
                const trendsResponse = await api.get(
                    "/analytics/trends",
                    {
                        params: {
                            groupBy: "month"
                        }
                    }
                );

                setTrends(trendsResponse.data.trends);

            } catch (error) {
                setError(
                    error.response?.data?.error ||
                    "Failed to load dashboard data"
                );
            }
        }

        fetchDashboardData();
    }, []);

    function handleLogout() {
        logout();
        navigate("/login");
    }

    return (
        <div>
            <h1>Dashboard</h1>

            {error && <p>{error}</p>}

            {/* Summary */}
            {summary && (
                <div>
                    <h2>Summary</h2>

                    <p>
                        Total Income: {summary.totalIncome}
                    </p>

                    <p>
                        Total Expenses: {summary.totalExpenses}
                    </p>

                    <p>
                        Balance: {summary.balance}
                    </p>
                </div>
            )}

            <hr />

            {/* Monthly Trends */}
            <h2>Monthly Trends</h2>

            {trends.length === 0 ? (
                <p>No trend data found.</p>
            ) : (
                <div>
                    {trends.map((trend) => (
                        <div key={trend.period}>
                            <p>
                                Period: {trend.period}
                            </p>

                            <p>
                                Income: {trend.income}
                            </p>

                            <p>
                                Expenses: {trend.expenses}
                            </p>

                            <hr />
                        </div>
                    ))}
                </div>
            )}

            {/* Expenses by Category */}
            <h2>Expenses by Category</h2>

            {categoryAnalytics && (
                <div>
                    <p>
                        Total Expenses:{" "}
                        {categoryAnalytics.totalExpenses}
                    </p>

                    {categoryAnalytics.categories.length === 0 ? (
                        <p>No expense data found.</p>
                    ) : (
                        <div>
                            {categoryAnalytics.categories.map(
                                (category) => (
                                    <div key={category.category}>
                                        <p>
                                            {category.category}:{" "}
                                            {category.total} (
                                            {category.percentage}%)
                                        </p>
                                    </div>
                                )
                            )}
                        </div>
                    )}
                </div>
            )}

            <hr />

            <button onClick={handleLogout}>
                Logout
            </button>
        </div>
    );
}

export default DashboardPage;