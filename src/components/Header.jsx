import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import UserMenu from "../components/UserMenu";
import logo from "../assets/logo.svg";
import "./Header.css";

const HOUSE_KEYWORDS = [
  "studio", "appartement", "villa", "boutique","piscine", "jardin", "terrasse", "garage", 
  "parking", "climatisation", "meublé",
  "vue mer", "balcon", "ascenseur", "gardien",
  "sécurité", "chambre", "salon", "cuisine",
  "salle de bain", "buanderie", "cave",
  "veranda", "vitré", "domotique", "alarme","compteur prépayé"
];

export default function Header() {
  const navigate = useNavigate();
  const dropdownRef = useRef(null);

  const [showDropdown, setShowDropdown] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem("token"));
  const [user, setUser] = useState(null);
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [searchParams, setSearchParams] = useState({
    query: "",
    city: "",
    price: "",
    quartier: ""
  });
  const [quartiers, setQuartiers] = useState([]);
  const [cities, setCities] = useState([]);
  const [priceRange, setPriceRange] = useState({ min: 0, max: 1000000 });
  const [loginError, setLoginError] = useState("");
  const [searchError, setSearchError] = useState("");
  const [isLoadingFilters, setIsLoadingFilters] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  // 🔹 Charger filtres & utilisateur
  useEffect(() => {
    const fetchFilters = async () => {
      setIsLoadingFilters(true);
      try {
        const res = await axios.get("https://allo-bailleur-backend-1.onrender.com/properties/filters");
        setQuartiers(res.data.quartiers || []);
        setCities(res.data.villes || []);
        setPriceRange({
          min: res.data.budget_min || 0,
          max: res.data.budget_max || 1000000
        });
      } catch (error) {
        console.error("Erreur filtres:", error);
      } finally {
        setIsLoadingFilters(false);
      }
    };

    const fetchUser = async () => {
      const token = localStorage.getItem("token");
      if (token) {
        try {
          const res = await axios.get("https://allo-bailleur-backend-1.onrender.com/users/me", {
            headers: { Authorization: `Bearer ${token}` }
          });
          setUser(res.data);
          setIsLoggedIn(true);
        } catch (err) {
          localStorage.removeItem("token");
          setIsLoggedIn(false);
        }
      }
    };

    fetchFilters();
    fetchUser();
  }, []);

  // 🔹 Fermer dropdown clic extérieur
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // 🔹 Recherche
  const handleSearch = () => {
    setSearchError("");
    const params = {};
    if (searchParams.query.trim()) params.query = searchParams.query.trim();
    if (searchParams.quartier.trim()) params.quartier = searchParams.quartier.trim();
    if (searchParams.city.trim()) params.ville = searchParams.city.trim();
    if (searchParams.price) params.max_budget = parseFloat(searchParams.price);

    if (Object.keys(params).length === 0) {
      setSearchError("Veuillez saisir au moins un critère de recherche");
      return;
    }
    navigate(`/properties?${new URLSearchParams(params).toString()}`);
  };

  const handleChange = (e) =>
    setSearchParams(prev => ({ ...prev, [e.target.name]: e.target.value }));

  // 🔹 Connexion
  const handleLogin = async () => {
    setIsLoggingIn(true);
    setLoginError("");
    
    try {
      const res = await axios.post("https://allo-bailleur-backend-1.onrender.com/auth/login", { phone, password });
      localStorage.setItem("token", res.data.access_token);
      setIsLoggedIn(true);
      const me = await axios.get("https://allo-bailleur-backend-1.onrender.com/users/me", {
        headers: { Authorization: `Bearer ${res.data.access_token}` }
      });
      localStorage.setItem("user", JSON.stringify(me.data));
      setUser(me.data);
      setShowDropdown(false);
    } catch (err) {
      setLoginError(err.response?.status === 401 ? "Identifiants incorrects" : "Erreur de connexion");
    } finally {
      setIsLoggingIn(false);
    }
  };

  return (
    <header className="airbnb-header header">
      {/* Logo */}
      <Link to="/" className="header-logo">
        <img src={logo} alt="Allo Bailleur Logo" className="logo-img" />
      </Link>

      {/* Barre de recherche minimaliste */}
      <div className="search-bar-compact">
        <input
          className="main-query"
          name="query"
          type="text"
          placeholder="Piscine, villa, jardin…"
          value={searchParams.query}
          onChange={handleChange}
          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          list="keywords-list"
        />
        <datalist id="keywords-list">
          {HOUSE_KEYWORDS.map(k => <option key={k} value={k} />)}
        </datalist>

        <button type="button" className="toggle-filters" onClick={() => setShowFilters(prev => !prev)}>
          Filtres ⌄
        </button>

        <button className="search-btn-min" onClick={handleSearch} aria-label="Rechercher">
          🔍
        </button>
      </div>

      {showFilters && (
        <div className="filters-panel">
          <input
            name="city"
            list="cities-list"
            placeholder="Ville"
            value={searchParams.city}
            onChange={handleChange}
          />
          <datalist id="cities-list">
            {cities.map(c => <option key={c} value={c} />)}
          </datalist>

          <input
            name="quartier"
            list="quartiers-list"
            placeholder="Quartier"
            value={searchParams.quartier}
            onChange={handleChange}
          />
          <datalist id="quartiers-list">
            {quartiers.map(q => <option key={q} value={q} />)}
          </datalist>

          <input
            name="price"
            type="number"
            placeholder={`Budget max (${priceRange.max.toLocaleString()} FCFA)`}
            min={priceRange.min}
            max={priceRange.max}
            value={searchParams.price}
            onChange={handleChange}
          />
        </div>
      )}

      {/* Menu utilisateur */}
      <div className="user-menu-container" ref={dropdownRef}>
        {isLoggedIn && user ? (
          <UserMenu 
            user={user} 
            onLogout={() => {
              localStorage.removeItem("token");
              setIsLoggedIn(false);
              setUser(null);
              navigate("/");
            }} 
          />
        ) : (
          <>
            <button
              className="login-button"
              onClick={() => setShowDropdown(!showDropdown)}
              aria-expanded={showDropdown}
            >
              Connexion
            </button>
            {showDropdown && (
              <div className="login-dropdown">
                <input
                  type="text"
                  placeholder="Téléphone"
                  className="login-input"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  autoFocus
                />
                <input
                  type="password"
                  placeholder="Mot de passe"
                  className="login-input"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                />
                <button 
                  onClick={handleLogin} 
                  className="login-submit-button"
                  disabled={isLoggingIn}
                >
                  {isLoggingIn ? <span className="login-spinner"></span> : "Se connecter"}
                </button>
                <div className="register-prompt">
                  Pas de compte ?{" "}
                  <Link to="/register" className="register-link">
                    Créer un compte
                  </Link>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </header>
  );
}
