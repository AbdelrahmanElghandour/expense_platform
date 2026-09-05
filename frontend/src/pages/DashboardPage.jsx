import { useEffect, useState } from "react";

import api from "../api/api";
import AppLayout from "../components/layout/AppLayout";
import SummaryCard from "../components/dashboard/SummaryCard";
import MonthlyTrendChart from "../components/dashboard/MonthlyTrendChart";
import CategoryDonutChart from "../components/dashboard/CategoryDonutChart";
import { useAuth } from "../context/useAuth";

import "../styles/dashboard.css";


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


function getDateRange(period, customStartDate, customEndDate) {
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

    if (period === "custom") {
        if (!customStartDate || !customEndDate) {
            return null;
        }

        if (customStartDate > customEndDate) {
            return null;
        }

        return {
            startDate: customStartDate,
            endDate: customEndDate
        };
    }

    return {};
}


function PeriodSelect({ value, onChange }) {
    return (
        <select
            className="period-select"
            value={value}
            onChange={onChange}
        >
            <option value="all">All Time</option>
            <option value="thisMonth">This Month</option>
            <option value="lastMonth">Last Month</option>
            <option value="last3Months">Last 3 Months</option>
            <option value="thisYear">This Year</option>
            <option value="custom">Custom</option>
        </select>
    );
}


function CustomDateRange({
    startDate,
    endDate,
    onStartDateChange,
    onEndDateChange
}) {
    const invalidRange =
        startDate &&
        endDate &&
        startDate > endDate;

    return (
        <div className="custom-date-range">
            <div className="custom-date-field">
                <label>From</label>

                <input
                    type="date"
                    value={startDate}
                    onChange={onStartDateChange}
                />
            </div>

            <div className="custom-date-field">
                <label>To</label>

                <input
                    type="date"
                    value={endDate}
                    onChange={onEndDateChange}
                />
            </div>

            {invalidRange && (
                <p className="date-range-error">
                    Start date cannot be after end date.
                </p>
            )}
        </div>
    );
}


function DashboardPage() {
    const { defaultCurrency } = useAuth();

    const [summary, setSummary] = useState(null);
    const [categoryAnalytics, setCategoryAnalytics] = useState(null);
    const [trends, setTrends] = useState([]);

    const [summaryPeriod, setSummaryPeriod] = useState("all");
    const [summaryStartDate, setSummaryStartDate] = useState("");
    const [summaryEndDate, setSummaryEndDate] = useState("");

    const [categoryPeriod, setCategoryPeriod] = useState("all");
    const [categoryStartDate, setCategoryStartDate] = useState("");
    const [categoryEndDate, setCategoryEndDate] = useState("");

    const [isSummaryLoading, setIsSummaryLoading] = useState(true);
    const [isTrendsLoading, setIsTrendsLoading] = useState(true);
    const [isCategoryLoading, setIsCategoryLoading] = useState(true);

    const [summaryError, setSummaryError] = useState("");
    const [trendsError, setTrendsError] = useState("");
    const [categoryError, setCategoryError] = useState("");


    useEffect(() => {
        async function fetchSummary() {
            const params = getDateRange(
                summaryPeriod,
                summaryStartDate,
                summaryEndDate
            );

            if (params === null) {
                setIsSummaryLoading(false);
                return;
            }

            setIsSummaryLoading(true);
            setSummaryError("");

            try {
                const response = await api.get(
                    "/analytics/summary",
                    { params }
                );

                setSummary(response.data);
            } catch (error) {
                setSummaryError(
                    error.response?.data?.error ||
                    "Failed to fetch summary"
                );
            } finally {
                setIsSummaryLoading(false);
            }
        }

        fetchSummary();
    }, [
        summaryPeriod,
        summaryStartDate,
        summaryEndDate
    ]);


    useEffect(() => {
        async function fetchTrends() {
            setIsTrendsLoading(true);
            setTrendsError("");

            try {
                const response = await api.get(
                    "/analytics/trends",
                    {
                        params: {
                            groupBy: "month"
                        }
                    }
                );

                setTrends(response.data.trends);
            } catch (error) {
                setTrendsError(
                    error.response?.data?.error ||
                    "Failed to fetch trends"
                );
            } finally {
                setIsTrendsLoading(false);
            }
        }

        fetchTrends();
    }, []);


    useEffect(() => {
        async function fetchCategoryAnalytics() {
            const params = getDateRange(
                categoryPeriod,
                categoryStartDate,
                categoryEndDate
            );

            if (params === null) {
                setIsCategoryLoading(false);
                return;
            }

            setIsCategoryLoading(true);
            setCategoryError("");

            try {
                const response = await api.get(
                    "/analytics/categories",
                    { params }
                );

                setCategoryAnalytics(response.data);
            } catch (error) {
                setCategoryError(
                    error.response?.data?.error ||
                    "Failed to fetch category analytics"
                );
            } finally {
                setIsCategoryLoading(false);
            }
        }

        fetchCategoryAnalytics();
    }, [
        categoryPeriod,
        categoryStartDate,
        categoryEndDate
    ]);


    return (
        <AppLayout>
            <div>
                <header className="dashboard-header">
                    <h1>Dashboard</h1>
                    <p>Overview of your finances</p>
                </header>


                {/* Summary */}
                <section>
                    <div className="overview-header">
                        <h2>Overview</h2>

                        <PeriodSelect
                            value={summaryPeriod}
                            onChange={(event) =>
                                setSummaryPeriod(event.target.value)
                            }
                        />
                    </div>

                    {summaryPeriod === "custom" && (
                        <CustomDateRange
                            startDate={summaryStartDate}
                            endDate={summaryEndDate}
                            onStartDateChange={(event) =>
                                setSummaryStartDate(event.target.value)
                            }
                            onEndDateChange={(event) =>
                                setSummaryEndDate(event.target.value)
                            }
                        />
                    )}

                    {summaryError && (
                        <p className="dashboard-error">
                            {summaryError}
                        </p>
                    )}

                    {isSummaryLoading ? (
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

                        {trendsError && (
                            <p className="dashboard-error">
                                {trendsError}
                            </p>
                        )}

                        {isTrendsLoading ? (
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

                            <PeriodSelect
                                value={categoryPeriod}
                                onChange={(event) =>
                                    setCategoryPeriod(event.target.value)
                                }
                            />
                        </div>

                        {categoryPeriod === "custom" && (
                            <CustomDateRange
                                startDate={categoryStartDate}
                                endDate={categoryEndDate}
                                onStartDateChange={(event) =>
                                    setCategoryStartDate(event.target.value)
                                }
                                onEndDateChange={(event) =>
                                    setCategoryEndDate(event.target.value)
                                }
                            />
                        )}

                        {categoryError && (
                            <p className="dashboard-error">
                                {categoryError}
                            </p>
                        )}

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
                                    totalExpenses={
                                        categoryAnalytics.totalExpenses
                                    }
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