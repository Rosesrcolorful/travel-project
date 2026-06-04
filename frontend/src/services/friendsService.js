const API_BASE_URL = "http://localhost:3000";

async function getUserById(userId) {
    const response = await fetch(`${API_BASE_URL}/users/${userId}`);
    const result = await response.json();

    if (!response.ok) {
        throw new Error(result.error?.message || "Could not load user");
    }

    return result.data;
}

export async function getFriendsForUser(userId) {
    const response = await fetch(`${API_BASE_URL}/friends/${userId}`);
    const result = await response.json();

    if (!response.ok) {
        throw new Error(result.error?.message || "Could not load friends");
    }

    const friendships = result.data;

    const friendsWithDetails = await Promise.all(
        friendships.map(async (friendship) => {
            const otherUserId =
                friendship.userId === Number(userId)
                    ? friendship.friendId
                    : friendship.userId;

            const friendUser = await getUserById(otherUserId);

            return {
                friendshipId: friendship.friendshipId,
                status: friendship.status,
                user: friendUser
            };
        })
    );

    return friendsWithDetails;
}