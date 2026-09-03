import { useEffect, useState } from "react";

import api from "../api/api";
import AppLayout from "../components/layout/AppLayout";
import SummaryCard from "../components/dashboard/SummaryCard";
import "../styles/dashboard.css";
import MonthlyTrendChart from "../components/dashboard/MonthlyTrendChart";
import CategoryDonutChart from "../components/dashboard/CategoryDonutChart";
import { useAuth } from "../context/useAuth";

function formatDate(date) {
    const year = date.getFullYear();

    const month = String(
        date.getMonth() + 1
    ).padStart(2, "0");

    const day = String(
        date.getDate()
    ).padStart(2, "0");

    return `${year}-${month}-${day}`;
}

function getCategoryDateRange(period) {
    const now = new Date();

    if (period === "all") {
        return {};
    }

    if (period === "thisMonth") {
        const startDate = new Date(
            now.getFullYear(),
            now.getMonth(),
            1
        );

        const endDate = new Date(
            now.getFullYear(),
            now.getMonth() + 1,
            0
        );

        return {
            startDate: formatDate(startDate),
            endDate: formatDate(endDate)
        };
    }

    if (period === "lastMonth") {
        const startDate = new Date(
            now.getFullYear(),
            now.getMonth() - 1,
            1
        );

        const endDate = new Date(
            now.getFullYear(),
            now.getMonth(),
            0
        );

        return {
            startDate: formatDate(startDate),
            endDate: formatDate(endDate)
        };
    }

    if (period === "last3Months") {
        const startDate = new Date(
            now.getFullYear(),
            now.getMonth() - 2,
            1
        );

        return {
            startDate: formatDate(startDate),
            endDate: formatDate(now)
        };
    }

    if (period === "thisYear") {
        const startDate = new Date(
            now.getFullYear(),
            0,
            1
        );

        return {
            startDate: formatDate(startDate),
            endDate: formatDate(now)
        };
    }

    return {};
}

function DashboardPage() {
    const { defaultCurrency } = useAuth();
    const [summary, setSummary] = useState(null);
    const [categoryAnalytics, setCategoryAnalytics] = useState(null);
    const [trends, setTrends] = useState([]);
    const [error, setError] = useState("");
    const [categoryPeriod, setCategoryPeriod] = useState("all");
    const [isDashboardLoading, setIsDashboardLoading] = useState(true);

    const [isCategoryLoading, setIsCategoryLoading] = useState(true);

    useEffect(() => {
        async function fetchDashboardData() {
            setIsDashboardLoading(true);

            try {
                const summaryResponse = await api.get(
                    "/analytics/summary"
                );

                const trendsResponse = await api.get(
                    "/analytics/trends",
                    {
                        params: {
                            groupBy: "month"
                        }
                    }
                );

                setSummary(summaryResponse.data);
                setTrends(trendsResponse.data.trends);
            } catch (error) {
                setError(
                    error.response?.data?.error ||
                    "Failed to fetch dashboard data"
                );
            } finally {
                setIsDashboardLoading(false);
            }
        }

        fetchDashboardData();
    }, []);
    useEffect(() => {
        async function fetchCategoryAnalytics() {
            setIsCategoryLoading(true);

            try {
                const params =
                    getCategoryDateRange(categoryPeriod);

                const response = await api.get(
                    "/analytics/categories",
                    { params }
                );

                setCategoryAnalytics(response.data);
            } catch (error) {
                setError(
                    error.response?.data?.error ||
                    "Failed to fetch category analytics"
                );
            } finally {
                setIsCategoryLoading(false);
            }
        }

        fetchCategoryAnalytics();
    }, [categoryPeriod]);


    return (
        <AppLayout>
            <div>
                <header className="dashboard-header">
                    <h1>Dashboard</h1>
                    <p>Overview of your finances</p>
                </header>

                {error && <p>{error}</p>}

                {/* Summary */}
                <section>
                    <h2>Overview</h2>

                    {isDashboardLoading ? (
                        <p>Loading summary...</p>
                    ) : summary ? (
                        <div className="summary-grid">
                            <SummaryCard
                                title="Total Income"
                                value={summary.totalIncome}
                                currency={defaultCurrency}
                            />

                            <SummaryCard
                                title="Total Expenses"
                                value={summary.totalExpenses}
                                currency={defaultCurrency}
                            />

                            <SummaryCard
                                title="Balance"
                                value={summary.balance}
                                currency={defaultCurrency}
                            />
                        </div>
                    ) : (
                        <p className="empty-state">
                            No summary data found.
                        </p>
                    )}
                </section>

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

                        {isDashboardLoading ? (
                            <p>Loading trends...</p>
                        ) : trends.length === 0 ? (
                            <p className="empty-state">
                                No trend data found.
                            </p>
                        ) : (
                            <MonthlyTrendChart
                                trends={trends}
                                currency={defaultCurrency}
                            />
                        )}
                    </section>

                    {/* Expenses by Category */}
                    <section className="dashboard-panel">
                        <div className="panel-header panel-header-row">
                            <div>
                                <h2>Expenses by Category</h2>
                                <p>Where your money is going</p>
                            </div>

                            <select
                                className="period-select"
                                value={categoryPeriod}
                                onChange={(event) =>
                                    setCategoryPeriod(event.target.value)
                                }
                            >
                                <option value="all">All Time</option>
                                <option value="thisMonth">This Month</option>
                                <option value="lastMonth">Last Month</option>
                                <option value="last3Months">Last 3 Months</option>
                                <option value="thisYear">This Year</option>
                            </select>
                        </div>

                        {isCategoryLoading ? (
                            <p>Loading category analytics...</p>
                        ) : categoryAnalytics ? (
                            categoryAnalytics.categories.length === 0 ? (
                                <p className="empty-state">
                                    No expense data found.
                                </p>
                            ) : (
                                <CategoryDonutChart
                                    categories={categoryAnalytics.categories}
                                    totalExpenses={categoryAnalytics.totalExpenses}
                                    currency={defaultCurrency}
                                />
                            )
                        ) : (
                            <p className="empty-state">
                                No category data found.
                            </p>
                        )}
                    </section>

                </div>

                <hr />
            </div>
        </AppLayout>
    );
}

export default DashboardPage;
