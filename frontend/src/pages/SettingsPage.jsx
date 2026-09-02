import { useEffect, useState } from "react";
import api from "../api/api";
import "../styles/settings.css";
import AppLayout from "../components/layout/AppLayout";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";


function SettingsPage() {
    const [user, setUser] = useState(null);

    const [name, setName] = useState("");
    const [currency, setCurrency] = useState("");

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [isSaving, setIsSaving] = useState(false);
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");

    const [passwordError, setPasswordError] = useState("");
    const [passwordSuccess, setPasswordSuccess] = useState("");
    const [isChangingPassword, setIsChangingPassword] = useState(false);

    const [deletePassword, setDeletePassword] = useState("");
    const [deleteError, setDeleteError] = useState("");
    const [isDeleting, setIsDeleting] = useState(false);

    const navigate = useNavigate();
    const { logout } = useAuth();

    useEffect(() => {
        async function fetchUser() {
            try {
                const response = await api.get("/users/me");

                const fetchedUser = response.data.user;

                setUser(fetchedUser);
                setName(fetchedUser.name || "");
                setCurrency(fetchedUser.default_currency || "");
            } catch (error) {
                setError(
                    error.response?.data?.error ||
                    "Failed to load profile"
                );
            }
        }

        fetchUser();
    }, []);

    async function handleProfileSubmit(event) {
        event.preventDefault();

        setError("");
        setSuccess("");
        setIsSaving(true);

        try {
            const response = await api.patch(
                "/users/me",
                {
                    name,
                    currency
                }
            );

            const updatedUser = response.data.user;

            setUser(updatedUser);
            setName(updatedUser.name || "");
            setCurrency(updatedUser.default_currency || "");

            setSuccess("Profile updated successfully");
        } catch (error) {
            setError(
                error.response?.data?.error ||
                "Failed to update profile"
            );
        } finally {
            setIsSaving(false);
        }
    }
    async function handlePasswordSubmit(event) {
        event.preventDefault();

        setPasswordError("");
        setPasswordSuccess("");
        setIsChangingPassword(true);

        try {
            await api.patch(
                "/users/me/password",
                {
                    currentPassword,
                    newPassword
                }
            );

            setCurrentPassword("");
            setNewPassword("");

            setPasswordSuccess(
                "Password changed successfully"
            );
        } catch (error) {
            setPasswordError(
                error.response?.data?.error ||
                "Failed to change password"
            );
        } finally {
            setIsChangingPassword(false);
        }
    }

    async function handleDeleteAccount(event) {
        event.preventDefault();

        const confirmed = window.confirm(
            "Are you sure you want to permanently delete your account? This cannot be undone."
        );

        if (!confirmed) {
            return;
        }

        setDeleteError("");
        setIsDeleting(true);

        try {
            await api.delete(
                "/users/me",
                {
                    data: {
                        password: deletePassword
                    }
                }
            );

            logout();
            navigate("/login");
        } catch (error) {
            setDeleteError(
                error.response?.data?.error ||
                "Failed to delete account"
            );
        } finally {
            setIsDeleting(false);
        }
    }

    if (!user && !error) {
        return (
            <AppLayout>
                <div className="settings-page">
                    <div className="settings-header">
                        <h1>Settings</h1>
                        <p>Loading profile...</p>
                    </div>
                </div>
            </AppLayout>
        );
    }

    return (
        <AppLayout>
            <div className="settings-page">
                <div className="settings-header">
                    <h1>Settings</h1>
                    <p>Manage your account and preferences.</p>
                </div>

                <section className="settings-card">
                    <div className="settings-card-header">
                        <h2>Profile</h2>
                        <p>
                            Update your personal information and default currency.
                        </p>
                    </div>

                    <form
                        className="settings-form"
                        onSubmit={handleProfileSubmit}
                    >
                        <div className="settings-field">
                            <label htmlFor="name">
                                Name
                            </label>

                            <input
                                id="name"
                                type="text"
                                value={name}
                                onChange={(event) =>
                                    setName(event.target.value)
                                }
                            />
                        </div>

                        <div className="settings-field">
                            <label htmlFor="email">
                                Email
                            </label>

                            <input
                                id="email"
                                type="email"
                                value={user?.email || ""}
                                disabled
                            />
                        </div>

                        <div className="settings-field">
                            <label htmlFor="currency">
                                Default currency
                            </label>

                            <select
                                id="currency"
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

                                <option value="JPY">
                                    JPY — Japanese Yen
                                </option>
                            </select>
                        </div>

                        {error && (
                            <p className="settings-message error">
                                {error}
                            </p>
                        )}

                        {success && (
                            <p className="settings-message success">
                                {success}
                            </p>
                        )}

                        <div className="settings-actions">
                            <button
                                className="settings-save-button"
                                type="submit"
                                disabled={isSaving}
                            >
                                {isSaving
                                    ? "Saving..."
                                    : "Save Changes"}
                            </button>
                        </div>
                    </form>
                </section>
                <section className="settings-card">
                    <div className="settings-card-header">
                        <h2>Change Password</h2>
                        <p>
                            Enter your current password before choosing a new one.
                        </p>
                    </div>

                    <form
                        className="settings-form"
                        onSubmit={handlePasswordSubmit}
                    >
                        <div className="settings-field">
                            <label htmlFor="currentPassword">
                                Current Password
                            </label>

                            <input
                                id="currentPassword"
                                type="password"
                                value={currentPassword}
                                onChange={(event) =>
                                    setCurrentPassword(event.target.value)
                                }
                                autoComplete="current-password"
                            />
                        </div>

                        <div className="settings-field">
                            <label htmlFor="newPassword">
                                New Password
                            </label>

                            <input
                                id="newPassword"
                                type="password"
                                value={newPassword}
                                onChange={(event) =>
                                    setNewPassword(event.target.value)
                                }
                                autoComplete="new-password"
                            />
                        </div>

                        {passwordError && (
                            <p className="settings-message error">
                                {passwordError}
                            </p>
                        )}

                        {passwordSuccess && (
                            <p className="settings-message success">
                                {passwordSuccess}
                            </p>
                        )}

                        <div className="settings-actions">
                            <button
                                className="settings-save-button"
                                type="submit"
                                disabled={isChangingPassword}
                            >
                                {isChangingPassword
                                    ? "Changing..."
                                    : "Change Password"}
                            </button>
                        </div>
                    </form>
                </section>
                <section className="settings-card danger-card">
                    <div className="settings-card-header">
                        <h2>Delete Account</h2>
                        <p>
                            Permanently delete your account and all associated data.
                        </p>
                    </div>

                    <form
                        className="settings-form"
                        onSubmit={handleDeleteAccount}
                    >
                        <div className="settings-field">
                            <label htmlFor="deletePassword">
                                Current Password
                            </label>

                            <input
                                id="deletePassword"
                                type="password"
                                value={deletePassword}
                                onChange={(event) =>
                                    setDeletePassword(event.target.value)
                                }
                                autoComplete="current-password"
                            />
                        </div>

                        {deleteError && (
                            <p className="settings-message error">
                                {deleteError}
                            </p>
                        )}

                        <div className="settings-actions">
                            <button
                                className="delete-account-button"
                                type="submit"
                                disabled={isDeleting}
                            >
                                {isDeleting
                                    ? "Deleting..."
                                    : "Delete Account"}
                            </button>
                        </div>
                    </form>
                </section>
            </div>
        </AppLayout>
    );
}

export default SettingsPage;