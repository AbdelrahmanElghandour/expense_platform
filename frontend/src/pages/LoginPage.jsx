import { useState } from "react";
import api from "../api/api";
import { useAuth } from "../context/useAuth";
import { Link, useNavigate } from "react-router-dom";
import "../styles/auth.css";

function LoginPage() {
    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    const { login } = useAuth();

    async function handleSubmit(event) {
        event.preventDefault();
        setError("");

        try {
            const response = await api.post("/auth/login", {
                email,
                password
            });

            login(response.data.token, response.data.user);
            navigate("/dashboard");
        } catch (error) {
            setError(
                error.response?.data?.error || "Login failed"
            );
        }
    }

    return (
        <div className="auth-page">
            <div className="auth-card">
                <div className="auth-header">
                    <h1>Welcome back</h1>
                    <p>Sign in to continue to your dashboard</p>
                </div>

                <form
                    className="auth-form"
                    onSubmit={handleSubmit}
                >
                    <div className="auth-field">
                        <label>Email</label>

                        <input
                            type="email"
                            placeholder="you@example.com"
                            value={email}
                            onChange={(event) =>
                                setEmail(event.target.value)
                            }
                        />
                    </div>

                    <div className="auth-field">
                        <label>Password</label>

                        <input
                            type="password"
                            placeholder="Enter your password"
                            value={password}
                            onChange={(event) =>
                                setPassword(event.target.value)
                            }
                        />
                    </div>

                    {error && (
                        <p className="auth-error">
                            {error}
                        </p>
                    )}

                    <button
                        className="auth-submit-button"
                        type="submit"
                    >
                        Sign In
                    </button>
                </form>

                <p className="auth-footer">
                    Don't have an account?{" "}
                    <Link to="/register">
                        Create an account
                    </Link>
                </p>
            </div>
        </div>
    );
}

export default LoginPage;
