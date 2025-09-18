import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { auth } from "../firebaseClient";
import { RecaptchaVerifier, signInWithPhoneNumber } from "firebase/auth";
import AuthOtp from "../components/AuthOtp/AuthOtp";
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
  const [confirmationResult, setConfirmationResult] = useState(null);
  const [emailLink, setEmailLink] = useState("");

  const handleChange = (e) =>
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleFileChange = (e) => setProfileImage(e.target.files[0]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      let phoneNumber = formData.phone.replace(/\D/g, "");
      if (!phoneNumber.startsWith("+")) phoneNumber = "+237" + phoneNumber;

      const data = new FormData();
      data.append("email", formData.email);
      data.append("full_name", formData.full_name);
      data.append("phone", phoneNumber);
      data.append("password", formData.password);
      data.append("role", formData.role);
      if (profileImage) data.append("profile_image", profileImage);

      // Choix méthode
      const method = window.confirm("Recevoir OTP par SMS ? (OK = SMS / Annuler = Email)")
        ? "sms"
        : "email";
      data.append("method", method);

      const response = await axios.post(
        "https://allo-bailleur-backend-1.onrender.com/auth/start-registration",
        data
      );

      if (method === "sms") {
        // Initialise Recaptcha correctement
        if (!window.recaptchaVerifier) {
          window.recaptchaVerifier = new RecaptchaVerifier(
            "recaptcha-container",
            { size: "invisible" },
            auth
          );
          await window.recaptchaVerifier.render();
        }

        const confirmation = await signInWithPhoneNumber(
          auth,
          phoneNumber,
          window.recaptchaVerifier
        );
        setConfirmationResult(confirmation);
      } else if (method === "email") {
        setEmailLink(response.data.email_verification_link);
        alert("Lien de vérification envoyé à votre email. Cliquez dessus pour valider votre compte.");
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.detail || err.message || "Erreur inscription");
    }
  };

  return (
    <div className="register-page">
      <div className="register-container">
        <h2>Inscription</h2>
        {error && <p style={{ color: "red" }}>{error}</p>}

        {!emailLink && !confirmationResult && (
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

            <button type="submit">S’inscrire</button>
          </form>
        )}

        {emailLink && (
          <div>
            <p>Vérifiez votre boîte email et cliquez sur le lien pour confirmer votre compte.</p>
            <a href={emailLink} target="_blank" rel="noopener noreferrer">Vérifier l'email</a>
          </div>
        )}

        {confirmationResult && (
          <AuthOtp confirmationResult={confirmationResult} onVerified={(user) => navigate("/")} />
        )}

        <div id="recaptcha-container"></div>
      </div>
    </div>
  );
}
