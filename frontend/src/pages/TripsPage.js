import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { deleteTrip, getTrips } from "../services/tripsService";
import { getFriendsForUser } from "../services/friendsService";
import {
  acceptTripShare,
  declineTripShare,
  getPendingTripShares,
  shareTrip
} from "../services/tripSharesService";

function getParticipantRole(participant) {
  return (
    participant?.TripParticipant?.participantRole ||
    participant?.tripParticipant?.participantRole ||
    participant?.participantRole ||
    "member"
  );
}

function userOwnsTrip(trip, userId) {
  if (Number(trip.createdBy) === Number(userId)) {
    return true;
  }

  const currentUserParticipant = trip.participants?.find(
    (participant) => Number(participant.userId) === Number(userId)
  );

  return getParticipantRole(currentUserParticipant) === "owner";
}

function formatTripDate(dateValue) {
  if (!dateValue) {
    return "";
  }

  return String(dateValue).split("T")[0];
}

function TripsPage({ userId }) {
  const [trips, setTrips] = useState([]);
  const [friends, setFriends] = useState([]);
  const [pendingShares, setPendingShares] = useState([]);
  const [selectedReceivers, setSelectedReceivers] = useState({});

  const [loading, setLoading] = useState(true);
  const [pageError, setPageError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  async function loadTripsPageData() {
    try {
      setLoading(true);
      setPageError("");

      const [tripsFromServer, friendsFromServer, pendingSharesFromServer] =
        await Promise.all([
          getTrips(userId),
          getFriendsForUser(userId),
          getPendingTripShares(userId)
        ]);

      setTrips(tripsFromServer);

      setFriends(
        friendsFromServer.filter((friendship) => friendship.status === "accepted")
      );

      setPendingShares(pendingSharesFromServer);
    } catch (error) {
      setPageError(error.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadTripsPageData();
  }, [userId]);

  const handleDelete = async (trip) => {
    const confirmed = window.confirm(
      `Delete "${trip.tripName}"? This cannot be undone.`
    );

    if (!confirmed) {
      return;
    }

    try {
      setPageError("");
      setSuccessMessage("");

      await deleteTrip(userId, trip.tripId);

      setTrips((previousTrips) =>
        previousTrips.filter((currentTrip) => currentTrip.tripId !== trip.tripId)
      );

      setSuccessMessage("Trip deleted successfully.");
    } catch (error) {
      setPageError(error.message);
    }
  };

  const handleReceiverChange = (tripId, receiverId) => {
    setSelectedReceivers((previousReceivers) => ({
      ...previousReceivers,
      [tripId]: receiverId
    }));
  };

  const handleShareTrip = async (trip) => {
    const receiverId = Number(selectedReceivers[trip.tripId]);

    if (!receiverId) {
      setPageError("Please choose a friend to share this trip with.");
      setSuccessMessage("");
      return;
    }

    try {
      setPageError("");
      setSuccessMessage("");

      await shareTrip(
        userId,
        trip.tripId,
        receiverId,
        `I shared "${trip.tripName}" with you.`
      );

      setSelectedReceivers((previousReceivers) => ({
        ...previousReceivers,
        [trip.tripId]: ""
      }));

      setSuccessMessage("Trip share sent successfully.");
    } catch (error) {
      setPageError(error.message);
    }
  };

  const handleAcceptShare = async (tripShareId) => {
    try {
      setPageError("");
      setSuccessMessage("");

      await acceptTripShare(userId, tripShareId);
      await loadTripsPageData();

      setSuccessMessage("Trip share accepted. The trip was added to your trips.");
    } catch (error) {
      setPageError(error.message);
    }
  };

  const handleDeclineShare = async (tripShareId) => {
    try {
      setPageError("");
      setSuccessMessage("");

      await declineTripShare(userId, tripShareId);

      setPendingShares((previousShares) =>
        previousShares.filter((share) => share.tripShareId !== tripShareId)
      );

      setSuccessMessage("Trip share declined.");
    } catch (error) {
      setPageError(error.message);
    }
  };

  if (loading) {
    return <p className="loading-message">Loading trips...</p>;
  }

  return (
    <section className="page">
      <div className="page-header page-header-row">
        <div>
          <h1>My Trips</h1>
          <p className="page-subtitle">
            View, edit, delete, and share your saved trips.
          </p>
        </div>

        <Link className="primary-link-button" to="/trips/new">
          Create Trip
        </Link>
      </div>

      {pageError && <p className="error-message">{pageError}</p>}
      {successMessage && <p className="success-message">{successMessage}</p>}

      {pendingShares.length > 0 && (
        <section className="trip-shares-panel">
          <div className="section-header no-margin-top">
            <div>
              <h2>Shared with you</h2>
              <p>Accept a shared trip to become a participant.</p>
            </div>
          </div>

          <div className="trip-shares-grid">
            {pendingShares.map((share) => (
              <article className="trip-share-card" key={share.tripShareId}>
                <div>
                  <h3>{share.trip?.tripName}</h3>
                  <p>
                    {share.sender?.username} shared a trip to{" "}
                    <strong>{share.trip?.destination}</strong>.
                  </p>

                  {share.note && <p className="trip-share-note">{share.note}</p>}
                </div>

                <div className="trip-share-actions">
                  <button
                    type="button"
                    onClick={() => handleAcceptShare(share.tripShareId)}
                  >
                    Accept
                  </button>

                  <button
                    type="button"
                    className="danger-button"
                    onClick={() => handleDeclineShare(share.tripShareId)}
                  >
                    Decline
                  </button>
                </div>
              </article>
            ))}
          </div>
        </section>
      )}

      {trips.length === 0 ? (
        <div className="empty-panel">
          <h2>No trips yet</h2>
          <p>Create your first trip and it will appear here.</p>
          <Link className="primary-link-button" to="/trips/new">
            Create Trip
          </Link>
        </div>
      ) : (
        <section className="table-section">
          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Trip Name</th>
                  <th>Destination</th>
                  <th>Dates</th>
                  <th>Budget</th>
                  <th>Status</th>
                  <th>Participants</th>
                  <th>Share</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {trips.map((trip) => {
                  const isOwner = userOwnsTrip(trip, userId);

                  return (
                    <tr key={trip.tripId}>
                      <td>{trip.tripName}</td>

                      <td>{trip.destination}</td>

                      <td>
                        {formatTripDate(trip.startDate)} →{" "}
                        {formatTripDate(trip.endDate)}
                      </td>

                      <td>${trip.budget}</td>

                      <td>
                        <span className={`status-pill ${trip.status}`}>
                          {trip.status}
                        </span>
                      </td>

                      <td>{trip.participants?.length || 0}</td>

                      <td>
                        {isOwner ? (
                          <div className="share-trip-control">
                            <select
                              value={selectedReceivers[trip.tripId] || ""}
                              onChange={(event) =>
                                handleReceiverChange(
                                  trip.tripId,
                                  event.target.value
                                )
                              }
                            >
                              <option value="">Choose friend</option>

                              {friends.map((friendship) => (
                                <option
                                  key={friendship.otherUser.userId}
                                  value={friendship.otherUser.userId}
                                >
                                  {friendship.otherUser.username}
                                </option>
                              ))}
                            </select>

                            <button
                              type="button"
                              onClick={() => handleShareTrip(trip)}
                            >
                              Share
                            </button>
                          </div>
                        ) : (
                          <span className="owner-only-note">Owner only</span>
                        )}
                      </td>

                      <td>
                        <div className="table-actions">
                          <Link to={`/trips/${trip.tripId}/edit`}>
                            {isOwner ? "Edit" : "View"}
                          </Link>

                          {isOwner && (
                            <button
                              type="button"
                              onClick={() => handleDelete(trip)}
                            >
                              Delete
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {friends.length === 0 && (
              <p className="table-note">
                You need accepted friends before you can share trips.
              </p>
            )}
          </div>
        </section>
      )}
    </section>
  );
}

export default TripsPage;