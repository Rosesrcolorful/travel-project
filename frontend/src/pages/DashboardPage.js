import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { getTrips } from "../services/tripsService";
import { getFriendsForUser } from "../services/friendsService";

import TripCard from "../components/TripCard";
import TripsTable from "../components/TripsTable";
import FriendCard from "../components/FriendCard";

function DashboardPage({ userId }) {
  const [trips, setTrips] = useState([]);
  const [friends, setFriends] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadDashboardData() {
      try {
        const [tripsFromServer, friendsFromServer] = await Promise.all([
          getTrips(userId),
          getFriendsForUser(userId)
        ]);

        setTrips(tripsFromServer);
        setFriends(friendsFromServer);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    }

    loadDashboardData();
  }, [userId]);

  if (loading) {
    return <p className="loading-message">Loading dashboard...</p>;
  }

  if (error) {
    return <p className="error-message">{error}</p>;
  }

  const plannedTrips = trips.filter((trip) => trip.status === "planned").length;
  const completedTrips = trips.filter((trip) => trip.status === "completed").length;
  const acceptedFriends = friends.filter((friend) => friend.status === "accepted").length;

  return (
    <section className="page">
      <section className="dashboard-hero">
        <div>
          <p className="eyebrow">Smart travel planning</p>
          <h1>Plan trips, save ideas, and travel together.</h1>
          <p>
            Your dashboard brings together saved trips, travel friends, and future
            AI recommendations in one place.
          </p>

          <div className="hero-actions">
            <Link className="hero-button" to="/plan-trip">
              Plan New Trip
            </Link>

            <Link className="hero-button secondary" to="/trips/new">
              Create Manually
            </Link>

            <Link className="hero-button secondary" to="/trips">
              View My Trips
            </Link>
          </div>
        </div>

        <div className="hero-card">
          <span>AI feature</span>
          <strong>Trip recommendations</strong>
          <p>
            Describe your ideal trip and let the AI suggest a plan you can edit,
            save, and share.
          </p>
        </div>
      </section>

      <section className="stats-grid">
        <div className="stat-card">
          <span>Total Trips</span>
          <strong>{trips.length}</strong>
        </div>

        <div className="stat-card">
          <span>Planned Trips</span>
          <strong>{plannedTrips}</strong>
        </div>

        <div className="stat-card">
          <span>Completed Trips</span>
          <strong>{completedTrips}</strong>
        </div>

        <div className="stat-card">
          <span>Accepted Friends</span>
          <strong>{acceptedFriends}</strong>
        </div>
      </section>

      {trips.length === 0 ? (
        <p className="empty-message">
          No trips found yet. Start planning your next adventure.
        </p>
      ) : (
        <>
          <section className="section-header">
            <div>
              <h2>Featured Trips</h2>
              <p>Your latest saved trips from the database.</p>
            </div>

            <Link className="small-link-button" to="/trips">
              Manage all
            </Link>
          </section>

          <section className="cards-grid">
            {trips.slice(0, 3).map((trip) => (
              <TripCard key={trip.tripId} trip={trip} />
            ))}
          </section>

          <section className="friends-section">
            <div className="section-header">
              <div>
                <h2>Travel Friends</h2>
                <p>Friends and pending collaborations from the backend.</p>
              </div>
            </div>

            {friends.length === 0 ? (
              <p className="empty-message">No friends found for this user.</p>
            ) : (
              <div className="friends-grid">
                {friends.map((friend) => (
                  <FriendCard key={friend.friendshipId} friend={friend} />
                ))}
              </div>
            )}
          </section>

          <section className="table-section">
            <div className="section-header no-margin-top">
              <div>
                <h2>All Trips</h2>
                <p>Quick overview of your current trip records.</p>
              </div>
            </div>

            <TripsTable trips={trips} />
          </section>
        </>
      )}
    </section>
  );
}

export default DashboardPage;