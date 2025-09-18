import { useEffect, useState, useRef } from "react";
import { Avatar } from "./Avatar";
import { useNavigate } from "react-router-dom";
import "./UserMenu.css";

export default function UserMenu({ user, onLogout }) {
  const [showMenu, setShowMenu] = useState(false);
  const [balance, setBalance] = useState(0);
  const menuRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setShowMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // 👉 Récupération du solde
  useEffect(() => {
    const fetchBalance = async () => {
      try {
        const token = localStorage.getItem("token");
        console.log("📦 TOKEN récupéré :", token);
        const res = await fetch("https://allo-bailleur-backend-1.onrender.com/tokens/balance", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        console.log("🎯 Données de solde récupérées:", data);
        setBalance(data.balance);
      } catch (error) {
        console.error("Erreur lors de la récupération du solde:", error);
      }
    };

    if (user) fetchBalance();
  }, [user]);

  if (!user) {
    return (
      <button onClick={() => navigate("/register")} className="register-btn">
        S'inscrire
      </button>
    );
  }

  console.log("👤 USER:", user);

  // ✅ Encodage de l'URL pour gérer les espaces et caractères spéciaux
const imagePath = user.profile_image || user.profile_image_url || "";
console.log("📁 Chemin image original:", imagePath);

// Solution 1: Encoder seulement les parties problématiques, pas les slashes
const encodedPath = imagePath.split('/').map(part => encodeURIComponent(part)).join('/');
const imageUrl = imagePath
  ? (imagePath.startsWith("http")
      ? imagePath
      : `https://allo-bailleur-backend-1.onrender.com/${encodedPath}`)
  : "/default-avatar.png";

console.log("🔗 URL image générée:", imageUrl);

  return (
    <div className="relative" ref={menuRef}>
      <div
        className="flex items-center space-x-3 user-header cursor-pointer"
        onClick={() => setShowMenu((prev) => !prev)}
      >
        <Avatar
          src={imageUrl}
          alt={user.full_name || "Utilisateur"}
          size={40}
        />
        <span className="text-sm font-medium text-gray-800">
          {user.full_name || "Mon profil"}
        </span>
      </div>

      {showMenu && (
        <div className="user-menu-dropdown">
          <div className="token-balance">
            <span className="token-icon">🪙</span> {balance} tokens
          </div>

          <button
            onClick={() => {
              navigate("/dashboard", { state: { section: "profil" } });
              setShowMenu(false);
            }}
          >
            Mon Profil
          </button>

          <button
            onClick={() => {
              onLogout();
              setShowMenu(false);
            }}
            className="logout-btn"
          >
            Déconnexion
          </button>
        </div>
      )}
    </div>
  );
}
