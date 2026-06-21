import { useEffect, useRef, useState } from "react";

import {
  getConversation,
  sendMessage as sendMessageFallback
} from "../services/messagesService";

import {
  connectSocket,
  sendChatMessage,
  notifyTripShareResponse
} from "../services/socketService";

import {
  acceptTripShare,
  declineTripShare
} from "../services/tripSharesService";

function ChatBox({ userId, friendship }) {
  const friendUser = friendship?.otherUser;
  const messagesEndRef = useRef(null);

  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState("");
  const [loading, setLoading] = useState(Boolean(friendUser));
  const [error, setError] = useState("");
  const [onlineUserIds, setOnlineUserIds] = useState([]);

  useEffect(() => {
    if (!friendUser) {
      setMessages([]);
      setLoading(false);
      return;
    }

    async function loadConversation() {
      try {
        setLoading(true);
        setError("");

        const conversation = await getConversation(userId, friendUser.userId);
        setMessages(conversation);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    }

    loadConversation();

    const socket = connectSocket(userId);

    const handleIncomingMessage = (message) => {
      const isCurrentConversation =
        (message.senderId === Number(userId) && message.receiverId === friendUser.userId) ||
        (message.senderId === friendUser.userId && message.receiverId === Number(userId));

      if (!isCurrentConversation) {
        return;
      }

      setMessages((previousMessages) => {
        const alreadyExists = previousMessages.some(
          (currentMessage) => currentMessage.messageId === message.messageId
        );

        if (alreadyExists) {
          return previousMessages;
        }

        return [...previousMessages, message];
      });
    };

    const handleTripShareUpdate = (payload) => {
      setMessages((previousMessages) =>
        previousMessages.map((message) => {
          if (message.tripShareId !== payload.tripShareId || !message.tripShare) {
            return message;
          }

          return {
            ...message,
            tripShare: {
              ...message.tripShare,
              status: payload.status
            }
          };
        })
      );
    };

    const handleOnlineUsers = (payload) => {
      setOnlineUserIds(payload.onlineUserIds || []);
    };

    socket.on("chat:received", handleIncomingMessage);
    socket.on("trip_share:updated", handleTripShareUpdate);
    socket.on("user:online", handleOnlineUsers);

    return () => {
      socket.off("chat:received", handleIncomingMessage);
      socket.off("trip_share:updated", handleTripShareUpdate);
      socket.off("user:online", handleOnlineUsers);
    };
  }, [userId, friendUser?.userId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async (event) => {
    event.preventDefault();

    const trimmedMessage = messageText.trim();

    if (!trimmedMessage || !friendUser) {
      return;
    }

    setError("");
    setMessageText("");

    try {
      sendChatMessage(userId, friendUser.userId, trimmedMessage, async (result) => {
        if (!result.success) {
          setError(result.error?.message || "Could not send message.");

          try {
            await sendMessageFallback(userId, friendUser.userId, trimmedMessage);
          } catch (fallbackError) {
            setError(fallbackError.message);
          }
        }
      });
    } catch (error) {
      try {
        await sendMessageFallback(userId, friendUser.userId, trimmedMessage);
      } catch (fallbackError) {
        setError(fallbackError.message);
      }
    }
  };

  const handleAcceptTripShare = async (message) => {
    try {
      setError("");

      const updatedShare = await acceptTripShare(userId, message.tripShareId);

      setMessages((previousMessages) =>
        previousMessages.map((currentMessage) => {
          if (currentMessage.messageId !== message.messageId) {
            return currentMessage;
          }

          return {
            ...currentMessage,
            tripShare: updatedShare
          };
        })
      );

      notifyTripShareResponse({
        tripShareId: updatedShare.tripShareId,
        senderId: updatedShare.senderId,
        receiverId: updatedShare.receiverId,
        status: "accepted",
        tripName: updatedShare.trip?.tripName
      });
    } catch (error) {
      setError(error.message);
    }
  };

  const handleDeclineTripShare = async (message) => {
    try {
      setError("");

      const updatedShare = await declineTripShare(userId, message.tripShareId);

      setMessages((previousMessages) =>
        previousMessages.map((currentMessage) => {
          if (currentMessage.messageId !== message.messageId) {
            return currentMessage;
          }

          return {
            ...currentMessage,
            tripShare: updatedShare
          };
        })
      );

      notifyTripShareResponse({
        tripShareId: updatedShare.tripShareId,
        senderId: updatedShare.senderId,
        receiverId: updatedShare.receiverId,
        status: "declined",
        tripName: updatedShare.trip?.tripName
      });
    } catch (error) {
      setError(error.message);
    }
  };

  if (!friendUser) {
    return (
      <section className="chat-box empty-chat">
        <h2>Choose a friend</h2>
        <p>Select an accepted friend to start chatting.</p>
      </section>
    );
  }

  const isFriendOnline = onlineUserIds.includes(friendUser.userId);

  return (
    <section className="chat-box">
      <div className="chat-header">
        <div>
          <h2>{friendUser.username}</h2>
          <p>{isFriendOnline ? "Online now" : "Chat with your friend"}</p>
        </div>
      </div>

      {error && <p className="error-message chat-error">{error}</p>}

      <div className="messages-list">
        {loading ? (
          <p className="loading-message">Loading conversation...</p>
        ) : messages.length === 0 ? (
          <p className="empty-message">No messages yet. Send the first one.</p>
        ) : (
          messages.map((message) => {
            const isMine = message.senderId === Number(userId);
            const isTripShare = message.messageType === "trip_share" && message.tripShare;

            const canRespondToShare =
              isTripShare &&
              message.receiverId === Number(userId) &&
              message.tripShare.status === "pending";

            return (
              <article
                key={message.messageId}
                className={`message-bubble ${isMine ? "mine" : "theirs"}`}
              >
                {isTripShare ? (
                  <div className="chat-trip-share-card">
                    <span className="chat-card-label">Trip share</span>

                    <h3>{message.tripShare.trip?.tripName}</h3>

                    <p>
                      {message.sender?.username} shared a trip to{" "}
                      <strong>{message.tripShare.trip?.destination}</strong>.
                    </p>

                    <p className="chat-trip-status">
                      Status: <strong>{message.tripShare.status}</strong>
                    </p>

                    {canRespondToShare && (
                      <div className="chat-trip-actions">
                        <button
                          type="button"
                          onClick={() => handleAcceptTripShare(message)}
                        >
                          Accept
                        </button>

                        <button
                          type="button"
                          className="danger-button"
                          onClick={() => handleDeclineTripShare(message)}
                        >
                          Decline
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <p>{message.content}</p>
                )}
              </article>
            );
          })
        )}

        <div ref={messagesEndRef} />
      </div>

      <form className="chat-input-form" onSubmit={handleSendMessage}>
        <input
          type="text"
          value={messageText}
          placeholder={`Message ${friendUser.username}`}
          onChange={(event) => setMessageText(event.target.value)}
        />

        <button type="submit">Send</button>
      </form>
    </section>
  );
}

export default ChatBox;