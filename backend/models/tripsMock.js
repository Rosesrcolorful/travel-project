let trips = [
  {
    tripId: 1,
    tripName: "Japan Adventure",
    destination: "Tokyo, Japan",
    startDate: "2025-07-10",
    endDate: "2025-07-25",
    description: "Summer trip to Japan with friends",
    createdBy: 1,
    participants: [1, 2, 3],
    budget: 12000,
    status: "planned",
    createDate: new Date().toISOString(),
    updateDate: new Date().toISOString()
  },

  {
    tripId: 2,
    tripName: "Europe Backpacking",
    destination: "Europe",
    startDate: "2025-08-01",
    endDate: "2025-08-20",
    description: "Backpacking across Europe",
    createdBy: 2,
    participants: [2, 4, 5],
    budget: 18000,
    status: "planned",
    createDate: new Date().toISOString(),
    updateDate: new Date().toISOString()
  },

  {
    tripId: 3,
    tripName: "New York Vacation",
    destination: "New York, USA",
    startDate: "2025-09-05",
    endDate: "2025-09-12",
    description: "Family vacation in NYC",
    createdBy: 3,
    participants: [3, 1],
    budget: 9000,
    status: "completed",
    createDate: new Date().toISOString(),
    updateDate: new Date().toISOString()
  },

  {
    tripId: 4,
    tripName: "Thailand Beaches",
    destination: "Phuket, Thailand",
    startDate: "2025-11-15",
    endDate: "2025-11-28",
    description: "Relaxing beach vacation",
    createdBy: 4,
    participants: [4, 2],
    budget: 14000,
    status: "planned",
    createDate: new Date().toISOString(),
    updateDate: new Date().toISOString()
  },

  {
    tripId: 5,
    tripName: "Ski Trip",
    destination: "Switzerland",
    startDate: "2025-12-20",
    endDate: "2025-12-30",
    description: "Winter ski vacation",
    createdBy: 5,
    participants: [5, 1, 2],
    budget: 22000,
    status: "planned",
    createDate: new Date().toISOString(),
    updateDate: new Date().toISOString()
  }
];

module.exports = trips;