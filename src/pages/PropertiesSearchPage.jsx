import { useEffect, useState } from "react";
import { useLocation, Link } from "react-router-dom";
import axios from "axios";
import "./PropertiesSearchPage.css";

export default function PropertiesSearchPage() {
  const [properties, setProperties] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const location = useLocation();

  // Récupération des paramètres de recherche depuis l'URL
  const params = new URLSearchParams(location.search);
  const query = params.get("query") || "";
  const quartier = params.get("quartier") || "";
  const ville = params.get("ville") || "";
  const budget = params.get("max_budget") || "";

  console.log("Paramètres de recherche :", { query, quartier, ville, budget });

  // Fonction pour corriger les URLs d'image
  const fixUrl = (url) => {
    if (!url) return '/placeholder-property.jpg';
    return url.startsWith("http") 
      ? url 
      : `https://allo-bailleur-backend-1.onrender.com/${url.replace(/^\/?/, '')}`;
  };

  const handleSearch = async () => {
    setIsLoading(true);
    setError(null);
    console.log("Lancement de la recherche...");

    try {
      // Construction dynamique des filtres
      const filters = {
        ...(query && { query }),
        ...(quartier && { quartier }),
        ...(ville && { ville }),
        ...(budget && { max_budget: budget })
      };

      console.log("Filtres envoyés à l'API :", filters);

      const res = await axios.get("https://allo-bailleur-backend-1.onrender.com/properties/", {
        params: filters,
        paramsSerializer: params =>
          Object.entries(params)
            .filter(([_, value]) => value !== "")
            .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
            .join("&"),
      });

      console.log("Réponse de l'API :", res.data);
      setProperties(res.data);
    } catch (err) {
      console.error("Erreur lors de la recherche:", err);
      setError("Une erreur est survenue lors de la recherche");
      setProperties([]);
    } finally {
      setIsLoading(false);
      console.log("Recherche terminée");
    }
  };

  // Relancer la recherche à chaque changement d'URL
  useEffect(() => {
    handleSearch();
  }, [location.search]);

  if (isLoading) {
    return (
      <div className="properties-search-loading">
        <div className="properties-search-spinner"></div>
        <p>Recherche en cours...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="properties-search-error">
        <div className="properties-search-error-message">{error}</div>
      </div>
    );
  }

  return (
    <div className="properties-search-container">
      <div className="properties-search-header">
        <h1 className="properties-search-title">Résultats de recherche</h1>
        <div className="properties-search-filters">
          {query && <span className="properties-search-filter">{query}</span>}
          {quartier && <span className="properties-search-filter">Quartier: {quartier}</span>}
          {ville && <span className="properties-search-filter">Ville: {ville}</span>}
          {budget && <span className="properties-search-filter">Budget max: {parseInt(budget).toLocaleString()} FCFA</span>}
        </div>
      </div>

      {properties.length === 0 ? (
        <div className="properties-search-empty">
          <h2 className="properties-search-empty-title">Aucun résultat trouvé</h2>
          <p className="properties-search-empty-text">Essayez de modifier vos critères de recherche</p>
        </div>
      ) : (
      <div className="properties-search-grid">
        {properties.map((property) => {
          console.log("Propriété affichée :", property);
          const images = property.images || [];

          return (
            <Link to={`/properties/${property.id}`} key={property.id} className="properties-search-card">
              <div className="properties-search-image-container">
                {images.length > 0 ? (
                  images.map((img, index) => (
                    <img
                      key={index}
                      src={fixUrl(img.url)}
                      alt={`Image ${index + 1}`}
                      className="properties-search-image"
                      onError={(e) => { e.target.src = '/placeholder-property.jpg'; }}
                    />
                  ))
                ) : (
                  <img
                    src="/placeholder-property.jpg"
                    alt="Aucune image"
                    className="properties-search-image"
                  />
                )}
              </div>

              <div className="properties-search-content">
                <h3 className="properties-search-property-title">{property.description || "Sans titre"}</h3>
                <div className="properties-search-location">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                    <circle cx="12" cy="10" r="3"></circle>
                  </svg>
                  {property.quartier || "N/A"} - {property.ville || "N/A"}
                </div>
                <div className="properties-search-price">
                  {property.budget ? parseInt(property.budget).toLocaleString() : "N/A"} FCFA / mois
                </div>
                <div className="properties-search-details">
                  <span>{property.surface || 'N/A'} m²</span>
                  <span>{property.rooms || 'N/A'} pièces</span>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
      )}
    </div>
  );
}