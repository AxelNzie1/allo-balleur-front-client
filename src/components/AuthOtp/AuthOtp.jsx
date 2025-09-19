import { useState } from "react";
import axios from "axios";

export default function AuthOtp({ confirmationResult, email, onVerified }) {
  const [code, setCode] = useState("");
  const [error, setError] = useState("");

  const handleVerify = async () => {
    try {
      await confirmationResult.confirm(code);

      // Envoie au backend pour compléter l'inscription
      await axios.post(
        "https://allo-bailleur-backend-1.onrender.com/auth/complete-registration",
        new URLSearchParams({ email, otp: code })
      );

      onVerified();
    } catch (err) {
      console.error(err);
      setError("Code incorrect ou expiré");
    }
  };

  return (
    <div>
      <input
        type="text"
        value={code}
        onChange={(e) => setCode(e.target.value)}
        placeholder="Entrez le code OTP"
      />
      <button onClick={handleVerify}>Vérifier</button>
      {error && <p style={{ color: "red" }}>{error}</p>}
    </div>
  );
}
