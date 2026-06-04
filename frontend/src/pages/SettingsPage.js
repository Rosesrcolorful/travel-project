import { useEffect, useState } from "react";
import { getSettings, updateSettings } from "../services/settingsService";

function SettingsPage({ userId }) {
  const [settings, setSettings] = useState({
    username: "",
    email: "",
    theme: "light",
    newPassword: "",
    confirmPassword: ""
  });

  const [errors, setErrors] = useState({});
  const [pageError, setPageError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function loadSettings() {
      try {
        const settingsFromServer = await getSettings(userId);

        setSettings({
          username: settingsFromServer.username || "",
          email: settingsFromServer.email || "",
          theme: settingsFromServer.theme || "light",
          newPassword: "",
          confirmPassword: ""
        });
        document.body.className = "";
        document.body.classList.add(`theme-${settingsFromServer.theme || "light"}`);
      } catch (error) {
        setPageError(error.message);
      } finally {
        setLoading(false);
      }
    }

    loadSettings();
  }, [userId]);

  const validateForm = () => {
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

    if (settings.newPassword || settings.confirmPassword) {
      if (settings.newPassword.length < 6) {
        newErrors.newPassword = "New password must be at least 6 characters";
      }

      if (settings.newPassword !== settings.confirmPassword) {
        newErrors.confirmPassword = "Passwords do not match";
      }
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (event) => {
    const { name, value } = event.target;

    setSettings((previousSettings) => ({
      ...previousSettings,
      [name]: value
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setPageError("");
    setSuccessMessage("");

    if (!validateForm()) {
      return;
    }

    try {
      setSaving(true);

      const settingsToUpdate = {
        username: settings.username,
        email: settings.email,
        theme: settings.theme
      };

      if (settings.newPassword) {
        settingsToUpdate.newPassword = settings.newPassword;
      }

      const updatedSettings = await updateSettings(userId, settingsToUpdate);

      setSettings({
        username: updatedSettings.username || "",
        email: updatedSettings.email || "",
        theme: updatedSettings.theme || "light",
        newPassword: "",
        confirmPassword: ""
      });

      document.body.className = "";
      document.body.classList.add(`theme-${updatedSettings.theme || "light"}`);

      setSuccessMessage("Settings updated successfully.");
    } catch (error) {
      setPageError(error.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <p className="loading-message">Loading settings...</p>;
  }

  return (
    <section className="page">
      <div className="settings-layout">
        <aside className="settings-info-card">
          <p className="eyebrow dark">Account settings</p>
          <h1>Personalize your travel profile</h1>
          <p>
            Keep your account details updated and choose how you prefer to use
            the travel planner.
          </p>

          <div className="settings-mini-list">
            <div>
              <strong>Profile</strong>
              <span>Username and email information</span>
            </div>

            <div>
              <strong>Theme</strong>
              <span>Visual preference saved for your account</span>
            </div>

            <div>
              <strong>Mock backend</strong>
              <span>Settings are loaded and updated through the API</span>
            </div>
          </div>
        </aside>

        <form className="settings-form form" onSubmit={handleSubmit}>
          <label>
            Username
            <input
              type="text"
              name="username"
              value={settings.username}
              placeholder="Enter username"
              onChange={handleChange}
            />
          </label>
          {errors.username && <p className="field-error">{errors.username}</p>}

          <label>
            Email
            <input
              type="email"
              name="email"
              value={settings.email}
              placeholder="Enter email"
              onChange={handleChange}
            />
          </label>
          {errors.email && <p className="field-error">{errors.email}</p>}

          <label>
            Theme Preference
            <select
              name="theme"
              value={settings.theme}
              onChange={handleChange}
            >
              <option value="light">Light</option>
              <option value="dark">Dark</option>
              <option value="travel">Travel</option>
            </select>
          </label>
          <label>
            New Password
            <input
              type="password"
              name="newPassword"
              value={settings.newPassword}
              placeholder="Leave empty to keep current password"
              onChange={handleChange}
            />
          </label>
          {errors.newPassword && <p className="field-error">{errors.newPassword}</p>}

          <label>
            Confirm New Password
            <input
              type="password"
              name="confirmPassword"
              value={settings.confirmPassword}
              placeholder="Confirm new password"
              onChange={handleChange}
            />
          </label>
          {errors.confirmPassword && (
            <p className="field-error">{errors.confirmPassword}</p>
          )}
          {errors.theme && <p className="field-error">{errors.theme}</p>}

          {pageError && <p className="error-message">{pageError}</p>}
          {successMessage && <p className="success-message">{successMessage}</p>}

          <button type="submit" disabled={saving}>
            {saving ? "Saving..." : "Save Settings"}
          </button>
        </form>
      </div>
    </section>
  );
}

export default SettingsPage;