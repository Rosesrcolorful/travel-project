import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  getSettings,
  updateSettings,
  changePassword,
  deleteAccount
} from "../services/settingsService";

function SettingsPage({ userId, onAccountDeleted }) {
  const navigate = useNavigate();

  const [settings, setSettings] = useState({
    username: "",
    email: "",
    theme: "light"
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });

  const [deletePassword, setDeletePassword] = useState("");

  const [profileErrors, setProfileErrors] = useState({});
  const [passwordErrors, setPasswordErrors] = useState({});
  const [deleteError, setDeleteError] = useState("");

  const [pageError, setPageError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const [loading, setLoading] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    async function loadSettings() {
      try {
        const settingsFromServer = await getSettings(userId);

        setSettings({
          username: settingsFromServer.username || "",
          email: settingsFromServer.email || "",
          theme: settingsFromServer.theme || "light"
        });

        document.body.className = "";
        document.body.classList.add(`theme-${settingsFromServer.theme || "light"}`);
        localStorage.setItem("theme", settingsFromServer.theme || "light");
      } catch (error) {
        setPageError(error.message);
      } finally {
        setLoading(false);
      }
    }

    loadSettings();
  }, [userId]);

  const validateProfileForm = () => {
    const newErrors = {};

    if (!settings.username.trim()) {
      newErrors.username = "Username is required";
    }

    if (!settings.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(settings.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!settings.theme) {
      newErrors.theme = "Theme preference is required";
    }

    setProfileErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validatePasswordForm = () => {
    const newErrors = {};

    if (!passwordForm.currentPassword) {
      newErrors.currentPassword = "Current password is required";
    }

    if (!passwordForm.newPassword) {
      newErrors.newPassword = "New password is required";
    } else if (passwordForm.newPassword.length < 6) {
      newErrors.newPassword = "New password must be at least 6 characters";
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setPasswordErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSettingsChange = (event) => {
    const { name, value } = event.target;

    setSettings((previousSettings) => ({
      ...previousSettings,
      [name]: value
    }));
  };

  const handlePasswordChange = (event) => {
    const { name, value } = event.target;

    setPasswordForm((previousForm) => ({
      ...previousForm,
      [name]: value
    }));
  };

  const handleProfileSubmit = async (event) => {
    event.preventDefault();

    setPageError("");
    setSuccessMessage("");

    if (!validateProfileForm()) {
      return;
    }

    try {
      setSavingProfile(true);

      const updatedSettings = await updateSettings(userId, {
        username: settings.username,
        email: settings.email,
        theme: settings.theme
      });

      setSettings({
        username: updatedSettings.username || "",
        email: updatedSettings.email || "",
        theme: updatedSettings.theme || "light"
      });

      document.body.className = "";
      document.body.classList.add(`theme-${updatedSettings.theme || "light"}`);
      localStorage.setItem("theme", updatedSettings.theme || "light");

      setSuccessMessage("Profile settings updated successfully.");
    } catch (error) {
      setPageError(error.message);
    } finally {
      setSavingProfile(false);
    }
  };

  const handlePasswordSubmit = async (event) => {
    event.preventDefault();

    setPageError("");
    setSuccessMessage("");

    if (!validatePasswordForm()) {
      return;
    }

    try {
      setSavingPassword(true);

      await changePassword(userId, {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword
      });

      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
      });

      setSuccessMessage("Password changed successfully.");
    } catch (error) {
      setPageError(error.message);
    } finally {
      setSavingPassword(false);
    }
  };

  const handleDeleteAccount = async (event) => {
    event.preventDefault();

    setDeleteError("");
    setPageError("");
    setSuccessMessage("");

    if (!deletePassword) {
      setDeleteError("Password is required before deleting account.");
      return;
    }

    const confirmed = window.confirm(
      "Are you sure you want to delete your account? This cannot be undone."
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeleting(true);

      await deleteAccount(userId, deletePassword);

      onAccountDeleted();
      navigate("/signup");
    } catch (error) {
      setPageError(error.message);
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return <p className="loading-message">Loading settings...</p>;
  }

  return (
    <section className="settings-page">
      <div className="settings-page-header">
        <div>
          <p className="eyebrow">Account settings</p>
          <h1>Settings</h1>
          <p>
            Manage your profile, theme, password, and account preferences.
          </p>
        </div>
      </div>

      {pageError && <p className="error-message settings-message">{pageError}</p>}
      {successMessage && (
        <p className="success-message settings-message">{successMessage}</p>
      )}

      <div className="settings-layout">
        <aside className="settings-info-card">
          <h2>Your account</h2>
          <p>
            These settings are saved in the database, so they stay after refreshing
            or restarting the server.
          </p>

          <div className="settings-mini-list">
            <div>
              <strong>Profile</strong>
              <span>Username and email</span>
            </div>

            <div>
              <strong>Appearance</strong>
              <span>Light, dark, or travel theme</span>
            </div>

            <div>
              <strong>Security</strong>
              <span>Password and account deletion</span>
            </div>
          </div>
        </aside>

        <div className="settings-form">
          <form className="settings-card" onSubmit={handleProfileSubmit}>
            <div className="settings-card-header">
              <div>
                <h2>Profile</h2>
                <p>Update your public account details.</p>
              </div>
            </div>

            <div className="settings-form-grid">
              <div className="settings-field">
                <label>Username</label>
                <input
                  type="text"
                  name="username"
                  value={settings.username}
                  placeholder="Enter username"
                  onChange={handleSettingsChange}
                />
                {profileErrors.username && (
                  <p className="field-error">{profileErrors.username}</p>
                )}
              </div>

              <div className="settings-field">
                <label>Email</label>
                <input
                  type="email"
                  name="email"
                  value={settings.email}
                  placeholder="Enter email"
                  onChange={handleSettingsChange}
                />
                {profileErrors.email && (
                  <p className="field-error">{profileErrors.email}</p>
                )}
              </div>
            </div>

            <div className="settings-field">
              <label>Theme Preference</label>
              <select
                name="theme"
                value={settings.theme}
                onChange={handleSettingsChange}
              >
                <option value="light">Light</option>
                <option value="dark">Dark</option>
                <option value="travel">Travel</option>
              </select>
              {profileErrors.theme && (
                <p className="field-error">{profileErrors.theme}</p>
              )}
            </div>

            <div className="settings-actions">
              <button className="settings-primary-button" type="submit" disabled={savingProfile}>
                {savingProfile ? "Saving..." : "Save Profile"}
              </button>
            </div>
          </form>

          <form className="settings-card" onSubmit={handlePasswordSubmit}>
            <div className="settings-card-header">
              <div>
                <h2>Change Password</h2>
                <p>Confirm your current password before setting a new one.</p>
              </div>
            </div>

            <div className="settings-field">
              <label>Current Password</label>
              <input
                type="password"
                name="currentPassword"
                value={passwordForm.currentPassword}
                placeholder="Enter current password"
                onChange={handlePasswordChange}
              />
              {passwordErrors.currentPassword && (
                <p className="field-error">{passwordErrors.currentPassword}</p>
              )}
            </div>

            <div className="settings-form-grid">
              <div className="settings-field">
                <label>New Password</label>
                <input
                  type="password"
                  name="newPassword"
                  value={passwordForm.newPassword}
                  placeholder="Enter new password"
                  onChange={handlePasswordChange}
                />
                {passwordErrors.newPassword && (
                  <p className="field-error">{passwordErrors.newPassword}</p>
                )}
              </div>

              <div className="settings-field">
                <label>Confirm New Password</label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={passwordForm.confirmPassword}
                  placeholder="Confirm new password"
                  onChange={handlePasswordChange}
                />
                {passwordErrors.confirmPassword && (
                  <p className="field-error">{passwordErrors.confirmPassword}</p>
                )}
              </div>
            </div>

            <div className="settings-actions">
              <button className="settings-primary-button" type="submit" disabled={savingPassword}>
                {savingPassword ? "Changing..." : "Change Password"}
              </button>
            </div>
          </form>

          <form className="settings-card danger-card" onSubmit={handleDeleteAccount}>
            <div className="settings-card-header">
              <div>
                <h2>Delete Account</h2>
                <p>
                  This removes your user account, friendships, and trip participation
                  records.
                </p>
              </div>
            </div>

            <div className="settings-field">
              <label>Confirm Password</label>
              <input
                type="password"
                value={deletePassword}
                placeholder="Enter password to delete account"
                onChange={(event) => setDeletePassword(event.target.value)}
              />
              {deleteError && <p className="field-error">{deleteError}</p>}
            </div>

            <div className="settings-actions">
              <button className="settings-danger-button" type="submit" disabled={deleting}>
                {deleting ? "Deleting..." : "Delete My Account"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}

export default SettingsPage;