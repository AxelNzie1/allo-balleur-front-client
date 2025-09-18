import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Conversation from './Conversation';
import './ConversationsList.css';

const API = "https://allo-bailleur-backend-1.onrender.com";

const ConversationsList = ({ onSelectConversation, selectedConversation }) => {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchConversations = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      if (!token) {
        setError("Authentification requise");
        return;
      }

      const response = await axios.get(`${API}/users/chat/conversations`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Vérifier que c’est bien un tableau et qu’il contient toutes les conversations
      if (response.data && Array.isArray(response.data)) {
        const allConversations = response.data.map(conv => {
          // S'assurer que le dernier message existe
          return {
            ...conv,
            last_message: conv.last_message || "Aucun message",
            last_message_time: conv.last_message_time || null,
          };
        });
        setConversations(allConversations);
      } else {
        setConversations([]);
      }
    } catch (err) {
      console.error("Erreur chargement conversations:", err);
      setError(err.response?.data?.detail || "Impossible de charger les conversations");
      setConversations([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConversations();
    const interval = setInterval(fetchConversations, 30000); // rafraîchir toutes les 30s
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="convlist-container">
        <div className="convlist-header">
          <h3>Conversations</h3>
        </div>
        <div className="convlist-loading">
          <p>Chargement des conversations...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="convlist-container">
        <div className="convlist-header">
          <h3>Conversations</h3>
          <button onClick={fetchConversations} className="convlist-refresh-btn">🔄</button>
        </div>
        <div className="convlist-error">
          <p>{error}</p>
          <button onClick={fetchConversations} className="convlist-retry-btn">Réessayer</button>
        </div>
      </div>
    );
  }

  return (
    <div className="convlist-container">
      <div className="convlist-header">
        <h3>Conversations</h3>
        <button onClick={fetchConversations} className="convlist-refresh-btn">🔄</button>
      </div>

      <div className="convlist-content">
        {conversations.length === 0 ? (
          <div className="convlist-empty">
            <p>Aucune conversation</p>
            <small>Commencez une nouvelle conversation !</small>
          </div>
        ) : (
          conversations.map((conversation) => (
            <Conversation
              key={conversation.user_id}
              conversation={{
                username: conversation.user_name,
                avatar: conversation.user_avatar,
                last_message: conversation.last_message,
                last_message_timestamp: conversation.last_message_time,
                unread_count: conversation.unread_count,
                is_online: conversation.is_online,
                is_support: conversation.is_support,
              }}
              isSelected={selectedConversation === conversation.user_id}
              onSelect={() => onSelectConversation(conversation.user_id)}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default ConversationsList;
