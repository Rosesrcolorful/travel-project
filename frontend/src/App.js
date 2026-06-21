import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useState, useEffect } from "react";

import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import DashboardPage from "./pages/DashboardPage";
import TripsPage from "./pages/TripsPage";
import TripFormPage from "./pages/TripFormPage";
import SettingsPage from "./pages/SettingsPage";
import FriendsPage from "./pages/FriendsPage";
import PlanTripPage from "./pages/PlanTripPage";

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

import "./App.css";

function App() {
  const savedUserId = localStorage.getItem("userId");
  const [userId, setUserId] = useState(savedUserId);

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");

    if (savedTheme) {
      document.body.className = `theme-${savedTheme}`;
    } else {
      document.body.className = "theme-light";
    }
  }, []);

  const handleLogin = (loggedInUser) => {
    localStorage.setItem("userId", loggedInUser.userId);

    if (loggedInUser.theme) {
      localStorage.setItem("theme", loggedInUser.theme);
      document.body.className = `theme-${loggedInUser.theme}`;
    } else {
      document.body.className = "theme-light";
    }

    setUserId(loggedInUser.userId);
  };

  const handleLogout = () => {
    localStorage.removeItem("userId");
    localStorage.removeItem("theme");
    document.body.className = "theme-light";
    setUserId(null);
  };

  return (
    <BrowserRouter>
      <div className="app">
        {userId && <Navbar userId={userId} onLogout={handleLogout} />}

        <main className="main-content">
          <Routes>
            <Route
              path="/signup"
              element={
                userId ? (
                  <Navigate to="/dashboard" />
                ) : (
                  <SignupPage onSignup={handleLogin} />
                )
              }
            />

            <Route
              path="/login"
              element={
                userId ? (
                  <Navigate to="/dashboard" />
                ) : (
                  <LoginPage onLogin={handleLogin} />
                )
              }
            />

            <Route
              path="/dashboard"
              element={
                userId ? (
                  <DashboardPage userId={userId} />
                ) : (
                  <Navigate to="/login" />
                )
              }
            />

            <Route
              path="/trips"
              element={
                userId ? (
                  <TripsPage userId={userId} />
                ) : (
                  <Navigate to="/login" />
                )
              }
            />

            <Route
              path="/trips/new"
              element={
                userId ? (
                  <TripFormPage userId={userId} />
                ) : (
                  <Navigate to="/login" />
                )
              }
            />

            <Route
              path="/trips/:tripId/edit"
              element={
                userId ? (
                  <TripFormPage userId={userId} />
                ) : (
                  <Navigate to="/login" />
                )
              }
            />

            <Route
              path="/settings"
              element={
                userId ? (
                  <SettingsPage userId={userId} onAccountDeleted={handleLogout} />
                ) : (
                  <Navigate to="/login" />
                )
              }
            />

            <Route
              path="/friends"
              element={
                userId ? (
                  <FriendsPage userId={userId} />
                ) : (
                  <Navigate to="/login" />
                )
              }
            />

            <Route
              path="/"
              element={
                userId ? (
                  <Navigate to="/dashboard" />
                ) : (
                  <Navigate to="/login" />
                )
              }
            />

            <Route
              path="/plan-trip"
              element={
                userId ? (
                  <PlanTripPage userId={userId} />
                ) : (
                  <Navigate to="/login" />
                )
              }
            />
          </Routes>
        </main>

        {userId && <Footer />}
      </div>
    </BrowserRouter>
  );
}

export default App;