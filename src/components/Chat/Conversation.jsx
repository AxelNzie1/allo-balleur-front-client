import React from "react";
import "./Conversation.css";

export default function Conversation({ conversation, onSelect, isSelected }) {
  const formatTime = (timestamp) => {
    if (!timestamp) return "";

    const now = new Date();
    const messageDate = new Date(timestamp);
    const diffInHours = (now - messageDate) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return messageDate.toLocaleTimeString("fr-FR", {
        hour: "2-digit",
        minute: "2-digit",
      });
    } else if (diffInHours < 48) {
      return "Hier";
    } else {
      return messageDate.toLocaleDateString("fr-FR", {
        day: "2-digit",
        month: "2-digit",
      });
    }
  };

  const truncateMessage = (message, maxLength = 35) =>
    !message ? "" : message.length > maxLength
      ? message.slice(0, maxLength) + "…"
      : message;

  return (
    <div
      className={`conversation-item ${isSelected ? "selected" : ""}`}
      onClick={() => onSelect(conversation)}
    >
      {/* Avatar */}
      <div className="conversation-avatar">
        {conversation.avatar ? (
          <img
            src={conversation.avatar}
            alt={conversation.username}
            className="avatar-img"
          />
        ) : (
          <div className="avatar-placeholder">
            {conversation.username?.charAt(0).toUpperCase()}
          </div>
        )}
        {conversation.is_online && <span className="online-indicator" />}
      </div>

      {/* Infos */}
      <div className="conversation-info">
        <div className="conversation-header">
          <p className="conversation-name">{conversation.username}</p>
          {conversation.last_message_timestamp && (
            <span className="conversation-time">
              {formatTime(conversation.last_message_timestamp)}
            </span>
          )}
        </div>

        <div className="conversation-preview">
          <p className="conversation-last-message">
            {truncateMessage(conversation.last_message)}
          </p>

          <div className="conversation-meta">
            {conversation.is_support && (
              <span className="support-badge">Support</span>
            )}
            {conversation.unread_count > 0 && (
              <span className="conversation-unread">
                {conversation.unread_count}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
