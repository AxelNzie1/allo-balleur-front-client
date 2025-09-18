import React, { useEffect, useState } from "react";
import axios from "axios";
import "./MesBiens.css";
import ConfirmationModal from "./ConfirmationModal";

import { useNavigate } from "react-router-dom";

// Créez d'abord ce fichier dans src/constants/apiSchemas.js
const PaymentTypes = {
  VIEW_NUMBER: "VIEW_NUMBER",
  BAILLEUR_PRO: "BAILLEUR_PRO",
  PROMOTION: "ANNONCE_MISE_EN_AVANT"
};

const PropertyStatuses = {
  DISPONIBLE: "DISPONIBLE",
  OCCUPE: "OCCUPE"
};

const createPaymentSchema = (propertyId, type) => ({
  type,
  ...(propertyId && { property_id: propertyId })
});

const API = "https://allo-bailleur-backend-1.onrender.com";

const MesBiens = () => {
  const [biens, setBiens] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const [selectedPropertyId, setSelectedPropertyId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchBiens = async () => {
    try {
      const res = await axios.get(`${API}/properties/my-properties`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      
      // Conversion cohérente vers majuscules pour le frontend
      const normalizedBiens = res.data.map(bien => ({
        ...bien,
        status: bien.status.toUpperCase()
      }));
      
      setBiens(normalizedBiens);
    } catch (err) {
      console.error("Erreur:", err);
      alert("Erreur lors du chargement de vos biens");
    } finally {
      setLoading(false);
    }
  };

  const supprimerBien = async (id) => {
    if (!window.confirm("Supprimer ce bien ?")) return;
    try {
      await axios.delete(`${API}/properties/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setBiens(biens.filter((b) => b.id !== id));
    } catch (err) {
      console.error("Erreur suppression :", err);
      alert("Erreur lors de la suppression");
    }
  };

  const toggleDisponibilite = async (id, currentStatus) => {
    try {
      const newStatus = currentStatus === "DISPONIBLE" ? "occupe" : "disponible";
      
      const response = await axios.patch(
        `${API}/properties/${id}/status`,
        { new_status: newStatus },
        {
          headers: { 
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            'Content-Type': 'application/json'
          }
        }
      );
  
      setBiens(prevBiens => 
        prevBiens.map(bien => 
          bien.id === id ? { 
            ...bien, 
            status: response.data.new_status.toUpperCase() 
          } : bien
        )
      );
    } catch (err) {
      console.error("Erreur:", err);
      alert("Échec de la mise à jour du statut");
    }
  };

  const promouvoirBien = async () => {
    try {
      const response = await axios.post(
        `${API}/payments/`,
        {
          type: "annonce_mise_en_avant",
          property_id: selectedPropertyId.toString()
        },
        {
          headers: { 
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            'Content-Type': 'application/json'
          }
        }
      );
  
      alert("✅ Bien promu avec succès !");
      setIsModalOpen(false);
      setSelectedPropertyId(null);
      fetchBiens();
    } catch (err) {
      console.error("Erreur:", err);
      setIsModalOpen(false);
      setSelectedPropertyId(null);
  
      if (err.response?.status === 402) {
        alert("❌ Solde insuffisant. Veuillez recharger votre portefeuille.");
      } else {
        alert("Erreur lors de la promotion.");
      }
    }
  };
  
  
  
  const renderStars = (rating) => {
    return [...Array(5)].map((_, i) => (
      <span 
        key={i} 
        className={`star ${i < Math.floor(rating) ? 'filled' : ''} ${i === Math.floor(rating) && rating % 1 >= 0.5 ? 'half' : ''}`}
      >
        ★
      </span>
    ));
  };

  useEffect(() => {
    fetchBiens();
  }, []);

  return (
    <div className="mesbiens-container">
      <h2 className="mesbiens-title">Mes Biens Immobiliers</h2>

      {loading ? (
        <div className="loading">Chargement en cours...</div>
      ) : biens.length === 0 ? (
        <div className="no-properties">
          <p>Vous n'avez aucun bien enregistré.</p>
        </div>
      ) : (
        <div className="biens-grid">
          {biens.map((bien) => (
            <div key={bien.id} className={`bien-card ${bien.is_promoted ? 'promoted' : ''}`}>
              {bien.is_promoted && <div className="promoted-badge">★ Promu</div>}
              
              <div className="bien-header">
                <h3>{bien.description}</h3>
                <div className="bien-meta">
                  <span className={`bien-statut ${bien.status === PropertyStatuses.DISPONIBLE ? 'disponible' : 'indisponible'}`}>
                    {bien.status === PropertyStatuses.DISPONIBLE ? "Disponible" : "Occupé"}
                  </span>
                  <div className="bien-ratings">
                    {renderStars(bien.average_rating || 0)}
                    <span>({bien.rating_count || 0})</span>
                  </div>
                  <div className="bien-likes">❤️ {bien.like_count || 0}</div>
                </div>
              </div>
              
              <div className="bien-details">
                <p><span>📍</span> {bien.ville}, {bien.quartier}</p>
                <p><span>🏠</span> {bien.type} • {bien.surface}m²</p>
                <p><span>💰</span> {bien.budget} €</p>
                <p><span>👁️</span> {bien.views} vues</p>
              </div>

              <div className="bien-actions">
              <button 
                onClick={() => {
                  setSelectedPropertyId(bien.id);
                  setIsModalOpen(true);
                }}
                className="btn-promote"
                disabled={bien.status !== PropertyStatuses.DISPONIBLE || bien.is_promoted}
              >
                {bien.is_promoted ? "Promotion encours ★" : "Promouvoir"}
              </button>
                <button 
                  onClick={() => navigate(`/modifier-bien/${bien.id}`)}
                  className="btn-edit"
                >
                  Modifier
                </button>
                <button
                  onClick={() => toggleDisponibilite(bien.id, bien.status)}
                  className={`status-btn ${bien.status === PropertyStatuses.DISPONIBLE ? "occupied" : "available"}`}
                >
                  {bien.status === PropertyStatuses.DISPONIBLE ? "Marquer comme occupé" : "Rendre disponible"}
                </button>
                <button 
                  onClick={() => supprimerBien(bien.id)}
                  className="btn-delete"
                >
                  Supprimer
                </button>
                <ConfirmationModal 
                  isOpen={isModalOpen} 
                  onConfirm={promouvoirBien} 
                  onCancel={() => {
                    setIsModalOpen(false);
                    setSelectedPropertyId(null);
                  }} 
                />

              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MesBiens;