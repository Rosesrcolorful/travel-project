import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { generateTripPlan } from "../services/aiService";
import { createTrip } from "../services/tripsService";
import { getFriendsForUser } from "../services/friendsService";
import { shareTrip } from "../services/tripSharesService";

const emptyTrip = {
  tripName: "",
  destination: "",
  startDate: "",
  endDate: "",
  budget: "",
  status: "planned",
  description: ""
};

function formatDateForInput(dateValue) {
  if (!dateValue) {
    return "";
  }

  return String(dateValue).split("T")[0];
}

function PlanTripPage({ userId }) {
  const navigate = useNavigate();

  const [prompt, setPrompt] = useState("");
  const [suggestedTrip, setSuggestedTrip] = useState(null);
  const [editableTrip, setEditableTrip] = useState(emptyTrip);

  const [friends, setFriends] = useState([]);
  const [selectedFriendId, setSelectedFriendId] = useState("");

  const [loadingFriends, setLoadingFriends] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [saving, setSaving] = useState(false);

  const [pageError, setPageError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    async function loadFriends() {
      try {
        const friendships = await getFriendsForUser(userId);

        setFriends(
          friendships.filter((friendship) => friendship.status === "accepted")
        );
      } catch (error) {
        setPageError(error.message);
      } finally {
        setLoadingFriends(false);
      }
    }

    loadFriends();
  }, [userId]);

  const handleGenerate = async (event) => {
    event.preventDefault();

    setPageError("");
    setSuccessMessage("");

    if (prompt.trim().length < 10) {
      setPageError("Please write a more detailed trip prompt.");
      return;
    }

    try {
      setGenerating(true);

      const tripPlan = await generateTripPlan(prompt.trim());

      setSuggestedTrip(tripPlan);

      setEditableTrip({
        tripName: tripPlan.tripName || "",
        destination: tripPlan.destination || "",
        startDate: formatDateForInput(tripPlan.startDate),
        endDate: formatDateForInput(tripPlan.endDate),
        budget: tripPlan.budget || "",
        status: tripPlan.status || "planned",
        description: tripPlan.description || ""
      });

      setSuccessMessage("AI trip suggestion generated. You can edit it before saving.");
    } catch (error) {
      setPageError(error.message);
    } finally {
      setGenerating(false);
    }
  };

  const handleTripChange = (event) => {
    const { name, value } = event.target;

    setEditableTrip((previousTrip) => ({
      ...previousTrip,
      [name]: value
    }));
  };

  const validateTripBeforeSave = () => {
    if (!editableTrip.tripName.trim()) {
      return "Trip name is required.";
    }

    if (!editableTrip.destination.trim()) {
      return "Destination is required.";
    }

    if (!editableTrip.startDate) {
      return "Start date is required.";
    }

    if (!editableTrip.endDate) {
      return "End date is required.";
    }

    if (new Date(editableTrip.startDate) > new Date(editableTrip.endDate)) {
      return "End date cannot be before start date.";
    }

    if (editableTrip.budget === "" || Number.isNaN(Number(editableTrip.budget))) {
      return "Budget must be a valid number.";
    }

    if (Number(editableTrip.budget) < 0) {
      return "Budget cannot be negative.";
    }

    return "";
  };

  const buildSavePayload = () => {
    let description = editableTrip.description.trim();

    if (suggestedTrip?.itinerary?.length > 0) {
      const itineraryText = suggestedTrip.itinerary
        .map((day) => {
          const activities = Array.isArray(day.activities)
            ? day.activities.join(", ")
            : "";

          return `Day ${day.day}: ${day.title}. ${activities}`;
        })
        .join("\n");

      description = `${description}\n\nAI Itinerary:\n${itineraryText}`;
    }

    if (suggestedTrip?.tips?.length > 0) {
      description = `${description}\n\nTips:\n${suggestedTrip.tips.join("\n")}`;
    }

    return {
      tripName: editableTrip.tripName.trim(),
      destination: editableTrip.destination.trim(),
      startDate: editableTrip.startDate,
      endDate: editableTrip.endDate,
      budget: Number(editableTrip.budget),
      status: editableTrip.status || "planned",
      description
    };
  };

  const handleSave = async () => {
    setPageError("");
    setSuccessMessage("");

    const validationError = validateTripBeforeSave();

    if (validationError) {
      setPageError(validationError);
      return;
    }

    try {
      setSaving(true);

      await createTrip(userId, buildSavePayload());

      setSuccessMessage("Trip saved successfully.");
      navigate("/trips");
    } catch (error) {
      setPageError(error.message);
    } finally {
      setSaving(false);
    }
  };

  const handleSaveAndShare = async () => {
    setPageError("");
    setSuccessMessage("");

    if (!selectedFriendId) {
      setPageError("Please choose a friend before using Save & Share.");
      return;
    }

    const validationError = validateTripBeforeSave();

    if (validationError) {
      setPageError(validationError);
      return;
    }

    try {
      setSaving(true);

      const createdTrip = await createTrip(userId, buildSavePayload());

      await shareTrip(
        userId,
        createdTrip.tripId,
        Number(selectedFriendId),
        `I shared my AI-planned trip "${createdTrip.tripName}" with you.`
      );

      setSuccessMessage("Trip saved and shared successfully.");
      navigate("/trips");
    } catch (error) {
      setPageError(error.message);
    } finally {
      setSaving(false);
    }
  };

  const handleClearSuggestion = () => {
    setSuggestedTrip(null);
    setEditableTrip(emptyTrip);
    setSelectedFriendId("");
    setSuccessMessage("");
    setPageError("");
  };

  return (
    <section className="plan-trip-page">
      <div className="plan-trip-header">
        <p className="eyebrow">AI trip planner</p>
        <h1>Plan a new trip</h1>
        <p>
          Describe the kind of trip you want, then edit the AI suggestion before
          saving it to your trips.
        </p>
      </div>

      {pageError && <p className="error-message">{pageError}</p>}
      {successMessage && <p className="success-message">{successMessage}</p>}

      <div className="plan-trip-layout">
        <section className="ai-prompt-card">
          <h2>What should we plan?</h2>

          <form onSubmit={handleGenerate}>
            <textarea
              value={prompt}
              rows="8"
              placeholder="Example: Plan me a 5 day trip to Rome in July with museums, good food, and a medium budget."
              onChange={(event) => setPrompt(event.target.value)}
            />

            <button type="submit" disabled={generating}>
              {generating ? "Generating..." : "Generate Trip"}
            </button>
          </form>

          <div className="prompt-examples">
            <strong>Prompt ideas</strong>
            <button
              type="button"
              onClick={() =>
                setPrompt(
                  "Plan a 4 day relaxing trip to Greece with beaches, good food, and a medium budget."
                )
              }
            >
              Greece beach trip
            </button>

            <button
              type="button"
              onClick={() =>
                setPrompt(
                  "Plan a 7 day Japan trip focused on Tokyo, culture, shopping, anime, and food."
                )
              }
            >
              Japan city trip
            </button>

            <button
              type="button"
              onClick={() =>
                setPrompt(
                  "Plan a 3 day Paris trip with museums, cafes, sightseeing, and a low to medium budget."
                )
              }
            >
              Paris weekend
            </button>
          </div>
        </section>

        <section className="ai-result-card">
          {!suggestedTrip ? (
            <div className="ai-empty-state">
              <h2>No suggestion yet</h2>
              <p>
                Generate a trip and the editable recommendation will appear here.
              </p>
            </div>
          ) : (
            <>
              <div className="ai-result-header">
                <div>
                  <h2>Edit AI suggestion</h2>
                  <p>Nothing is saved until you click Save.</p>
                </div>

                <button
                  type="button"
                  className="clear-ai-button"
                  onClick={handleClearSuggestion}
                >
                  Clear
                </button>
              </div>

              <div className="ai-trip-form">
                <label>
                  Trip Name
                  <input
                    type="text"
                    name="tripName"
                    value={editableTrip.tripName}
                    onChange={handleTripChange}
                  />
                </label>

                <label>
                  Destination
                  <input
                    type="text"
                    name="destination"
                    value={editableTrip.destination}
                    onChange={handleTripChange}
                  />
                </label>

                <div className="ai-form-grid">
                  <label>
                    Start Date
                    <input
                      type="date"
                      name="startDate"
                      value={editableTrip.startDate}
                      onChange={handleTripChange}
                    />
                  </label>

                  <label>
                    End Date
                    <input
                      type="date"
                      name="endDate"
                      value={editableTrip.endDate}
                      onChange={handleTripChange}
                    />
                  </label>
                </div>

                <div className="ai-form-grid">
                  <label>
                    Budget
                    <input
                      type="number"
                      name="budget"
                      min="0"
                      value={editableTrip.budget}
                      onChange={handleTripChange}
                    />
                  </label>

                  <label>
                    Status
                    <select
                      name="status"
                      value={editableTrip.status}
                      onChange={handleTripChange}
                    >
                      <option value="planned">Planned</option>
                      <option value="active">Active</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </label>
                </div>

                <label>
                  Description
                  <textarea
                    name="description"
                    rows="5"
                    value={editableTrip.description}
                    onChange={handleTripChange}
                  />
                </label>
              </div>

              {suggestedTrip.itinerary?.length > 0 && (
                <div className="ai-itinerary">
                  <h3>Suggested itinerary</h3>

                  {suggestedTrip.itinerary.map((day) => (
                    <article key={day.day}>
                      <strong>
                        Day {day.day}: {day.title}
                      </strong>

                      {Array.isArray(day.activities) && (
                        <ul>
                          {day.activities.map((activity, index) => (
                            <li key={`${day.day}-${index}`}>{activity}</li>
                          ))}
                        </ul>
                      )}
                    </article>
                  ))}
                </div>
              )}

              {suggestedTrip.tips?.length > 0 && (
                <div className="ai-tips">
                  <h3>Tips</h3>

                  <ul>
                    {suggestedTrip.tips.map((tip, index) => (
                      <li key={index}>{tip}</li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="ai-share-box">
                <label>
                  Share after saving
                  <select
                    value={selectedFriendId}
                    disabled={loadingFriends || friends.length === 0}
                    onChange={(event) => setSelectedFriendId(event.target.value)}
                  >
                    <option value="">Do not share now</option>

                    {friends.map((friendship) => (
                      <option
                        key={friendship.otherUser.userId}
                        value={friendship.otherUser.userId}
                      >
                        {friendship.otherUser.username}
                      </option>
                    ))}
                  </select>
                </label>

                {friends.length === 0 && (
                  <p>You need accepted friends before you can share a trip.</p>
                )}
              </div>

              <div className="ai-actions">
                <Link className="secondary-link-button" to="/dashboard">
                  Cancel
                </Link>

                <button type="button" onClick={handleSave} disabled={saving}>
                  {saving ? "Saving..." : "Save Trip"}
                </button>

                <button
                  type="button"
                  onClick={handleSaveAndShare}
                  disabled={saving || !selectedFriendId}
                >
                  {saving ? "Saving..." : "Save & Share"}
                </button>
              </div>
            </>
          )}
        </section>
      </div>
    </section>
  );
}

export default PlanTripPage;