// src/utils/sendSmsCode.js
import { RecaptchaVerifier, signInWithPhoneNumber } from "firebase/auth";
import { auth } from "../firebaseClient"; // adapte le chemin si besoin

export async function sendSmsCode(phone) {
  if (!window.recaptchaVerifier) {
    window.recaptchaVerifier = new RecaptchaVerifier(
      "recaptcha-container",
      { size: "invisible" },
      auth
    );
  }

  const confirmationResult = await signInWithPhoneNumber(
    auth,
    phone,
    window.recaptchaVerifier
  );

  window.confirmationResult = confirmationResult;
}

export async function verifySmsCode(code) {
  return await window.confirmationResult.confirm(code);
}
