import React, { useState } from "react";
import { auth } from "./firebaseClient";
import { signInWithCustomToken, RecaptchaVerifier } from "firebase/auth";

export default function SmsOtpLogin({ customToken, phoneNumber }) {
  const [otp, setOtp] = useState("");
  const [confirmationResult, setConfirmationResult] = useState(null);

  // Initialise le reCAPTCHA invisible
  const setupRecaptcha = () => {
    window.recaptchaVerifier = new RecaptchaVerifier(
      "recaptcha-container",
      { size: "invisible" },
      auth
    );
  };

  const sendSmsOtp = async () => {
    setupRecaptcha();
    try {
      // 🔹 Connexion via le customToken du backend
      await signInWithCustomToken(auth, customToken);

      // 🔹 Envoie le code SMS
      const appVerifier = window.recaptchaVerifier;
      const confirmation = await auth.signInWithPhoneNumber(phoneNumber, appVerifier);
      setConfirmationResult(confirmation);
      alert("OTP SMS envoyé !");
    } catch (error) {
      console.error("Erreur SMS OTP:", error);
      alert("Erreur lors de l'envoi du SMS OTP");
    }
  };

  const verifyOtp = async () => {
    try {
      if (!confirmationResult) return alert("Aucun OTP envoyé");
      await confirmationResult.confirm(otp);
      alert("Téléphone vérifié avec succès !");
    } catch (error) {
      console.error("OTP invalide:", error);
      alert("OTP invalide");
    }
  };

  return (
    <div>
      <div id="recaptcha-container"></div>
      <button onClick={sendSmsOtp}>Envoyer OTP SMS</button>

      <div>
        <input
          type="text"
          placeholder="Entrez OTP"
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
        />
        <button onClick={verifyOtp}>Vérifier OTP</button>
      </div>
    </div>
  );
}
