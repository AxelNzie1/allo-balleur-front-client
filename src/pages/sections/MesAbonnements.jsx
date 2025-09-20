import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './MesAbonnements.css';
import Support from "./Support";


const API = "https://allo-bailleur-backend-1.onrender.com";

const Abonnements = () => {
  const [subscription, setSubscription] = useState({
    is_pro: false,
    is_active: false,
    is_vip: false,
    vip_is_active: false,
    vip_subscription_expires: null,
    pro_subscription_expires: null,
    required_tokens_pro: 0,
    required_tokens_vip: 0
  });
  const [tokenBalance, setTokenBalance] = useState(0);
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [processing, setProcessing] = useState(false);
  const navigate = useNavigate();

  const fetchUserRole = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return navigate("/login");

      const res = await axios.get(`${API}/users/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUserRole(res.data.role);
    } catch (err) {
      console.error("Error fetching user role:", err);
      setError("Impossible de récupérer le rôle de l'utilisateur");
    }
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      if (!token) return navigate('/login');
  
      console.log("Fetching data for role:", userRole); // Debug
  
      // Testez d'abord si les endpoints existent
      try {
        const testResponse = await axios.get(`${API}/users/vip-status`, { 
          headers: { Authorization: `Bearer ${token}` } 
        });
        console.log("VIP endpoint test:", testResponse.data);
      } catch (testError) {
        console.error("VIP endpoint error:", testError.response?.data);
      }
  
      const [proStatusRes, vipStatusRes, balanceRes] = await Promise.allSettled([
        userRole === "bailleur" ? 
          axios.get(`${API}/users/pro-status`, { headers: { Authorization: `Bearer ${token}` } }) : 
          Promise.resolve({ data: { is_pro: false, is_active: false, pro_subscription_expires: null, required_tokens: 0 } }),
        userRole === "client" ? 
          axios.get(`${API}/users/vip-status`, { headers: { Authorization: `Bearer ${token}` } }) : 
          Promise.resolve({ data: { is_vip: false, is_active: false, vip_subscription_expires: null, required_tokens: 0 } }),
        axios.get(`${API}/tokens/balance`, { headers: { Authorization: `Bearer ${token}` } })
      ]);
  
      console.log("Raw API responses:", { proStatusRes, vipStatusRes, balanceRes });
  
      // Le reste du code reste inchangé...

      const proData = proStatusRes.status === 'fulfilled' ? proStatusRes.value.data : defaultPro;
      const vipData = vipStatusRes.status === 'fulfilled' ? vipStatusRes.value.data : defaultVip;
      const balanceData = balanceRes.status === 'fulfilled' ? balanceRes.value.data : { balance: 0 };

      console.log("Pro data:", proData);
      console.log("VIP data:", vipData);
      console.log("Balance data:", balanceData);

      setSubscription({
        is_pro: proData.is_pro || false,
        is_active: proData.is_active || false,
        is_vip: vipData.is_vip || false,
        vip_is_active: vipData.is_active || false,
        vip_subscription_expires: vipData.vip_subscription_expires || null,
        pro_subscription_expires: proData.pro_subscription_expires || null,
        required_tokens_pro: proData.required_tokens || 0,
        required_tokens_vip: vipData.required_tokens || 0
      });
      
      setTokenBalance(balanceData.balance || 0);
      setError(null);
    } catch (err) {
      console.error("Error in fetchData:", err);
      if (err.response?.status === 401) navigate('/login');
      setError(err.response?.data?.detail || err.message || "Erreur de chargement");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserRole();
  }, [navigate]);

  useEffect(() => {
    if (userRole) {
      fetchData();
    }
  }, [userRole]);

  // Reste du code inchangé...
  const handleSubscribePro = async () => {
    try {
      setProcessing(true);
      const token = localStorage.getItem("token");
      if (!token) return navigate('/login');

      const response = await axios.post(
        `${API}/payments/`,
        { type: "bailleur_pro" },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.status === 200) {
        alert("Abonnement activé avec succès !");
        fetchData();
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.detail || err.message || "Erreur lors de l'abonnement");
      if (err.response?.status === 402) {
        navigate("/dashboard", { state: { section: "profil" } });
      }
    } finally {
      setProcessing(false);
    }
  };

  const handleVipSubscribe = async () => {
    try {
      setProcessing(true);
      const token = localStorage.getItem("token");
      if (!token) return navigate('/login');

      const response = await axios.post(
        `${API}/users/subscribe-vip`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.status === 200) {
        alert("Abonnement VIP activé avec succès !");
        fetchData();
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.detail || err.message || "Erreur lors de l'abonnement VIP");
    } finally {
      setProcessing(false);
    }
  };

  if (loading) return <div className="loading">Chargement en cours...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="subscription-container">
      <h2>Vos abonnements</h2>

      {/* Section descriptive des avantages - Affichage conditionnel par rôle */}
      <div className="subscription-description">
        <h3>🎯 Pourquoi s'abonner ?</h3>
        <div className="description-grid">
          
          {/* Description Bailleur Pro - Seulement pour les bailleurs */}
          {userRole === "bailleur" && (
            <div className="description-card pro-description">
              <div className="description-header">
                <h4>🏢 Forfait Bailleur Pro</h4>
                <span className="badge">Pour les propriétaires</span>
              </div>
              <div className="description-content">
                <p>Optimisez la gestion de vos biens immobiliers et maximisez votre visibilité</p>
                
                <div className="feature-list">
                  <div className="feature-item">
                    <span className="feature-icon">🚀</span>
                    <div className="feature-text">
                      <strong>Annonces prioritaires</strong>
                      <p>Vos biens apparaissent en tête des résultats de recherche</p>
                    </div>
                  </div>
                  
                  <div className="feature-item">
                    <span className="feature-icon">🤖</span>
                    <div className="feature-text">
                      <strong>Obtenez les numéros de vos prospects </strong>
                      <p>Pour les actions marketing, vous avez une liste de numéros des clients intéressés par vos maisons</p>
                    </div>
                  </div>
                  
                  <div className="feature-item">
                    <span className="feature-icon">📊</span>
                    <div className="feature-text">
                      <strong>Analytics avancés</strong>
                      <p>Statistiques détaillées sur les vues et interactions</p>
                    </div>
                  </div>
                  
                  <div className="feature-item">
                    <span className="feature-icon">📷</span>
                    <div className="feature-text">
                      <strong>Repondez aux messages laissés de vos clients</strong>
                      <p>à defaut d'etre directement joignable, vos clients peuvent vous ecrires via la messagerie de l'application</p>
                    </div>
                  </div>
                  
                  <div className="feature-item">
                    <span className="feature-icon">⭐</span>
                    <div className="feature-text">
                      <strong>Badge de bailleur Professionnel</strong>
                      <p>Gagnez la confiance des locataires avec un profil certifié</p>
                    </div>
                  </div>

                  <div className="feature-item">
                    <span className="feature-icon">💬</span>
                    <div className="feature-text">
                      <strong>Support prioritaire</strong>
                      <p>Assistance technique en moins de 2 heures</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Description Client VIP - Seulement pour les clients */}
          {userRole === "client" && (
            <div className="description-card vip-description">
              <div className="description-header">
                <h4>👑 Forfait Client VIP</h4>
                <span className="badge">Pour les locataires</span>
              </div>
              <div className="description-content">
                <p>Soyez le premier à découvrir les meilleures opportunités immobilières</p>
                
                <div className="feature-list">
                  <div className="feature-item">
                    <span className="feature-icon">⚡</span>
                    <div className="feature-text">
                      <strong>Accès 24h en avance</strong>
                      <p>Consultez les nouvelles annonces avant tout le monde</p>
                    </div>
                  </div>
                  
                  <div className="feature-item">
                    <span className="feature-icon">🔔</span>
                    <div className="feature-text">
                      <strong>Chatez avec votre bailleur à volonté</strong>
                      <p>La messagerie de l'application vous permet de discuter avec votre bailleur</p>
                    </div>
                  </div>
                  
                  <div className="feature-item">
                    <span className="feature-icon">💬</span>
                    <div className="feature-text">
                      <strong>Assistance prioritaire</strong>
                      <p>Vos reclammations sont traités en priorité par les bailleurs</p>
                    </div>
                  </div>
                  
                  <div className="feature-item">
                    <span className="feature-icon">📋</span>
                    <div className="feature-text">
                      <strong>Réservations exclusives</strong>
                      <p>Vous avez la possibilité de reserver une maison si vous n'êtes pas pret tout de suite</p>
                    </div>
                  </div>
                  
                  <div className="feature-item">
                    <span className="feature-icon">🎁</span>
                    <div className="feature-text">
                      <strong>Offres spéciales</strong>
                      <p>Accès à des promotions et offres exclusives</p>
                    </div>
                  </div>

                  <div className="feature-item">
                    <span className="feature-icon">🤝</span>
                    <div className="feature-text">
                      <strong>Conseiller dédié</strong>
                      <p>Accompagnement personnalisé pour trouver votre logement</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Message pour les admins ou autres rôles */}
          {userRole && !["bailleur", "client"].includes(userRole) && (
            <div className="description-card">
              <div className="description-header">
                <h4>ℹ️ Informations</h4>
              </div>
              <div className="description-content">
                <p>Les abonnements sont disponibles uniquement pour les bailleurs et clients.</p>
                <p>En tant qu'administrateur, vous pouvez gérer les abonnements des utilisateurs mais ne pouvez pas souscrire vous-même.</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Abonnement Bailleur Pro - Seulement pour les bailleurs */}
      {userRole === "bailleur" && (
        <div className="subscription-card">
          <h3>🏢 Forfait Bailleur Pro</h3>
          <div className="status">
            <p>
              Statut: <span className={subscription.is_active ? "active" : "inactive"}>
                {subscription.is_active ? "ACTIF" : "INACTIF"}
              </span>
            </p>
            {subscription.pro_subscription_expires && (
              <p>Date d'expiration: {new Date(subscription.pro_subscription_expires).toLocaleDateString()}</p>
            )}
          </div>

          <div className="price">
            <p>Coût: {subscription.required_tokens_pro} tokens/mois</p>
            <p>Votre solde: {tokenBalance} tokens</p>
          </div>

          <div className="benefits">
            <h4>🎁 Avantages inclus:</h4>
            <ul>
              <li>✅ Annonces en tête de liste</li>
              <li>✅ Obtenez les numéros de téléphones des clients intéressé par votre maison</li>
              <li>✅ Statistiques détaillées de performance</li>
              <li>✅ Badge de profil "Pro" </li>
              <li>✅ Support technique prioritaire</li>
              <li>✅ Analytics avancés</li>
              <li>✅ Mise en avant permanente</li>
            </ul>
          </div>

          <div className="actions">
            {!subscription.is_active ? (
              <>
                <button
                  onClick={handleSubscribePro}
                  disabled={processing || tokenBalance < subscription.required_tokens_pro}
                  className={tokenBalance < subscription.required_tokens_pro ? "disabled" : "primary"}
                >
                  {processing ? "Traitement..." : "Devenir Pro 🚀"}
                </button>
                {tokenBalance < subscription.required_tokens_pro && (
                  <button
                    onClick={() => navigate("/dashboard", { state: { section: "profil" } })}
                    className="secondary"
                  >
                    💰 Acheter des tokens
                  </button>
                )}
              </>
            ) : (
              <button className="active-btn" disabled>
                ✅ Abonnement actif - Profitez de vos avantages !
              </button>
            )}
          </div>
        </div>
      )}

      {/* Abonnement Client VIP - Seulement pour les clients */}
      {userRole === "client" && (
        <div className="subscription-card vip">
          <h3>👑 Forfait Client VIP</h3>
          <div className="status">
            <p>
              Statut: <span className={subscription.vip_is_active ? "active" : "inactive"}>
                {subscription.vip_is_active ? "ACTIF" : "INACTIF"}
              </span>
            </p>
            {subscription.vip_subscription_expires && (
              <p>Date d'expiration: {new Date(subscription.vip_subscription_expires).toLocaleDateString()}</p>
            )}
          </div>

          <div className="price">
            <p>Coût: {subscription.required_tokens_vip} tokens/mois</p>
            <p>Votre solde: {tokenBalance} tokens</p>
          </div>

          <div className="benefits">
            <h4>🎁 Avantages inclus:</h4>
            <ul>
              <li>✅ Accès 24h avant tout le monde</li>
              <li>✅ Alertes instantanées personnalisées</li>
              <li>✅ Réservation exclusive des biens</li>
              <li>✅ Offres promotionnelles spéciales</li>
              <li>✅ Conseils et accompagnement technique dédié</li>
              <li>✅ Support client prioritaire</li>
              <li>✅ Tableau de bord détaillé de vos activités.</li>
            </ul>
          </div>

          <div className="actions">
            {!subscription.vip_is_active ? (
              <button 
                onClick={handleVipSubscribe} 
                disabled={processing || tokenBalance < subscription.required_tokens_vip}
                className={tokenBalance < subscription.required_tokens_vip ? "disabled" : "primary"}
              >
                {processing ? "Traitement..." : "Devenir VIP 👑"}
              </button>
            ) : (
              <button className="active-btn" disabled>
                ✅ Abonnement VIP actif - Profitez de vos avantages !
              </button>
            )}
            {tokenBalance < subscription.required_tokens_vip && !subscription.vip_is_active && (
              <button
                onClick={() => navigate("/dashboard", { state: { section: "profil" } })}
                className="secondary"
              >
                💰 Acheter des tokens
              </button>
            )}
          </div>
        </div>
      )}

      {/* Message pour les autres rôles */}
      {userRole && !["bailleur", "client"].includes(userRole) && (
        <div className="subscription-card">
          <h3>ℹ️ Information</h3>
          <div className="benefits">
            <p>Les abonnements Pro et VIP sont réservés aux bailleurs et clients.</p>
            <p>En tant qu'administrateur, vous avez accès à tous les fonctionnalités sans abonnement.</p>
          </div>
        </div>
      )}

      <div className="support">
        <p>Besoin d'aide ?</p>
        <Support />  {/* ton widget chat support */}
      </div>

    </div>
  );
};

export default Abonnements;