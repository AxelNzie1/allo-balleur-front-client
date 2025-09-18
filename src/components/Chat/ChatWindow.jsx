import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import './ChatWindow.css';

const API = "https://allo-bailleur-backend-1.onrender.com";

const ChatWindow = ({ conversationId, onBack }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [userInfo, setUserInfo] = useState(null);
  const messagesEndRef = useRef(null);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setCurrentUser(parsedUser);
      console.log("Utilisateur actuel chargé:", parsedUser.full_name, "(ID:", parsedUser.id + ")");
    } else {
      console.log("Aucun utilisateur trouvé dans le localStorage");
    }
  }, []);

  const currentUserId = currentUser?.id;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // 🔹 Récupérer les messages
  const fetchMessages = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token || !conversationId) return;

      console.log("Chargement des messages pour la conversation:", conversationId);
      
      const response = await axios.get(`${API}/users/chat/${conversationId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data && Array.isArray(response.data)) {
        console.log("Messages chargés:", response.data.length, "messages trouvés");
        setMessages(response.data);
      } else {
        console.error("Format de réponse inattendu:", response.data);
        setError("Format de réponse inattendu du serveur");
      }
    } catch (err) {
      console.error("Erreur lors du chargement des messages:", err);
      setError(err.response?.data?.detail || "Impossible de charger les messages");
    }
  };

  // 🔹 Récupérer les infos de l'utilisateur en face
  const fetchUserInfo = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token || !conversationId) return;

      console.log("Chargement des informations de l'utilisateur ID:", conversationId);
      
      const response = await axios.get(`${API}/users/${conversationId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      console.log("Informations utilisateur chargées:", response.data);
      setUserInfo(response.data);
    } catch (err) {
      console.error("Erreur lors du chargement des informations:", err);
    }
  };

  // 🔹 Envoyer un message (CORRIGÉ)
  const sendMessage = async () => {
    if (!newMessage.trim() || !conversationId) return;

    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      if (!token) return;

      console.log("Envoi d'un message à l'utilisateur ID:", conversationId);
      console.log("Contenu du message:", newMessage.trim());

      // Utilisation de JSON au lieu de FormData
      const requestData = {
        receiver_id: conversationId,
        content: newMessage.trim()
      };

      await axios.post(`${API}/users/chat/send`, requestData, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log("Message envoyé avec succès");
      setNewMessage('');
      fetchMessages(); // Recharger les messages après envoi
    } catch (err) {
      console.error("Erreur lors de l'envoi du message:", err);
      setError(err.response?.data?.detail || "Erreur lors de l'envoi");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (conversationId && currentUser) {
      console.log("Conversation ID:", conversationId, "- Utilisateur actuel ID:", currentUser.id);
      console.log("Démarrage du chargement des messages et infos utilisateur");
      
      fetchMessages();
      fetchUserInfo();

      const interval = setInterval(fetchMessages, 5000);
      return () => {
        console.log("Nettoyage de l'intervalle de rafraîchissement");
        clearInterval(interval);
      };
    }
  }, [conversationId, currentUser]);

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // Afficher les informations de débogage
  useEffect(() => {
    console.log("Messages actuels:", messages);
    console.log("Informations utilisateur:", userInfo);
    console.log("Utilisateur actuel ID:", currentUserId);
  }, [messages, userInfo, currentUserId]);

  return (
    <div className="chatwin-container">
      <div className="chatwin-header">
        {onBack && (
          <button className="chatwin-back-btn" onClick={onBack}>←</button>
        )}
        <div className="chatwin-user-info">
          <h3>{userInfo?.full_name || "Admin"}</h3>
          <span className="chatwin-user-status">En ligne</span>
        </div>
      </div>

      <div className="chatwin-messages">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`chatwin-message ${message.sender_id === currentUserId ? 'chatwin-sent' : 'chatwin-received'}`}
          >
            <div className="chatwin-message-content">
              <p>{message.content}</p>
              <span className="chatwin-message-time">
                {new Date(message.timestamp).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}
              </span>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div className="chatwin-input-container">
        <textarea
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Tapez votre message..."
          disabled={loading || !currentUser}
          rows={1}
          className="chatwin-input-field"
        />
        <button 
          onClick={sendMessage} 
          disabled={loading || !newMessage.trim() || !currentUser}
          className="chatwin-send-btn"
        >
          {loading ? '⏳' : '📤'}
        </button>
      </div>

      {error && <div className="chatwin-error">{error}</div>}
    </div>
  );
};

export default ChatWindow;