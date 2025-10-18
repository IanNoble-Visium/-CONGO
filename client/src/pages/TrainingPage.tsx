import { useEffect, useMemo, useRef, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { useLanguage } from "@/contexts/LanguageContext";
import { Play, Square, CheckCircle2, Volume2, Film, BookOpenCheck, Trophy } from "lucide-react";

// Local storage helpers for progress
const PROGRESS_KEY = "training-progress";

type ProgressMap = Record<string, boolean>; // key: video name -> completed

function loadProgress(): ProgressMap {
  try {
    const raw = localStorage.getItem(PROGRESS_KEY);
    return raw ? (JSON.parse(raw) as ProgressMap) : {};
  } catch {
    return {};
  }
}

function saveProgress(p: ProgressMap) {
  try {
    localStorage.setItem(PROGRESS_KEY, JSON.stringify(p));
  } catch {}
}

export default function TrainingPage() {
  const { language, t } = useLanguage();
  const { data: videos, isLoading: loadingVideos, error: videosError } = trpc.training.listVideos.useQuery();
  const { data: prompts, isLoading: loadingPrompts, error: promptsError } = trpc.training.prompts.useQuery();
  const narrate = trpc.training.narrate.useMutation();

  const [progress, setProgress] = useState<ProgressMap>(() => loadProgress());
  const [currentModuleIndex, setCurrentModuleIndex] = useState<number>(0);
  const [currentVideoName, setCurrentVideoName] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [narrating, setNarrating] = useState(false);
  const [narrationError, setNarrationError] = useState<string | null>(null);

  const modules = prompts?.modules ?? [];

  // Map videos by detected number (Video_12_... -> 12)
  const videosByNumber = useMemo(() => {
    const map = new Map<number, { name: string; url: string }>();
    (videos ?? []).forEach(v => {
      const m = v.name.match(/Video_(\d+)/i);
      const n = m ? parseInt(m[1], 10) : NaN;
      if (!isNaN(n)) map.set(n, v);
    });
    return map;
  }, [videos]);

  // Pick a default current video on load
  useEffect(() => {
    if (!currentVideoName && videos && videos.length > 0) {
      setCurrentVideoName(videos[0].name);
    }
  }, [videos, currentVideoName]);

  const totalCount = videos?.length ?? 0;
  const completedCount = useMemo(() => Object.values(progress).filter(Boolean).length, [progress]);
  const completionPct = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  const currentModule = modules[currentModuleIndex];

  function markCompleted(name: string) {
    const next = { ...progress, [name]: true };
    setProgress(next);
    saveProgress(next);
  }

  function stopAudio() {
    setNarrating(false);
    setNarrationError(null);
    const a = audioRef.current;
    if (a) {
      a.pause();
      a.currentTime = 0;
      a.src = "";
    }
  }

  async function playNarration(text: string) {
    try {
      setNarrationError(null);
      setNarrating(true);
      const res = await narrate.mutateAsync({ text, language });
      const a = audioRef.current || new Audio();
      audioRef.current = a;
      a.src = `data:${res.contentType};base64,${res.audioBase64}`;
      await a.play();
      a.onended = () => setNarrating(false);
    } catch (e: any) {
      setNarrating(false);
      setNarrationError(e?.message || "Narration failed");
    }
  }

  function narrationTextFor(videoTitle?: string, useCase?: string, prompt?: string) {
    const overview = language === "fr"
      ? "Bienvenue à la formation CongoAddressMapper. Découvrez comment notre système transforme les services publics, la logistique et le développement économique à travers la RDC."
      : "Welcome to CongoAddressMapper training. Learn how our system transforms public services, logistics, and economic development across the DRC.";
    const body = [videoTitle, useCase, prompt].filter(Boolean).join(". ");
    return `${overview} ${body}`.slice(0, 1200); // keep it concise
  }

  function categoryFromModule(title: string): string {
    const t = title.toLowerCase();
    if (t.includes("gombe")) return language === "fr" ? "Partenariat gouvernemental" : "Government Partnership";
    if (t.includes("tower") || t.includes("landmark")) return language === "fr" ? "Monuments nationaux" : "National Landmarks";
    if (t.includes("boulevard") || t.includes("streets")) return language === "fr" ? "Infrastructure urbaine" : "Urban Infrastructure";
    if (t.includes("post")) return language === "fr" ? "Modernisation postale" : "Postal Modernization";
    return language === "fr" ? "Intégration numérique" : "Digital Integration";
  }

  function Quiz({ moduleTitle }: { moduleTitle: string }) {
    const correct = categoryFromModule(moduleTitle);
    const options = useMemo(() => {
      const base = [
        language === "fr" ? "Partenariat gouvernemental" : "Government Partnership",
        language === "fr" ? "Monuments nationaux" : "National Landmarks",
        language === "fr" ? "Infrastructure urbaine" : "Urban Infrastructure",
        language === "fr" ? "Modernisation postale" : "Postal Modernization",
        language === "fr" ? "Intégration numérique" : "Digital Integration",
      ];
      return base.sort(() => Math.random() - 0.5);
    }, [language, moduleTitle]);

    const [selected, setSelected] = useState<string | null>(null);
    const [result, setResult] = useState<"idle" | "correct" | "wrong">("idle");

    function submit() {
      if (!selected) return;
      setResult(selected === correct ? "correct" : "wrong");
    }

    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpenCheck className="h-5 w-5" /> {t("training.quiz")}
          </CardTitle>
          <CardDescription>
            {language === "fr" ? "Quelle catégorie décrit le mieux ce module ?" : "Which category best describes this module?"}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {options.map(opt => (
              <Button
                key={opt}
                variant={selected === opt ? "default" : "outline"}
                onClick={() => setSelected(opt)}
                className="justify-start"
              >
                {opt}
              </Button>
            ))}
          </div>
          <div className="flex gap-2">
            <Button onClick={submit} disabled={!selected}>
              {t("training.submitQuiz")}
            </Button>
            {result !== "idle" && (
              <Badge variant={result === "correct" ? "default" : "destructive"}>
                {result === "correct"
                  ? language === "fr" ? "Correct" : "Correct"
                  : language === "fr" ? "Incorrect" : "Incorrect"}
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Overview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5" /> {t("training.title")}
            </CardTitle>
            <CardDescription>{t("training.overview")}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-4">
              <Progress value={completionPct} className="w-48" />
              <div className="text-sm text-muted-foreground">
                {t("training.progress")} • {completedCount}/{totalCount} ({completionPct}%)
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Error states */}
        {(videosError || promptsError) && (
          <Alert variant="destructive">
            <AlertTitle>{t("common.error")}</AlertTitle>
            <AlertDescription>
              {(videosError as any)?.message || (promptsError as any)?.message || "Failed to load training content"}
            </AlertDescription>
          </Alert>
        )}

        {/* Content */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Left: Modules and Videos */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Film className="h-5 w-5" /> {t("training.videos")}
                </CardTitle>
                <CardDescription>
                  {loadingVideos || loadingPrompts ? t("training.loading") : `${videos?.length || 0} ${language === "fr" ? "vidéos" : "videos"}`}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Tabs value={String(currentModuleIndex)} onValueChange={(v) => setCurrentModuleIndex(parseInt(v, 10))}>
                  <TabsList className="w-full overflow-x-auto">
                    {modules.map((m: any, idx: number) => (
                      <TabsTrigger key={idx} value={String(idx)} className="whitespace-nowrap">
                        {m.title}
                      </TabsTrigger>
                    ))}
                  </TabsList>

                  {modules.map((m: any, idx: number) => (
                    <TabsContent key={idx} value={String(idx)} className="space-y-4">
                      <div className="grid gap-4 md:grid-cols-2">
                        {m.videos.map((v: any) => {
                          const linked = videosByNumber.get(v.number);
                          if (!linked) return null;
                          const isActive = currentVideoName === linked.name;
                          return (
                            <Card key={linked.name} className={isActive ? "ring-2 ring-primary" : ""}>
                              <CardHeader>
                                <CardTitle className="text-sm">{v.title}</CardTitle>
                                <CardDescription>
                                  <span className="block text-xs opacity-70">Video {v.number}</span>
                                  {v.useCase && <span className="block text-xs">{v.useCase}</span>}
                                </CardDescription>
                              </CardHeader>
                              <CardContent className="space-y-2">
                                <video
                                  src={linked.url}
                                  className="w-full rounded border"
                                  controls
                                  onPlay={() => setCurrentVideoName(linked.name)}
                                />
                                <div className="flex gap-2">
                                  <Button
                                    size="sm"
                                    onClick={() =>
                                      playNarration(narrationTextFor(v.title, v.useCase, v.prompt))
                                    }
                                    disabled={narrate.isPending}
                                  >
                                    <Volume2 className="h-4 w-4 mr-2" />
                                    {narrating ? t("training.stopNarration") : t("training.playNarration")}
                                  </Button>
                                  <Button size="sm" variant="outline" onClick={() => markCompleted(linked.name)}>
                                    <CheckCircle2 className="h-4 w-4 mr-2" />
                                    {t("training.markComplete")}
                                  </Button>
                                  {progress[linked.name] && (
                                    <Badge variant="default">{t("training.completed")}</Badge>
                                  )}
                                </div>
                              </CardContent>
                            </Card>
                          );
                        })}
                      </div>
                    </TabsContent>
                  ))}
                </Tabs>

                {(!videos || videos.length === 0) && (
                  <p className="text-sm text-muted-foreground">{t("training.noVideos")}</p>
                )}

                {narrationError && (
                  <Alert variant="destructive">
                    <AlertTitle>{t("common.error")}</AlertTitle>
                    <AlertDescription>{narrationError}</AlertDescription>
                  </Alert>
                )}

                <audio ref={audioRef} hidden />
              </CardContent>
            </Card>
          </div>

          {/* Right: Quiz and Module Summary */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>{t("training.modules")}</CardTitle>
                <CardDescription>
                  {modules[currentModuleIndex]?.title || (language === "fr" ? "Aucun module" : "No module")}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                {modules[currentModuleIndex]?.videos?.[0]?.prompt && (
                  <p className="text-sm text-muted-foreground">
                    {modules[currentModuleIndex]?.videos?.[0]?.prompt}
                  </p>
                )}
              </CardContent>
            </Card>

            {modules[currentModuleIndex] && (
              <Quiz moduleTitle={modules[currentModuleIndex].title} />
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
