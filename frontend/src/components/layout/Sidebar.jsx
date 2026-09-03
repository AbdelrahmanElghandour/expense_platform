import { NavLink, useNavigate } from "react-router-dom";

import { useAuth } from "../../context/useAuth";

function Sidebar() {
    const { logout } = useAuth();
    const navigate = useNavigate();

    function handleLogout() {
        logout();
        navigate("/login");
    }

    return (
        <aside className="sidebar">
            <div className="sidebar-header">
                <h2>Expense Platform</h2>
            </div>

            <nav className="sidebar-nav">
                {/* Nav link knows whether its destination is the current Page */}
                <NavLink
                    to="/dashboard"
                    className={({ isActive }) =>
                        isActive
                            ? "sidebar-link active"
                            : "sidebar-link"
                    }
                >
                    Dashboard
                </NavLink>

                <NavLink
                    to="/transactions"
                    className={({ isActive }) =>
                        isActive
                            ? "sidebar-link active"
                            : "sidebar-link"
                    }
                >
                    Transactions
                </NavLink>
            </nav>
            <NavLink
                to="/settings"
                className={({ isActive }) =>
                    isActive ? "sidebar-link active" : "sidebar-link"
                }
            >
                Settings
            </NavLink>
            <button
                className="sidebar-logout"
                onClick={handleLogout}
            >
                Logout
            </button>
        </aside>
    );
}

export default Sidebar;
