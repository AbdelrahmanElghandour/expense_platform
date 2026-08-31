import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer
} from "recharts";

function MonthlyTrendChart({ trends }) {
    const chartData = trends.map((trend) => ({
        period: trend.period,
        income: Number(trend.income),
        expenses: Number(trend.expenses)
    }));

    return (
        <div className="chart-container">
            <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />

                    <XAxis dataKey="period" />

                    <YAxis />

                    <Tooltip />

                    <Legend />

                    <Line
                        type="monotone"
                        dataKey="income"
                        name="Income"
                        stroke="#10b981"
                        strokeWidth={2}
                    />

                    <Line
                        type="monotone"
                        dataKey="expenses"
                        name="Expenses"
                        stroke="#ef4444"
                        strokeWidth={2}
                    />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
}

export default MonthlyTrendChart;