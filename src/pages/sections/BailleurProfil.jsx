import React, { useState, useEffect } from "react";
import axios from "axios";
import "./BailleurProfil.css";

const API = "https://allo-bailleur-backend-1.onrender.com";

const RECHARGE_PACKS = [
  { amount: 1000, tokens: 10, label: "10 tokens - 1 000 FCFA" },
  { amount: 2500, tokens: 30, label: "30 tokens - 2 500 FCFA" },
  { amount: 5000, tokens: 80, label: "80 tokens - 5 000 FCFA" },
  { amount: 10000, tokens: 150, label: "150 tokens - 10 000 FCFA" }
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

  // États “loading” pour chaque bouton
  const [isLoadingProfile, setIsLoadingProfile] = useState(false);
  const [isLoadingKycUpload, setIsLoadingKycUpload] = useState(false);
  const [isLoadingKycSubmit, setIsLoadingKycSubmit] = useState(false);
  const [isLoadingCampay, setIsLoadingCampay] = useState(false);
  const [isLoadingPDF, setIsLoadingPDF] = useState(false);

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
      console.error("Erreur lors du chargement du profil", err);
    }
  };

  const fetchKycStatus = async () => {
    try {
      const res = await axios.get(`${API}/users/kyc/status`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setKycStatus(res.data.status || "inconnu");
    } catch (err) {
      console.error("Erreur récupération statut KYC", err);
      setKycStatus("erreur");
    }
  };

  const fetchTokenBalance = async () => {
    try {
      const res = await axios.get(`${API}/tokens/balance`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setTokenBalance(res.data.balance || 0);
    } catch (err) {
      console.error("Erreur récupération du solde :", err);
    }
  };

  const fetchTokenHistory = async () => {
    try {
      const res = await axios.get(`${API}/tokens/history`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setTransactionHistory(res.data || []);
    } catch (err) {
      console.error("Erreur récupération de l'historique :", err);
    }
  };

  const handlePackSelect = (pack) => {
    setSelectedPack(pack);
    setRechargeAmount(pack.amount.toString());
  };

  const handleRechargeCampay = async () => {
    const amount = parseInt(rechargeAmount);

    if (!amount || isNaN(amount) || amount < 1000) {
      alert("Montant invalide. Le minimum est de 1000 FCFA.");
      return;
    }

    if (!campayPhone.startsWith('237') || campayPhone.length !== 12) {
      alert("Le numéro CamPay doit commencer par 237 et avoir 12 chiffres (ex: 237690000000)");
      return;
    }

    setIsLoadingCampay(true);
    try {
      const response = await axios.post(
        `${API}/tokens/campay`,
        { amount, phone_number: campayPhone },
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );

      alert(`Demande de paiement envoyée pour ${campayPhone} ! Référence: ${response.data.campay_reference}`);
      setRechargeAmount("");
      setCampayPhone("");
      setSelectedPack(null);
      setTimeout(() => {
        fetchTokenBalance();
        fetchTokenHistory();
      }, 3000);
    } catch (err) {
      console.error("Erreur CamPay :", err);
      alert(err.response?.data?.detail || "Erreur lors de la recharge CamPay.");
    } finally {
      setIsLoadingCampay(false);
    }
  };

  const handleUpdateProfile = async () => {
    setIsLoadingProfile(true);
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
    } catch (err) {
      console.error("Erreur mise à jour profil :", err);
      alert("Erreur lors de la mise à jour.");
    } finally {
      setIsLoadingProfile(false);
    }
  };

  const handleMultipleKycUpload = async () => {
    if (!selfieFile || !idCardFile || !ownershipFile) {
      alert("Veuillez choisir les 3 fichiers requis.");
      return;
    }
    setIsLoadingKycUpload(true);

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
    } catch (err) {
      console.error("Erreur upload KYC :", err);
      alert("Erreur lors de l'envoi des documents.");
    } finally {
      setIsLoadingKycUpload(false);
    }
  };

  const handleKycSubmit = async () => {
    setIsLoadingKycSubmit(true);
    try {
      await axios.post(`${API}/users/kyc/submit`, null, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      alert("Dossier KYC soumis !");
      fetchKycStatus();
    } catch (err) {
      console.error("Erreur soumission KYC :", err);
      alert("Erreur lors de la soumission.");
    } finally {
      setIsLoadingKycSubmit(false);
    }
  };

  const handleDownloadPDF = async () => {
    setIsLoadingPDF(true);
    try {
      const res = await axios.get(`${API}/tokens/history/download-pdf`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        responseType: "blob",
      });
      const blob = new Blob([res.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "historique_transactions.pdf";
      link.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Erreur téléchargement PDF :", err);
      alert("Erreur lors du téléchargement du PDF.");
    } finally {
      setIsLoadingPDF(false);
    }
  };

  const renderKycStatus = () => {
    if (isVerified) return <span className="kyc-status verified">✅ Compte vérifié</span>;
    switch (kycStatus) {
      case "pending": return <span className="kyc-status pending">🕒 En attente</span>;
      case "approved": return <span className="kyc-status approved">⚠️ Validé</span>;
      case "rejected": return <span className="kyc-status rejected">❌ Rejeté</span>;
      case "not_submitted": return <span className="kyc-status not-submitted">⛔ Non soumis</span>;
      default: return <span className="kyc-status unknown">Statut inconnu</span>;
    }
  };

  return (
    <div className="bailleur-profil">
      <div className="profil-container">
        {/* Section Tokens */}
        <div className="token-card">
          {isPro && <div className="pro-badge">⭐ PRO</div>}
          <h2 className="token-header">
            💰 Solde de jetons : <span className="token-balance">{tokenBalance} jetons</span>
          </h2>

          <div className="recharge-packs">
            <h4>🎁 Packs de recharge</h4>
            <div className="packs-grid">
              {RECHARGE_PACKS.map((pack, index) => (
                <div
                  key={index}
                  className={`pack-card ${selectedPack === pack ? 'selected' : ''}`}
                  onClick={() => handlePackSelect(pack)}
                >
                  <div className="pack-tokens">{pack.tokens} tokens</div>
                  <div className="pack-amount">{pack.amount.toLocaleString()} FCFA</div>
                  <div className="pack-bonus">
                    {pack.tokens > (pack.amount / 100) && `+${pack.tokens - Math.floor(pack.amount / 100)} bonus`}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="campay-group">
            <h4>📱 Recharge via Mobile Money</h4>
            {selectedPack && (
              <div className="selected-pack-info">
                <strong>Pack sélectionné:</strong> {selectedPack.tokens} tokens - {selectedPack.amount.toLocaleString()} FCFA
              </div>
            )}
            <div className="input-group">
              <label>Téléphone Mobile Money</label>
              <input
                type="text"
                placeholder="690000000"
                value={campayPhone.replace(/^237/, "")}
                onChange={(e) => setCampayPhone("237" + e.target.value.replace(/^237/, ""))}
                className="recharge-input"
              />
            </div>
            <div className="input-group">
              <label>Montant personnalisé (min 1000 FCFA)</label>
              <input
                type="number"
                placeholder="1000"
                value={rechargeAmount}
                onChange={(e) => { setRechargeAmount(e.target.value); setSelectedPack(null); }}
                className="recharge-input"
                min="1000"
                step="100"
              />
            </div>
            <button
              className="recharge-btn"
              onClick={handleRechargeCampay}
              disabled={!campayPhone || !rechargeAmount || isLoadingCampay || parseInt(rechargeAmount) < 1000}
            >
              {isLoadingCampay ? "Traitement..." : selectedPack ? ` Payer ${selectedPack.amount.toLocaleString()} FCFA` : "Recharger avec Mobile Money"}
            </button>
          </div>

          <div className="transaction-section">
            <div className="transaction-header">
              <h3>📜 Historique des transactions</h3>
              <button
                className="btn pdf-btn"
                onClick={handleDownloadPDF}
                disabled={isLoadingPDF}
              >
                {isLoadingPDF ? "⏳ Téléchargement..." : "📄 PDF"}
              </button>
            </div>
            <div className="transaction-scroll">
              <ul className="transaction-list">
                {transactionHistory.length === 0 ? (
                  <li className="no-transactions">Aucune transaction</li>
                ) : (
                  transactionHistory.map((tx, idx) => (
                    <li key={idx} className={`transaction-item ${tx.type}`}>
                      <div className="transaction-icon">{tx.type === "credit" ? "➕" : "➖"}</div>
                      <div className="transaction-details">
                        <div className="transaction-amount">{tx.amount} tokens</div>
                        <div className="transaction-description">{tx.description}</div>
                        <div className="transaction-date">{new Date(tx.timestamp).toLocaleString()}</div>
                      </div>
                    </li>
                  ))
                )}
              </ul>
            </div>
          </div>
        </div>

        <hr className="section-divider" />

        {/* Section Profil */}
        <div className="profile-section">
          <h2>Mise à jour du profil</h2>
          <div className="input-group">
            <label>Nom complet</label>
            <input value={fullName} onChange={(e) => setFullName(e.target.value)} className="profile-input" />
          </div>
          <div className="input-group">
            <label>Email</label>
            <input value={email} onChange={(e) => setEmail(e.target.value)} className="profile-input" type="email" />
          </div>
          <div className="input-group">
            <label>Téléphone</label>
            <input value={phone} onChange={(e) => setPhone(e.target.value)} className="profile-input" />
          </div>
          <div className="input-group">
            <label>Photo de profil</label>
            <input type="file" accept="image/*" onChange={(e) => setProfileImage(e.target.files[0])} className="file-input" />
          </div>
          <button
            onClick={handleUpdateProfile}
            className="update-btn"
            disabled={isLoadingProfile}
          >
            {isLoadingProfile ? "⏳ Mise à jour en cours..." : "Mettre à jour le profil"}
          </button>
        </div>

        {/* Section KYC */}
        {userRole !== "client" && (
          <>
            <hr className="section-divider" />
            <div className="kyc-section">
              <h2>Vérification KYC</h2>
              <p className="kyc-info">Pour devenir bailleur vérifié, veuillez uploader les documents suivants :</p>
              
              <div className="kyc-docs">
                <div className="kyc-doc">
                  <label>📸 Selfie avec pièce d'identité</label>
                  <input type="file" accept="image/*" onChange={(e) => setSelfieFile(e.target.files[0])} className="file-input" />
                </div>
                <div className="kyc-doc">
                  <label>🪪 Pièce d'identité (recto-verso)</label>
                  <input type="file" accept="image/*" onChange={(e) => setIdCardFile(e.target.files[0])} className="file-input" />
                </div>
                <div className="kyc-doc">
                  <label>🏠 Justificatif de domicile</label>
                  <input type="file" accept="image/*,.pdf" onChange={(e) => setOwnershipFile(e.target.files[0])} className="file-input" />
                </div>
              </div>

              <button
                onClick={handleMultipleKycUpload}
                className="kyc-upload-btn"
                disabled={isLoadingKycUpload}
              >
                {isLoadingKycUpload ? "⏳ Soumission en cours..." : "Uploader les documents"}
              </button>

              <div className="kyc-status-container">
                <strong>Statut KYC :</strong> {renderKycStatus()}
              </div>

              {!isVerified && kycStatus === "approved" && (
                <button
                  onClick={handleKycSubmit}
                  className="kyc-submit-btn"
                  disabled={isLoadingKycSubmit}
                >
                  {isLoadingKycSubmit ? "Soumission en cours..." : "Soumettre le dossier KYC"}
                </button>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default BailleurProfil;
