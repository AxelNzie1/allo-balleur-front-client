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

  const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  useEffect(scrollToBottom, [messages]);

  const fetchAdmins = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;
      const response = await axios.get(`${API}/users/admins`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data?.length) setAdmins(response.data);
      else { setAdmins([]); setError("Aucun admin disponible pour le support"); }
    } catch {
      setAdmins([]);
      setError("Erreur de connexion au support");
    }
  };

  const fetchMessages = async () => {
    if (!admins.length) return;
    try {
      const token = localStorage.getItem("token");
      if (!token) return;
      const all = await Promise.all(
        admins.map(a => axios.get(`${API}/users/chat/${a.id}`, { headers:{Authorization:`Bearer ${token}`} }))
      );
      const merged = all.flatMap(res => res.data)
                        .sort((a,b) => new Date(a.timestamp) - new Date(b.timestamp));
      setMessages(merged);
      scrollToBottom();
    } catch (err) { console.error(err); }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !admins.length) return;
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      if (!token) return;
      await Promise.all(
        admins.map(a => axios.post(`${API}/users/chat/send`, {
          receiver_id: a.id, content: newMessage.trim()
        }, { headers:{Authorization:`Bearer ${token}`,'Content-Type':'application/json'} }))
      );
      setNewMessage('');
      fetchMessages();
    } catch (err) {
      setError(err.response?.data?.detail || "Erreur lors de l'envoi du message");
    } finally { setLoading(false); }
  };

  const handleKeyPress = e => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  useEffect(() => { if (isOpen) fetchAdmins(); }, [isOpen]);
  useEffect(() => {
    if (!admins.length) return;
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
        {messages.map(msg => (
          <div key={msg.id}
            className={`message ${admins.some(a => a.id === msg.sender_id) ? 'support' : 'user'}`}>
            <div className="message-content">
              <p>{msg.content}</p>
              <span className="message-time">
                {new Date(msg.timestamp).toLocaleTimeString()}
              </span>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div className="chat-input">
        <textarea
          value={newMessage}
          onChange={e => setNewMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Tapez votre message..."
          disabled={loading || !admins.length}
          rows={1}
        />
        <button
          onClick={sendMessage}
          disabled={loading || !newMessage.trim() || !admins.length}
          className="send-btn"
        >
          {loading ? '⏳' : '📤'}
        </button>
      </div>

      {error && <div className="chat-error">{error}</div>}
      {!admins.length && <div className="chat-warning">⚠️ Service support temporairement indisponible</div>}
    </div>
  );
};

export default Support;
