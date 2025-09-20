import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { Loader, Lightbulb } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import PropertyCard from "@/components/ui/PropertyCard";
import "./HomePage.css";
import Support from "./sections/Support";

export default function HomePage() {
  const [properties, setProperties] = useState([]);
  const [ads, setAds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentAdIndex, setCurrentAdIndex] = useState(0);
  const [funFact, setFunFact] = useState("");
  const [trackingLoading, setTrackingLoading] = useState(false);
  const [showPopupWarning, setShowPopupWarning] = useState(false);

  // 🔹 Ref layout pour padding dynamique
  const layoutRef = useRef(null);
  const [headerHeight, setHeaderHeight] = useState(0);

  useEffect(() => {
    const updatePadding = () => {
      const headerEl = document.querySelector(".airbnb-header");
      if (headerEl && layoutRef.current) {
        const height = headerEl.getBoundingClientRect().height;
        setHeaderHeight(height + 20); // 20px d'espace supplémentaire
      }
    };
    updatePadding();
    window.addEventListener("resize", updatePadding);
    return () => window.removeEventListener("resize", updatePadding);
  }, []);

  const funFactsList = [
    "Signalez tout de suite Un bailleur qui vous demande des frais de visite et de commissions",
    "Vérifiez l'état des meubles et équipements avant de signer.",
    "Inspectez l'électricité et la plomberie pour éviter les surprises.",
    "Privilégiez une maison bien exposée et ventilée.",
    "Toutes les reservations de maison se font via le compte bancaire de la plateforme ALLO-Bailleur! ou via debit de tokens (CLIENT VIP)",
    "En saison de pluie, vérifiez l'étanchéité du toit et les risques d'inondation.",
    "En saison sèche, contrôlez la qualité de l'eau et l'humidité des murs.",
    "Testez la pression d'eau et le fonctionnement des sanitaires.",
    "Assurez-vous que toutes les portes et fenêtres ferment correctement.",
    "Vérifiez l'état du sol : fissures ou taches suspectes.",
    "Lisez attentivement le contrat avant de signer.",
    "les Clients VIP et le Bailleur PRO beneficient de nombreux avantages... Profitez en",
    "N'hesitez pas à sollicité l'expertises des equipes d'allo-bailleur pour vos acquistions immobilières",
    "Demandez un état des lieux précis pour éviter les litiges.",
    "Conservez toutes les preuves de paiement et communications.",
    "Assurez-vous que la maison respecte les normes de sécurité.",
    "Signalez les bailleurs ou annonces frauduleuses.",
    "Signalez tous bailleur qui vous demande des paiements avant visite.",
    "Pour une meilleure collaboration, Vérifiez la réputation du bailleur auprès des anciens locataires.",
    "Prenez toujours un contrat écrit et détaillé.",
    "Vérifiez les rangements et espaces disponibles pour vos meubles.",
    "Testez les appareils électroménagers inclus.",
    "Allo-Bailleur ne repont pas d'une reservation de maison faites en dehors de sa plateforme",
    "Notez les voisins et l'environnement pour la sécurité et le confort.",
    "Préparez une checklist pour chaque visite : murs, plomberie, électricité, toiture, meubles."
  ];

  // Animation fun fact automatique
  useEffect(() => {
    if (funFactsList.length === 0) return;
    let index = 0;
    let timeout;
    const showNextFunFact = () => {
      setFunFact(funFactsList[index]);
      timeout = setTimeout(() => {
        setFunFact("");
        timeout = setTimeout(() => {
          index = (index + 1) % funFactsList.length;
          showNextFunFact();
        }, 10000);
      }, 5000);
    };
    showNextFunFact();
    return () => clearTimeout(timeout);
  }, []);

  // Chargement des propriétés et annonces
  useEffect(() => {
    async function loadData() {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem("token");
        const headers = token ? { Authorization: `Bearer ${token}` } : {};

        const [feedRes, adsRes] = await Promise.all([
          axios.get("https://allo-bailleur-backend-1.onrender.com/properties/feed", { headers }),
          axios.get("https://allo-bailleur-backend-1.onrender.com/ads/"),
        ]);

        const sortedProperties = [...feedRes.data].sort((a, b) => b.is_promoted - a.is_promoted);
        setProperties(Array.isArray(sortedProperties) ? sortedProperties : []);
        setAds(Array.isArray(adsRes.data) ? adsRes.data : []);
      } catch (err) {
        console.error("Erreur loadData :", err);
        setError(
          err.response?.status === 401
            ? "Veuillez vous reconnecter pour voir vos recommandations."
            : "Erreur lors du chargement des données."
        );
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // Changement automatique des annonces
  useEffect(() => {
    if (ads.length > 1) {
      const interval = setInterval(() => {
        setCurrentAdIndex((prev) => (prev + 1) % ads.length);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [ads]);

  return (
    <div
      ref={layoutRef}
      className="homepage-layout"
      style={{ paddingTop: `${headerHeight}px` }} // ✅ padding dynamique
    >
      <div className="main-content">
        {error && <p className="error-message">{error}</p>}

        {ads.length > 0 && (
          <div className="ads-banner">
            <motion.div
              key={ads[currentAdIndex]?.id}
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className="ads-content"
            >
              {ads[currentAdIndex]?.images?.length > 0 && (
                <div
                  onClick={() => handleAdClick(ads[currentAdIndex])}
                  style={{ cursor: "pointer", display: "inline-block", position: "relative" }}
                >
                  <img
                    src={`https://allo-bailleur-backend-1.onrender.com${ads[currentAdIndex].images[0].url}`}
                    alt="Publicité"
                    className="ads-image"
                    style={{
                      border: "2px solid transparent",
                      borderRadius: "8px",
                      transition: "all 0.3s ease",
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.border = "2px solid #007bff";
                      e.target.style.transform = "scale(1.02)";
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.border = "2px solid transparent";
                      e.target.style.transform = "scale(1)";
                    }}
                  />
                  {trackingLoading && (
                    <div
                      style={{
                        position: "absolute",
                        top: "10px",
                        right: "10px",
                        background: "rgba(255, 255, 255, 0.8)",
                        borderRadius: "50%",
                        padding: "5px",
                      }}
                    >
                      <Loader size={16} className="animate-spin" />
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          </div>
        )}

        <AnimatePresence mode="wait">
          {funFact && (
            <motion.div
              key={funFact}
              className="fun-fact-floating"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.5 }}
            >
              <Lightbulb size={20} className="fun-fact-icon" />
              <span>{funFact}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {loading ? (
          <div className="loader-wrapper">
            <Loader className="animate-spin h-10 w-10 text-gray-500" />
          </div>
        ) : properties.length === 0 ? (
          <p className="no-properties">Aucune maison trouvée pour le moment.</p>
        ) : (
          <div className="properties-grid">
            {properties.map((prop, idx) => (
              <motion.div
                key={prop.id ?? idx}
                className="motion-wrapper"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
              >
                <PropertyCard property={prop} showPromotedBadge={true} />
              </motion.div>
            ))}
          </div>
        )}

        {showPopupWarning && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            style={{
              position: "fixed",
              bottom: "20px",
              right: "20px",
              background: "#ff4757",
              color: "white",
              padding: "12px 18px",
              borderRadius: "8px",
              zIndex: 1000,
              maxWidth: "300px",
              boxShadow: "0 4px 15px rgba(0, 0, 0, 0.2)",
            }}
          >
            ⚠️ Redirection en cours...
          </motion.div>
        )}
      </div>
      <Support />
    </div>
  );
}
