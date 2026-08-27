import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  View,
} from "react-native";
import InputPassword from "../components/Inputs/InputPassword";
import CustomButton from "../components/Buttons/CustomButton";
import { useRecoveryPasswordForm } from "../hooks/useRecoveryPasswordForm";

export default function RecoveryNewPasswordScreen({ email, onBack, onFinish }) {
  const {
    newPassword,
    setNewPassword,
    confirmNewPassword,
    setConfirmNewPassword,
    loading,
    error,
    success,
    submitNewPassword,
  } = useRecoveryPasswordForm(email);

  const handleSubmit = async () => {
    const isUpdated = await submitNewPassword();

    if (isUpdated && onFinish) {
      onFinish();
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View style={styles.card}>
        <Text style={styles.title}>Nueva contraseña</Text>
        <Text style={styles.subtitle}>
          Crea una nueva contraseña para tu cuenta.
        </Text>

        <InputPassword
          placeHolder="Nueva contraseña"
          setValor={newPassword}
          contra
          setTextChange={setNewPassword}
        />

        <InputPassword
          placeHolder="Confirmar contraseña"
          setValor={confirmNewPassword}
          contra
          setTextChange={setConfirmNewPassword}
        />

        {error ? <Text style={styles.errorText}>{error}</Text> : null}
        {success ? <Text style={styles.successText}>{success}</Text> : null}

        {loading ? (
          <ActivityIndicator
            size="small"
            color="#C26D3B"
            style={styles.loader}
          />
        ) : null}

        <CustomButton
          textButton="Actualizar contraseña"
          actionButton={handleSubmit}
        />
        <CustomButton textButton="Volver" actionButton={onBack} />
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FAF5EE",
    paddingHorizontal: 20,
  },
  card: {
    width: "100%",
    maxWidth: 340,
    backgroundColor: "#FFFDF8",
    borderRadius: 12,
    paddingHorizontal: 24,
    paddingVertical: 26,
    borderWidth: 1,
    borderColor: "#E9D8C3",
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    color: "#6F3E1F",
  },
  subtitle: {
    marginTop: 6,
    marginBottom: 14,
    fontSize: 14,
    color: "#9A6A47",
  },
  errorText: {
    marginTop: 4,
    color: "#B12929",
    fontSize: 13,
    fontWeight: "600",
  },
  successText: {
    marginTop: 4,
    color: "#1E7A46",
    fontSize: 13,
    fontWeight: "600",
  },
  loader: {
    marginTop: 10,
  },
});
