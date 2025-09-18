import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import './Support.css';

const API = "https://allo-bailleur-backend-1.onrender.com";

const Support = () => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const [admins, setAdmins] = useState([]);

  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  // Récupérer tous les admins
  const fetchAdmins = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const response = await axios.get(`${API}/users/admins`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data && response.data.length > 0) {
        console.log("Admins récupérés :", response.data);
        setAdmins(response.data);
      } else {
        setAdmins([]);
        setError("Aucun admin disponible pour le support");
      }
    } catch (err) {
      console.error("Erreur récupération admins :", err);
      setAdmins([]);
      setError("Erreur de connexion au support");
    }
  };

  // Récupérer tous les messages de tous les admins
  const fetchMessages = async () => {
    if (admins.length === 0) return;

    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const allMessages = await Promise.all(
        admins.map(admin =>
          axios.get(`${API}/users/chat/${admin.id}`, {
            headers: { Authorization: `Bearer ${token}` }
          })
        )
      );

      const mergedMessages = allMessages.flatMap(res => res.data);
      mergedMessages.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

      setMessages(mergedMessages);
      scrollToBottom();
    } catch (err) {
      console.error("Erreur chargement messages :", err);
    }
  };

  // Envoyer le message à tous les admins
  const sendMessage = async () => {
    if (!newMessage.trim() || admins.length === 0) return;

    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      if (!token) return;

      await Promise.all(
        admins.map(admin =>
          axios.post(`${API}/users/chat/send`, {
            receiver_id: admin.id,
            content: newMessage.trim()
          }, {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          })
        )
      );

      setNewMessage('');
      fetchMessages();
    } catch (err) {
      console.error("Erreur envoi message :", err);
      setError(err.response?.data?.detail || "Erreur lors de l'envoi du message");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // Initialiser les admins et messages
  useEffect(() => {
    if (isOpen) fetchAdmins();
  }, [isOpen]);

  // Rafraîchir messages toutes les 5 secondes
  useEffect(() => {
    if (admins.length === 0) return;

    fetchMessages();
    const interval = setInterval(fetchMessages, 5000);
    return () => clearInterval(interval);
  }, [admins]);

  if (!isOpen) {
    return (
      <div className="chat-widget closed">
        <button className="chat-toggle-btn" onClick={() => setIsOpen(true)}>💬 Support</button>
      </div>
    );
  }

  return (
    <div className="chat-widget open">
      <div className="chat-header">
        <h3>💬 Support Client</h3>
        <button className="close-chat" onClick={() => setIsOpen(false)}>×</button>
      </div>

      <div className="chat-messages">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`message ${admins.some(admin => admin.id === message.sender_id) ? 'support' : 'user'}`}
          >
            <div className="message-content">
              <p>{message.content}</p>
              <span className="message-time">{new Date(message.timestamp).toLocaleTimeString()}</span>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div className="chat-input">
        <textarea
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Tapez votre message..."
          disabled={loading || admins.length === 0}
          rows={1}
        />
        <button
          onClick={sendMessage}
          disabled={loading || !newMessage.trim() || admins.length === 0}
          className="send-btn"
        >
          {loading ? '⏳' : '📤'}
        </button>
      </div>

      {error && <div className="chat-error">{error}</div>}
      {admins.length === 0 && <div className="chat-warning">⚠️ Service support temporairement indisponible</div>}
    </div>
  );
};

export default Support;
