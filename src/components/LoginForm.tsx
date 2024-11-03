"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";

interface LoginFormProps {
  dict: any;
}

export default function LoginForm({ dict }: LoginFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const formData = new FormData(e.currentTarget);
      const response = await fetch("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({
          email: formData.get("email"),
          password: formData.get("password"),
        }),
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Login failed");
      }

      // Obtener la URL de retorno si existe
      const returnUrl = searchParams?.get("returnUrl");

      // Redirigir a la URL original o al perfil
      if (returnUrl) {
        router.push(decodeURIComponent(returnUrl));
      } else {
        const locale = window.location.pathname.split("/")[1];
        router.push(`/${locale}/profile`);
      }
      router.refresh();
    } catch (error) {
      toast({
        title: dict.error?.title ?? "Error",
        description: dict.error?.loginFailed ?? "Failed to login",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        name="email"
        type="email"
        placeholder={dict.auth?.emailPlaceholder ?? "Email"}
        required
      />
      <Input
        name="password"
        type="password"
        placeholder={dict.auth?.passwordPlaceholder ?? "Password"}
        required
      />
      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading
          ? (dict.auth?.loggingIn ?? "Logging in...")
          : (dict.auth?.login ?? "Login")}
      </Button>
    </form>
  );
}
