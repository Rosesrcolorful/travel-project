import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login } from "../services/authService";

function LoginPage({ onLogin }) {
  const navigate = useNavigate();

  const [email, setEmail] = useState("tamar@email.com");
  const [password, setPassword] = useState("123456");

  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false);

  const validateForm = () => {
    const newErrors = {};

    if (!email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!password) {
      newErrors.password = "Password is required";
    } else if (password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setServerError("");

    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);

      const loggedInUser = await login(email, password);

      onLogin(loggedInUser);
      navigate("/dashboard");
    } catch (error) {
      setServerError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <section className="login-card">
        <h1>TravelMate</h1>
        <p className="page-subtitle">
          Plan smarter trips, save your ideas, and explore hidden gems.
        </p>

        <form onSubmit={handleSubmit} className="form">
          <label>
            Email
            <input
              type="email"
              value={email}
              placeholder="Enter your email"
              onChange={(event) => setEmail(event.target.value)}
            />
          </label>
          {errors.email && <p className="field-error">{errors.email}</p>}

          <label>
            Password
            <input
              type="password"
              value={password}
              placeholder="Enter your password"
              onChange={(event) => setPassword(event.target.value)}
            />
          </label>
          {errors.password && <p className="field-error">{errors.password}</p>}

          {serverError && <p className="error-message">{serverError}</p>}

          <button type="submit" disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <p className="demo-note">
          Demo user: tamar@email.com / 123456
        </p>
      </section>
    </div>
  );
}

export default LoginPage;