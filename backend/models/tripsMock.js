let trips = [
  {
    tripId: 1,
    tripName: 'Japan Hidden Gems Adventure',
    destination: 'Tokyo, Japan',
    startDate: '2026-07-10',
    endDate: '2026-07-25',
    description: 'A summer trip focused on local neighborhoods, food spots, temples, and hidden gems.',
    createdBy: 1,
    participants: [1, 2, 3],
    budget: 12000,
    status: 'planned',
    createDate: new Date().toISOString(),
    updateDate: new Date().toISOString()
  },
  {
    tripId: 2,
    tripName: 'Europe Backpacking',
    destination: 'Europe',
    startDate: '2026-08-01',
    endDate: '2026-08-20',
    description: 'Backpacking across several European cities with a flexible budget.',
    createdBy: 2,
    participants: [2, 4, 5],
    budget: 18000,
    status: 'planned',
    createDate: new Date().toISOString(),
    updateDate: new Date().toISOString()
  },
  {
    tripId: 3,
    tripName: 'New York Food and Culture Trip',
    destination: 'New York, USA',
    startDate: '2026-09-05',
    endDate: '2026-09-12',
    description: 'A city trip with museums, street food, parks, and local neighborhoods.',
    createdBy: 3,
    participants: [3, 1],
    budget: 9000,
    status: 'completed',
    createDate: new Date().toISOString(),
    updateDate: new Date().toISOString()
  },
  {
    tripId: 4,
    tripName: 'Thailand Beach Escape',
    destination: 'Phuket, Thailand',
    startDate: '2026-11-15',
    endDate: '2026-11-28',
    description: 'A relaxing beach vacation with islands, markets, and local food recommendations.',
    createdBy: 4,
    participants: [4, 2],
    budget: 14000,
    status: 'planned',
    createDate: new Date().toISOString(),
    updateDate: new Date().toISOString()
  },
  {
    tripId: 5,
    tripName: 'Switzerland Ski Trip',
    destination: 'Switzerland',
    startDate: '2026-12-20',
    endDate: '2026-12-30',
    description: 'A winter ski vacation with mountain villages and scenic train rides.',
    createdBy: 5,
    participants: [5, 1, 2],
    budget: 22000,
    status: 'planned',
    createDate: new Date().toISOString(),
    updateDate: new Date().toISOString()
  }
];

module.exports = trips;