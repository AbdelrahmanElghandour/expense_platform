import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import "../styles/auth.css";

import api from "../api/api";

function RegisterPage() {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [currency, setCurrency] = useState("KRW");
    const [error, setError] = useState("");

    const navigate = useNavigate();

    async function handleSubmit(event) {
        event.preventDefault();
        setError("");

        try {
            await api.post("/auth/register", {
                name,
                email,
                password,
                currency
            });

            navigate("/login");
        } catch (error) {
            setError(
                error.response?.data?.error ||
                "Registration failed"
            );
        }
    }

    return (
        <div className="auth-page">
            <div className="auth-card">
                <div className="auth-header">
                    <h1>Create your account</h1>
                    <p>Start tracking your finances in one place</p>
                </div>

                <form
                    className="auth-form"
                    onSubmit={handleSubmit}
                >
                    <div className="auth-field">
                        <label>Name</label>

                        <input
                            type="text"
                            placeholder="Your name"
                            value={name}
                            onChange={(event) =>
                                setName(event.target.value)
                            }
                            required
                        />
                    </div>

                    <div className="auth-field">
                        <label>Email</label>

                        <input
                            type="email"
                            placeholder="you@example.com"
                            value={email}
                            onChange={(event) =>
                                setEmail(event.target.value)
                            }
                            required
                        />
                    </div>

                    <div className="auth-field">
                        <label>Password</label>

                        <input
                            type="password"
                            placeholder="Create a password"
                            value={password}
                            onChange={(event) =>
                                setPassword(event.target.value)
                            }
                            required
                        />
                    </div>

                    <div className="auth-field">
                        <label>Default Currency</label>

                        <select
                            value={currency}
                            onChange={(event) =>
                                setCurrency(event.target.value)
                            }
                        >
                            <option value="KRW">
                                KRW — Korean Won
                            </option>

                            <option value="USD">
                                USD — US Dollar
                            </option>

                            <option value="EUR">
                                EUR — Euro
                            </option>

                            <option value="EGP">
                                EGP — Egyptian Pound
                            </option>
                        </select>
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
                        Create Account
                    </button>
                </form>

                <p className="auth-footer">
                    Already have an account?{" "}
                    <Link to="/login">
                        Sign in
                    </Link>
                </p>
            </div>
        </div>
    );
}

export default RegisterPage;