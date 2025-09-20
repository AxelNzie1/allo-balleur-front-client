import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "./PropertyDetails.css";
import { FaHeart, FaRegHeart, FaStar, FaPhone, FaExclamationTriangle, FaArrowLeft, FaArrowRight, FaFileUpload, FaDownload } from "react-icons/fa";
import { BsCoin } from "react-icons/bs";

export default function PropertyDetail() {
  const { propertyId } = useParams();
  const navigate = useNavigate();
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // États existants
  const [phoneVisible, setPhoneVisible] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState(null);
  const [phoneError, setPhoneError] = useState(null);
  const [isLiked, setIsLiked] = useState(false);
  const [isReserved, setIsReserved] = useState(false);
  const [showVIPPopup, setShowVIPPopup] = useState(false);

  const [userRating, setUserRating] = useState(null);
  const [averageRating, setAverageRating] = useState(0);
  const [ratingCount, setRatingCount] = useState(0);
  const [likeCount, setLikeCount] = useState(0);
  const [isLiking, setIsLiking] = useState(false);
  const [isRating, setIsRating] = useState(false);
  const [isEngaged, setIsEngaged] = useState(false);
  const [engagementCount, setEngagementCount] = useState(0);
  const [isEngaging, setIsEngaging] = useState(false);
  const [showLoginPopup, setShowLoginPopup] = useState(false);
  const [showTokenConfirmPopup, setShowTokenConfirmPopup] = useState(false);
  const [showNoTokensPopup, setShowNoTokensPopup] = useState(false);
  const [userTokens, setUserTokens] = useState(0);
  const [showReportDialog, setShowReportDialog] = useState(false);
  const [reportReason, setReportReason] = useState("");
  const [reportError, setReportError] = useState("");
  const [reportSuccess, setReportSuccess] = useState(false);
  const [isReporting, setIsReporting] = useState(false);
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [messageContent, setMessageContent] = useState("");
  const [sendingMessage, setSendingMessage] = useState(false);

  // Nouveaux états pour la réservation VIP
  const [reservationStep, setReservationStep] = useState(0);
  const [cniFile, setCniFile] = useState(null);
  const [incomeProofFile, setIncomeProofFile] = useState(null);
  const [isVIP, setIsVIP] = useState(false);
  const [reservationStatus, setReservationStatus] = useState(null);
  const [showTermsPopup, setShowTermsPopup] = useState(false);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [reservedUntil, setReservedUntil] = useState(null);

  const token = localStorage.getItem("token");

  const sendMessageToOwner = async () => {
    if (!token) {
      setShowLoginPopup(true);
      return;
    }
  
    if (!messageContent.trim()) {
      alert('Veuillez écrire un message');
      return;
    }
  
    if (!property?.owner?.id) {
      alert('Erreur: Propriétaire non trouvé');
      return;
    }
  
    setSendingMessage(true);
    try {
      const requestData = {
        receiver_id: property.owner.id,
        content: messageContent.trim()
      };
  
      console.log("Envoi du message avec données:", requestData);
  
      const response = await fetch('https://allo-bailleur-backend-1.onrender.com/users/chat/send', {
        method: "POST",
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(requestData)
      });
  
      console.log("Réponse status:", response.status);
  
      if (!response.ok) {
        const errorText = await response.text();
        console.error("Erreur réponse:", errorText);
        
        let errorMessage = "Erreur lors de l'envoi du message";
        
        try {
          const errorData = JSON.parse(errorText);
          errorMessage = errorData.detail || errorMessage;
        } catch (e) {
          errorMessage = errorText || errorMessage;
        }
        
        throw new Error(errorMessage);
      }
  
      const responseData = await response.json();
      console.log("Message envoyé avec succès:", responseData);
  
      alert('Message envoyé avec succès !');
      setMessageContent('');
      setShowMessageModal(false);
    } catch (error) {
      console.error('Erreur détaillée:', error);
      alert(error.message || 'Erreur lors de l\'envoi du message');
    } finally {
      setSendingMessage(false);
    }
  };

  const handleOpenMessageModal = async () => {
    if (!token) {
      setShowLoginPopup(true);
      return;
    }

    // Vérifier l'éligibilité avant d'ouvrir le modal
    try {
      const response = await fetch(`https://allo-bailleur-backend-1.onrender.com/users/chat/eligibility/${property.owner.id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();

        
        if (!data.eligible) {
          alert(`Vous ne pouvez pas envoyer de message à ce propriétaire.\n\nRaison: ${data.reason}\n\nDevenez membre VIP/PRO pour pouvoir discuter.`);
          navigate("/dashboard", { state: { section: "abonnements" } });
          return;
        }
      }
    } catch (error) {
      console.error('Erreur vérification éligibilité:', error);
      alert('Erreur lors de la vérification des permissions');
      return;
    }

    setShowMessageModal(true);
  };

  const incrementView = async () => {
    try {
      const headers = {
        'Content-Type': 'application/json'
      };
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(
        `https://allo-bailleur-backend-1.onrender.com/properties/${propertyId}/increment-view`,
        {
          method: "POST",
          headers: headers,
          credentials: 'include'
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Échec de l'incrémentation");
      }

      return await response.json();
    } catch (err) {
      console.error("Erreur vue:", err);
    }
  };

  useEffect(() => {
    if (!propertyId) {
      setError("Aucun ID de propriété fourni");
      setLoading(false);
      return;
    }

    async function fetchProperty() {
      try {
        const response = await fetch(`https://allo-bailleur-backend-1.onrender.com/properties/${propertyId}`);
        if (!response.ok) throw new Error(`Erreur ${response.status}`);
        const data = await response.json();
        setProperty(data);
        setIsLiked(data.is_liked || false);
        setUserRating(data.user_rating || null);
        setAverageRating(data.average_rating || 0);
        setRatingCount(data.rating_count || 0);
        setLikeCount(data.like_count || 0);
        setIsEngaged(data.is_engaged || false);
        setEngagementCount(data.engagement_count || 0);
        setIsReserved(data.is_reserved || false);
        setReservationStatus(data.reservation_status || null);
        setReservedUntil(data.reserved_until || null);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    async function fetchUserStatus() {
      try {
        const response = await fetch('https://allo-bailleur-backend-1.onrender.com/users/me', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        const data = await response.json();
        setIsVIP(data.is_vip || false);
      } catch (err) {
        console.error("Erreur récupération statut VIP", err);
      }
    }

    async function fetchTokenBalance() {
      try {
        const response = await fetch('https://allo-bailleur-backend-1.onrender.com/tokens/balance', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        const data = await response.json();
        setUserTokens(data.balance || 0);
      } catch (err) {
        console.error("Erreur récupération solde tokens", err);
      }
    }

    incrementView();
    fetchProperty();
    if (token) {
      fetchUserStatus();
      fetchTokenBalance();
    }
  }, [propertyId, token]);

  const handleVIPReservation = async () => {
    if (!token) {
      setShowLoginPopup(true);
      return;
    }
  
    if (!isVIP) {
      setShowVIPPopup(true); // Affiche la popup au lieu de l'alert
      return;
    }
  
    const formData = new FormData();
    formData.append('property_id', propertyId);
    formData.append('cni', cniFile);
    formData.append('income_proof', incomeProofFile);
  
    try {
      const response = await fetch(`https://allo-bailleur-backend-1.onrender.com/properties/${propertyId}/vip-reserve`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Erreur lors de la réservation VIP");
      }
  
      const data = await response.json();
      setReservationStatus('pending');
      setShowTermsPopup(true);
    } catch (error) {
      console.error("Erreur:", error);
      alert("Une erreur est survenue lors de la réservation");
    }
  };
  
  

  const initiatePayment = async () => {
    setPaymentLoading(true);
    try {
      const response = await fetch(`https://allo-bailleur-backend-1.onrender.com/payment/`, {
        method: "POST",
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          property_id: propertyId,
          amount: property.budget * 0.1
        })
      });

      const data = await response.json();
      if (data.payment_url) {
        window.location.href = data.payment_url;
      }
    } catch (error) {
      console.error("Erreur de paiement:", error);
    } finally {
      setPaymentLoading(false);
    }
  };

  const renderReservationSection = () => {
    if (reservationStatus === 'pending') {
      return (
        <div className="pd-reservation-status pending">
          <p>⏳ Votre réservation est en cours de validation par le bailleur</p>
          <small>Vous recevrez une notification dès qu'une décision sera prise</small>
        </div>
      );
    }

    if (reservationStatus === 'approved') {
      return (
        <div className="pd-reservation-status approved">
          <p>✅ Réservation approuvée jusqu'au {new Date(reservedUntil).toLocaleDateString()}</p>
          <small>Contactez le bailleur pour finaliser la transaction</small>
        </div>
      );
    }

    if (reservationStatus === 'rejected') {
      return (
        <div className="pd-reservation-status rejected">
          <p>❌ Réservation refusée par le bailleur</p>
          <button onClick={() => setReservationStep(1)} className="pd-retry-btn">
            Réessayer avec de nouveaux documents
          </button>
        </div>
      );
    }

    if (reservationStep === 1) {
      return (
        <div className="pd-reservation-docs">
          <h4>Documents requis pour la réservation VIP</h4>
          
          <div className="pd-doc-upload">
            <label>
              <FaFileUpload /> Pièce d'identité (CNI/Passport)
            </label>
            <input 
              type="file" 
              accept="image/*,.pdf" 
              onChange={(e) => setCniFile(e.target.files[0])} 
            />
            {cniFile && <small>{cniFile.name}</small>}
          </div>
          
          <div className="pd-doc-upload">
            <label>
              <FaFileUpload /> Preuve de revenus (3 derniers bulletins de salaire)
            </label>
            <input 
              type="file" 
              accept="image/*,.pdf" 
              onChange={(e) => setIncomeProofFile(e.target.files[0])} 
            />
            {incomeProofFile && <small>{incomeProofFile.name}</small>}
          </div>
          
          <button 
            onClick={handleVIPReservation} 
            disabled={!cniFile || !incomeProofFile}
            className="pd-reserve-btn"
          >
            Envoyer les documents
          </button>
        </div>
      );
    }

    return (
      <button 
        className="pd-reserve-btn" 
        onClick={() => setReservationStep(1)}
      >
        Réserver cette maison (VIP)
      </button>
    );
  };

  const handleLike = async () => {
    if (!token) {
      setShowLoginPopup(true);
      return;
    }

    setIsLiking(true);
    try {
      const response = await fetch(`https://allo-bailleur-backend-1.onrender.com/properties/${propertyId}/like`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Erreur lors du like");
      }

      const data = await response.json();
      setIsLiked(data.is_liked);
      setLikeCount(data.like_count);
    } catch (err) {
      console.error("Erreur like:", err);
    } finally {
      setIsLiking(false);
    }
  };

  const handleEngagement = async () => {
    if (!token) {
      setShowLoginPopup(true);
      return;
    }

    setIsEngaging(true);
    try {
      const response = await fetch(`https://allo-bailleur-backend-1.onrender.com/properties/${propertyId}/engage`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Erreur lors de l'engagement");
      }

      const data = await response.json();
      setIsEngaged(data.is_engaged);
      setEngagementCount(data.engagement_count);
    } catch (err) {
      console.error("Erreur engagement:", err);
    } finally {
      setIsEngaging(false);
    }
  };

  const handleRating = async (rating) => {
    if (!token) {
      setShowLoginPopup(true);
      return;
    }
    
    if (rating < 1 || rating > 5) return;

    setIsRating(true);
    try {
      const response = await fetch(`https://allo-bailleur-backend-1.onrender.com/properties/${propertyId}/rate`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ rating }),
      });

      if (!response.ok) {
        throw new Error("Erreur lors de la notation");
      }

      const data = await response.json();
      setUserRating(data.user_rating);
      setAverageRating(data.average_rating);
      setRatingCount(data.rating_count);
    } catch (err) {
      console.error("Erreur notation:", err);
    } finally {
      setIsRating(false);
    }
  };

  const handleViewPhone = async () => {
    setPhoneError(null);
    
    if (!token) {
      setShowLoginPopup(true);
      return;
    }

    if (userTokens < 3) {
      setShowNoTokensPopup(true);
      return;
    }

    setShowTokenConfirmPopup(true);
  };

  const confirmTokenDeduction = async () => {
    setShowTokenConfirmPopup(false);
    try {
      const response = await fetch(`https://allo-bailleur-backend-1.onrender.com/payments/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          type: "view_number",
          property_id: propertyId
        })
      });
  
      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.detail || "Erreur lors de la consultation");
      }
  
      const data = await response.json();
      
      // Maintenant, récupérez le numéro de téléphone depuis la propriété
      // car le paiement a été effectué avec succès
      const propertyResponse = await fetch(`https://allo-bailleur-backend-1.onrender.com/properties/${propertyId}`);
      if (propertyResponse.ok) {
        const propertyData = await propertyResponse.json();
        setPhoneNumber(propertyData.owner?.phone);
        setPhoneVisible(true);
        
        // Mettez à jour le solde de tokens
        const balanceResponse = await fetch('https://allo-bailleur-backend-1.onrender.com/tokens/balance', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (balanceResponse.ok) {
          const balanceData = await balanceResponse.json();
          setUserTokens(balanceData.balance || 0);
        }
      }
      
    } catch (err) {
      setPhoneError(err.message);
    }
  };

  const handleReportSubmit = async () => {
    if (!reportReason.trim()) {
      setReportError("Veuillez indiquer la raison du signalement");
      return;
    }

    setIsReporting(true);
    setReportError("");
    
    try {
      const response = await fetch("https://allo-bailleur-backend-1.onrender.com/users/report", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          reported_id: property.owner.id,
          reason: reportReason
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Erreur lors du signalement");
      }

      setReportSuccess(true);
      setTimeout(() => {
        setShowReportDialog(false);
        setReportSuccess(false);
        setReportReason("");
      }, 2000);
    } catch (err) {
      setReportError(err.message);
    } finally {
      setIsReporting(false);
    }
  };

  const openReportDialog = () => {
    if (!token) {
      setShowLoginPopup(true);
      return;
    }
    setShowReportDialog(true);
  };

  const triggerHeaderLogin = () => {
    setShowLoginPopup(false);
    document.dispatchEvent(new CustomEvent('openLoginModal', {
      detail: {
        redirectAfterLogin: `/properties/${propertyId}`
      }
    }));
  };

  if (loading) return (
    <div className="pd-loading">
      <div className="pd-loading-spinner"></div>
      <p>Chargement en cours...</p>
    </div>
  );
  
  if (error) return (
    <div className="pd-error">
      <div className="pd-error-icon">⚠️</div>
      <p>Erreur : {error}</p>
      <button className="pd-retry-btn" onClick={() => window.location.reload()}>
        Réessayer
      </button>
    </div>
  );
  
  if (!property) return (
    <div className="pd-no-data">
      <div className="pd-no-data-icon">😕</div>
      <p>Aucune donnée disponible</p>
    </div>
  );

  const images = property.images || [];

  return (
    <div className="pd-container">
      <div className="pd-card">
        {/* Partie gauche : images + description */}
        <div className="pd-image-carousel">
          {images.length > 0 && (
            <>
              <img
                src={`https://allo-bailleur-backend-1.onrender.com/${images[currentImageIndex].url}`}
                alt={`Image ${currentImageIndex + 1}`}
                className="pd-carousel-image"
              />
              <div className="pd-carousel-controls">
                <button
                  className="pd-carousel-btn"
                  onClick={() =>
                    setCurrentImageIndex((prev) =>
                      prev === 0 ? images.length - 1 : prev - 1
                    )
                  }
                >
                  <FaArrowLeft className="pd-carousel-icon" />
                </button>
                <span className="pd-carousel-counter">
                  {currentImageIndex + 1} / {images.length}
                </span>
                <button
                  className="pd-carousel-btn"
                  onClick={() =>
                    setCurrentImageIndex((prev) =>
                      prev === images.length - 1 ? 0 : prev + 1
                    )
                  }
                >
                  <FaArrowRight className="pd-carousel-icon" />
                </button>
              </div>
              <div className="pd-thumbnails">
                {images.map((img, index) => (
                  <img
                    key={index}
                    src={`https://allo-bailleur-backend-1.onrender.com/${img.url}`}
                    alt={`Miniature ${index + 1}`}
                    className={`pd-thumbnail ${index === currentImageIndex ? "pd-active" : ""}`}
                    onClick={() => setCurrentImageIndex(index)}
                  />
                ))}
              </div>
            </>
          )}
 
          <div className="pd-description-box">
            <h2>Description</h2>
            <p>{property.description}</p>
          </div>
        </div>

        {/* Partie droite */}
        <div className="pd-info-section">
          <div className="pd-header">
            <h1>{property.type} à {property.ville || "Ville inconnue"}</h1>
            <p className="pd-sub-info">{property.quartier}, {property.ville}, {property.pays}</p>
          </div>

          <div className="pd-interaction-section">
            <div className="pd-like-section">
              <button 
                className={`pd-like-btn ${isLiked ? "pd-liked" : ""} ${isLiking ? "pd-disabled" : ""}`}
                onClick={handleLike}
                disabled={isLiking}
              >
                {isLiking ? (
                  <div className="pd-spinner"></div>
                ) : isLiked ? (
                  <FaHeart className="pd-heart-icon pd-filled" />
                ) : (
                  <FaRegHeart className="pd-heart-icon" />
                )}
                <span>J'aime ({likeCount})</span>
              </button>
              <div className="pd-favorites-note">
                <small>💡 En aimant cette maison, vous pourrez la retrouver dans la section "Mes favoris"</small>
              </div>
            </div>

            <div className="pd-engagement-section">
              <button 
                className={`pd-engagement-btn ${isEngaged ? "pd-engaged" : ""} ${isEngaging ? "pd-disabled" : ""}`}
                onClick={handleEngagement}
                disabled={isEngaging}
              >
                {isEngaging ? (
                  <div className="pd-spinner"></div>
                ) : (
                  <>
                    <span className="pd-engagement-icon">🤝</span>
                    <span>{isEngaged ? "Je me désengage" : "Je m'engage"} ({engagementCount})</span>
                  </>
                )}
              </button>
              <div className="pd-engagement-note">
                <small>💡 En vous engageant, vous laissez une trace de votre interaction</small>
              </div>
            </div>


             {/* 
             <div className="pd-reservation-section">
              {renderReservationSection()}
             
              <div className="pd-reservation-note">
                <small>💡 La réservation VIP vous donne la priorité absolue</small>
                {!isVIP && (
                  <small className="pd-vip-upgrade">
                    Devenez membre VIP pour accéder à cette fonctionnalité
                  </small>
                )}
              </div>
            </div>
            */}
            
            <div className="pd-rating-section">
              <h3>Notez cette propriété</h3>
              <div className="pd-star-rating">
                {[1, 2, 3, 4, 5].map((star) => (
                  <span
                    key={star}
                    className={`pd-star ${star <= (userRating || averageRating) ? "pd-filled" : ""} ${isRating ? "pd-disabled" : ""}`}
                    onClick={() => !isRating && handleRating(star)}
                  >
                    <FaStar className="pd-star-icon" />
                  </span>
                ))}
              </div>
              <p className="pd-rating-info">
                Moyenne: <span className="pd-rating-value">{averageRating.toFixed(1)}</span> 
                <span className="pd-rating-count">({ratingCount} avis)</span>
              </p>
            </div>
          </div>

          <div className="pd-section-separator" />

          <div className="pd-card-grid">
            <div className="pd-info-card">
              <div className="pd-info-icon">📏</div>
              <div>
                <strong>Surface:</strong>
                <p>{property.surface} m²</p>
              </div>
            </div>
            <div className="pd-info-card">
              <div className="pd-info-icon">💰</div>
              <div>
                <strong>Budget:</strong>
                <p>{property.budget} FCFA</p>
              </div>
            </div>
            <div className="pd-info-card">
              <div className="pd-info-icon">👁️</div>
              <div>
                <strong>Vues:</strong>
                <p>{property.views}</p>
              </div>
            </div>
            <div className="pd-info-card">
              <div className="pd-info-icon">🏷️</div>
              <div>
                <strong>Statut:</strong>
                <p>{property.status}</p>
              </div>
            </div>
          </div>

          <div className="pd-section-separator" />

          <div className="pd-owner-info">
            <h2>Coordonnées du bailleur</h2>
            <div className="pd-card-grid">
              <div className="pd-info-card">
                <div className="pd-info-icon">👤</div>
                <div>
                  <strong>Nom:</strong>
                  <p>{property.owner?.full_name}</p>
                </div>
              </div>

              <div className="pd-info-card">
                <div className="pd-info-icon"><FaPhone /></div>
                <div>
                  <strong>Téléphone:</strong>
                  {phoneVisible ? (
                    <p className="pd-phone-number">{phoneNumber}</p>
                  ) : (
                    <>
                      <button 
                        className="pd-view-phone-btn" 
                        onClick={handleViewPhone}
                      >
                        <FaPhone className="pd-phone-icon" /> Afficher
                      </button>
                      {phoneError && <p className="pd-error-text">{phoneError}</p>}
                    </>
                  )}
                </div>
              </div>
              <div className="pd-info-card">
              <div className="pd-info-icon">🏢</div>
              <div>
                <strong>Statut:</strong>
                {property.owner?.is_pro ? (
                  <span className="pd-pro-badge">Bailleur PRO</span>
                ) : (
                  <p>Particulier</p>
                )}
              </div>
            </div>

            </div>

            {/* BOUTON DE MESSAGERIE */}
            <div className="pd-contact-section">
              <button 
                className="pd-contact-btn"
                onClick={handleOpenMessageModal}
              >
                ✉️ Envoyer un message
              </button>
            </div>

            <div className="pd-report-section">
              <button 
                className="pd-report-btn"
                onClick={openReportDialog}
              >
                <FaExclamationTriangle className="pd-report-icon" /> Signaler ce bailleur
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de messagerie */}
      {showMessageModal && (
        <div className="pd-popup-overlay">
          <div className="pd-popup-content">
            <button 
              className="pd-popup-close-btn" 
              onClick={() => {
                setShowMessageModal(false);
                setMessageContent('');
              }}
            >
              &times;
            </button>
            
            <h3>Envoyer un message à {property.owner?.full_name}</h3>
            
            <textarea
              className="pd-message-textarea"
              value={messageContent}
              onChange={(e) => setMessageContent(e.target.value)}
              placeholder="Écrivez votre message ici..."
              rows="5"
            />
            
            <div className="pd-popup-buttons">
              <button 
                className="pd-popup-btn pd-popup-btn-secondary"
                onClick={() => {
                  setShowMessageModal(false);
                  setMessageContent('');
                }}
              >
                Annuler
              </button>
              <button 
                className="pd-popup-btn pd-popup-btn-primary"
                onClick={sendMessageToOwner}
                disabled={sendingMessage || !messageContent.trim()}
              >
                {sendingMessage ? 'Envoi en cours...' : 'Envoyer'}
              </button>
            </div>
          </div>
        </div>
      )}
      {showVIPPopup && (
        <div className="pd-popup-overlay">
          <div className="pd-popup-content">
            <button 
              className="pd-popup-close-btn" 
              onClick={() => setShowVIPPopup(false)}
            >
              &times;
            </button>
            <h3>Réservation VIP</h3>
            <p>Vous devez être membre VIP pour effectuer cette réservation.</p>
            <div className="pd-popup-buttons">
              <button 
                className="pd-popup-btn pd-popup-btn-primary"
                onClick={() => {
                  setShowVIPPopup(false);
                  navigate("/dashboard", { state: { section: "abonnements" } });
                }}
              >
                Devenir VIP
              </button>
              <button 
                className="pd-popup-btn pd-popup-btn-secondary"
                onClick={() => setShowVIPPopup(false)}
              >
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}


      {/* Popup de conditions de réservation */}
      {showTermsPopup && (
        <div className="pd-popup-overlay">
          <div className="pd-popup-content">
            <button 
              className="pd-popup-close-btn" 
              onClick={() => setShowTermsPopup(false)}
            >
              &times;
            </button>
            <h3>Conditions de réservation VIP</h3>
            
            <div className="pd-terms-content">
              <p>En confirmant, vous acceptez les conditions suivantes :</p>
              <ul>
                <li>Paiement immédiat de 10% du loyer ({property.budget * 0.1} FCFA)</li>
                <li>Aucun remboursement en cas de désistement</li>
                <li>Validation sous 48h par le bailleur</li>
                <li>Documents authentiques requis</li>
              </ul>
              
              <a href="/terms.pdf" download className="pd-download-terms">
                <FaDownload /> Télécharger les conditions complètes (PDF)
              </a>
            </div>
            
            <div className="pd-popup-buttons">
              <button 
                onClick={() => setShowTermsPopup(false)} 
                className="pd-popup-btn-secondary"
              >
                Annuler
              </button>
              <button 
                onClick={initiatePayment} 
                className="pd-popup-btn-primary"
                disabled={paymentLoading}
              >
                {paymentLoading ? (
                  <span>Initialisation du paiement...</span>
                ) : (
                  <span>Lu et approuvé - Payer maintenant</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Boîte de dialogue de signalement */}
      {showReportDialog && (
        <div className="pd-report-dialog-overlay">
          <div className="pd-report-dialog">
            <button 
              className="pd-close-dialog-btn"
              onClick={() => {
                setShowReportDialog(false);
                setReportError("");
                setReportReason("");
              }}
              disabled={isReporting}
            >
              &times;
            </button>

            <h3>Signaler ce bailleur</h3>
            
            {reportSuccess ? (
              <div className="pd-report-success">
                <div className="pd-success-icon">✓</div>
                <p>Votre signalement a bien été pris en compte.</p>
                <p>Merci pour votre contribution.</p>
              </div>
            ) : (
              <>
                <p>Merci de nous indiquer pourquoi vous souhaitez signaler ce bailleur :</p>
                
                <div className="pd-report-reasons">
                  <div className="pd-reason-option">
                    <input 
                      type="radio" 
                      id="reason-scam" 
                      name="report-reason" 
                      value="Annonce frauduleuse"
                      checked={reportReason === "Annonce frauduleuse"}
                      onChange={() => setReportReason("Annonce frauduleuse")}
                    />
                    <label htmlFor="reason-scam">Annonce frauduleuse</label>
                  </div>
                  
                  <div className="pd-reason-option">
                    <input 
                      type="radio" 
                      id="reason-broker" 
                      name="report-reason" 
                      value="Démarcheur immobilier"
                      checked={reportReason === "Démarcheur immobilier"}
                      onChange={() => setReportReason("Démarcheur immobilier")}
                    />
                    <label htmlFor="reason-broker">Démarcheur immobilier</label>
                  </div>
                  
                  <div className="pd-reason-option">
                    <input 
                      type="radio" 
                      id="reason-other" 
                      name="report-reason" 
                      value="other"
                      checked={!["Annonce frauduleuse", "Démarcheur immobilier"].includes(reportReason)}
                      onChange={() => setReportReason("")}
                    />
                    <label htmlFor="reason-other">Autre raison</label>
                  </div>
                </div>

                {!["Annonce frauduleuse", "Démarcheur immobilier"].includes(reportReason) && (
                  <textarea
                    className="pd-report-textarea"
                    placeholder="Décrivez le problème rencontré..."
                    value={reportReason}
                    onChange={(e) => {
                      setReportReason(e.target.value);
                      setReportError("");
                    }}
                    rows={4}
                  />
                )}

                {reportError && <div className="pd-report-error">⚠️ {reportError}</div>}

                <div className="pd-dialog-actions">
                  <button 
                    className="pd-cancel-btn"
                    onClick={() => setShowReportDialog(false)}
                    disabled={isReporting}
                  >
                    Annuler
                  </button>
                  <button 
                    className="pd-submit-btn"
                    onClick={handleReportSubmit}
                    disabled={isReporting || !reportReason.trim()}
                  >
                    {isReporting ? (
                      <>
                        <div className="pd-spinner pd-small"></div>
                        Envoi en cours...
                      </>
                    ) : "Confirmer le signalement"}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Popup de confirmation de déduction */}
      {showTokenConfirmPopup && (
        <div className="pd-popup-overlay">
          <div className="pd-popup-content pd-token-popup">
            <button className="pd-popup-close-btn" onClick={() => setShowTokenConfirmPopup(false)}>
              &times;
            </button>
            <div className="pd-popup-header">
              <h3>Confirmation requise</h3>
              <div className="pd-token-info">
                <BsCoin className="pd-token-icon" />
                <p>Cette action va déduire <strong>3 tokens</strong> de votre solde.</p>
              </div>
              <p>Solde actuel: <strong>{userTokens} tokens</strong></p>
            </div>
            <div className="pd-popup-buttons">
              <button className="pd-popup-btn pd-popup-btn-primary" onClick={confirmTokenDeduction}>
                Confirmer
              </button>
              <button 
                className="pd-popup-btn pd-popup-btn-secondary" 
                onClick={() => setShowTokenConfirmPopup(false)}
              >
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Popup solde insuffisant */}
      {showNoTokensPopup && (
        <div className="pd-popup-overlay">
          <div className="pd-popup-content pd-token-popup">
            <button className="pd-popup-close-btn" onClick={() => setShowNoTokensPopup(false)}>
              &times;
            </button>
            <div className="pd-popup-header">
              <h3>Solde insuffisant</h3>
              <div className="pd-token-warning">
                <BsCoin className="pd-token-icon pd-warning" />
                <p>Vous n'avez pas assez de tokens pour cette action.</p>
              </div>
              <p>Solde actuel: <strong>{userTokens} tokens</strong> (3 requis)</p>
            </div>
            <div className="pd-popup-buttons">
              <button 
                className="pd-popup-btn pd-popup-btn-primary" 
                onClick={() => {
                  setShowNoTokensPopup(false);
                  navigate("/dashboard", { state: { section: "profil" } });
                }}
              >
                Recharger des tokens
              </button>
              <button 
                className="pd-popup-btn pd-popup-btn-secondary" 
                onClick={() => setShowNoTokensPopup(false)}
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Popup de connexion */}
      {showLoginPopup && (
        <div className="pd-popup-overlay">
          <div className="pd-popup-content">
            <button className="pd-popup-close-btn" onClick={() => setShowLoginPopup(false)}>
              &times;
            </button>
            <div className="pd-popup-header">
              <h3>Connexion requise</h3>
              <p>Vous devez être connecté pour effectuer cette action.</p>
            </div>
            <div className="pd-popup-buttons">
              <button className="pd-popup-btn pd-popup-btn-primary" onClick={triggerHeaderLogin}>
                Se connecter
              </button>
              <button 
                className="pd-popup-btn pd-popup-btn-secondary" 
                onClick={() => setShowLoginPopup(false)}
              >
                Continuer sans connexion
              </button>
            </div>
          </div>
        </div>
      )}
      
    </div>
  );
}