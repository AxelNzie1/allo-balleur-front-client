import { useEffect, useState } from "react";
import { IoShareOutline, IoAddCircleOutline } from "react-icons/io5";

export default function InstallPWAButton() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showIosBanner, setShowIosBanner] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    const isIos = /iphone|ipad|ipod/.test(window.navigator.userAgent.toLowerCase());
    const isStandalone = "standalone" in window.navigator && window.navigator.standalone;
    if (isIos && !isStandalone) setShowIosBanner(true);

    return () => window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
  }, []);

  const handleInstallClick = () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    deferredPrompt.userChoice.finally(() => setDeferredPrompt(null));
  };

  return (
    <>
      {/* Bouton Android */}
      {deferredPrompt && (
        <button
          onClick={handleInstallClick}
          style={{
            position: "fixed",
            bottom: 20,
            right: 20,
            padding: "10px 20px",
            background: "linear-gradient(135deg,#FF0086,#f406b1)",
            color: "#fff",
            border: "none",
            borderRadius: 12,
            fontWeight: 600,
            cursor: "pointer",
            boxShadow: "0 6px 14px rgba(0,0,0,0.25)",
            zIndex: 1000,
          }}
        >
          📥 Installer l’app
        </button>
      )}

      {/* Bannière iOS – alignée à gauche */}
      {showIosBanner && (
        <div
          style={{
            position: "fixed",
            bottom: "1rem",
            left: "1rem",
            background_color: "rgba(255,255,255,0.95)",
            borderRadius: "1rem",
            padding: "0.8rem 1.2rem",
            display: "flex",
            alignItems: "center",
            gap: "0.8rem",
            boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
            backdropFilter: "blur(8px)",
            fontSize: "0.95rem",
            lineHeight: 1.5,
            animation: "slideUp 0.4s ease-out",
            zIndex: 1000,
            maxWidth: "320px",
          }}
        >
          <span
            style={{
              flex: 1,
              padding: "0 0.5rem",
              textAlign: "left",
              display: "flex",
              flexDirection: "column",
              gap: "0.4rem",
            }}
          >
            <strong style={{ fontSize: "1rem", color: "#FF008C" }}>
              Installer cette application à l’écran d’accueil
            </strong>
            <span style={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: "0.35rem" }}>
              Touchez l’icône <strong>Partager</strong>
              <IoShareOutline size={20} color="#FF008C" />
              puis defilez jusqu'à l'icone <strong> Ecran d’accueil</strong>
              <IoAddCircleOutline size={20} color="#FF008C" /> 
              et touchez <strong>Ajouter</strong>
            </span>
          </span>

          <button
            onClick={() => setShowIosBanner(false)}
            style={{
              background: "transparent",
              border: "none",
              color: "#007aff",
              fontSize: "1.3rem",
              cursor: "pointer",
              lineHeight: 1,
            }}
            aria-label="Fermer"
          >
            ✕
          </button>
        </div>
      )}

      <style>{`
        @keyframes slideUp {
          0% { transform: translateY(120%); opacity: 0; }
          100% { transform: translateY(0); opacity: 1; }
        }
      `}</style>
    </>
  );
}
