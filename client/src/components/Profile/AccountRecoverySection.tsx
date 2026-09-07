import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ShieldCheck, CheckCircle2, Loader2, AlertTriangle } from "lucide-react";

interface AccountRecoverySectionProps {
  isAdminUser: boolean;
  isLoading: boolean;
  onOpenDialog: () => void;
}

export function AccountRecoverySection({
  isAdminUser,
  isLoading,
  onOpenDialog,
}: AccountRecoverySectionProps) {
  return (
    <Card className="bg-slate-800/50 border-slate-700">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <ShieldCheck className="w-5 h-5" />
          Account Recovery
        </CardTitle>
        <CardDescription className="text-slate-400">
          Security question for password recovery
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {!isAdminUser ? (
          <>
            <div className="rounded-lg bg-emerald-900/20 border border-emerald-600/30 p-4">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-emerald-300">
                    Security Question Configured
                  </p>
                  <p className="text-sm text-emerald-200/80 mt-1">
                    Your security question can be used to reset your password if
                    you forget it.
                  </p>
                </div>
              </div>
            </div>

            <Button
              onClick={onOpenDialog}
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-semibold"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Loading...
                </>
              ) : (
                "Change Security Question"
              )}
            </Button>
          </>
        ) : (
          <div className="rounded-lg bg-amber-900/20 border border-amber-600/30 p-3 flex items-start gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-amber-200">
              Security questions are not available for the admin account.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

