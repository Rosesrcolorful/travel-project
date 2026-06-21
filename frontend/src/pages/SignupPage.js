import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { signup } from "../services/authService";

function SignupPage({ onSignup }) {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    username: "",
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: ""
  });

  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previousData) => ({
      ...previousData,
      [name]: value
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.username.trim()) {
      newErrors.username = "Username is required";
    }

    if (!formData.firstName.trim()) {
      newErrors.firstName = "First name is required";
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = "Last name is required";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
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

      const createdUser = await signup({
        username: formData.username,
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        password: formData.password
      });

      onSignup(createdUser);
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
        <h1>Create account</h1>
        <p className="page-subtitle">
          Join TravelMate and start saving your own trips.
        </p>

        <form onSubmit={handleSubmit} className="form">
          <label>
            Username
            <input
              type="text"
              name="username"
              value={formData.username}
              placeholder="Choose a username"
              onChange={handleChange}
            />
          </label>
          {errors.username && <p className="field-error">{errors.username}</p>}

          <label>
            First Name
            <input
              type="text"
              name="firstName"
              value={formData.firstName}
              placeholder="Enter first name"
              onChange={handleChange}
            />
          </label>
          {errors.firstName && <p className="field-error">{errors.firstName}</p>}

          <label>
            Last Name
            <input
              type="text"
              name="lastName"
              value={formData.lastName}
              placeholder="Enter last name"
              onChange={handleChange}
            />
          </label>
          {errors.lastName && <p className="field-error">{errors.lastName}</p>}

          <label>
            Email
            <input
              type="email"
              name="email"
              value={formData.email}
              placeholder="Enter email"
              onChange={handleChange}
            />
          </label>
          {errors.email && <p className="field-error">{errors.email}</p>}

          <label>
            Password
            <input
              type="password"
              name="password"
              value={formData.password}
              placeholder="Create password"
              onChange={handleChange}
            />
          </label>
          {errors.password && <p className="field-error">{errors.password}</p>}

          <label>
            Confirm Password
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              placeholder="Confirm password"
              onChange={handleChange}
            />
          </label>
          {errors.confirmPassword && <p className="field-error">{errors.confirmPassword}</p>}

          {serverError && <p className="error-message">{serverError}</p>}

          <button type="submit" disabled={loading}>
            {loading ? "Creating account..." : "Sign Up"}
          </button>
        </form>

        <p className="demo-note">
          Already have an account? <Link to="/login">Login here</Link>
        </p>
      </section>
    </div>
  );
}

export default SignupPage;