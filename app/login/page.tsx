import { AuthShell } from "@/components/AuthShell";
import { LoginForm } from "./LoginForm";

export const metadata = { title: "Entrar · Cena Pronta" };

export default function LoginPage() {
  return (
    <AuthShell title={<>Bem-vindo de <span className="italic text-volt">volta</span></>} subtitle="Entre com seu e-mail e senha.">
      <LoginForm />
    </AuthShell>
  );
}
