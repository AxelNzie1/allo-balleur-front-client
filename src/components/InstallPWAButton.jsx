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
    const isInStandaloneMode = ('standalone' in window.navigator) && window.navigator.standalone;
    if (isIos && !isInStandaloneMode) {
      setShowIosBanner(true);
    }

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    deferredPrompt.userChoice.then((choiceResult) => {
      if (choiceResult.outcome === "accepted") {
        console.log("PWA installée");
      } else {
        console.log("Installation refusée");
      }
      setDeferredPrompt(null);
    });
  };

  return (
    <>
      {/* Bouton Android */}
      {deferredPrompt && (
        <button
          onClick={handleInstallClick}
          style={{
            position: "fixed",
            bottom: "20px",
            right: "20px",
            padding: "10px 20px",
            background: "#FF0086",
            color: "#fff",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
            zIndex: 1000,
          }}
        >
          Installer l'app
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
    </>
  );
}
