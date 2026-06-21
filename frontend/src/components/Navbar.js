import { useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { getCurrentUser, logout } from "../services/authService";

function Navbar({ userId, onLogout }) {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadUser() {
      try {
        const currentUser = await getCurrentUser(userId);
        setUser(currentUser);
      } catch (error) {
        setError(error.message);
      }
    }

    loadUser();
  }, [userId]);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error(error.message);
    } finally {
      onLogout();
      navigate("/login");
    }
  };

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <span className="logo">TravelMate</span>
        <span className="tagline">Smart Trip Planner</span>
      </div>

      <div className="nav-links">
        <NavLink to="/dashboard">Dashboard</NavLink>
        <NavLink to="/plan-trip">Plan Trip</NavLink>
        <NavLink to="/trips">My Trips</NavLink>
        <NavLink to="/friends">Friends</NavLink>
        <NavLink to="/settings">Settings</NavLink>
      </div>

      <div className="nav-user">
        {error && <span className="nav-error">{error}</span>}

        {user && (
          <span>
            Hello, {user.firstName || user.username}
          </span>
        )}

        <button type="button" onClick={handleLogout}>
          Logout
        </button>
      </div>
    </nav>
  );
}

export default Navbar;