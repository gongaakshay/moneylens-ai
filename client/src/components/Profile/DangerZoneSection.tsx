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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ShieldAlert, Trash2, AlertTriangle, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface DangerZoneSectionProps {
  isAdminUser: boolean;
  username: string;
  onDeleteAccount: (password: string) => Promise<void>;
  onNavigateHome: () => void;
}

export function DangerZoneSection({
  isAdminUser,
  username,
  onDeleteAccount,
  onNavigateHome,
}: DangerZoneSectionProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletePassword, setDeletePassword] = useState("");
  const [deleteConfirmUsername, setDeleteConfirmUsername] = useState("");
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);

  const handleDeleteAccount = async () => {
    if (deleteConfirmUsername !== username) {
      toast.error("Username does not match");
      return;
    }

    setIsDeletingAccount(true);
    try {
      await onDeleteAccount(deletePassword);
      setTimeout(() => {
        onNavigateHome();
      }, 1000);
    } catch {
      // Error already shown in toast by context
      setIsDeletingAccount(false);
    }
  };

  return (
    <>
      <Card className="bg-red-950/20 border-red-900/50">
        <CardHeader>
          <CardTitle className="text-red-400 flex items-center gap-2">
            <ShieldAlert className="w-5 h-5" />
            Danger Zone
          </CardTitle>
          <CardDescription className="text-red-300/70">
            Irreversible actions that affect your account
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {isAdminUser && (
            <div className="rounded-lg bg-amber-900/20 border border-amber-600/30 p-3 flex items-start gap-2 mb-4">
              <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-amber-200">
                Account deletion is disabled for the admin account to prevent
                accidental removal of the demo account.
              </p>
            </div>
          )}
          <div
            className={`rounded-lg border border-red-900/30 bg-red-950/30 p-4 ${
              isAdminUser ? "opacity-50" : ""
            }`}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-white font-semibold mb-1">
                  Delete Account
                </h3>
                <p className="text-sm text-red-300/70">
                  Permanently delete your account and all associated data. This
                  action cannot be undone.
                </p>
              </div>
              <Button
                variant="destructive"
                onClick={() => setDeleteDialogOpen(true)}
                disabled={isAdminUser}
                className="bg-red-600 hover:bg-red-700 text-white shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete Account
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Account Deletion Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="bg-slate-800 border-red-900/50 text-white sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-400">
              <AlertTriangle className="w-5 h-5" />
              Delete Account - This Action is IRREVERSIBLE
            </DialogTitle>
            <DialogDescription className="text-slate-300 space-y-2">
              <p className="font-bold text-red-400">
                WARNING: This will permanently delete:
              </p>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li>All your month data and transactions</li>
                <li>All recurring expenses</li>
                <li>All AI insights</li>
                <li>Your user account</li>
              </ul>
              <p className="text-red-300 font-semibold mt-3">
                This action cannot be undone!
              </p>
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="delete-password" className="text-slate-300">
                Confirm Your Password
              </Label>
              <Input
                id="delete-password"
                type="password"
                placeholder="Enter your password"
                value={deletePassword}
                onChange={(e) => setDeletePassword(e.target.value)}
                className="bg-slate-900/50 border-slate-600 text-white"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="delete-confirm" className="text-slate-300">
                Type your username to confirm:{" "}
                <span className="font-mono text-white">{username}</span>
              </Label>
              <Input
                id="delete-confirm"
                type="text"
                placeholder="Type your username"
                value={deleteConfirmUsername}
                onChange={(e) => setDeleteConfirmUsername(e.target.value)}
                className="bg-slate-900/50 border-slate-600 text-white"
              />
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="ghost"
              onClick={() => {
                setDeleteDialogOpen(false);
                setDeletePassword("");
                setDeleteConfirmUsername("");
              }}
              disabled={isDeletingAccount}
              className="text-slate-400 hover:text-white hover:bg-slate-700/50"
            >
              Cancel
            </Button>
            <Button
              onClick={handleDeleteAccount}
              disabled={
                isDeletingAccount ||
                !deletePassword ||
                deleteConfirmUsername !== username
              }
              className="bg-red-600 hover:bg-red-700 text-white font-medium"
            >
              {isDeletingAccount ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete My Account"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

