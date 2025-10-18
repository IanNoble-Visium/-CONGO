import { useEffect, useState } from "react";
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
import { Database, AlertCircle, CheckCircle, Loader, RefreshCw, Image as ImageIcon, SlidersHorizontal } from "lucide-react";
import { useAuth } from "@/_core/hooks/useAuth";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { getMediaSettings, resetMediaSettings, saveMediaSettings, type TrainingMediaSettings } from "@/lib/trainingSettings";
import { useLanguage } from "@/contexts/LanguageContext";

export default function SettingsPage() {
  const { user } = useAuth();
  const { language } = useLanguage();
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

  // Training media settings state
  const [media, setMedia] = useState<TrainingMediaSettings>(() => getMediaSettings());
  const [saveMsg, setSaveMsg] = useState<string>("");

  // Training content for image management
  type ModulePage = { title: string; body: string };
  type Module = { id: string; title: string; pages: ModulePage[] };
  const [modules, setModules] = useState<Module[]>([]);
  useEffect(() => {
    const url = language === "fr" ? "/training/training.fr.json" : "/training/training.en.json";
    fetch(url)
      .then((r) => r.json())
      .then((data: { modules: Array<{ id: string; title: string; pages: Array<{ title: string; body: string }> }> }) => {
        setModules(data.modules.map(m => ({ id: m.id, title: m.title, pages: m.pages.map(p => ({ title: p.title, body: p.body })) })));
      })
      .catch(() => setModules([]));
  }, [language]);

  // tRPC mutations for image generation
  const genMutation = trpc.training.generatePageImage.useMutation();

  async function regenerateOne(moduleId: string, pageIndex: number, prompt: string) {
    await genMutation.mutateAsync({ moduleId, pageIndex, prompt, force: true });
  }

  const [regenOpen, setRegenOpen] = useState(false);
  const [regenLoading, setRegenLoading] = useState(false);

  async function regenerateAll() {
    setRegenLoading(true);
    for (const m of modules) {
      for (let i = 0; i < m.pages.length; i++) {
        const p = m.pages[i];
        const prompt = `${m.title}. ${p.title}. ${p.body}`.slice(0, 800);
        try { await regenerateOne(m.id, i, prompt); } catch {}
      }
    }
    setRegenLoading(false);
    setRegenOpen(false);
  }

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

              {/* Training Media Settings */}
              <div className="space-y-4 p-4 bg-slate-50 rounded-lg border border-slate-200">
                <div className="flex items-center gap-2 mb-2">
                  <SlidersHorizontal className="h-5 w-5" />
                  <h3 className="font-semibold text-lg">Training Media Settings</h3>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="text-sm font-medium">Background Opacity ({Math.round(media.opacity * 100)}%)</label>
                    <Slider min={10} max={50} value={[Math.round(media.opacity * 100)]} onValueChange={(v) => setMedia(m => ({ ...m, opacity: (v[0] ?? 30) / 100 }))} />
                    <p className="text-xs text-muted-foreground mt-1">Adjust to improve readability. Typical range: 25%–35%.</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Background Blur ({media.blur.toFixed(1)}px)</label>
                    <Slider min={0} max={4} value={[Math.round(media.blur * 10)]} onValueChange={(v) => setMedia(m => ({ ...m, blur: (v[0] ?? 10) / 10 }))} />
                    <p className="text-xs text-muted-foreground mt-1">Subtle blur helps text stand out. 0–3px recommended.</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Switch checked={media.gradient} onCheckedChange={(val) => setMedia(m => ({ ...m, gradient: !!val }))} />
                  <span className="text-sm">Enable subtle gradient overlay</span>
                </div>
                <div className="flex gap-2">
                  <Button onClick={() => { saveMediaSettings(media); setSaveMsg("Saved"); setTimeout(() => setSaveMsg(""), 2000); }}>Save</Button>
                  <Button variant="outline" onClick={() => { resetMediaSettings(); const def = getMediaSettings(); setMedia(def); }}>Reset</Button>
                  {saveMsg && <span className="text-sm text-green-600">{saveMsg}</span>}
                </div>
              </div>

              {/* Training Image Management */}
              <div className="space-y-4 p-4 bg-slate-50 rounded-lg border border-slate-200">
                <div className="flex items-center gap-2 mb-2">
                  <ImageIcon className="h-5 w-5" />
                  <h3 className="font-semibold text-lg">Training Image Management</h3>
                </div>
                <p className="text-sm text-gray-600">Regenerate images to match the latest visual style and DRC context.</p>
                <Button variant="outline" className="flex items-center gap-2" onClick={() => setRegenOpen(true)} disabled={regenLoading}>
                  <RefreshCw className="h-4 w-4" /> {regenLoading ? "Regenerating..." : "Regenerate All Images"}
                </Button>
                <AlertDialog open={regenOpen} onOpenChange={setRegenOpen}>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Regenerate all training images?</AlertDialogTitle>
                      <AlertDialogDescription>This will overwrite existing images in Cloudinary with newly generated ones using current settings.</AlertDialogDescription>
                    </AlertDialogHeader>
                    <div className="flex gap-3">
                      <AlertDialogCancel disabled={regenLoading}>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={regenerateAll} disabled={regenLoading} className="bg-[#007FFF] hover:bg-[#0066cc]">Regenerate All</AlertDialogAction>
                    </div>
                  </AlertDialogContent>
                </AlertDialog>

                <div className="space-y-3">
                  {modules.map((m) => (
                    <Card key={m.id}>
                      <CardHeader>
                        <CardTitle className="text-base">{m.title}</CardTitle>
                        <CardDescription>{m.id}</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        {m.pages.map((p, idx) => {
                          const prompt = `${m.title}. ${p.title}. ${p.body}`.slice(0, 800);
                          const run = () => regenerateOne(m.id, idx, prompt);
                          return (
                            <div key={idx} className="flex items-center justify-between gap-3 py-2 border-b last:border-0">
                              <div className="min-w-0">
                                <div className="text-sm font-medium truncate">{idx + 1}. {p.title}</div>
                                <div className="text-xs text-muted-foreground truncate">{p.body}</div>
                              </div>
                              <Button size="sm" onClick={run} disabled={genMutation.status === "pending"}>
                                <RefreshCw className="h-4 w-4 mr-1" /> Regenerate
                              </Button>
                            </div>
                          );
                        })}
                      </CardContent>
                    </Card>
                  ))}
                </div>
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

