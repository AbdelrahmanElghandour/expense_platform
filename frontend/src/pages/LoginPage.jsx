import { useState } from "react";
import api from "../api/api";
import { useAuth } from "../context/AuthContext";
import { Link, useNavigate } from "react-router-dom";


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

            login(response.data.token);
            navigate("/dashboard");
        } catch (error) {
            setError(
                error.response?.data?.error || "Login failed"
            );
        }
    }

    return (
        <div>
            <h1>Login</h1>

            <form onSubmit={handleSubmit}>
                <div>
                    <label>Email</label>
                    <input
                        type="email"
                        value={email}
                        onChange={(event) =>
                            setEmail(event.target.value)
                        }
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
                    />
                </div>
                <div></div>
                <button type="submit">
                    Login
                </button>
                <div></div>
            </form>
            <p>
                Don't have an account?{" "}
                <Link to="/register">
                    Create an account
                </Link>
            </p>

            {error && <p>{error}</p>}
        </div>
    );
}

export default LoginPage;