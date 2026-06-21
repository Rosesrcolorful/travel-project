require("dotenv").config();

const db = require("./models");
const { User, Trip, TripParticipant, Admin, Friendship } = db;
async function seed() {
  try {
    await db.sequelize.sync({ force: true });

    const users = await User.bulkCreate([
      {
        username: "gal12345",
        firstName: "Gal",
        lastName: "Fuerst",
        email: "gal12345@gmail.com",
        password: "123456",
        userRole: "admin"
      },
      {
        username: "roza123",
        firstName: "Roza",
        lastName: "Student",
        email: "roza123@gmail.com",
        password: "123456",
        userRole: "admin"
      },
      {
        username: "yossi77",
        firstName: "Yossi",
        lastName: "Mizrahi",
        email: "yossi@email.com",
        password: "123456",
        userRole: "user"
      },
      {
        username: "tamar88",
        firstName: "Tamar",
        lastName: "David",
        email: "tamar@email.com",
        password: "123456",
        userRole: "manager"
      },
      {
        username: "roni55",
        firstName: "Roni",
        lastName: "Sharon",
        email: "roni@email.com",
        password: "123456",
        userRole: "user"
      }
    ]);

    await Admin.create({
      userId: users[0].userId,
      permissions: "manage_users,manage_trips"
    });

    const trips = await Trip.bulkCreate([
      {
        tripName: "Japan Adventure",
        destination: "Tokyo, Japan",
        startDate: "2025-07-10",
        endDate: "2025-07-25",
        description: "Summer trip to Japan with friends",
        createdBy: users[0].userId,
        budget: 12000,
        status: "planned"
      },
      {
        tripName: "Europe Backpacking",
        destination: "Europe",
        startDate: "2025-08-01",
        endDate: "2025-08-20",
        description: "Backpacking across Europe",
        createdBy: users[1].userId,
        budget: 18000,
        status: "planned"
      },
      {
        tripName: "New York Vacation",
        destination: "New York, USA",
        startDate: "2025-09-05",
        endDate: "2025-09-12",
        description: "Family vacation in NYC",
        createdBy: users[2].userId,
        budget: 9000,
        status: "completed"
      },
      {
        tripName: "Thailand Beaches",
        destination: "Phuket, Thailand",
        startDate: "2025-11-15",
        endDate: "2025-11-28",
        description: "Relaxing beach vacation",
        createdBy: users[3].userId,
        budget: 14000,
        status: "planned"
      },
      {
        tripName: "Ski Trip",
        destination: "Switzerland",
        startDate: "2025-12-20",
        endDate: "2025-12-30",
        description: "Winter ski vacation",
        createdBy: users[4].userId,
        budget: 22000,
        status: "planned"
      }
    ]);

    await TripParticipant.bulkCreate([
      { userId: users[0].userId, tripId: trips[0].tripId, participantRole: "owner" },
      { userId: users[1].userId, tripId: trips[0].tripId, participantRole: "member" },
      { userId: users[2].userId, tripId: trips[0].tripId, participantRole: "member" },

      { userId: users[1].userId, tripId: trips[1].tripId, participantRole: "owner" },
      { userId: users[3].userId, tripId: trips[1].tripId, participantRole: "member" },
      { userId: users[4].userId, tripId: trips[1].tripId, participantRole: "member" },

      { userId: users[2].userId, tripId: trips[2].tripId, participantRole: "owner" },
      { userId: users[0].userId, tripId: trips[2].tripId, participantRole: "member" },

      { userId: users[3].userId, tripId: trips[3].tripId, participantRole: "owner" },
      { userId: users[1].userId, tripId: trips[3].tripId, participantRole: "member" },

      { userId: users[4].userId, tripId: trips[4].tripId, participantRole: "owner" },
      { userId: users[0].userId, tripId: trips[4].tripId, participantRole: "member" },
      { userId: users[1].userId, tripId: trips[4].tripId, participantRole: "member" }
    ]);

    await Friendship.bulkCreate([
      { userId: users[0].userId, friendId: users[1].userId, status: "accepted" },
      { userId: users[1].userId, friendId: users[3].userId, status: "accepted" },
      { userId: users[2].userId, friendId: users[1].userId, status: "pending" },
      { userId: users[4].userId, friendId: users[1].userId, status: "pending" }
    ]);

    console.log("Database seeded successfully");
    process.exit();
  } catch (error) {
    console.error("Seed failed:", error);
    process.exit(1);
  }
}

seed();