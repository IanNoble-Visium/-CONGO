import { useState } from "react";
import { trpc } from "@/lib/trpc";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Database, AlertCircle, CheckCircle, Loader } from "lucide-react";
import { useAuth } from "@/_core/hooks/useAuth";

export default function SettingsPage() {
  const { user } = useAuth();
  const [showSeedDialog, setShowSeedDialog] = useState(false);
  const [seedStatus, setSeedStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [seedMessage, setSeedMessage] = useState("");
  const [seedResult, setSeedResult] = useState<{ provinces: number; addresses: number } | null>(null);

  const seedMutation = trpc.admin.seedDatabase.useMutation({
    onSuccess: (data) => {
      setSeedStatus("success");
      setSeedResult(data);
      setSeedMessage(`✅ Database seeded successfully! Created ${data.provinces} provinces and ${data.addresses} addresses.`);
      setTimeout(() => {
        setShowSeedDialog(false);
        setSeedStatus("idle");
        setSeedMessage("");
        setSeedResult(null);
      }, 3000);
    },
    onError: (error) => {
      setSeedStatus("error");
      setSeedMessage(`❌ Error seeding database: ${error.message}`);
    },
  });

  const handleSeedDatabase = async () => {
    setSeedStatus("loading");
    setSeedMessage("Seeding database...");
    await seedMutation.mutateAsync();
  };

  const isAdmin = user?.role === "admin";

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
          <p className="text-muted-foreground">Manage application settings and administrative tasks</p>
        </div>

        {/* Admin Section */}
        {isAdmin && (
          <Card className="border-[#007FFF]/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5 text-[#007FFF]" />
                Admin Tools
              </CardTitle>
              <CardDescription>Administrative functions for managing the application</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Seed Database Section */}
              <div className="space-y-4 p-4 bg-slate-50 rounded-lg border border-slate-200">
                <div>
                  <h3 className="font-semibold text-lg mb-2">Load Sample Data</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Populate the database with sample provinces and addresses from across the DRC. This will create:
                  </p>
                  <ul className="text-sm text-gray-600 space-y-1 ml-4 mb-4">
                    <li>• 26 provinces with demographic data</li>
                    <li>• 12 sample addresses across major cities (Kinshasa, Lubumbashi, Goma, Bukavu, Kisangani)</li>
                    <li>• Verification status and confidence scores</li>
                  </ul>
                </div>

                {seedStatus === "success" && seedResult && (
                  <Alert className="border-green-200 bg-green-50">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <AlertDescription className="text-green-800">
                      ✅ Successfully created {seedResult.provinces} provinces and {seedResult.addresses} addresses!
                    </AlertDescription>
                  </Alert>
                )}

                {seedStatus === "error" && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{seedMessage}</AlertDescription>
                  </Alert>
                )}

                <Button
                  onClick={() => setShowSeedDialog(true)}
                  disabled={seedStatus === "loading"}
                  className="bg-[#007FFF] hover:bg-[#0066cc] text-white"
                >
                  {seedStatus === "loading" ? (
                    <>
                      <Loader className="mr-2 h-4 w-4 animate-spin" />
                      Seeding...
                    </>
                  ) : (
                    <>
                      <Database className="mr-2 h-4 w-4" />
                      Load Sample Data
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Non-Admin Message */}
        {!isAdmin && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Admin tools are only available to administrators. Contact your system administrator for access.
            </AlertDescription>
          </Alert>
        )}

        {/* General Settings */}
        <Card>
          <CardHeader>
            <CardTitle>General Settings</CardTitle>
            <CardDescription>Application preferences and information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Application Name</label>
              <p className="text-sm text-gray-600">CongoAddressMapper</p>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Version</label>
              <p className="text-sm text-gray-600">1.0.0</p>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Database</label>
              <p className="text-sm text-gray-600">PostgreSQL (Neon)</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Seed Database Confirmation Dialog */}
      <AlertDialog open={showSeedDialog} onOpenChange={setShowSeedDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Load Sample Data?</AlertDialogTitle>
            <AlertDialogDescription>
              This will populate the database with 26 provinces and 12 sample addresses. This action cannot be undone.
              If data already exists, it will be updated.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="space-y-2 my-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-sm font-semibold text-blue-900">Data to be created:</p>
            <ul className="text-sm text-blue-800 space-y-1 ml-4">
              <li>• 26 DRC provinces</li>
              <li>• 12 sample addresses</li>
              <li>• Verification statuses and confidence scores</li>
            </ul>
          </div>
          <div className="flex gap-3">
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleSeedDatabase}
              disabled={seedStatus === "loading"}
              className="bg-[#007FFF] hover:bg-[#0066cc]"
            >
              {seedStatus === "loading" ? "Seeding..." : "Load Data"}
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
}

