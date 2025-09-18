import { useState } from "react";

export default function AuthOtp({ confirmationResult, onVerified }) {
  const [code, setCode] = useState("");
  const [error, setError] = useState("");

  const handleVerify = async () => {
    try {
      const result = await confirmationResult.confirm(code);
      alert("Numéro vérifié avec succès !");
      onVerified(result.user); // callback pour naviguer ou mettre à jour l'état
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
