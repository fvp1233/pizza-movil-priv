import { useCallback, useEffect, useState } from "react";
import { useAuth } from "./useAuth";

export function useRecoveryPasswordForm(initialEmail = null) {
  const { requestPasswordRecovery, verifyRecoveryCode, resetPassword } =
    useAuth();
  const [email, setEmail] = useState(initialEmail ?? "");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (initialEmail) {
      setEmail(initialEmail);
    }
  }, [initialEmail]);

  const resetStatus = useCallback(() => {
    setError("");
    setSuccess("");
  }, []);

  const submitRequestCode = useCallback(async () => {
    resetStatus();

    const trimmedEmail = email.trim();

    if (!trimmedEmail) {
      setError("Debes ingresar tu correo.");
      return { ok: false };
    }

    try {
      setLoading(true);
      const result = await requestPasswordRecovery({ email: trimmedEmail });
      setSuccess(result?.message ?? "Código enviado a tu correo");
      return { ok: true, email: trimmedEmail };
    } catch (requestError) {
      setError(
        requestError.message || "No se pudo enviar el código de recuperación",
      );
      return { ok: false };
    } finally {
      setLoading(false);
    }
  }, [email, requestPasswordRecovery, resetStatus]);

  const submitVerifyCode = useCallback(async () => {
    resetStatus();

    if (!code.trim()) {
      setError("Ingresa el código de verificación.");
      return false;
    }

    try {
      setLoading(true);
      await verifyRecoveryCode({ code: code.trim() });
      setSuccess("Código verificado correctamente.");
      return true;
    } catch (requestError) {
      setError(requestError.message || "No se pudo verificar el código");
      return false;
    } finally {
      setLoading(false);
    }
  }, [code, resetStatus, verifyRecoveryCode]);

  const submitNewPassword = useCallback(async () => {
    resetStatus();

    if (!newPassword || !confirmNewPassword) {
      setError("Completa la nueva contraseña y su confirmación.");
      return false;
    }

    if (newPassword !== confirmNewPassword) {
      setError("Las contraseñas no coinciden.");
      return false;
    }

    if (newPassword.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres.");
      return false;
    }

    try {
      setLoading(true);
      await resetPassword({ newPassword, confirmNewPassword });
      setSuccess("Contraseña actualizada correctamente.");
      return true;
    } catch (requestError) {
      setError(requestError.message || "No se pudo actualizar la contraseña");
      return false;
    } finally {
      setLoading(false);
    }
  }, [confirmNewPassword, newPassword, resetPassword, resetStatus]);

  return {
    email,
    setEmail,
    code,
    setCode,
    newPassword,
    setNewPassword,
    confirmNewPassword,
    setConfirmNewPassword,
    loading,
    error,
    success,
    submitRequestCode,
    submitVerifyCode,
    submitNewPassword,
  };
}
