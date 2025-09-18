import { useState } from "react";
import { sendSmsCode, verifySmsCode } from "../../utils/sendSmsCode";

export default function AuthOtp() {
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [step, setStep] = useState("phone");

  const handleSend = async () => {
    await sendSmsCode(phone);
    setStep("code");
  };

  const handleVerify = async () => {
    const result = await verifySmsCode(code);
    console.log("User Firebase:", result.user);
  };

  return (
    <div>
      {step === "phone" && (
        <>
          <input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+237..."
          />
          <button onClick={handleSend}>Envoyer SMS</button>
        </>
      )}
      {step === "code" && (
        <>
          <input
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="Code OTP"
          />
          <button onClick={handleVerify}>Vérifier</button>
        </>
      )}
    </div>
  );
}
