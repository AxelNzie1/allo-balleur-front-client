import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Preferences.css';

const API_BASE_URL = "https://allo-bailleur-backend-1.onrender.com-backend-1.onrender.com";

const MesPreferences = () => {
  const [likedProperties, setLikedProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Fonction pour récupérer les propriétés likées
  const fetchLikedProperties = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }

      const response = await axios.get(`${API_BASE_URL}/properties/user/likes`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setLikedProperties(response.data);
      setError(null);
    } catch (err) {
      console.error("Erreur lors de la récupération des favoris:", err);
      setError(err.response?.data?.detail || "Erreur de chargement des favoris");
      if (err.response?.status === 401) {
        navigate("/login");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLikedProperties();
  }, []);

  // Fonction pour formater le prix
  const formatPrice = (price) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF'
    }).format(price);
  };

  // Fonction pour naviguer vers les détails d'une propriété
  const handlePropertyClick = (propertyId) => {
    navigate(`/property/${propertyId}`);
  };

  if (loading) {
    return (
      <div className="mes-preferences-container">
        <div className="loading">Chargement de vos favoris...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mes-preferences-container">
        <div className="error">{error}</div>
        <button onClick={fetchLikedProperties} className="retry-button">
          Réessayer
        </button>
      </div>
    );
  }

  return (
    <div className="mes-preferences-container">
      <div className="preferences-header">
        <h1>🏠 Mes Préférences</h1>
        <p>Retrouvez toutes les maisons que vous avez likées</p>
      </div>

      {likedProperties.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">❤️</div>
          <h3>Aucune maison likée pour le moment</h3>
          <p>Likez des maisons pour les retrouver ici</p>
          <button onClick={() => navigate('/properties')} className="browse-button">
            Parcourir les maisons
          </button>
        </div>
      ) : (
        <>
          <div className="preferences-stats">
            <p>Vous avez liké <strong>{likedProperties.length}</strong> maison{likedProperties.length > 1 ? 's' : ''}</p>
          </div>

          <div className="properties-grid">
            {likedProperties.map((property) => (
              <div 
                key={property.id} 
                className="property-card"
                onClick={() => handlePropertyClick(property.id)}
              >
                {property.images && property.images.length > 0 ? (
                  <div className="property-image">
                    <img 
                      src={`${API_BASE_URL}/${property.images[0].url}`} 
                      alt={property.description} 
                      onError={(e) => {
                        e.target.src = '/placeholder-property.jpg';
                      }}
                    />
                    <div className="property-badge">LIKÉ ❤️</div>
                  </div>
                ) : (
                  <div className="property-image placeholder">
                    <div className="no-image">🏠 Aucune image</div>
                  </div>
                )}

                <div className="property-content">
                  <h3 className="property-title">
                    {property.type || 'Maison'} à {property.ville || 'Inconnu'}
                  </h3>
                  
                  <p className="property-description">
                    {property.description?.length > 100 
                      ? `${property.description.substring(0, 100)}...` 
                      : property.description}
                  </p>

                  <div className="property-details">
                    <div className="detail-item">
                      <span className="detail-label">📍</span>
                      <span>{property.quartier || 'Quartier non spécifié'}</span>
                    </div>
                    
                    {property.surface && (
                      <div className="detail-item">
                        <span className="detail-label">📐</span>
                        <span>{property.surface} m²</span>
                      </div>
                    )}

                    <div className="detail-item price">
                      <span className="detail-label">💰</span>
                      <span className="price-amount">{formatPrice(property.budget)}</span>
                    </div>
                  </div>

                  <div className="property-metrics">
                    <div className="metric">
                      <span className="metric-icon">👁️</span>
                      <span>{property.views || 0} vues</span>
                    </div>
                    
                    <div className="metric">
                      <span className="metric-icon">❤️</span>
                      <span>{property.like_count || 0} likes</span>
                    </div>

                    {property.average_rating > 0 && (
                      <div className="metric">
                        <span className="metric-icon">⭐</span>
                        <span>{property.average_rating.toFixed(1)}</span>
                      </div>
                    )}
                  </div>

                  <div className="property-owner">
                    <span className="owner-badge">
                      👤 {property.owner?.full_name || 'Propriétaire'}
                    </span>
                    {property.owner?.is_verified && (
                      <span className="verified-badge">✅ Vérifié</span>
                    )}
                  </div>
                </div>

                <button className="view-details-btn">
                  Voir les détails →
                </button>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default MesPreferences;