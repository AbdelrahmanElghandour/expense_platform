import {
    PieChart,
    Pie,
    Cell,
    Tooltip,
    ResponsiveContainer
} from "recharts";

const COLORS = [
    "#3b82f6",
    "#10b981",
    "#f59e0b",
    "#ef4444",
    "#8b5cf6",
    "#06b6d4",
    "#ec4899",
    "#6b7280"
];

function CategoryDonutChart({
    categories,
    totalExpenses
}) {
    const chartData = categories.map((category) => ({
        name: category.category,
        value: Number(category.total),
        percentage: category.percentage
    }));

    return (
        <div>
            <div className="category-chart-container">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={chartData}
                            dataKey="value"
                            nameKey="name"
                            cx="50%"
                            cy="50%"
                            innerRadius={70}
                            outerRadius={100}
                            paddingAngle={2}
                        >
                            {chartData.map((entry, index) => (
                                <Cell
                                    key={entry.name}
                                    fill={
                                        COLORS[
                                            index % COLORS.length
                                        ]
                                    }
                                />
                            ))}
                        </Pie>

                        <text
                            x="50%"
                            y="47%"
                            textAnchor="middle"
                            dominantBaseline="middle"
                            className="donut-center-label"
                        >
                            Total
                        </text>

                        <text
                            x="50%"
                            y="55%"
                            textAnchor="middle"
                            dominantBaseline="middle"
                            className="donut-center-value"
                        >
                            {Number(totalExpenses).toLocaleString()}
                        </text>

                        <Tooltip />
                    </PieChart>
                </ResponsiveContainer>
            </div>

            <div className="category-legend">
                {chartData.map((category, index) => (
                    <div
                        className="category-legend-item"
                        key={category.name}
                    >
                        <span
                            className="category-legend-color"
                            style={{
                                backgroundColor:
                                    COLORS[
                                        index % COLORS.length
                                    ]
                            }}
                        />

                        <span className="category-legend-name">
                            {category.name}
                        </span>

                        <span className="category-legend-percentage">
                            {category.percentage}%
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default CategoryDonutChart;