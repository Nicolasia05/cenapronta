import { AuthShell } from "@/components/AuthShell";
import { SignupForm } from "./SignupForm";

export const metadata = { title: "Criar conta · Cena Pronta" };

export default function SignupPage() {
  return (
    <AuthShell title={<>Ative seu <span className="italic text-volt">acesso</span></>} subtitle="Use o código de convite que você recebeu.">
      <SignupForm />
    </AuthShell>
  );
}
