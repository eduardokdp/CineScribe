import { useState } from "react";
import { useLocation } from "wouter";
import { useLogin, useRegister } from "@workspace/api-client-react";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Clapperboard } from "lucide-react";

export default function Login() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  
  const [, setLocation] = useLocation();
  const { login: setAuth } = useAuth();

  const loginMutation = useLogin();
  const registerMutation = useRegister();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (isLogin) {
      loginMutation.mutate(
        { data: { email, password } },
        {
          onSuccess: (res) => {
            setAuth(res.token, res.user);
            toast.success("Welcome back!");
            setLocation("/");
          },
          onError: (err: any) => {
            toast.error("Login failed", {
              description: err.message || "Please check your credentials.",
            });
          },
        }
      );
    } else {
      registerMutation.mutate(
        { data: { email, password, username } },
        {
          onSuccess: (res) => {
            setAuth(res.token, res.user);
            toast.success("Account created!", {
              description: "Welcome to CineScribe.",
            });
            setLocation("/");
          },
          onError: (err: any) => {
            toast.error("Registration failed", {
              description: err.message || "Please try again.",
            });
          },
        }
      );
    }
  };

  const isPending = loginMutation.isPending || registerMutation.isPending;

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-card border border-border rounded-2xl shadow-2xl overflow-hidden">
          <div className="p-8 pb-6 bg-muted/30 border-b border-border text-center">
            <Clapperboard className="w-12 h-12 text-primary mx-auto mb-4" />
            <h1 className="text-2xl font-serif font-bold">
              {isLogin ? "Welcome back" : "Join CineScribe"}
            </h1>
            <p className="text-muted-foreground mt-2 text-sm">
              {isLogin
                ? "Enter your details to access your journal."
                : "Create an account to start logging your journey."}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="p-8 space-y-6">
            {!isLogin && (
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  placeholder="cinephile99"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  className="bg-background"
                />
              </div>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="bg-background"
              />
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label htmlFor="password">Password</Label>
              </div>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="bg-background"
              />
            </div>

            <Button type="submit" className="w-full" size="lg" disabled={isPending}>
              {isPending ? "Please wait..." : isLogin ? "Sign In" : "Create Account"}
            </Button>
          </form>

          <div className="p-6 pt-0 text-center">
            <button
              type="button"
              onClick={() => setIsLogin(!isLogin)}
              className="text-sm text-muted-foreground hover:text-primary transition-colors font-medium"
            >
              {isLogin
                ? "Don't have an account? Sign up"
                : "Already have an account? Sign in"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
