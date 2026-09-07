import { useState } from "react";
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
import { User, Loader2, CheckCircle2 } from "lucide-react";

interface ProfileInfoSectionProps {
  username: string;
  name: string;
  currency: "USD" | "INR";
  onUpdateProfile: (name: string, currency: "USD" | "INR") => Promise<void>;
}

export function ProfileInfoSection({
  username,
  name: initialName,
  currency: initialCurrency,
  onUpdateProfile,
}: ProfileInfoSectionProps) {
  const [name, setName] = useState(initialName);
  const [selectedCurrency, setSelectedCurrency] = useState<"USD" | "INR">(
    initialCurrency
  );
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess(false);
    setIsLoading(true);

    try {
      await onUpdateProfile(name, selectedCurrency);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch {
      setError("Failed to update profile");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="bg-slate-800/50 border-slate-700">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <User className="w-5 h-5" />
          Personal Information
        </CardTitle>
        <CardDescription className="text-slate-400">
          Update your display name
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="username" className="text-slate-300">
              Username
            </Label>
            <Input
              id="username"
              type="text"
              value={username}
              disabled
              className="bg-slate-900/50 border-slate-600 text-slate-500"
            />
            <p className="text-xs text-slate-500">
              Username cannot be changed
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="name" className="text-slate-300">
              Display Name
            </Label>
            <Input
              id="name"
              type="text"
              placeholder="Enter your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="bg-slate-900/50 border-slate-600 text-white placeholder:text-slate-500 focus:border-emerald-500 focus:ring-emerald-500/20"
            />
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="currency"
              className="text-slate-300 flex items-center gap-2"
            >
              Default Currency
            </Label>
            <Select
              value={selectedCurrency}
              onValueChange={(value: "USD" | "INR") =>
                setSelectedCurrency(value)
              }
            >
              <SelectTrigger className="bg-slate-900/50 border-slate-600 text-white focus:border-emerald-500 focus:ring-emerald-500/20">
                <SelectValue placeholder="Select currency" />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-700">
                <SelectItem value="INR" className="text-white">
                  ₹ Indian Rupees (INR)
                </SelectItem>
                <SelectItem value="USD" className="text-white">
                  $ US Dollars (USD)
                </SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-slate-500">
              This will be used throughout the application for displaying
              amounts
            </p>
          </div>

          {error && (
            <div className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-md p-3">
              {error}
            </div>
          )}

          {success && (
            <div className="text-emerald-400 text-sm bg-emerald-500/10 border border-emerald-500/20 rounded-md p-3 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              Profile updated successfully!
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
                Saving...
              </>
            ) : (
              "Save Changes"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

