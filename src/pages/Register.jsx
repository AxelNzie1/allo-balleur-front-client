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
  const [method, setMethod] = useState("");

  const handleChange = (e) =>
    setFormData((p) => ({ ...p, [e.target.name]: e.target.value }));
  const handleFileChange = (e) => setProfileImage(e.target.files[0]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      let phoneNumber = formData.phone.replace(/\D/g, "");
      if (!phoneNumber.startsWith("+")) phoneNumber = "+237" + phoneNumber;

      const data = new FormData();
      Object.entries({ ...formData, phone: phoneNumber }).forEach(([k, v]) =>
        data.append(k, v)
      );
      if (profileImage) data.append("profile_image", profileImage);

      const m = window.confirm(
        "Recevoir OTP par SMS ? (OK = SMS / Annuler = Email)"
      )
        ? "sms"
        : "email";
      setMethod(m);
      data.append("method", m);

      const res = await axios.post(
        "https://allo-bailleur-backend-1.onrender.com/auth/start-registration",
        data
      );

      if (m === "email") {
        setEmailLink(res.data.email_verification_link);
        alert("Vérifiez votre email et cliquez sur le lien.");
      } else {
        // reCAPTCHA invisible
        const verifier = new RecaptchaVerifier(
          "recaptcha-container",
          { size: "invisible" },
          auth
        );
        await verifier.render();
        const confirmation = await signInWithPhoneNumber(
          auth,
          phoneNumber,
          verifier
        );
        setConfirmationResult(confirmation);
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.detail || err.message);
    }
  };

  return (
    <div className="register-page">
      <div className="register-container">
        <h2>Inscription</h2>
        {error && <p style={{ color: "red" }}>{error}</p>}

        {!emailLink && !confirmationResult && (
          <form onSubmit={handleSubmit} encType="multipart/form-data">
            {/* champs identiques */}
            <label>Email:</label>
            <input name="email" type="email" onChange={handleChange} required />
            <label>Nom complet:</label>
            <input name="full_name" onChange={handleChange} required />
            <label>Téléphone:</label>
            <input name="phone" onChange={handleChange} required />
            <label>Mot de passe:</label>
            <input
              name="password"
              type="password"
              onChange={handleChange}
              required
            />
            <label>Rôle:</label>
            <select name="role" onChange={handleChange} value={formData.role}>
              <option value="client">Client</option>
              <option value="bailleur">Bailleur</option>
            </select>
            <label>Image profil:</label>
            <input type="file" accept="image/*" onChange={handleFileChange} />
            <button type="submit">S’inscrire</button>
          </form>
        )}

        {emailLink && (
          <p>
            Lien de vérification envoyé.{" "}
            <a href={emailLink} target="_blank" rel="noreferrer">
              Ouvrir le lien
            </a>
          </p>
        )}

        {confirmationResult && (
          <AuthOtp
            confirmationResult={confirmationResult}
            email={formData.email}
            onVerified={async () => {
              // On suppose que l'OTP est ok côté Firebase,
              // on appelle le backend pour créer l'utilisateur
              const otpPrompt = prompt("Entrez le code reçu par SMS");
              await axios.post(
                "https://allo-bailleur-backend-1.onrender.com/auth/complete-registration",
                { email: formData.email, otp: otpPrompt }
              );
              navigate("/");
            }}
          />
        )}
        <div id="recaptcha-container"></div>
      </div>
    </div>
  );
}
