function FriendCard({ friend }) {
  const friendUser =
    friend?.otherUser ||
    friend?.requester ||
    friend?.addressee ||
    friend?.user ||
    friend;

  if (!friendUser) {
    return (
      <article className="friend-card">
        <h3>Unknown user</h3>
        <p>Friend data could not be loaded.</p>
      </article>
    );
  }

  const displayName =
    friendUser.firstName || friendUser.username || "Unknown user";

  const fullName =
    friendUser.firstName && friendUser.lastName
      ? `${friendUser.firstName} ${friendUser.lastName}`
      : displayName;

  return (
    <article className="friend-card">
      <div className="friend-avatar">
        {displayName.charAt(0).toUpperCase()}
      </div>

      <div>
        <h3>{fullName}</h3>
        <p>@{friendUser.username || "unknown"}</p>

        {friend?.status && (
          <span className={`friend-status ${friend.status}`}>
            {friend.status}
          </span>
        )}
      </div>
    </article>
  );
}

export default FriendCard;