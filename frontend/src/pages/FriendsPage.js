import { useEffect, useState } from "react";

import ChatBox from "../components/ChatBox";

import {
  acceptFriendRequest,
  declineFriendRequest,
  getFriendsForUser,
  getPendingFriendRequests,
  searchUsersByUsername,
  sendFriendRequest,
  unfriend
} from "../services/friendsService";

function FriendsPage({ userId }) {
  const [friendships, setFriendships] = useState([]);
  const [receivedRequests, setReceivedRequests] = useState([]);
  const [sentRequests, setSentRequests] = useState([]);

  const [searchText, setSearchText] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [selectedFriendship, setSelectedFriendship] = useState(null);

  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [pageError, setPageError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  async function loadFriendsPageData() {
    try {
      setLoading(true);
      setPageError("");

      const [friendsFromServer, receivedRequestsFromServer] = await Promise.all([
        getFriendsForUser(userId),
        getPendingFriendRequests(userId)
      ]);

      const acceptedFriends = friendsFromServer.filter(
        (friendship) => friendship.status === "accepted"
      );

      const outgoingPendingRequests = friendsFromServer.filter(
        (friendship) =>
          friendship.status === "pending" &&
          Number(friendship.userId) === Number(userId)
      );

      setFriendships(acceptedFriends);
      setReceivedRequests(receivedRequestsFromServer);
      setSentRequests(outgoingPendingRequests);

      if (!selectedFriendship && acceptedFriends.length > 0) {
        setSelectedFriendship(acceptedFriends[0]);
      }
    } catch (error) {
      setPageError(error.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadFriendsPageData();
  }, [userId]);

  const handleSearch = async (event) => {
    event.preventDefault();

    if (!searchText.trim()) {
      setSearchResults([]);
      return;
    }

    try {
      setSearching(true);
      setPageError("");
      setSuccessMessage("");

      const users = await searchUsersByUsername(userId, searchText.trim());
      setSearchResults(users);
    } catch (error) {
      setPageError(error.message);
    } finally {
      setSearching(false);
    }
  };

  const handleSendRequest = async (friendId) => {
    try {
      setPageError("");
      setSuccessMessage("");

      const createdRequest = await sendFriendRequest(userId, friendId);

      setSearchResults((previousResults) =>
        previousResults.map((user) => {
          if (user.userId !== friendId) {
            return user;
          }

          return {
            ...user,
            friendship: {
              friendshipId: createdRequest.friendshipId,
              status: "pending",
              direction: "outgoing"
            }
          };
        })
      );

      await loadFriendsPageData();

      setSuccessMessage("Friend request sent.");
    } catch (error) {
      setPageError(error.message);
    }
  };

  const handleAcceptRequest = async (friendshipId) => {
    try {
      setPageError("");
      setSuccessMessage("");

      await acceptFriendRequest(userId, friendshipId);
      await loadFriendsPageData();

      setSuccessMessage("Friend request accepted.");
    } catch (error) {
      setPageError(error.message);
    }
  };

  const handleDeclineRequest = async (friendshipId) => {
    try {
      setPageError("");
      setSuccessMessage("");

      await declineFriendRequest(userId, friendshipId);

      setReceivedRequests((previousRequests) =>
        previousRequests.filter((request) => request.friendshipId !== friendshipId)
      );

      setSuccessMessage("Friend request declined.");
    } catch (error) {
      setPageError(error.message);
    }
  };

  const handleUnfriend = async (friendship) => {
    const confirmed = window.confirm(
      `Remove ${friendship.otherUser.username} from your friends?`
    );

    if (!confirmed) {
      return;
    }

    try {
      setPageError("");
      setSuccessMessage("");

      await unfriend(userId, friendship.friendshipId);

      setFriendships((previousFriendships) =>
        previousFriendships.filter(
          (currentFriendship) =>
            currentFriendship.friendshipId !== friendship.friendshipId
        )
      );

      if (selectedFriendship?.friendshipId === friendship.friendshipId) {
        setSelectedFriendship(null);
      }

      setSuccessMessage("Friend removed.");
    } catch (error) {
      setPageError(error.message);
    }
  };

  const renderSearchButton = (user) => {
    if (!user.friendship) {
      return (
        <button type="button" onClick={() => handleSendRequest(user.userId)}>
          Add
        </button>
      );
    }

    if (user.friendship.status === "pending" && user.friendship.direction === "outgoing") {
      return (
        <button type="button" disabled>
          Request pending
        </button>
      );
    }

    if (user.friendship.status === "pending" && user.friendship.direction === "incoming") {
      return (
        <button type="button" disabled>
          Respond in requests
        </button>
      );
    }

    if (user.friendship.status === "accepted") {
      return (
        <button type="button" disabled>
          Already friends
        </button>
      );
    }

    if (user.friendship.status === "declined") {
      return (
        <button type="button" onClick={() => handleSendRequest(user.userId)}>
          Send again
        </button>
      );
    }

    return null;
  };

  if (loading) {
    return <p className="loading-message">Loading friends...</p>;
  }

  return (
    <section className="friends-page">
      <div className="page-header">
        <h1>Friends</h1>
        <p className="page-subtitle">
          Add friends, manage requests, chat, and receive shared trips.
        </p>
      </div>

      {pageError && <p className="error-message">{pageError}</p>}
      {successMessage && <p className="success-message">{successMessage}</p>}

      <div className="friends-layout">
        <aside className="friends-sidebar">
          <section className="friends-panel">
            <h2>Find users</h2>

            <form className="friend-search-form" onSubmit={handleSearch}>
              <input
                type="text"
                value={searchText}
                placeholder="Search username"
                onChange={(event) => setSearchText(event.target.value)}
              />

              <button type="submit" disabled={searching}>
                {searching ? "Searching..." : "Search"}
              </button>
            </form>

            {searchResults.length > 0 && (
              <div className="friend-search-results">
                {searchResults.map((user) => (
                  <article key={user.userId} className="friend-search-result">
                    <div>
                      <strong>{user.username}</strong>
                      <span>{user.email}</span>
                    </div>

                    {renderSearchButton(user)}
                  </article>
                ))}
              </div>
            )}
          </section>

          <section className="friends-panel">
            <h2>Received requests</h2>

            {receivedRequests.length === 0 ? (
              <p className="empty-message">No pending received requests.</p>
            ) : (
              <div className="request-list">
                {receivedRequests.map((request) => (
                  <article key={request.friendshipId} className="request-card">
                    <div>
                      <strong>{request.requester?.username}</strong>
                      <span>wants to add you</span>
                    </div>

                    <div className="request-actions">
                      <button
                        type="button"
                        onClick={() => handleAcceptRequest(request.friendshipId)}
                      >
                        Accept
                      </button>

                      <button
                        type="button"
                        className="danger-button"
                        onClick={() => handleDeclineRequest(request.friendshipId)}
                      >
                        Decline
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>

          <section className="friends-panel">
            <h2>Sent requests</h2>

            {sentRequests.length === 0 ? (
              <p className="empty-message">No sent requests waiting for approval.</p>
            ) : (
              <div className="request-list">
                {sentRequests.map((request) => (
                  <article key={request.friendshipId} className="request-card">
                    <div>
                      <strong>{request.otherUser?.username}</strong>
                      <span>request pending</span>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>

          <section className="friends-panel">
            <h2>Friend list</h2>

            {friendships.length === 0 ? (
              <p className="empty-message">No accepted friends yet.</p>
            ) : (
              <div className="friend-list">
                {friendships.map((friendship) => (
                  <article
                    key={friendship.friendshipId}
                    className={`friend-list-item ${
                      selectedFriendship?.friendshipId === friendship.friendshipId
                        ? "active"
                        : ""
                    }`}
                  >
                    <button
                      type="button"
                      className="friend-select-button"
                      onClick={() => setSelectedFriendship(friendship)}
                    >
                      <strong>{friendship.otherUser.username}</strong>
                      <span>{friendship.otherUser.email}</span>
                    </button>

                    <button
                      type="button"
                      className="remove-friend-button"
                      onClick={() => handleUnfriend(friendship)}
                    >
                      Remove
                    </button>
                  </article>
                ))}
              </div>
            )}
          </section>
        </aside>

        <ChatBox userId={userId} friendship={selectedFriendship} />
      </div>
    </section>
  );
}

export default FriendsPage;