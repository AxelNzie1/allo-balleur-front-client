import React, { useState, useEffect } from "react";
import axios from "axios";
import "./BailleurProfil.css";

const API = "https://allo-bailleur-backend-1.onrender.com";

const ProBenefitsNotification = () => {
  const benefits = [
    "📈 Votre bien est 3x plus visible avec l'offre Pro",
    // "✨ Description optimisée automatiquement par IA", // SECTION IA COMMENTÉE
    "🏆 Badge 'Pro' pour plus de crédibilité",
    "📊 Statistiques détaillées sur vos annonces",
    "🚀 Mise en avant dans les résultats de recherche"
  ];

  const [currentBenefit, setCurrentBenefit] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setCurrentBenefit((prev) => (prev + 1) % benefits.length);
        setVisible(true);
      }, 500);
    }, 5000);

    return () => clearInterval(interval);
  }, [benefits.length]);

  return (
    <div className={`pro-benefit-notification ${visible ? 'visible' : ''}`}>
      <div className="pro-benefit-content">
        <span className="pro-badge">PRO</span>
        {benefits[currentBenefit]}
      </div>
    </div>
  );
};

const AjouterBien = () => {
  const [formData, setFormData] = useState({
    description: "",
    pays: "",
    ville: "",
    quartier: "",
    type: "",
    budget: "",
    surface: "",
  });

  const [images, setImages] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  // const [useAI, setUseAI] = useState(false); // SECTION IA COMMENTÉE
  const [showBenefits, setShowBenefits] = useState(true);
  // const [isGenerating, setIsGenerating] = useState(false); // SECTION IA COMMENTÉE

  // 🔹 SECTION IA - COMMENTÉE POUR DÉSACTIVER LA GÉNÉRATION AUTOMATIQUE
  /*
  const handleGenerateWithAI = async () => {
    if (images.length === 0) {
      alert("Veuillez ajouter au moins une image avant de générer la description");
      return;
    }
  
    setIsGenerating(true);
    try {
      const formDataToSend = new FormData();
  
      // Ajouter toutes les données du formulaire même si elles sont vides
      Object.entries(formData).forEach(([key, value]) => {
        formDataToSend.append(key, value || "");
      });
  
      // Ajouter les images
      images.forEach((image) => {
        formDataToSend.append("images", image);
      });
  
      const res = await axios.post(
        `${API}/properties/create-with-ai?preview=true`,
        formDataToSend,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
  
      if (res.data?.description) {
        setFormData((prev) => ({
          ...prev,
          description: res.data.description,
        }));
        alert("Description générée par l'IA !");
      }
    } catch (err) {
      console.error("Erreur génération IA :", err);
      alert("Erreur lors de la génération avec l'IA");
    } finally {
      setIsGenerating(false);
    }
  };
  */
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files).slice(0, 10);
    const maxSizeMB = 5;
    const filteredFiles = files.filter((file) => file.size / 1024 / 1024 <= maxSizeMB);
    
    if (filteredFiles.length < files.length) {
      alert(`Certaines images ont été ignorées car elles dépassent ${maxSizeMB} Mo.`);
    }
    setImages(filteredFiles);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (images.length === 0) {
      alert("Veuillez ajouter au moins une image");
      return;
    }

    setIsSubmitting(true);

    try {
      const formDataToSend = new FormData();
      
      Object.entries(formData).forEach(([key, value]) => {
        if (value !== "" && value !== null && value !== undefined) {
          formDataToSend.append(key, value);
        }
      });

      images.forEach((image) => {
        formDataToSend.append("images", image);
      });

      // SECTION IA COMMENTÉE - Utilisation du endpoint standard
      // const endpoint = useAI 
      //   ? `${API}/properties/create-with-ai`
      //   : `${API}/properties/create`;

      const endpoint = `${API}/properties/create`;

      await axios.post(endpoint, formDataToSend, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      alert("Bien publié avec succès !");
      
    } catch (err) {
      console.error("Erreur lors de la publication :", err);
      let errorMessage = "Erreur lors de la publication";
      if (err.response) {
        if (err.response.status === 403) {
          errorMessage = err.response.data.detail || "Action non autorisée";
        } else if (err.response.data?.detail) {
          errorMessage = err.response.data.detail;
        }
      }
      alert(`⚠️ ${errorMessage}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="ajouter-bien-container">
      <div className="ajouter-bien-card">
        <h2 className="ajouter-bien-title">Ajouter un nouveau bien</h2>
        
        <form onSubmit={handleSubmit} className="ajouter-bien-form">
          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea
              name="description"
              placeholder="Décrivez votre bien en détail..."
              value={formData.description}
              onChange={handleChange}
              rows={6}
              className="form-textarea"
              required
            />
          </div>

          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">Pays</label>
              <input
                type="text"
                name="pays"
                placeholder="France"
                value={formData.pays}
                onChange={handleChange}
                className="form-input"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Ville</label>
              <input
                type="text"
                name="ville"
                placeholder="Paris"
                value={formData.ville}
                onChange={handleChange}
                className="form-input"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Quartier</label>
              <input
                type="text"
                name="quartier"
                placeholder="Le Marais"
                value={formData.quartier}
                onChange={handleChange}
                className="form-input"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Type de bien</label>
              <select
                name="type"
                value={formData.type}
                onChange={handleChange}
                className="form-select"
                required
              >
                <option value="">Sélectionnez un type</option>
                <option value="appartement">Appartement</option>
                <option value="chambre">Chambre</option>
                <option value="villa">Villa</option>
                <option value="local commercial">Local commercial</option>
                <option value="terrain">Terrain</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Budget (€)</label>
              <input
                type="number"
                name="budget"
                placeholder="250000"
                value={formData.budget}
                onChange={handleChange}
                className="form-input"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Surface (m²)</label>
              <input
                type="number"
                name="surface"
                placeholder="75"
                value={formData.surface}
                onChange={handleChange}
                className="form-input"
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Images du bien (max 10)</label>
            <div className="file-upload">
              <label className="file-upload-label">
                <input
                  type="file"
                  name="images"
                  accept="image/*"
                  multiple
                  onChange={handleFileChange}
                  className="file-upload-input"
                  required
                />
                <span className="file-upload-button">Choisir des fichiers</span>
                <span className="file-upload-text">
                  {images.length > 0 
                    ? `${images.length} fichier(s) sélectionné(s)` 
                    : "Aucun fichier sélectionné"}
                </span>
              </label>
            </div>
          </div>

          {/* SECTION IA COMMENTÉE - Checkbox et bouton de génération IA
          <div className="form-group-checkbox">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={useAI}
                onChange={(e) => setUseAI(e.target.checked)}
                className="checkbox-input"
              />

              <span className="checkbox-custom"></span>
              <span className="checkbox-text">
                Utiliser l'IA pour optimiser la description (abonnés Pro)
              </span>
            </label>
          </div>
          {useAI && (
            <button
              type="button"
              onClick={handleGenerateWithAI}
              disabled={isGenerating}
              className="generate-ai-button"
            >
              {isGenerating ? "Génération..." : "Générer avec l'IA"}
            </button>
          )}
          */}

          <button
            type="submit"
            disabled={isSubmitting}
            className="submit-button"
          >
            {isSubmitting ? (
              <span className="button-loader"></span>
            ) : (
              "Publier le bien"
            )}
          </button>
        </form>
      </div>

      {showBenefits && <ProBenefitsNotification />}

      <style jsx>{`
        .ajouter-bien-container {
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 100vh;
          background: linear-gradient(135deg, #fafafa 0%, #f5f5f5 100%);
          padding: 2rem;
          position: relative;
        }

        .ajouter-bien-card {
          width: 100%;
          max-width: 1280px;
          background: white;
          border-radius: 20px;
        
          border: 2px solid #ffe6f2;
          padding: 2.5rem;
          margin: 2rem 0;
        }

        .ajouter-bien-title {
          font-size: 2rem;
          font-weight: 700;
          background: linear-gradient(135deg, #FF0086 0%, #FF6B9C 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          margin-bottom: 2rem;
          text-align: center;
        }

        .ajouter-bien-form {
          display: flex;
          flex-direction: column;
          gap: 1.8rem;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 0.8rem;
        }

        .form-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 1.8rem;
        }

        .form-label {
          font-size: 1rem;
          font-weight: 600;
          color: #444;
        }

        .form-input, .form-select, .form-textarea {
          padding: 1rem 1.2rem;
          border: 2px solid #e0e0e0;
          border-radius: 12px;
          font-size: 1rem;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          background-color: #fafafa;
        }

        .form-input:focus, .form-select:focus, .form-textarea:focus {
          outline: none;
          border-color: #FF0086;
          box-shadow: 0 0 0 4px rgba(255, 0, 134, 0.15);
          background-color: white;
        }

        .form-textarea {
          min-height: 140px;
          resize: vertical;
          line-height: 1.6;
        }

        .form-select {
          appearance: none;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' fill='%23FF0086' viewBox='0 0 16 16'%3E%3Cpath d='M7.247 11.14 2.451 5.658C1.885 5.013 2.345 4 3.204 4h9.592a1 1 0 0 1 .753 1.659l-4.796 5.48a1 1 0 0 1-1.506 0z'/%3E%3C/svg%3E");
          background-repeat: no-repeat;
          background-position: right 1rem center;
          background-size: 16px 12px;
        }

        .file-upload {
          position: relative;
        }

        .file-upload-label {
          display: flex;
          flex-direction: column;
          gap: 0.8rem;
        }

        .file-upload-input {
          position: absolute;
          width: 1px;
          height: 1px;
          padding: 0;
          margin: -1px;
          overflow: hidden;
          clip: rect(0, 0, 0, 0);
          white-space: nowrap;
          border-width: 0;
        }

        .file-upload-button {
          display: inline-block;
          padding: 1rem 1.2rem;
          background: linear-gradient(135deg, #f8f8f8 0%, #f0f0f0 100%);
          border: 2px dashed #cbd5e1;
          border-radius: 12px;
          font-size: 1rem;
          color: #666;
          text-align: center;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .file-upload-button:hover {
          background: linear-gradient(135deg, #f0f0f0 0%, #e8e8e8 100%);
          border-color: #FF0086;
        }

        .file-upload-text {
          font-size: 0.9rem;
          color: #888;
        }

        .submit-button {
          padding: 1.2rem 2rem;
          background: linear-gradient(135deg, #FF0086 0%, #FF6B9C 100%);
          color: white;
          font-size: 1.1rem;
          font-weight: 700;
          border: none;
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 0.8rem;
          box-shadow: 0 8px 25px rgba(255, 0, 134, 0.3);
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .submit-button:hover:not(:disabled) {
          transform: translateY(-3px);
          box-shadow: 0 12px 30px rgba(255, 0, 134, 0.4);
        }

        .submit-button:disabled {
          background: linear-gradient(135deg, #cccccc 0%, #aaaaaa 100%);
          cursor: not-allowed;
          transform: none;
          box-shadow: none;
        }

        .button-loader {
          width: 20px;
          height: 20px;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-radius: 50%;
          border-top-color: white;
          animation: spin 1s ease-in-out infinite;
        }

        .pro-benefit-notification {
          position: fixed;
          bottom: 2rem;
          right: 2rem;
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(10px);
          border-radius: 16px;
          padding: 1rem 1.2rem;
          box-shadow: 0 10px 30px rgba(255, 0, 134, 0.2);
          border: 2px solid rgba(255, 0, 134, 0.2);
          transform: translateY(20px);
          opacity: 0;
          transition: all 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55);
          z-index: 1000;
          max-width: 320px;
        }
        
        .pro-benefit-notification.visible {
          transform: translateY(0);
          opacity: 1;
        }
        
        .pro-benefit-content {
          display: flex;
          align-items: center;
          gap: 0.8rem;
          font-size: 0.9rem;
          color: #333;
          font-weight: 500;
        }
        
        .pro-badge {
          background: linear-gradient(135deg, #FF0086 0%, #FF6B9C 100%);
          color: white;
          font-weight: 700;
          font-size: 0.75rem;
          padding: 0.25rem 0.5rem;
          border-radius: 6px;
          text-transform: uppercase;
          letter-spacing: 0.8px;
          box-shadow: 0 2px 8px rgba(255, 0, 134, 0.3);
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        @media (max-width: 768px) {
          .ajouter-bien-card {
            padding: 2rem;
          }
          
          .form-grid {
            grid-template-columns: 1fr;
            gap: 1.5rem;
          }

          .pro-benefit-notification {
            bottom: 1rem;
            right: 1rem;
            max-width: calc(100% - 2rem);
          }

          .ajouter-bien-title {
            font-size: 1.7rem;
          }
        }

        @media (max-width: 480px) {
          .ajouter-bien-container {
            padding: 1rem;
          }
          
          .ajouter-bien-card {
            padding: 1.5rem;
          }

          .form-input, .form-select, .form-textarea {
            padding: 0.9rem;
          }

          .submit-button {
            padding: 1rem 1.5rem;
            font-size: 1rem;
          }
        }
      `}</style>
    </div>
  );
};

export default AjouterBien;