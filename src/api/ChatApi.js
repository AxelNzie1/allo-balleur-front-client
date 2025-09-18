import axios from "axios";

const API_URL = "https://allo-bailleur-backend-1.onrender.com/users/chat";

// Récupérer toutes les conversations
export const getConversations = async (token) => {
  const res = await axios.get(`${API_URL}/conversations`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

// Récupérer une conversation avec un utilisateur
export const getChatWithUser = async (userId, token) => {
  const res = await axios.get(`${API_URL}/${userId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

// Marquer une conversation comme lue
export const markAsRead = async (userId, token) => {
  const res = await axios.post(
    `${API_URL}/${userId}/mark-as-read`,
    {},
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
  return res.data;
};

// Envoyer un message
export const sendMessage = async (receiverId, content, token) => {
  const formData = new FormData();
  formData.append("receiver_id", receiverId);
  formData.append("content", content);

  const res = await axios.post(`${API_URL}/send`, formData, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};
