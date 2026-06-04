function TripsTable({ trips }) {
  if (!trips || trips.length === 0) {
    return <p className="empty-message">No trips to display.</p>;
  }

  return (
    <div className="table-wrapper">
      <table className="data-table">
        <thead>
          <tr>
            <th>Trip Name</th>
            <th>Destination</th>
            <th>Start Date</th>
            <th>End Date</th>
            <th>Budget</th>
            <th>Status</th>
          </tr>
        </thead>

        <tbody>
          {trips.map((trip) => (
            <tr key={trip.tripId}>
              <td>{trip.tripName}</td>
              <td>{trip.destination}</td>
              <td>{trip.startDate}</td>
              <td>{trip.endDate}</td>
              <td>${trip.budget}</td>
              <td>{trip.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default TripsTable;