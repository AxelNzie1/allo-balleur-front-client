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
            left: "1rem",         // ✅ Alignée à gauche
            background: "rgba(255,255,255,0.95)",
            borderRadius: "1rem",
            padding: "0.7rem 1.2rem",
            display: "flex",
            alignItems: "center",
            gap: "0.8rem",
            boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
            backdropFilter: "blur(8px)",
            fontSize: "0.95rem",
            lineHeight: 1.4,
            animation: "slideUp 0.4s ease-out",
            zIndex: 1000,
            maxWidth: "320px",    // pour éviter qu'elle ne prenne trop de place
          }}
        >
          
          <span style={{ flex: 1, padding: "0 0.5rem" }}>
          <strong>Installer cette application à l’écran d’accueil</strong>.
            Touchez l'icone <strong>Partager</strong> <IoShareOutline size={22} color="#007aff" />
            , puis <strong>Ajouter à l'ecran d'acceuil</strong> <IoAddCircleOutline size={22} color="#007aff" style={{ margin: "0 6px" }} />
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
