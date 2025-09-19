import { useState } from "react";
import axios from "axios";

export default function AuthOtp({ confirmationResult, email, onVerified }) {
  const [code, setCode] = useState("");
  const [error, setError] = useState("");

  const handleVerify = async () => {
    try {
      // Vérification OTP côté Firebase
      await confirmationResult.confirm(code);

      // Puis création du compte côté backend
      await axios.post(
        "https://allo-bailleur-backend-1.onrender.com/auth/complete-registration",
        { email, otp: code }
      );

      onVerified(); // navigation ou mise à jour front
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.detail || "Code incorrect ou expiré"
      );
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
