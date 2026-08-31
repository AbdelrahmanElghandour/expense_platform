import "./../../styles/layout.css";
import Sidebar from "./Sidebar";

function AppLayout({ children }) {
    return (
        <div className="app-layout">
            <Sidebar />

            <main className="main-content">
                {children}
            </main>
        </div>
    );
}

export default AppLayout;