import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import './ModifierBien.css';

const API = "https://allo-bailleur-backend-1.onrender.com";

const ModifierBien = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [images, setImages] = useState([]);
  const [newImages, setNewImages] = useState([]);
  
  const [formData, setFormData] = useState({
    type: '',
    description: '',
    ville: '',
    quartier: '',
    pays: '',
    surface: '',
    budget: '',
    status: 'DISPONIBLE'
  });

  useEffect(() => {
    const fetchBien = async () => {
      try {
        const res = await axios.get(`${API}/properties/${id}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        });
        
        const { images, ...propertyData } = res.data;
        setFormData({
          type: propertyData.type || '',
          description: propertyData.description || '',
          ville: propertyData.ville || '',
          quartier: propertyData.quartier || '',
          pays: propertyData.pays || '',
          surface: propertyData.surface || '',
          budget: propertyData.budget || '',
          status: propertyData.status || 'DISPONIBLE'
        });
        
        setImages(images || []);
        setLoading(false);
      } catch (err) {
        setError('Erreur lors du chargement du bien');
        setLoading(false);
      }
    };

    fetchBien();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageChange = (e) => {
    setNewImages([...e.target.files]);
  };

  const removeImage = (index) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const data = new FormData();
      
      // Ajouter les champs du formulaire
      Object.entries(formData).forEach(([key, value]) => {
        data.append(key, value);
      });
      
      // Ajouter les nouvelles images
      newImages.forEach((image) => {
        data.append('images', image);
      });
      
      await axios.put(`${API}/properties/${id}`, data, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      
      alert('Bien mis à jour avec succès!');
      navigate('/mes-biens');
    } catch (err) {
      console.error('Erreur:', err);
      alert('Erreur lors de la mise à jour du bien');
    }
  };

  if (loading) return <div className="loading">Chargement en cours...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="modifier-bien-container">
      <h2>Modifier le bien immobilier</h2>
      
      <form onSubmit={handleSubmit} className="modifier-bien-form">
        <div className="form-section">
          <h3>Informations générales</h3>
          
          <div className="form-group">
            <label>Type de bien</label>
            <select
              name="type"
              value={formData.type}
              onChange={handleChange}
              required
            >
              <option value="">Sélectionnez un type</option>
              <option value="Appartement">Appartement</option>
              <option value="Maison">Maison</option>
              <option value="Villa">Villa</option>
              <option value="Studio">Studio</option>
              <option value="Chambre">Chambre</option>
            </select>
          </div>
          
          <div className="form-group">
            <label>Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
              rows="4"
            />
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label>Ville</label>
              <input
                type="text"
                name="ville"
                value={formData.ville}
                onChange={handleChange}
                required
              />
            </div>
            
            <div className="form-group">
              <label>Quartier</label>
              <input
                type="text"
                name="quartier"
                value={formData.quartier}
                onChange={handleChange}
                required
              />
            </div>
          </div>
          
          <div className="form-group">
            <label>Pays</label>
            <input
              type="text"
              name="pays"
              value={formData.pays}
              onChange={handleChange}
              required
            />
          </div>
        </div>
        
        <div className="form-section">
          <h3>Caractéristiques</h3>
          
          <div className="form-row">
            <div className="form-group">
              <label>Surface (m²)</label>
              <input
                type="number"
                name="surface"
                value={formData.surface}
                onChange={handleChange}
                min="1"
                required
              />
            </div>
            
            <div className="form-group">
              <label>Budget (€)</label>
              <input
                type="number"
                name="budget"
                value={formData.budget}
                onChange={handleChange}
                min="1"
                required
              />
            </div>
          </div>
          
          <div className="form-group">
            <label>Statut</label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              required
            >
              <option value="DISPONIBLE">Disponible</option>
              <option value="OCCUPE">Occupé</option>
            </select>
          </div>
        </div>
        
        <div className="form-section">
          <h3>Images</h3>
          
          <div className="current-images">
            <h4>Images actuelles</h4>
            {images.length > 0 ? (
              <div className="images-grid">
                {images.map((image, index) => (
                  <div key={index} className="image-item">
                    <img 
                      src={`${API}/${image.url}`} 
                      alt={`Bien ${index}`} 
                    />
                    <button 
                      type="button" 
                      onClick={() => removeImage(index)}
                      className="remove-image-btn"
                    >
                      Supprimer
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p>Aucune image disponible</p>
            )}
          </div>
          
          <div className="form-group">
            <label>Ajouter de nouvelles images</label>
            <input
              type="file"
              onChange={handleImageChange}
              multiple
              accept="image/*"
            />
            <small>Vous pouvez sélectionner plusieurs images</small>
          </div>
        </div>
        
        <div className="form-actions">
          <button type="button" onClick={() => navigate('/mes-biens')} className="cancel-btn">
            Annuler
          </button>
          <button type="submit" className="submit-btn">
            Enregistrer les modifications
          </button>
        </div>
      </form>
    </div>
  );
};

export default ModifierBien;