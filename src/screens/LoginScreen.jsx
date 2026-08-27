import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import InputEmail from "../components/Inputs/InputEmail";
import InputPassword from "../components/Inputs/InputPassword";
import CustomButton from "../components/Buttons/CustomButton";
import { useLoginForm } from "../hooks/useLoginForm";

export default function LoginScreen({ onOpenRegister, onOpenRecovery }) {
  const { email, setEmail, password, setPassword, loading, error, submit } =
    useLoginForm();

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View style={styles.card}>
        <Text style={styles.title}>Iniciar sesión</Text>
        <Text style={styles.subtitle}>Bienvenido a tu app de pizzas</Text>

        <InputEmail
          placeHolder="Correo"
          setValor={email}
          setTextChange={setEmail}
          setEditable={!loading}
        />

        <InputPassword
          placeHolder="Contraseña"
          setValor={password}
          contra
          setTextChange={setPassword}
        />

        <TouchableOpacity
          onPress={onOpenRecovery}
          style={styles.forgotPasswordButton}
        >
          <Text style={styles.forgotPasswordText}>
            ¿Olvidaste tu contraseña?
          </Text>
        </TouchableOpacity>

        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        {loading ? (
          <ActivityIndicator
            size="small"
            color="#C26D3B"
            style={styles.loader}
          />
        ) : null}

        <CustomButton textButton="Entrar" actionButton={submit} />

        <View style={styles.registerPrompt}>
          <Text style={styles.registerText}>No tienes cuenta, </Text>
          <TouchableOpacity onPress={onOpenRegister}>
            <Text style={styles.registerLink}>créala aquí</Text>
          </TouchableOpacity>
        </View>
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
  loader: {
    marginTop: 10,
  },
  forgotPasswordButton: {
    alignSelf: "flex-end",
    marginTop: 6,
  },
  forgotPasswordText: {
    color: "#C26D3B",
    fontSize: 13,
    fontWeight: "700",
  },
  registerPrompt: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 18,
    flexWrap: "wrap",
  },
  registerText: {
    color: "#7A4E32",
    fontSize: 13,
  },
  registerLink: {
    color: "#C26D3B",
    fontSize: 13,
    fontWeight: "700",
  },
});
