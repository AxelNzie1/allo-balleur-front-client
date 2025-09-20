import React, { useState, useEffect } from "react";
import axios from "axios";
import "./BailleurProfil.css";

const API = "https://allo-bailleur-backend-1.onrender.com";

const RECHARGE_PACKS = [
  { amount: 1000, tokens: 10, label: "10 tokens - 1 000 FCFA" },
  { amount: 2500, tokens: 30, label: "30 tokens - 2 500 FCFA" },
  { amount: 5000, tokens: 80, label: "80 tokens - 5 000 FCFA" },
  { amount: 10000, tokens: 150, label: "150 tokens - 10 000 FCFA" },
];

const BailleurProfil = () => {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [profileImage, setProfileImage] = useState(null);
  const [selfieFile, setSelfieFile] = useState(null);
  const [idCardFile, setIdCardFile] = useState(null);
  const [ownershipFile, setOwnershipFile] = useState(null);
  const [kycStatus, setKycStatus] = useState("inconnu");
  const [isVerified, setIsVerified] = useState(false);
  const [isPro, setIsPro] = useState(false);
  const [userRole, setUserRole] = useState("");
  const [tokenBalance, setTokenBalance] = useState(0);
  const [transactionHistory, setTransactionHistory] = useState([]);
  const [rechargeAmount, setRechargeAmount] = useState("");
  const [campayPhone, setCampayPhone] = useState("");
  const [selectedPack, setSelectedPack] = useState(null);

  // loaders
  const [isLoadingRecharge, setIsLoadingRecharge] = useState(false);
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [isUploadingKyc, setIsUploadingKyc] = useState(false);
  const [isSubmittingKyc, setIsSubmittingKyc] = useState(false);

  useEffect(() => {
    fetchProfile();
    fetchKycStatus();
    fetchTokenBalance();
    fetchTokenHistory();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await axios.get(`${API}/users/me`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      const data = res.data;
      setFullName(data.full_name || "");
      setEmail(data.email || "");
      setPhone(data.phone || "");
      setIsVerified(data.is_verified);
      setIsPro(data.is_pro || false);
      setUserRole(data.role || "client");
    } catch (err) {
      console.error("Erreur profil", err);
    }
  };

  const fetchKycStatus = async () => {
    try {
      const res = await axios.get(`${API}/users/kyc/status`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setKycStatus(res.data.status || "inconnu");
    } catch {
      setKycStatus("erreur");
    }
  };

  const fetchTokenBalance = async () => {
    try {
      const res = await axios.get(`${API}/tokens/balance`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setTokenBalance(res.data.balance || 0);
    } catch {}
  };

  const fetchTokenHistory = async () => {
    try {
      const res = await axios.get(`${API}/tokens/history`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setTransactionHistory(res.data || []);
    } catch {}
  };

  const handlePackSelect = (pack) => {
    setSelectedPack(pack);
    setRechargeAmount(pack.amount.toString());
  };

  const handleRechargeCampay = async () => {
    const amount = parseInt(rechargeAmount);
    if (!amount || isNaN(amount) || amount < 1000) {
      alert("Montant invalide (min 1000 FCFA).");
      return;
    }
    if (!campayPhone.startsWith("237") || campayPhone.length !== 12) {
      alert("Numéro CamPay invalide (ex: 237690000000).");
      return;
    }
    setIsLoadingRecharge(true);
    try {
      const response = await axios.post(
        `${API}/tokens/campay`,
        { amount, phone_number: campayPhone },
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );
      alert(`Paiement envoyé ! Réf: ${response.data.campay_reference}`);
      setRechargeAmount("");
      setCampayPhone("");
      setSelectedPack(null);
      setTimeout(() => {
        fetchTokenBalance();
        fetchTokenHistory();
      }, 3000);
    } catch (err) {
      alert(err.response?.data?.detail || "Erreur CamPay.");
    } finally {
      setIsLoadingRecharge(false);
    }
  };

  const handleUpdateProfile = async () => {
    setIsUpdatingProfile(true);
    const formData = new FormData();
    formData.append("full_name", fullName);
    formData.append("email", email);
    formData.append("phone", phone);
    if (profileImage) formData.append("profile_image", profileImage);
    try {
      await axios.put(`${API}/users/me/update-with-photo`, formData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "multipart/form-data",
        },
      });
      alert("Profil mis à jour !");
      fetchProfile();
    } catch {
      alert("Erreur mise à jour.");
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const handleMultipleKycUpload = async () => {
    if (!selfieFile || !idCardFile || !ownershipFile) {
      alert("Veuillez choisir les 3 fichiers.");
      return;
    }
    setIsUploadingKyc(true);
    const formData = new FormData();
    formData.append("SELFIE", selfieFile);
    formData.append("id_card", idCardFile);
    formData.append("ownership_proof", ownershipFile);
    try {
      await axios.post(`${API}/users/kyc/upload`, formData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "multipart/form-data",
        },
      });
      alert("Documents KYC envoyés !");
      fetchKycStatus();
    } catch {
      alert("Erreur envoi KYC.");
    } finally {
      setIsUploadingKyc(false);
    }
  };

  const handleKycSubmit = async () => {
    setIsSubmittingKyc(true);
    try {
      await axios.post(`${API}/users/kyc/submit`, null, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      alert("Dossier KYC soumis !");
      fetchKycStatus();
    } catch {
      alert("Erreur soumission KYC.");
    } finally {
      setIsSubmittingKyc(false);
    }
  };

  const renderKycStatus = () => {
    if (isVerified) return <span className="kyc-status verified">✅ Compte vérifié</span>;
    switch (kycStatus) {
      case "pending":
        return <span className="kyc-status pending">🕒 En attente</span>;
      case "approved":
        return <span className="kyc-status approved">⚠️ Validé</span>;
      case "rejected":
        return <span className="kyc-status rejected">❌ Rejeté</span>;
      default:
        return <span className="kyc-status unknown">Statut inconnu</span>;
    }
  };

  return (
    <div className="bailleur-profil">
      <div className="profil-container">
        {/* Solde & Recharge */}
        <div className="token-card">
          <h2>
            💰 Solde : <span className="token-balance">{tokenBalance} jetons</span>
          </h2>

          {/* Packs */}
          <div className="packs-grid">
            {RECHARGE_PACKS.map((pack) => (
              <div
                key={pack.amount}
                className={`pack-card ${selectedPack === pack ? "selected" : ""}`}
                onClick={() => handlePackSelect(pack)}
              >
                {pack.tokens} tokens - {pack.amount.toLocaleString()} FCFA
              </div>
            ))}
          </div>

          {/* Form recharge */}
          <input
            type="text"
            placeholder="237690000000"
            value={campayPhone}
            onChange={(e) => setCampayPhone(e.target.value)}
          />
          <input
            type="number"
            placeholder="Montant (min 1000)"
            value={rechargeAmount}
            onChange={(e) => {
              setRechargeAmount(e.target.value);
              setSelectedPack(null);
            }}
          />
          <button
            className="recharge-btn"
            onClick={handleRechargeCampay}
            disabled={isLoadingRecharge}
          >
            {isLoadingRecharge ? "⏳ Traitement..." : "📱 Recharger"}
          </button>
        </div>

        {/* Mise à jour profil */}
        <div className="profile-section">
          <h2>📝 Mise à jour du profil</h2>
          <input value={fullName} onChange={(e) => setFullName(e.target.value)} />
          <input value={email} onChange={(e) => setEmail(e.target.value)} />
          <input value={phone} onChange={(e) => setPhone(e.target.value)} />
          <input type="file" onChange={(e) => setProfileImage(e.target.files[0])} />
          <button onClick={handleUpdateProfile} disabled={isUpdatingProfile}>
            {isUpdatingProfile ? "⏳ Sauvegarde..." : "Mettre à jour le profil"}
          </button>
        </div>

        {/* KYC */}
        {userRole !== "client" && (
          <div className="kyc-section">
            <h2>📤 Vérification KYC</h2>
            <input type="file" onChange={(e) => setSelfieFile(e.target.files[0])} />
            <input type="file" onChange={(e) => setIdCardFile(e.target.files[0])} />
            <input type="file" onChange={(e) => setOwnershipFile(e.target.files[0])} />
            <button onClick={handleMultipleKycUpload} disabled={isUploadingKyc}>
              {isUploadingKyc ? "⏳ Envoi..." : "📤 Uploader les documents"}
            </button>
            <div>Statut KYC : {renderKycStatus()}</div>
            {!isVerified && kycStatus === "approved" && (
              <button onClick={handleKycSubmit} disabled={isSubmittingKyc}>
                {isSubmittingKyc ? "⏳ Soumission..." : "✅ Soumettre le dossier"}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default BailleurProfil;
