import { useState } from "react";
import { useNavigate } from "react-router-dom";
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
import { Loader2, ArrowLeft, AlertTriangle, CheckCircle2, ShieldAlert } from "lucide-react";
import { getSecurityQuestion, verifySecurityAnswer, resetPasswordWithSecurity } from "@/services/api";
import { toast } from "sonner";

type Step = 1 | 2 | 3;

export function ForgotPassword() {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>(1);
  const [username, setUsername] = useState("");
  const [securityQuestion, setSecurityQuestion] = useState("");
  const [securityAnswer, setSecurityAnswer] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [attempts, setAttempts] = useState(0);

  const MAX_ATTEMPTS = 3;

  const handleStep1Submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const result = await getSecurityQuestion(username);

      // Check if admin
      if (result.isAdmin) {
        toast.error("Password reset is not available for the admin account");
        setIsLoading(false);
        return;
      }

      if (!result.hasSecurityQuestion || !result.question) {
        setError("No security question found for this username. Please contact support.");
        setIsLoading(false);
        return;
      }

      setSecurityQuestion(result.question);
      setStep(2);
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to retrieve security question");
    } finally {
      setIsLoading(false);
    }
  };

  const handleStep2Submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (attempts >= MAX_ATTEMPTS) {
      setError("Maximum attempts exceeded. Please try again later.");
      return;
    }

    setIsLoading(true);

    try {
      // Verify the security answer before proceeding to step 3
      await verifySecurityAnswer(username, securityAnswer);
      setStep(3);
    } catch (err: any) {
      const newAttempts = attempts + 1;
      setAttempts(newAttempts);

      if (err.response?.status === 401) {
        const remaining = MAX_ATTEMPTS - newAttempts;
        if (remaining > 0) {
          setError(`Incorrect security answer. ${remaining} attempt(s) remaining.`);
        } else {
          setError("Maximum attempts exceeded. Account locked for 15 minutes.");
          toast.error("Too many failed attempts. Please try again later.");
        }
      } else {
        setError(err.response?.data?.error || "Failed to verify security answer");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleStep3Submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (newPassword.length < 4) {
      setError("Password must be at least 4 characters");
      return;
    }

    setIsLoading(true);

    try {
      await resetPasswordWithSecurity(username, securityAnswer, newPassword);
      toast.success("Password reset successfully! Please login with your new password.");
      navigate("/login");
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to reset password");
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    setError("");
    if (step === 2) {
      setStep(1);
      setSecurityQuestion("");
      setSecurityAnswer("");
    } else if (step === 3) {
      setStep(2);
      setNewPassword("");
      setConfirmPassword("");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiMyMDIwMjAiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0djZoNnYtNmgtNnptMCAwdi02aC02djZoNnoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-40" />

      {/* Back to Login Button */}
      <button
        onClick={() => navigate("/login")}
        className="absolute top-6 left-6 z-20 flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span className="text-sm font-medium">Back to Login</span>
      </button>

      <Card className="w-full max-w-md relative z-10 bg-slate-800/80 border-slate-700 backdrop-blur-sm">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl flex items-center justify-center shadow-lg shadow-amber-500/20">
            <ShieldAlert className="w-8 h-8 text-white" />
          </div>
          <div>
            <CardTitle className="text-2xl font-bold text-white">
              Reset Password
            </CardTitle>
            <CardDescription className="text-slate-400">
              Step {step} of 3
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent>
          {/* Step 1: Enter Username */}
          {step === 1 && (
            <form onSubmit={handleStep1Submit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username" className="text-slate-300">
                  Username
                </Label>
                <Input
                  id="username"
                  type="text"
                  placeholder="Enter your username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  autoComplete="username"
                  className="bg-slate-900/50 border-slate-600 text-white placeholder:text-slate-500 focus:border-emerald-500 focus:ring-emerald-500/20"
                />
              </div>

              {error && (
                <div className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-md p-3">
                  {error}
                </div>
              )}

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-white font-semibold"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Checking...
                  </>
                ) : (
                  "Continue"
                )}
              </Button>
            </form>
          )}

          {/* Step 2: Answer Security Question */}
          {step === 2 && (
            <form onSubmit={handleStep2Submit} className="space-y-4">
              <div className="rounded-lg bg-amber-900/20 border border-amber-600/30 p-4">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-amber-200">
                    Answer your security question to reset your password. After {MAX_ATTEMPTS} failed attempts, you'll be locked out for 15 minutes.
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-slate-300">Security Question</Label>
                <div className="bg-slate-900/50 border border-slate-600 rounded-md p-3 text-slate-300">
                  {securityQuestion}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="security-answer" className="text-slate-300">
                  Your Answer
                </Label>
                <Input
                  id="security-answer"
                  type="text"
                  placeholder="Enter your answer"
                  value={securityAnswer}
                  onChange={(e) => setSecurityAnswer(e.target.value)}
                  required
                  autoComplete="off"
                  className="bg-slate-900/50 border-slate-600 text-white placeholder:text-slate-500 focus:border-emerald-500 focus:ring-emerald-500/20"
                />
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
                  onClick={handleBack}
                  className="text-slate-400 hover:text-white hover:bg-slate-700/50"
                >
                  Back
                </Button>
                <Button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-white font-semibold"
                  disabled={isLoading || attempts >= MAX_ATTEMPTS}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Verifying...
                    </>
                  ) : (
                    "Continue"
                  )}
                </Button>
              </div>
            </form>
          )}

          {/* Step 3: Set New Password */}
          {step === 3 && (
            <form onSubmit={handleStep3Submit} className="space-y-4">
              <div className="rounded-lg bg-emerald-900/20 border border-emerald-600/30 p-4">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-emerald-200">
                    Security answer verified! Now set your new password.
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="new-password" className="text-slate-300">
                  New Password
                </Label>
                <Input
                  id="new-password"
                  type="password"
                  placeholder="Enter new password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  autoComplete="new-password"
                  className="bg-slate-900/50 border-slate-600 text-white placeholder:text-slate-500 focus:border-emerald-500 focus:ring-emerald-500/20"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirm-password" className="text-slate-300">
                  Confirm New Password
                </Label>
                <Input
                  id="confirm-password"
                  type="password"
                  placeholder="Confirm new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  autoComplete="new-password"
                  className="bg-slate-900/50 border-slate-600 text-white placeholder:text-slate-500 focus:border-emerald-500 focus:ring-emerald-500/20"
                />
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
                  onClick={handleBack}
                  disabled={isLoading}
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
                      Resetting...
                    </>
                  ) : (
                    "Reset Password"
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

