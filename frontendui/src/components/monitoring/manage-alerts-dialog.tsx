"use client";

import { useState } from "react";
import { useAlertRecipients } from "@/hooks/useAlertRecipients";
import { Monitor, AlertRecipient } from "@/types/shared";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Mail,
  Plus,
  Trash2,
  Power,
  PowerOff,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";

interface ManageAlertsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  monitor: Monitor;
}

export function ManageAlertsDialog({
  open,
  onOpenChange,
  monitor,
}: ManageAlertsDialogProps) {
  const {
    recipients,
    loading,
    error,
    addRecipient,
    removeRecipient,
    toggleRecipient,
    refetch,
  } = useAlertRecipients(monitor.id);

  const [newEmail, setNewEmail] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedRecipient, setSelectedRecipient] =
    useState<AlertRecipient | null>(null);

  const handleAddRecipient = async () => {
    if (!newEmail.trim()) return;

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newEmail)) {
      toast.error("Please enter a valid email address");
      return;
    }

    setIsAdding(true);
    try {
      await addRecipient(newEmail.trim());
      setNewEmail("");
    } catch (error) {
      // Error handling is done in the hook
    } finally {
      setIsAdding(false);
    }
  };

  const handleDeleteRecipient = (recipient: AlertRecipient) => {
    setSelectedRecipient(recipient);
    setShowDeleteDialog(true);
  };

  const confirmDeleteRecipient = async () => {
    if (selectedRecipient) {
      try {
        await removeRecipient(selectedRecipient.id);
        setShowDeleteDialog(false);
        setSelectedRecipient(null);
      } catch (error) {
        // Error handling is done in the hook
      }
    }
  };

  const handleToggleRecipient = async (recipient: AlertRecipient) => {
    try {
      await toggleRecipient(recipient.id);
    } catch (error) {
      // Error handling is done in the hook
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleAddRecipient();
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Manage Alert Recipients
            </DialogTitle>
            <DialogDescription>
              Configure email addresses that will receive downtime and recovery
              alerts for <span className="font-medium">{monitor.name}</span>
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Add New Recipient */}
            <div className="space-y-2">
              <Label htmlFor="email">Add Email Address</Label>
              <div className="flex gap-2">
                <Input
                  id="email"
                  type="email"
                  placeholder="alerts@company.com"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  onKeyPress={handleKeyPress}
                  disabled={isAdding}
                />
                <Button
                  onClick={handleAddRecipient}
                  disabled={isAdding || !newEmail.trim()}
                >
                  {isAdding ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Plus className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            {/* Current Recipients */}
            <div className="space-y-2">
              <Label>Current Recipients</Label>

              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin" />
                </div>
              ) : error ? (
                <div className="flex items-center justify-center py-8 text-center">
                  <div className="space-y-2">
                    <AlertCircle className="h-8 w-8 text-red-500 mx-auto" />
                    <p className="text-sm text-muted-foreground">{error}</p>
                    <Button variant="outline" size="sm" onClick={refetch}>
                      Retry
                    </Button>
                  </div>
                </div>
              ) : recipients.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Mail className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>No alert recipients configured</p>
                  <p className="text-xs">
                    Add an email address above to get started
                  </p>
                </div>
              ) : (
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {recipients.map((recipient) => (
                    <div
                      key={recipient.id}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <div className="flex-1">
                          <div className="font-medium">{recipient.email}</div>
                          <div className="text-xs text-muted-foreground">
                            Added{" "}
                            {new Date(recipient.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                        {!recipient.isActive && (
                          <Badge variant="secondary" className="text-xs">
                            Disabled
                          </Badge>
                        )}
                      </div>

                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleToggleRecipient(recipient)}
                          title={
                            recipient.isActive
                              ? "Disable alerts"
                              : "Enable alerts"
                          }
                        >
                          {recipient.isActive ? (
                            <PowerOff className="h-4 w-4" />
                          ) : (
                            <Power className="h-4 w-4" />
                          )}
                        </Button>

                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteRecipient(recipient)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          title="Remove recipient"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Info */}
            <div className="text-xs text-muted-foreground bg-muted/50 p-3 rounded">
              <div className="font-medium mb-1">Alert Types:</div>
              <ul className="space-y-1">
                <li>
                  • <strong>Downtime Alert:</strong> Sent when the monitor goes
                  down
                </li>
                <li>
                  • <strong>Recovery Alert:</strong> Sent when the monitor comes
                  back online
                </li>
                <li>
                  • <strong>Throttling:</strong> Maximum 1 alert per hour to
                  prevent spam
                </li>
              </ul>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Done
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Alert Recipient</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove{" "}
              <span className="font-medium">{selectedRecipient?.email}</span>{" "}
              from receiving alerts for this monitor?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteRecipient}
              className="bg-red-600 hover:bg-red-700"
            >
              Remove Recipient
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
