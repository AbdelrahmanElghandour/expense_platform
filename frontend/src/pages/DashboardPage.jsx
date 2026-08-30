import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import api from "../api/api";
import { useAuth } from "../context/AuthContext";

function DashboardPage() {
    const { logout } = useAuth();
    const navigate = useNavigate();

    const [summary, setSummary] = useState(null);
    const [error, setError] = useState("");

    useEffect(() => {
        async function fetchSummary() {
            try {
                const response = await api.get("/analytics/summary");
                setSummary(response.data);
            } catch (error) {
                setError(
                    error.response?.data?.error ||
                    "Failed to load summary"
                );
            }
        }

        fetchSummary();
    }, []);

    function handleLogout() {
        logout();
        navigate("/login");
    }

    return (
        <div>
            <h1>Dashboard</h1>

            {error && <p>{error}</p>}

            {summary && (
                <div>
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

            <button onClick={handleLogout}>
                Logout
            </button>
        </div>
    );
}

export default DashboardPage;