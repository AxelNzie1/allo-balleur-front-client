import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { auth } from "../firebaseClient"; // ton instance Firebase
import { signInWithCustomToken, RecaptchaVerifier } from "firebase/auth";
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
  const [showBonusPopup, setShowBonusPopup] = useState(false);
  const [verificationMethod, setVerificationMethod] = useState(""); // "email" ou "sms"
  const [emailLink, setEmailLink] = useState("");

  const handleChange = (e) =>
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  const handleFileChange = (e) => setProfileImage(e.target.files[0]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      // FormData pour envoi multipart
      const data = new FormData();
      data.append("email", formData.email);
      data.append("full_name", formData.full_name);
      data.append("phone", formData.phone);
      data.append("password", formData.password);
      data.append("role", formData.role);
      if (profileImage) data.append("profile_image", profileImage);

      // Choix de la méthode SMS ou Email
      const method = window.confirm(
        "Voulez-vous recevoir l'OTP par SMS ? Cliquer sur 'Annuler' pour recevoir par email"
      )
        ? "sms"
        : "email";
      setVerificationMethod(method);
      data.append("method", method);

      // Envoi au backend
      const response = await axios.post(
        "https://allo-bailleur-backend-1.onrender.com/auth/start-registration",
        data,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      if (method === "sms") {
        const token = response.data.sms_custom_token;

        // Connecte l'utilisateur avec le token custom Firebase
        const userCredential = await signInWithCustomToken(auth, token);
        console.log("Utilisateur connecté avec custom token:", userCredential.user);

        // Afficher le popup bonus directement si la vérification côté backend est OK
        setShowBonusPopup(true);
      } else {
        setEmailLink(response.data.email_verification_link);
        alert(
          "Un lien de vérification a été envoyé à votre email. Cliquez dessus pour valider votre compte."
        );
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.detail || "Erreur lors de l'inscription");
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

        {!showBonusPopup && !emailLink && (
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
            <p>
              Un lien de vérification a été envoyé à votre email. Vérifiez votre boîte de réception pour activer le compte.
            </p>
            <a href={emailLink} target="_blank" rel="noopener noreferrer">
              Cliquer pour vérifier l'email
            </a>
          </div>
        )}

        <div id="recaptcha-container"></div>
      </div>

      {showBonusPopup && (
        <div className="bonus-popup-overlay">
          <div className="bonus-popup">
            <h3>🎉 Bienvenue !</h3>
            <p>
              Félicitations <strong>{formData.full_name || "cher utilisateur"}</strong> !
              <br />
              Votre compte a été créé avec succès et vous venez de recevoir <strong>150 tokens gratuits</strong>.
            </p>
            <button onClick={handleClosePopup}>Super, merci !</button>
          </div>
        </div>
      )}
    </div>
  );
}
