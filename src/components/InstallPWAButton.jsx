import { useEffect, useState } from "react";

export default function InstallPWAButton() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showIosBanner, setShowIosBanner] = useState(false);

  useEffect(() => {
    // Android : beforeinstallprompt
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    // iOS detection
    const isIos = /iphone|ipad|ipod/.test(window.navigator.userAgent.toLowerCase());
    const isInStandaloneMode = ("standalone" in window.navigator) && window.navigator.standalone;
    if (isIos && !isInStandaloneMode) setShowIosBanner(true);

    return () => window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
  }, []);

  const handleInstallClick = () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    deferredPrompt.userChoice.then((choiceResult) => {
      console.log(choiceResult.outcome === "accepted" ? "PWA installée" : "Installation refusée");
      setDeferredPrompt(null);
    });
  };

  return (
    <>
      {/* Bouton Android - petit ticket animé */}
      {deferredPrompt && (
        <button
          onClick={handleInstallClick}
          style={{
            position: "fixed",
            bottom: "20px",
            right: "20px",
            padding: "12px 24px",
            background: "linear-gradient(135deg, #FF0086, #f406b1)",
            color: "#fff",
            border: "none",
            borderRadius: "12px 4px 12px 4px",
            cursor: "pointer",
            zIndex: 1000,
            fontWeight: 600,
            fontSize: "0.95rem",
            boxShadow: "0 6px 14px rgba(0,0,0,0.2)",
            animation: "bounce 2s infinite",
          }}
        >
          📥 Installer l'app
        </button>
      )}

      {/* Bannière iOS */}
      {showIosBanner && (
        <div
          style={{
            background: "#FF0086",
            color: "white",
            padding: "1em",
            textAlign: "center",
            position: "fixed",
            bottom: 0,
            width: "100%",
            zIndex: 1000,
            fontWeight: 500,
            animation: "slideUp 1s ease-out",
          }}
        >
          Installez cette app sur votre écran d'accueil : appuyez sur{" "}
          <strong>Partager → Ajouter à l'écran d'accueil</strong>
          <button
            onClick={() => setShowIosBanner(false)}
            style={{
              marginLeft: "1em",
              background: "transparent",
              border: "none",
              color: "white",
              fontSize: "1.2em",
              cursor: "pointer",
            }}
          >
            ✕
          </button>
        </div>
      )}

      {/* Animations */}
      <style>{`
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-6px); }
        }
        @keyframes slideUp {
          0% { transform: translateY(100%); opacity: 0; }
          100% { transform: translateY(0); opacity: 1; }
        }
      `}</style>
    </>
  );
}
