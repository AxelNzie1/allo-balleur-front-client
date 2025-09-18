import React, { useState, useEffect } from "react";
import axios from "axios";
import { FaEye, FaPhone, FaCalendar, FaUser, FaLock } from "react-icons/fa";
import { useNavigate } from "react-router-dom"; // <- pour navigation
import "./Mes visites..css";

const Visites = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isPro, setIsPro] = useState(false);

  const navigate = useNavigate(); // <- hook pour navigation

  useEffect(() => {
    const fetchNumberViewers = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setError("Utilisateur non authentifié");
          setLoading(false);
          return;
        }

        // 🔹 Récupération des infos utilisateur connecté
        const userResponse = await axios.get("https://allo-bailleur-backend-1.onrender.com/users/me", {
          headers: { Authorization: `Bearer ${token}` }
        });

        const bailleurId = userResponse.data.id;
        setIsPro(userResponse.data.is_pro || false); // <- statut Pro

        // 🔹 Récupération des stats
        const response = await axios.get(
          `https://allo-bailleur-backend-1.onrender.com/properties/bailleur/${bailleurId}/view-stats`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        setStats(response.data);
      } catch (err) {
        console.error("Erreur lors de la récupération des viewers:", err);
        setError(err.response?.data?.detail || "Erreur de chargement des données");
      } finally {
        setLoading(false);
      }
    };

    fetchNumberViewers();
  }, []);

  if (loading) {
    return (
      <div className="section">
        <h2>Clients ayant consulté votre numéro</h2>
        <div className="loading">Chargement...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="section">
        <h2>Clients ayant consulté votre numéro</h2>
        <div className="error-message">⚠️ {error}</div>
      </div>
    );
  }

  return (
    <div className="locataires-page">
      <h2>Clients ayant consulté votre numéro</h2>

      {/* Statistiques générales */}
      <div className="stats-summary">
        <div className="stat-card">
          <FaEye className="stat-icon" />
          <div className="stat-content">
            <h3>{stats?.total_views || 0}</h3>
            <p>Consultations totales</p>
          </div>
        </div>

        <div className="stat-card">
          <FaUser className="stat-icon" />
          <div className="stat-content">
            <h3>{new Set(stats?.recent_viewers?.map(v => v.client_name)).size || 0}</h3>
            <p>Clients uniques</p>
          </div>
        </div>

        <div className="stat-card">
          <FaCalendar className="stat-icon" />
          <div className="stat-content">
            <h3>{new Set(stats?.daily_views?.map(v => v.date)).size || 0}</h3>
            <p>Jours d'activité</p>
          </div>
        </div>
      </div>

      {/* Liste des derniers viewers */}
      {(!stats?.recent_viewers || stats.recent_viewers.length === 0) ? (
        <div className="empty-state">
          <FaEye className="empty-icon" />
          <p>Aucun client n'a encore consulté votre numéro</p>
          <small>Vos annonces apparaîtront ici lorsqu'elles seront consultées</small>
        </div>
      ) : (
        <div className="viewers-list">
          <div className="list-header">
            <span>Client</span>
            <span>Date de consultation</span>
            <span>Annonce consultée</span>
            <span>Contact</span>
          </div>

          {stats.recent_viewers.map((viewer, index) => (
            <div key={index} className="viewer-card">
              {/* Infos client */}
              <div className="viewer-info">
                <div className="client-avatar">
                  {viewer.client_name ? viewer.client_name.charAt(0).toUpperCase() : "?"}
                </div>
                <div className="client-details">
                  <h4>{viewer.client_name || "Anonyme"}</h4>
                </div>
              </div>

              {/* Date */}
              <div className="view-date">
                <FaCalendar className="icon" />
                {new Date(viewer.view_date).toLocaleDateString("fr-FR", {
                  day: "2-digit",
                  month: "2-digit",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit"
                })}
              </div>

              {/* Annonce */}
              <div className="property-info">
                {viewer.property_description ? (
                  <span className="property-title">{viewer.property_description}</span>
                ) : (
                  <span className="no-property">Non spécifié</span>
                )}
              </div>

              {/* Contact (seulement si Pro) */}
              <div className="contact-actions">
                {isPro ? (
                  viewer.client_phone ? (
                    <a
                      href={`tel:${viewer.client_phone}`}
                      className="phone-link"
                      title="Appeler ce client"
                    >
                      <FaPhone className="icon" />
                      {viewer.client_phone}
                    </a>
                  ) : (
                    <span className="no-phone">Non disponible</span>
                  )
                ) : (
                  <button
                    className="upgrade-btn"
                    onClick={() => {
                      if (window.confirm("🚀 Passez en compte PRO pour voir les numéros ?")) {
                        navigate("/dashboard", { state: { section: "abonnements" } }); // <- redirection vers Mes abonnements
                      }
                    }}
                  >
                    <FaLock className="icon" />
                    Devenir Pro
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Visites;
