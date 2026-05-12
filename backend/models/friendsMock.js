let friends = [
  {
    friendshipId: 1,
    userId: 1,
    friendId: 2,
    status: 'accepted',
    createDate: new Date().toISOString(),
    updateDate: new Date().toISOString()
  },
  {
    friendshipId: 2,
    userId: 1,
    friendId: 3,
    status: 'accepted',
    createDate: new Date().toISOString(),
    updateDate: new Date().toISOString()
  },
  {
    friendshipId: 3,
    userId: 2,
    friendId: 4,
    status: 'pending',
    createDate: new Date().toISOString(),
    updateDate: new Date().toISOString()
  },
  {
    friendshipId: 4,
    userId: 3,
    friendId: 5,
    status: 'accepted',
    createDate: new Date().toISOString(),
    updateDate: new Date().toISOString()
  }
];

module.exports = friends;

/*
User 1 is friends with users 2 and 3
User 2 has a pending friendship with user 4
User 3 is friends with user 5
*/