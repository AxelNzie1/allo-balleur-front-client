import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { auth } from "../firebaseClient";
import { RecaptchaVerifier, signInWithPhoneNumber } from "firebase/auth";
import "./Register.css";
import AuthOtp from "../components/AuthOtp/AuthOtp";

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
  const [confirmationResult, setConfirmationResult] = useState(null);
  const [verificationMethod, setVerificationMethod] = useState(""); // sms | email
  const [emailLink, setEmailLink] = useState("");
  const [showBonusPopup, setShowBonusPopup] = useState(false);

  const handleChange = (e) =>
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleFileChange = (e) => setProfileImage(e.target.files[0]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      // Normalisation du numéro au format E.164
      let phoneNumber = formData.phone;
      if (!phoneNumber.startsWith("+")) {
        phoneNumber = "+237" + phoneNumber.replace(/\D/g, "");
      }

      // Préparer FormData pour le backend
      const data = new FormData();
      data.append("email", formData.email);
      data.append("full_name", formData.full_name);
      data.append("phone", phoneNumber);
      data.append("password", formData.password);
      data.append("role", formData.role);
      if (profileImage) data.append("profile_image", profileImage);

      // Choix de la méthode de vérification
      const method = window.confirm(
        "Voulez-vous recevoir l'OTP par SMS ? (OK = SMS / Annuler = Email)"
      )
        ? "sms"
        : "email";
      setVerificationMethod(method);
      data.append("method", method);

      // Appel backend pour créer l'utilisateur
      const response = await axios.post(
        "https://allo-bailleur-backend-1.onrender.com/auth/start-registration",
        data,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      if (method === "sms") {
        // 1️⃣ Crée le Recaptcha invisible si pas déjà créé
        if (!window.recaptchaVerifier) {
          window.recaptchaVerifier = new RecaptchaVerifier(
            "recaptcha-container",
            { size: "invisible" },
            auth
          );
        }

        // 2️⃣ Envoi du SMS via Firebase Auth
        const confirmation = await signInWithPhoneNumber(
          auth,
          phoneNumber,
          window.recaptchaVerifier
        );
        setConfirmationResult(confirmation);
        alert("OTP envoyé par SMS ! Vérifiez votre téléphone.");
      } else if (method === "email") {
        setEmailLink(response.data.email_verification_link);
        alert(
          "Un lien de vérification a été envoyé à votre email. Cliquez dessus pour valider votre compte."
        );
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.detail || err.message || "Erreur lors de l'inscription");
    }
  };

  const handleOtpVerified = (user) => {
    // Appelé après validation OTP
    alert(`Bienvenue ${user.phoneNumber || formData.full_name} !`);
    setShowBonusPopup(true);
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

        {/* Formulaire d'inscription */}
        {!showBonusPopup && !emailLink && !confirmationResult && (
          <form onSubmit={handleSubmit} encType="multipart/form-data">
            <label>Email:</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
            />

            <label>Nom complet:</label>
            <input
              type="text"
              name="full_name"
              value={formData.full_name}
              onChange={handleChange}
              required
            />

            <label>Téléphone:</label>
            <input
              type="text"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              required
            />

            <label>Mot de passe:</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
            />

            <label>Rôle:</label>
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              required
            >
              <option value="client">Client</option>
              <option value="bailleur">Bailleur</option>
            </select>

            <label>Image de profil (optionnel):</label>
            <input type="file" accept="image/*" onChange={handleFileChange} />

            <button type="submit">S’inscrire</button>
          </form>
        )}

        {/* Lien de vérification email */}
        {emailLink && (
          <div>
            <p>
              Un lien de vérification a été envoyé à votre email. Vérifiez votre
              boîte de réception.
            </p>
            <a href={emailLink} target="_blank" rel="noopener noreferrer">
              Cliquer pour vérifier l'email
            </a>
          </div>
        )}

        {/* OTP pour SMS */}
        {verificationMethod === "sms" && confirmationResult && (
          <AuthOtp
            confirmationResult={confirmationResult}
            onVerified={handleOtpVerified}
          />
        )}

        {/* Recaptcha container requis par Firebase */}
        <div id="recaptcha-container"></div>
      </div>

      {/* Popup bonus après création de compte */}
      {showBonusPopup && (
        <div className="bonus-popup-overlay">
          <div className="bonus-popup">
            <h3>🎉 Bienvenue !</h3>
            <p>
              Félicitations <strong>{formData.full_name || "cher utilisateur"}</strong> !<br />
              Votre compte a été créé avec succès et vous venez de recevoir{" "}
              <strong>150 tokens gratuits</strong>.
            </p>
            <button onClick={handleClosePopup}>Super, merci !</button>
          </div>
        </div>
      )}
    </div>
  );
}
