import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

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
        <div>
            <h1>Create Account</h1>

            <form onSubmit={handleSubmit}>
                <div>
                    <label>Name</label>

                    <input
                        type="text"
                        value={name}
                        onChange={(event) =>
                            setName(event.target.value)
                        }
                        required
                    />
                </div>

                <div>
                    <label>Email</label>

                    <input
                        type="email"
                        value={email}
                        onChange={(event) =>
                            setEmail(event.target.value)
                        }
                        required
                    />
                </div>

                <div>
                    <label>Password</label>

                    <input
                        type="password"
                        value={password}
                        onChange={(event) =>
                            setPassword(event.target.value)
                        }
                        required
                    />
                </div>

                <div>
                    <label>Currency</label>

                    <select
                        value={currency}
                        onChange={(event) =>
                            setCurrency(event.target.value)
                        }
                    >
                        <option value="KRW">KRW</option>
                        <option value="USD">USD</option>
                        <option value="EUR">EUR</option>
                        <option value="EGP">EGP</option>
                    </select>
                </div>

                {error && <p>{error}</p>}

                <button type="submit">
                    Create Account
                </button>
            </form>

            <p>
                Already have an account?{" "}
                <Link to="/login">
                    Login
                </Link>
            </p>
        </div>
    );
}

export default RegisterPage;