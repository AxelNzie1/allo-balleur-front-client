import React, { useState, useEffect } from "react";
import ChatWindow from "../../components/Chat/ChatWindow";
import ConversationsList from "../../components/Chat/ConversationsList";
import './Messagerie.css';

export default function ChatPage() {
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  // Détecter les changements de taille d'écran
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleBackToList = () => {
    setSelectedConversation(null);
  };

  const handleSelectConversation = (conversationId) => {
    setSelectedConversation(conversationId);
  };

  return (
    <div className="messagerie-container">
      {/* Liste des conversations */}
      {(isMobile && !selectedConversation) || !isMobile ? (
        <div className={`messagerie-conversations ${isMobile ? 'messagerie-mobile-view' : ''}`}>
          <ConversationsList
            onSelectConversation={handleSelectConversation}
            selectedConversation={selectedConversation}
          />
        </div>
      ) : null}

      {/* Fenêtre de chat */}
      {(isMobile && selectedConversation) || !isMobile ? (
        <div className={`messagerie-chatpanel ${isMobile ? 'messagerie-mobile-view' : ''}`}>
          {selectedConversation && (
            <ChatWindow
              conversationId={selectedConversation}
              onBack={isMobile ? handleBackToList : null}
            />
          )}
        </div>
      ) : (
        !isMobile && (
          <div className="messagerie-empty-state">
            <p>Sélectionnez une conversation pour commencer à discuter</p>
          </div>
        )
      )}
    </div>
  );
}