import Card from "@/components/ui/card";
import { Link } from "react-router-dom";
import {
  Star,
  Heart,
  Bed,
  Bath,
  Ruler,
} from "lucide-react";
import "./PropertyCard.css";

const getImageUrl = (url) => {
  return url?.startsWith("http") ? url : `https://allo-bailleur-backend-1.onrender.com/${url}`;
};

const PropertyCard = ({ property }) => {
  return (
    <Link to={`/properties/${property.id}`} className="property-card">
      <Card className="property-card-container">
        {/* Badge En vedette */}
        {property.is_promoted && (
          <span className="promoted-badge">
            <Star className="icon text-white" /> En vedette
          </span>
        )}


        {/* Image principale */}
        <div className="property-card-image-container">
          <img
            src={getImageUrl(property.images?.[0]?.url)}
            alt={property.type}
            className="property-card-image"
          />
        </div>

        {/* Notes et likes */}
        <div className="property-card-stats">
        <span className="rating">
          <Star className="icon" style={{ color: '#facc15' }} /> {/* Or */}
          {property.average_rating?.toFixed(1) ?? "—"} / 5
        </span>
        <span className="likes">
          <Heart className="icon" style={{ color: '#e11d48' }} /> {/* Rouge vif */}
          {property.like_count ?? 0}
        </span>

        </div>

        {/* Détails */}
        <div className="property-card-details">
          <h3 className="property-card-title">{property.description}</h3>
          <p className="property-card-location">
            {property.quartier}  •  {property.ville}  • {property.pays}
          </p>
          <p className="property-card-price">
            {Number(property.budget).toLocaleString()} FCFA / mois
          </p>

          {/* Infos clés */}
          <div className="property-card-info">
            {property.nb_chambres !== undefined && (
              <span className="info-item">
                <Bed className="icon" /> {property.nb_chambres} ch.
              </span>
            )}
            {property.nb_salles_bain !== undefined && (
              <span className="info-item">
                <Bath className="icon" /> {property.nb_salles_bain} sdb
              </span>
            )}
            {property.surface !== undefined && (
              <span className="info-item">
                <Ruler className="icon" /> {property.surface} m²
              </span>
            )}
          </div>
        </div>
      </Card>
    </Link>
  );
};

export default PropertyCard;
