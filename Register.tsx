import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "@/context/AppContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Loader2,
  ArrowLeft,
  AlertTriangle,
  ShieldCheck,
} from "lucide-react";
import { Logo } from "@/components/shared/Logo";
import { SECURITY_QUESTIONS } from "@/constants/securityQuestions";

export function Register() {
  const [step, setStep] = useState<1 | 2>(1);
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [securityQuestion, setSecurityQuestion] = useState("");
  const [securityAnswer, setSecurityAnswer] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { register } = useApp();
  const navigate = useNavigate();

  const handleStep1Next = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setStep(2);
  };

  const handleStep2Submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Validate security question and answer
    if (!securityQuestion) {
      setError("Please select a security question");
      return;
    }

    if (securityAnswer.length < 3) {
      setError("Security answer must be at least 3 characters");
      return;
    }

    setIsLoading(true);

    try {
      // Register account with security question in one call
      const result = await register(username, password, name, securityQuestion, securityAnswer);
      if (!result.success) {
        setError(result.error || "Registration failed");
        setIsLoading(false);
        return;
      }

      // Navigate to dashboard
      navigate("/dashboard");
    } catch (err: any) {
      setError(err.response?.data?.error || "Registration failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiMyMDIwMjAiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0djZoNnYtNmgtNnptMCAwdi02aC02djZoNnoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-40" />

      {/* Back to Home Button */}
      <button
        onClick={() => navigate("/")}
        className="absolute top-6 left-6 z-20 flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span className="text-sm font-medium">Back to Home</span>
      </button>

      <Card className="w-full max-w-md relative z-10 bg-slate-800/80 border-slate-700 backdrop-blur-sm">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto flex justify-center">
            <Logo size="md" />
          </div>
          <div>
            <CardTitle className="text-2xl font-bold text-white">
              {step === 1 ? "Create Your Account" : "Secure Your Account"}
            </CardTitle>
            <CardDescription className="text-slate-400">
              Step {step} of 2
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          {/* Step 1: Basic Info */}
          {step === 1 && (
            <form onSubmit={handleStep1Next} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-slate-300">
                  Name
                </Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Enter your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  autoComplete="name"
                  className="bg-slate-900/50 border-slate-600 text-white placeholder:text-slate-500 focus:border-emerald-500 focus:ring-emerald-500/20"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="username" className="text-slate-300">
                  Username
                </Label>
                <Input
                  id="username"
                  type="text"
                  placeholder="Enter username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  autoComplete="off"
                  className="bg-slate-900/50 border-slate-600 text-white placeholder:text-slate-500 focus:border-emerald-500 focus:ring-emerald-500/20"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-slate-300">
                  Password
                </Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="new-password"
                  className="bg-slate-900/50 border-slate-600 text-white placeholder:text-slate-500 focus:border-emerald-500 focus:ring-emerald-500/20"
                />
              </div>

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-white font-semibold"
              >
                Next
              </Button>

              <div className="text-center text-sm mt-4">
                <button
                  type="button"
                  onClick={() => navigate("/login")}
                  className="text-emerald-400 hover:text-emerald-300 transition-colors"
                >
                  Already have an account? Sign in
                </button>
              </div>
            </form>
          )}

          {/* Step 2: Security Question */}
          {step === 2 && (
            <form onSubmit={handleStep2Submit} className="space-y-4">
              {/* Warning Banner */}
              <div className="rounded-lg bg-amber-900/20 border border-amber-600/30 p-3">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-amber-200">
                    REQUIRED: Your security answer is the ONLY way to recover
                    your account if you forget your password. Write it down in a
                    safe place!
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="security-question" className="text-slate-300">
                  Security Question *
                </Label>
                <Select
                  value={securityQuestion}
                  onValueChange={setSecurityQuestion}
                >
                  <SelectTrigger className="bg-slate-900/50 border-slate-600 text-white focus:border-emerald-500 focus:ring-emerald-500/20">
                    <SelectValue placeholder="Select a security question" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-700">
                    {SECURITY_QUESTIONS.map((q) => (
                      <SelectItem
                        key={q}
                        value={q}
                        className="text-white focus:bg-slate-700 focus:text-white"
                      >
                        {q}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="security-answer" className="text-slate-300">
                  Your Answer *{" "}
                  <span className="text-xs text-slate-500">
                    (min. 3 characters)
                  </span>
                </Label>
                <Input
                  id="security-answer"
                  type="text"
                  placeholder="Enter your answer"
                  value={securityAnswer}
                  onChange={(e) => setSecurityAnswer(e.target.value)}
                  required
                  className="bg-slate-900/50 border-slate-600 text-white placeholder:text-slate-500 focus:border-emerald-500 focus:ring-emerald-500/20"
                />
                <p className="text-xs text-slate-500">
                  Answers are not case-sensitive. Keep it simple and memorable.
                </p>
              </div>

              {error && (
                <div className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-md p-3">
                  {error}
                </div>
              )}

              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => {
                    setStep(1);
                    setError("");
                  }}
                  className="text-slate-400 hover:text-white hover:bg-slate-700/50"
                >
                  Back
                </Button>
                <Button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-white font-semibold"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating account...
                    </>
                  ) : (
                    "Create Account"
                  )}
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
