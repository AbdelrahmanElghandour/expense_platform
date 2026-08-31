import { useEffect, useState } from "react";

import api from "../api/api";
import AppLayout from "../components/layout/AppLayout";
import SummaryCard from "../components/dashboard/SummaryCard";
import "../styles/dashboard.css";

function DashboardPage() {
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

    return (
        <AppLayout>
            <div>
                <header className="dashboard-header">
                    <h1>Dashboard</h1>
                    <p>Overview of your finances</p>
                </header>

                {error && <p>{error}</p>}

                {/* Summary */}
                {summary && (
                    <section>
                        <h2>Overview</h2>

                        <div className="summary-grid">
                            <SummaryCard
                                title="Total Income"
                                value={summary.totalIncome}
                            />

                            <SummaryCard
                                title="Total Expenses"
                                value={summary.totalExpenses}
                            />

                            <SummaryCard
                                title="Balance"
                                value={summary.balance}
                            />
                        </div>
                    </section>
                )}

                <hr />

                <div className="analytics-grid">

                    {/* Monthly Trends */}
                    <section className="dashboard-panel">
                        <div className="panel-header">
                            <div>
                                <h2>Monthly Trends</h2>
                                <p>Income and expenses over time</p>
                            </div>
                        </div>

                        {trends.length === 0 ? (
                            <p className="empty-state">
                                No trend data found.
                            </p>
                        ) : (
                            <div className="trends-list">
                                {trends.map((trend) => (
                                    <div
                                        className="trend-row"
                                        key={trend.period}
                                    >
                                        <span className="trend-period">
                                            {trend.period}
                                        </span>

                                        <div className="trend-values">
                                            <div>
                                                <span className="trend-label">
                                                    Income
                                                </span>

                                                <strong>
                                                    {trend.income}
                                                </strong>
                                            </div>

                                            <div>
                                                <span className="trend-label">
                                                    Expenses
                                                </span>

                                                <strong>
                                                    {trend.expenses}
                                                </strong>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </section>

                    {/* Expenses by Category */}
                    <section className="dashboard-panel">
                        <div className="panel-header">
                            <div>
                                <h2>Expenses by Category</h2>
                                <p>Where your money is going</p>
                            </div>
                        </div>

                        {categoryAnalytics &&
                            (categoryAnalytics.categories.length === 0 ? (
                                <p className="empty-state">
                                    No expense data found.
                                </p>
                            ) : (
                                <div className="category-list">
                                    {categoryAnalytics.categories.map(
                                        (category) => (
                                            <div
                                                className="category-row"
                                                key={category.category}
                                            >
                                                <div className="category-info">
                                                    <span className="category-name">
                                                        {category.category}
                                                    </span>

                                                    <span className="category-total">
                                                        {category.total}
                                                    </span>
                                                </div>

                                                <div className="category-percentage">
                                                    {category.percentage}%
                                                </div>
                                            </div>
                                        )
                                    )}
                                </div>
                            ))}
                    </section>

                </div>
                <hr />
            </div>
        </AppLayout>
    );
}

export default DashboardPage;