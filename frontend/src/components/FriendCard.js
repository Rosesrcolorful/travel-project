function FriendCard({ friend }) {
  const fullName = `${friend.user.firstName || ""} ${friend.user.lastName || ""}`.trim();

  return (
    <article className="friend-card">
      <div className="friend-avatar">
        {(friend.user.firstName || friend.user.username || "?")[0].toUpperCase()}
      </div>

      <div>
        <h3>{fullName || friend.user.username}</h3>
        <p>@{friend.user.username}</p>
        <span className={`friend-status ${friend.status}`}>
          {friend.status}
        </span>
      </div>
    </article>
  );
}

export default FriendCard;