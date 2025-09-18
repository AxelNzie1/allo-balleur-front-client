import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';

// Sections bailleur
import VueGlobale from './sections/VueGlobale';
import AjouterBien from './sections/AddPropertie';
import MesBiens from './sections/MesBiens';
import CampagnesAds from './sections/CampagnesAds';
import Visites from './sections/Mes visites';
import Messagerie from './sections/Messagerie';
import Profil from './sections/BailleurProfil';
import Abonnements from './sections/MesAbonnements';
import MesPreferences from './sections/preferences';

import "../pages/BailleurDashboard.css";

const BailleurDashboard = () => {
  const location = useLocation();
  const [section, setSection] = useState('vue-globale');
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [userRole, setUserRole] = useState(null);
  const [isPro, setIsPro] = useState(false);
  const [isVip, setIsVip] = useState(false);
  const [proExpires, setProExpires] = useState(null);
  const [vipExpires, setVipExpires] = useState(null);
  const [loadingRole, setLoadingRole] = useState(true);

  // 🔹 Récupération rôle + infos d’abonnement
  const fetchUserRole = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch('https://allo-bailleur-backend-1.onrender.com/users/me', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        console.log("Données utilisateur:", data);

        setUserRole(data.role);
        setIsPro(Boolean(data.is_pro));
        setIsVip(Boolean(data.is_vip));
        setProExpires(data.pro_subscription_expires);
        setVipExpires(data.vip_subscription_expires);
      }
    } catch (error) {
      console.error('Erreur récupération rôle utilisateur:', error);
    } finally {
      setLoadingRole(false);
    }
  };

  // 🔹 Messages non lus
  const fetchUnreadMessages = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return 0;
      const response = await fetch('https://allo-bailleur-backend-1.onrender.com/users/users/chat/unread-count', {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      if (response.ok) {
        const data = await response.json();
        return data.count || 0;
      }
      return 0;
    } catch (error) {
      console.error("Erreur messages non lus:", error);
      return 0;
    }
  };

  useEffect(() => {
    fetchUserRole();
    const loadUnreadMessages = async () => {
      const count = await fetchUnreadMessages();
      setUnreadMessages(count);
    };
    loadUnreadMessages();
  }, []);

  useEffect(() => {
    const interval = setInterval(async () => {
      const count = await fetchUnreadMessages();
      setUnreadMessages(count);
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (location.state?.section) {
      setSection(location.state.section);
    }
  }, [location.state]);

  const renderSection = () => {
    switch (section) {
      case 'vue-globale': return <VueGlobale />;
      case 'add-propertie': return <AjouterBien />;
      case 'mes-biens': return <MesBiens />;
      case 'preferences': return <MesPreferences />;
      case 'campagnes': return <CampagnesAds />;
      case 'visites': return <Visites />;
      case 'messagerie': return <Messagerie />;
      case 'profil': return <Profil />;
      case 'abonnements': return <Abonnements />;
      default: return <VueGlobale />;
    }
  };

  const renderMenuItems = () => {
    if (userRole === 'bailleur') {
      return (
        <>
          <li onClick={() => setSection('vue-globale')}>🏠 Vue d'ensemble</li>
          <li onClick={() => setSection('profil')}>👤 Mon Profil</li>
          <li onClick={() => setSection('add-propertie')}>🏠 Ajouter une maison</li>
          <li onClick={() => setSection('mes-biens')}>📋 Mes biens</li>
          <li onClick={() => setSection('campagnes')}>📬 Publicités encours</li>
          <li onClick={() => setSection('visites')}>👥 Mes visites</li>
          <li onClick={() => setSection('messagerie')} className="messagerie-item">
            💬 Messagerie
            {unreadMessages > 0 && <span className="unread-badge">{unreadMessages}</span>}
          </li>
          <li onClick={() => setSection('abonnements')}>🏆 Mes Abonnements</li>
        </>
      );
    }

    if (userRole === 'client') {
      return (
        <>
          <li onClick={() => setSection('profil')}>👤 Mon Profil</li>
          <li onClick={() => setSection('preferences')}>❤️ Mes préférences</li>
          <li onClick={() => setSection('campagnes')}>📬 Publicités encours</li>
          <li onClick={() => setSection('messagerie')} className="messagerie-item">
            💬 Messagerie
            {unreadMessages > 0 && <span className="unread-badge">{unreadMessages}</span>}
          </li>
          <li onClick={() => setSection('abonnements')}>🏆 Mes Abonnements</li>
        </>
      );
    }
    return null;
  };

  if (loadingRole) return <div>Chargement...</div>;

  // Vérification expiration (optionnel)
  const now = new Date();
  const proActive = isPro && proExpires && new Date(proExpires) > now;
  const vipActive = isVip && vipExpires && new Date(vipExpires) > now;

  // 🔹 Sections qui nécessitent VIP ou PRO
  const protectedSections = ['vue-globale','visites','messagerie','mes-biens' ]; 


  return (
    <div className="bailleur-dashboard">
      <div className="bailleur-dashboard__container">
        <aside className="bailleur-dashboard__sidebar">
          <ul>{renderMenuItems()}</ul>
        </aside>

        <main className="bailleur-dashboard__main">
          <div className="section-wrapper">
            {renderSection()}

            {/* 🔐 Overlay si ni PRO ni VIP actifs */}
            {protectedSections.includes(section) && !(proActive || vipActive) && (
              <div className="locked-overlay">
                <div className="locked-message">
                  Vous devez avoir un abonnement <strong>VIP</strong> ou <strong>PRO</strong>
                  pour accéder aux données analytiques.
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default BailleurDashboard;
