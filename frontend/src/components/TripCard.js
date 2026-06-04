function TripCard({ trip }) {
  return (
    <article className="trip-card">
      <h3>{trip.tripName}</h3>

      <p className="trip-destination">{trip.destination}</p>

      <div className="trip-card-details">
        <span>
          <strong>Dates:</strong> {trip.startDate} → {trip.endDate}
        </span>

        <span>
          <strong>Budget:</strong> ${trip.budget}
        </span>

        <span>
          <strong>Status:</strong> {trip.status}
        </span>
      </div>

      <p>{trip.description}</p>
    </article>
  );
}

export default TripCard;