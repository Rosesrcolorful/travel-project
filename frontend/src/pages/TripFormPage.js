import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  createTrip,
  getTripById,
  updateTrip
} from "../services/tripsService";

const emptyForm = {
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

function getParticipantRole(participant) {
  return (
    participant?.TripParticipant?.participantRole ||
    participant?.tripParticipant?.participantRole ||
    participant?.participantRole ||
    "member"
  );
}

function TripFormPage({ userId }) {
  const navigate = useNavigate();
  const { tripId } = useParams();

  const isEditMode = Boolean(tripId);

  const [formData, setFormData] = useState(emptyForm);
  const [tripDetails, setTripDetails] = useState(null);

  const [errors, setErrors] = useState({});
  const [pageError, setPageError] = useState("");
  const [loading, setLoading] = useState(isEditMode);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function loadTrip() {
      if (!isEditMode) {
        return;
      }

      try {
        setLoading(true);

        const trip = await getTripById(userId, tripId);

        setTripDetails(trip);

        setFormData({
          tripName: trip.tripName || "",
          destination: trip.destination || "",
          startDate: formatDateForInput(trip.startDate),
          endDate: formatDateForInput(trip.endDate),
          budget: trip.budget || "",
          status: trip.status || "planned",
          description: trip.description || ""
        });
      } catch (error) {
        setPageError(error.message);
      } finally {
        setLoading(false);
      }
    }

    loadTrip();
  }, [isEditMode, tripId, userId]);

  const participants = tripDetails?.participants || [];

  const ownerParticipant = participants.find(
    (participant) => getParticipantRole(participant) === "owner"
  );

  const owner =
    tripDetails?.creator ||
    ownerParticipant ||
    null;

  const currentUserParticipant = participants.find(
    (participant) => Number(participant.userId) === Number(userId)
  );

  const currentUserRole = currentUserParticipant
    ? getParticipantRole(currentUserParticipant)
    : null;

  const isOwner =
    !isEditMode ||
    Number(tripDetails?.createdBy) === Number(userId) ||
    currentUserRole === "owner";

  const canEdit = !isEditMode || isOwner;

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previousData) => ({
      ...previousData,
      [name]: value
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.tripName.trim()) {
      newErrors.tripName = "Trip name is required";
    }

    if (!formData.destination.trim()) {
      newErrors.destination = "Destination is required";
    }

    if (!formData.startDate) {
      newErrors.startDate = "Start date is required";
    }

    if (!formData.endDate) {
      newErrors.endDate = "End date is required";
    }

    if (
      formData.startDate &&
      formData.endDate &&
      new Date(formData.startDate) > new Date(formData.endDate)
    ) {
      newErrors.endDate = "End date cannot be before start date";
    }

    if (formData.budget === "") {
      newErrors.budget = "Budget is required";
    } else if (Number.isNaN(Number(formData.budget)) || Number(formData.budget) < 0) {
      newErrors.budget = "Budget must be zero or more";
    }

    if (!formData.status) {
      newErrors.status = "Status is required";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setPageError("");

    if (!canEdit) {
      setPageError("Only the trip owner can edit this trip.");
      return;
    }

    if (!validateForm()) {
      return;
    }

    const payload = {
      tripName: formData.tripName.trim(),
      destination: formData.destination.trim(),
      startDate: formData.startDate,
      endDate: formData.endDate,
      budget: Number(formData.budget),
      status: formData.status,
      description: formData.description.trim()
    };

    try {
      setSaving(true);

      if (isEditMode) {
        await updateTrip(userId, tripId, payload);
      } else {
        await createTrip(userId, payload);
      }

      navigate("/trips");
    } catch (error) {
      setPageError(error.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <p className="loading-message">Loading trip...</p>;
  }

  return (
    <section className="page trip-form-page">
      <div className="page-header">
        <h1>{isEditMode ? "Edit Trip" : "Create Trip"}</h1>
        <p className="page-subtitle">
          {isEditMode
            ? "View the trip owner, participants, and trip details."
            : "Create a trip manually. Or go to Plan Trip for AI help."}
        </p>
      </div>

      {isEditMode && tripDetails && (
        <section className="trip-meta-panel">
          <div className="trip-meta-card owner-card">
            <span>Trip owner</span>

            {owner ? (
              <>
                <strong>
                  {owner.firstName && owner.lastName
                    ? `${owner.firstName} ${owner.lastName}`
                    : owner.username}
                </strong>
                <p>@{owner.username}</p>
              </>
            ) : (
              <>
                <strong>Unknown owner</strong>
                <p>This trip has no active creator account.</p>
              </>
            )}
          </div>

          <div className="trip-meta-card participants-card">
            <span>Participants</span>

            {participants.length === 0 ? (
              <p>No participants listed.</p>
            ) : (
              <div className="participants-list">
                {participants.map((participant) => {
                  const role = getParticipantRole(participant);

                  return (
                    <div
                      className="participant-pill"
                      key={participant.userId}
                    >
                      <div>
                        <strong>
                          {participant.firstName && participant.lastName
                            ? `${participant.firstName} ${participant.lastName}`
                            : participant.username}
                        </strong>
                        <small>@{participant.username}</small>
                      </div>

                      <em>{role}</em>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </section>
      )}

      {isEditMode && !canEdit && (
        <div className="readonly-trip-warning">
          You are a participant in this trip, but only the owner can edit or delete it.
        </div>
      )}

      <div className="form-page-card">
        <form className="form" onSubmit={handleSubmit}>
          <label>
            Trip Name
            <input
              type="text"
              name="tripName"
              value={formData.tripName}
              placeholder="Japan Adventure"
              onChange={handleChange}
              disabled={!canEdit}
            />
          </label>
          {errors.tripName && <p className="field-error">{errors.tripName}</p>}

          <label>
            Destination
            <input
              type="text"
              name="destination"
              value={formData.destination}
              placeholder="Tokyo, Japan"
              onChange={handleChange}
              disabled={!canEdit}
            />
          </label>
          {errors.destination && <p className="field-error">{errors.destination}</p>}

          <div className="form-grid-two">
            <div>
              <label>
                Start Date
                <input
                  type="date"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleChange}
                  disabled={!canEdit}
                />
              </label>
              {errors.startDate && <p className="field-error">{errors.startDate}</p>}
            </div>

            <div>
              <label>
                End Date
                <input
                  type="date"
                  name="endDate"
                  value={formData.endDate}
                  onChange={handleChange}
                  disabled={!canEdit}
                />
              </label>
              {errors.endDate && <p className="field-error">{errors.endDate}</p>}
            </div>
          </div>

          <div className="form-grid-two">
            <div>
              <label>
                Budget
                <input
                  type="number"
                  name="budget"
                  value={formData.budget}
                  min="0"
                  placeholder="5000"
                  onChange={handleChange}
                  disabled={!canEdit}
                />
              </label>
              {errors.budget && <p className="field-error">{errors.budget}</p>}
            </div>

            <div>
              <label>
                Status
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  disabled={!canEdit}
                >
                  <option value="planned">Planned</option>
                  <option value="active">Active</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </label>
              {errors.status && <p className="field-error">{errors.status}</p>}
            </div>
          </div>

          <label>
            Description
            <textarea
              name="description"
              value={formData.description}
              placeholder="Write notes, itinerary ideas, or anything important about this trip."
              onChange={handleChange}
              rows="5"
              disabled={!canEdit}
            />
          </label>

          {pageError && <p className="error-message">{pageError}</p>}

          <div className="form-actions">
            <Link className="secondary-link-button" to="/trips">
              Cancel
            </Link>

            {canEdit && (
              <button type="submit" disabled={saving}>
                {saving
                  ? "Saving..."
                  : isEditMode
                    ? "Save Changes"
                    : "Create Trip"}
              </button>
            )}
          </div>
        </form>
      </div>
    </section>
  );
}

export default TripFormPage;