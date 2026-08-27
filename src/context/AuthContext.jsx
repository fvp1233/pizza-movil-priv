import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";

const AuthContext = createContext(null);

const AUTH_STORAGE_KEY = "pizza-movil:auth-session";

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL;

function getApiBaseUrl() {
  // Devuelve la URL base de la API y ajusta localhost para emulador Android.
  // On Android emulators localhost points to the device itself.
  if (Platform.OS === "android") {
    return API_BASE_URL.replace("localhost", "10.0.2.2");
  }

  return API_BASE_URL;
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isBooting, setIsBooting] = useState(true);

  // Guarda la sesion del usuario en almacenamiento local.
  const persistSession = useCallback(async (nextUser) => {
    await AsyncStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(nextUser));
  }, []);

  // Elimina la sesion guardada del almacenamiento local.
  const clearSessionStorage = useCallback(async () => {
    await AsyncStorage.removeItem(AUTH_STORAGE_KEY);
  }, []);

  // Inicializa la sesion al abrir la app leyendo AsyncStorage.
  const initializeSession = useCallback(async () => {
    try {
      const raw = await AsyncStorage.getItem(AUTH_STORAGE_KEY);
      if (raw) {
        setUser(JSON.parse(raw));
      }
    } catch (error) {
      console.log("Auth bootstrap error", error);
    } finally {
      setIsBooting(false);
    }
  }, []);

  useEffect(() => {
    // Ejecuta la inicializacion de sesion una vez al montar el provider.
    initializeSession();
  }, [initializeSession]);

  // Inicia sesion en backend, construye el usuario y lo persiste localmente.
  const login = useCallback(
    async ({ email, password }) => {
      const normalizedEmail = email.trim().toLowerCase();

      const loginResponse = await fetch(`${getApiBaseUrl()}/loginCustomers`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email: normalizedEmail, password }),
      });

      const loginData = await loginResponse.json().catch(() => ({}));

      if (!loginResponse.ok) {
        throw new Error(loginData?.message ?? "No se pudo iniciar sesion");
      }

      // Backend login only returns a message, so we resolve the user name by email.
      const customersResponse = await fetch(`${getApiBaseUrl()}/customers`);
      const customersData = await customersResponse.json().catch(() => []);

      const customer = Array.isArray(customersData)
        ? customersData.find(
            (item) => item?.email?.toLowerCase() === normalizedEmail,
          )
        : null;

      const sessionUser = {
        email: normalizedEmail,
        name: customer?.name ?? "Cliente",
        lastName: customer?.lastName ?? "",
      };

      setUser(sessionUser);
      await persistSession(sessionUser);

      return sessionUser;
    },
    [persistSession],
  );

  const register = useCallback(async (customerData) => {
    const response = await fetch(`${getApiBaseUrl()}/registerCustomer`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        ...customerData,
        email: customerData.email.trim().toLowerCase(),
      }),
    });

    const payload = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(payload?.message ?? "No se pudo iniciar el registro");
    }

    return payload;
  }, []);

  const verifyRegistrationCode = useCallback(
    async ({ verificationCodeRequest }) => {
      const response = await fetch(
        `${getApiBaseUrl()}/registerCustomer/verifyCodeEmail`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ verificationCodeRequest }),
        },
      );

      const payload = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(payload?.message ?? "No se pudo verificar el código");
      }

      return payload;
    },
    [],
  );

  const requestPasswordRecovery = useCallback(async ({ email }) => {
    const response = await fetch(
      `${getApiBaseUrl()}/recoveryPassword/requestCode`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      },
    );

    const payload = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(
        payload?.message ?? "No se pudo enviar el código de recuperación",
      );
    }

    return payload;
  }, []);

  const verifyRecoveryCode = useCallback(async ({ code }) => {
    const response = await fetch(
      `${getApiBaseUrl()}/recoveryPassword/verifyCode`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ code }),
      },
    );

    const payload = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(payload?.message ?? "No se pudo verificar el código");
    }

    return payload;
  }, []);

  const resetPassword = useCallback(
    async ({ newPassword, confirmNewPassword }) => {
      const response = await fetch(
        `${getApiBaseUrl()}/recoveryPassword/newPassword`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ newPassword, confirmNewPassword }),
        },
      );

      const payload = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          payload?.message ?? "No se pudo actualizar la contraseña",
        );
      }

      return payload;
    },
    [],
  );

  // Cierra sesion en backend y limpia el estado/localStorage en la app.
  const logout = useCallback(async () => {
    try {
      await fetch(`${getApiBaseUrl()}/logout`, { method: "POST" });
    } catch (error) {
      console.log("Logout request error", error);
    }

    setUser(null);
    await clearSessionStorage();
  }, [clearSessionStorage]);

  // Agrupa y memoiza los valores y funciones compartidas por el contexto.
  const value = useMemo(
    () => ({
      user,
      isBooting,
      isAuthenticated: Boolean(user),
      login,
      register,
      verifyRegistrationCode,
      requestPasswordRecovery,
      verifyRecoveryCode,
      resetPassword,
      logout,
      apiBaseUrl: getApiBaseUrl(),
    }),
    [
      isBooting,
      login,
      logout,
      register,
      requestPasswordRecovery,
      resetPassword,
      user,
      verifyRecoveryCode,
      verifyRegistrationCode,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export default AuthContext;
