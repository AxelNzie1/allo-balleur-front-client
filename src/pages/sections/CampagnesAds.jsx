import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { format, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';
import "./CampagnesAds.css";

const CampagnesAds = () => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    start_date: format(new Date(), 'yyyy-MM-dd'),
    duration_days: 7,
    redirect_url: '',
    images: []
  });
  const [currentUser, setCurrentUser] = useState(null);
  const [userTokens, setUserTokens] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [userAds, setUserAds] = useState([]);
  const navigate = useNavigate();

  // Récupérer les données utilisateur et publicités
  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          navigate('/login');
          return;
        }

        const headers = { Authorization: `Bearer ${token}` };
        
        const [userRes, adsRes, tokensRes] = await Promise.all([
          axios.get('https://allo-bailleur-backend-1.onrender.com/users/me', { headers }),
          axios.get('https://allo-bailleur-backend-1.onrender.com/ads/my-ads', { headers }),
          axios.get('https://allo-bailleur-backend-1.onrender.com/tokens/balance', { headers })
        ]);

        setCurrentUser(userRes.data);
        setUserTokens(tokensRes.data.balance);
        setUserAds(adsRes.data);
      } catch (err) {
        if (err.response?.status === 401) {
          localStorage.removeItem('token');
          navigate('/login');
        } else {
          setError(err.response?.data?.detail || 'Erreur lors du chargement des données');
        }
      }
    };

    fetchData();
  }, [navigate]);

  // Calculer la date de fin automatiquement
  useEffect(() => {
    if (formData.start_date && formData.duration_days) {
      const startDate = new Date(formData.start_date);
      const endDate = new Date(startDate);
      endDate.setDate(startDate.getDate() + parseInt(formData.duration_days) - 1);
      
      setFormData(prev => ({
        ...prev,
        end_date: format(endDate, 'yyyy-MM-dd')
      }));
    }
  }, [formData.start_date, formData.duration_days]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    const data = new FormData();
    data.append('title', formData.title);
    data.append('description', formData.description);
    data.append('start_date', formData.start_date);
    data.append('duration_days', formData.duration_days);
    data.append('redirect_url', formData.redirect_url);
    
    for (let i = 0; i < formData.images.length; i++) {
      data.append('images', formData.images[i]);
    }

    try {
      const response = await axios.post('https://allo-bailleur-backend-1.onrender.com/ads/', data, {
        headers: { 
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      alert('Publicité créée avec succès ! En attente de validation.');
      setUserAds([...userAds, response.data]);
      setFormData({
        title: '',
        description: '',
        start_date: format(new Date(), 'yyyy-MM-dd'),
        duration_days: 7,
        redirect_url: '',
        images: []
      });
    } catch (err) {
      setError(err.response?.data?.detail || 'Erreur lors de la création');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    setFormData(prev => ({ ...prev, images: Array.from(e.target.files) }));
  };

  const handleDeleteAd = async (adId) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette publicité ?')) {
      try {
        await axios.delete(`https://allo-bailleur-backend-1.onrender.com/ads/${adId}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        setUserAds(userAds.filter(ad => ad.id !== adId));
        alert('Publicité supprimée avec succès');
      } catch (err) {
        setError(err.response?.data?.detail || 'Erreur lors de la suppression');
      }
    }
  };

  if (!currentUser) {
    return <div className="loading">Chargement des données utilisateur...</div>;
  }

  return (
    <div className="campagnes-ads">
      <h1>Gestion des publicités</h1>
      <div className="user-info">
        Connecté en tant que {currentUser.email} 
        <span className={`role-badge ${currentUser.role}`}>{currentUser.role}</span>
        - Solde: {userTokens} tokens
      </div>
      
      {error && <div className="error-message">{error}</div>}

      <div className="ads-sections">
        {/* Section création de publicité */}
        <section className="create-ad-section">
          <h2>Créer une nouvelle publicité</h2>
          <form onSubmit={handleSubmit} className="ad-form">
            <div className="form-group">
              <label>Titre de la publicité:</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
                placeholder="Titre attractif"
              />
            </div>

            <div className="form-group">
              <label>Description:</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                required
                placeholder="Description détaillée de votre offre"
                rows="3"
              />
            </div>

            <div className="form-group">
              <label>Date de début:</label>
              <input
                type="date"
                name="start_date"
                value={formData.start_date}
                onChange={handleChange}
                required
                min={format(new Date(), 'yyyy-MM-dd')}
              />
            </div>

            <div className="form-group">
              <label>Durée (jours):</label>
              <input
                type="number"
                name="duration_days"
                value={formData.duration_days}
                onChange={handleChange}
                min="1"
                max="30"
                required
              />
            </div>

            <div className="form-group">
              <label>Date de fin calculée:</label>
              <input
                type="date"
                value={formData.end_date || ''}
                readOnly
                className="read-only"
              />
            </div>

            <div className="form-group">
              <label>URL de redirection:</label>
              <input
                type="url"
                name="redirect_url"
                value={formData.redirect_url}
                onChange={handleChange}
                required
                placeholder="https://example.com"
              />
            </div>

            <div className="form-group">
              <label>Images (1-3):</label>
              <input
                type="file"
                multiple
                onChange={handleFileChange}
                accept="image/*"
                required
              />
              <small>Formats acceptés: JPG, PNG, WEBP. Max 2MB par image.</small>
            </div>

            <div className="cost-estimation">
              <h3>Estimation du coût</h3>
              <p>{formData.duration_days} jours × 1 token/jour = {formData.duration_days} tokens</p>
            </div>

            <button 
              type="submit" 
              disabled={loading || (userTokens < formData.duration_days)}
              className="submit-btn"
            >
              {loading ? 'Envoi en cours...' : 'Créer la publicité'}
              {userTokens < formData.duration_days && ' (Solde insuffisant)'}
            </button>
          </form>
        </section>

        {/* Section des publicités utilisateur */}
        <section className="user-ads-section">
          <h2>Vos publicités ({userAds.length})</h2>
          
          {userAds.length === 0 ? (
            <p className="no-ads">Vous n'avez aucune publicité pour le moment</p>
          ) : (
            <div className="ads-grid">
              {userAds.map(ad => (
                <div key={ad.id} className={`ad-card ${ad.status}`}>
                  <div className="ad-header">
                    <h3>{ad.title}</h3>
                    <span className={`status-badge ${ad.status}`}>{ad.status}</span>
                  </div>
                  
                  {ad.images?.[0]?.url && (
                    <img 
                      src={`https://allo-bailleur-backend-1.onrender.com${ad.images[0].url}`} 
                      alt="Publicité" 
                      className="ad-image"
                    />
                  )}
                  
                  <div className="ad-details">
                    <p className="ad-description">{ad.description}</p>
                    
                    <div className="ad-meta">
                      <div className="ad-dates">
                        {format(parseISO(ad.start_date), 'dd MMM yyyy', { locale: fr })} - {format(parseISO(ad.end_date), 'dd MMM yyyy', { locale: fr })}
                      </div>
                      <div className="ad-cost">{ad.price || 0} tokens</div>
                    </div>
                    
                    {ad.status === 'rejected' && ad.rejection_reason && (
                      <div className="rejection-reason">
                        <strong>Raison du rejet:</strong> {ad.rejection_reason}
                      </div>
                    )}
                    
                    <div className="ad-actions">
                      {ad.status === 'approved' && (
                        <button 
                          onClick={() => window.open(ad.redirect_url, '_blank')}
                          className="action-btn view-btn"
                        >
                          Voir
                        </button>
                      )}
                      <button 
                        onClick={() => handleDeleteAd(ad.id)}
                        className="action-btn delete-btn"
                      >
                        Supprimer
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default CampagnesAds;