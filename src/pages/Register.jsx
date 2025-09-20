import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./Register.css";

export default function Register() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    full_name: "",
    phone: "",
    password: "",
    role: "client",
  });
  const [profileImage, setProfileImage] = useState(null);
  const [error, setError] = useState("");
  const [showBonusPopup, setShowBonusPopup] = useState(false);
  const [loading, setLoading] = useState(false); // ✅ Nouvel état pour le loader

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleFileChange = (e) => {
    setProfileImage(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true); // ✅ Active le loader

    try {
      const data = new FormData();
      data.append("email", formData.email);
      data.append("full_name", formData.full_name);
      data.append("phone", formData.phone);
      data.append("password", formData.password);
      data.append("role", formData.role);
      if (profileImage) data.append("profile_image", profileImage);

      await axios.post("https://allo-bailleur-backend-1.onrender.com/auth/register", data, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setShowBonusPopup(true);
    } catch (err) {
      if (err.response?.data?.detail) {
        setError(err.response.data.detail);
      } else {
        setError("Erreur lors de l'inscription");
      }
    } finally {
      setLoading(false); // ✅ Désactive le loader
    }
  };

  const handleClosePopup = () => {
    setShowBonusPopup(false);
    navigate("/");
  };

  return (
    <div className="register-page">
      <div className="register-container">
        <h2>Inscription</h2>
        {error && <p style={{ color: "red" }}>{error}</p>}

        <form onSubmit={handleSubmit} encType="multipart/form-data">
          <label>Email:</label>
          <input type="email" name="email" value={formData.email} onChange={handleChange} required />

          <label>Nom complet:</label>
          <input type="text" name="full_name" value={formData.full_name} onChange={handleChange} required />

          <label>Téléphone:</label>
          <input type="text" name="phone" value={formData.phone} onChange={handleChange} required />

          <label>Mot de passe:</label>
          <input type="password" name="password" value={formData.password} onChange={handleChange} required />

          <label>Rôle:</label>
          <select name="role" value={formData.role} onChange={handleChange} required>
            <option value="client">Client</option>
            <option value="bailleur">Bailleur</option>
          </select>

          <label>Image de profil (optionnel):</label>
          <input type="file" accept="image/*" onChange={handleFileChange} />

          {/* ✅ Bouton avec loader */}
          <button type="submit" disabled={loading} className="register-button">
            {loading ? "⏳ Inscription en cours..." : "S’inscrire"}
          </button>
        </form>
      </div>

      {showBonusPopup && (
        <div className="bonus-popup-overlay">
          <div className="bonus-popup">
            <h3>🎉 Bienvenue !</h3>
            <p>
              Félicitations <strong>{formData.full_name || "cher utilisateur"}</strong> !
              <br />
              Votre compte a été créé avec succès et vous venez de recevoir
              <strong> 150 tokens gratuits </strong>.
            </p>
            <button onClick={handleClosePopup}>Super, merci !</button>
          </div>
        </div>
      )}
    </div>
  );
}
