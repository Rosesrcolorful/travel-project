import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useState } from "react";

import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";
import SettingsPage from "./pages/SettingsPage";

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

import "./App.css";

function App() {
  const savedUserId = localStorage.getItem("userId");
  const [userId, setUserId] = useState(savedUserId);

  const handleLogin = (loggedInUser) => {
    localStorage.setItem("userId", loggedInUser.userId);
    setUserId(loggedInUser.userId);
  };

  const handleLogout = () => {
    localStorage.removeItem("userId");
    setUserId(null);
  };

  return (
    <BrowserRouter>
      <div className="app">
        {userId && <Navbar userId={userId} onLogout={handleLogout} />}

        <main className="main-content">
          <Routes>
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
              path="/settings"
              element={
                userId ? (
                  <SettingsPage userId={userId} />
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
          </Routes>
        </main>

        {userId && <Footer />}
      </div>
    </BrowserRouter>
  );
}

export default App;