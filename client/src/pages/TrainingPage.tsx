import { useEffect, useMemo, useRef, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { trpc } from "@/lib/trpc";
import { useLanguage } from "@/contexts/LanguageContext";
import { CheckCircle2, Volume2, Trophy, Layers3, ArrowRight, ArrowLeft } from "lucide-react";
import { useAuth } from "@/_core/hooks/useAuth";

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
  const { isAuthenticated, user } = useAuth();
  const { data: videos, isLoading: loadingVideos, error: videosError } = trpc.training.listVideos.useQuery();
  const narrate = trpc.training.narrate.useMutation();
  const saveProgressMutation = trpc.training.saveProgress.useMutation();
  const { data: serverProgress, refetch: refetchProgress } = trpc.training.getProgress.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  const [moduleProgress, setModuleProgress] = useState<Record<string, number>>(() => {
    try {
      const raw = localStorage.getItem("training-module-progress");
      return raw ? JSON.parse(raw) : {};
    } catch {
      return {};
    }
  });
  const [activeModule, setActiveModule] = useState<string | null>(null);
  const [activePageIndex, setActivePageIndex] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [narrating, setNarrating] = useState(false);
  const [narrationError, setNarrationError] = useState<string | null>(null);
  const [showCertificate, setShowCertificate] = useState(false);

  const [modules, setModules] = useState<Module[]>([]);
  // Load content from JSON and attach b-roll URLs from available videos
  useEffect(() => {
    const url = language === "fr" ? "/training/training.fr.json" : "/training/training.en.json";
    fetch(url)
      .then((r) => r.json())
      .then((data: { modules: Array<{ id: string; title: string; summary: string; pages: Array<{ title: string; body: string; keywords?: string[]; quiz?: QuizSpec }> }> }) => {
        const v = videos || [];
        const findByKeywords = (kw?: string[]) => {
          if (!kw || kw.length === 0) return undefined;
          const hit = v.find((vid) => kw.some((k) => vid.name.toLowerCase().includes(k.toLowerCase())));
          return hit?.url;
        };
        const mods: Module[] = data.modules.map((m) => ({
          id: m.id,
          title: m.title,
          summary: m.summary,
          pages: m.pages.map((p) => ({ title: p.title, body: p.body, videoUrl: findByKeywords(p.keywords), quiz: p.quiz })),
        }));
        setModules(mods);
      })
      .catch(() => setModules([]));
  }, [language, videos]);
  // Hydrate local progress from server on load
  useEffect(() => {
    if (!serverProgress || !Array.isArray(serverProgress)) return;
    const merged: Record<string, number> = { ...moduleProgress };
    for (const row of serverProgress as any[]) {
      if (row?.moduleId != null && typeof row.lastPage === "number") {
        merged[row.moduleId] = Math.max(merged[row.moduleId] ?? 0, row.lastPage);
      }
    }
    setModuleProgress(merged);
    try { localStorage.setItem("training-module-progress", JSON.stringify(merged)); } catch {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [serverProgress]);
  const totalPages = modules.reduce((sum, m) => sum + m.pages.length, 0);
  const completedPages = Object.entries(moduleProgress).reduce((a, [mid, idx]) => {
    const mod = modules.find((m) => m.id === mid);
    if (!mod) return a;
    return a + Math.min(idx + 1, mod.pages.length);
  }, 0);
  const overallPct = totalPages ? Math.round((completedPages / totalPages) * 100) : 0;

  function saveModuleProgress(next: Record<string, number>) {
    setModuleProgress(next);
    try {
      localStorage.setItem("training-module-progress", JSON.stringify(next));
    } catch {}
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

  function openModule(id: string) {
    setActiveModule(id);
    setActivePageIndex(moduleProgress[id] ? Math.min(moduleProgress[id], (modules.find(m => m.id === id)?.pages.length || 1) - 1) : 0);
    stopAudio();
  }

  function closeModule() {
    setActiveModule(null);
    setActivePageIndex(0);
    stopAudio();
  }

  function nextPage() {
    if (!activeModule) return;
    const mod = modules.find(m => m.id === activeModule);
    if (!mod) return;
    const nextIndex = Math.min(activePageIndex + 1, mod.pages.length - 1);
    const nextProg = { ...moduleProgress, [activeModule]: Math.max(moduleProgress[activeModule] || 0, nextIndex) };
    saveModuleProgress(nextProg);
    setActivePageIndex(nextIndex);
    // Persist to server
    if (isAuthenticated) {
      saveProgressMutation.mutate({
        moduleId: activeModule,
        lastPage: nextIndex,
        completedPages: Math.min(nextIndex + 1, mod.pages.length),
        totalPages: mod.pages.length,
      }, { onSuccess: () => refetchProgress() });
    }
  }

  function prevPage() {
    if (!activeModule) return;
    setActivePageIndex(Math.max(activePageIndex - 1, 0));
  }

  const active = activeModule ? modules.find(m => m.id === activeModule) : null;
  const currentPage = active ? active.pages[activePageIndex] : null;

  // Auto-play narration and background video when page changes
  const bgVideoRef = useRef<HTMLVideoElement | null>(null);
  // Draggable / resizable dialog state
  const [dlgPos, setDlgPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [dlgSize, setDlgSize] = useState<{ w: number; h: number | 'auto' }>({ w: 0, h: 'auto' });
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const dragStartRef = useRef<{ mx: number; my: number; x: number; y: number } | null>(null);
  const resizeStartRef = useRef<{ mx: number; my: number; w: number; h: number } | null>(null);
  const [isMaximized, setIsMaximized] = useState(false);
  const contentRef = useRef<HTMLDivElement | null>(null);
  const [dlgInitialized, setDlgInitialized] = useState(false);
  const [autoCenter, setAutoCenter] = useState(true);

  // Initialize centered position and default size on open
  useEffect(() => {
    if (!activeModule) return;
    const w = Math.min(Math.floor(window.innerWidth * 0.9), 1100);
    const hPx = Math.min(Math.floor(window.innerHeight * 0.8), 680);
    const x = Math.max(8, Math.floor((window.innerWidth - w) / 2));
    const y = Math.max(8, Math.floor((window.innerHeight - hPx) / 2));
    setDlgSize({ w, h: hPx });
    setDlgPos({ x, y });
    setIsMaximized(false);
    setDlgInitialized(true);
    setAutoCenter(true);
  }, [activeModule]);
  useEffect(() => {
    if (!activeModule) setDlgInitialized(false);
  }, [activeModule]);
  useEffect(() => {
    if (active && currentPage) {
      // Attempt autoplay narration
      const text = `${active.title}. ${currentPage.title}. ${currentPage.body}`;
      playNarration(text);
      // Attempt autoplay video
      const v = bgVideoRef.current;
      if (v) {
        v.currentTime = 0;
        const p = v.play();
        if (p && typeof p.then === "function") {
          p.catch(() => {/* ignored: browser may block but video is muted so usually allowed */});
        }
      }
      // Save current position to server
      if (isAuthenticated) {
        saveProgressMutation.mutate({
          moduleId: active.id,
          lastPage: activePageIndex,
          completedPages: Math.min((moduleProgress[active.id] ?? 0) + 1, active.pages.length),
          totalPages: active.pages.length,
        });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeModule, activePageIndex]);

  // Drag handlers
  useEffect(() => {
    function onMove(e: MouseEvent) {
      if (isDragging && dragStartRef.current) {
        const dx = e.clientX - dragStartRef.current.mx;
        const dy = e.clientY - dragStartRef.current.my;
        const nextX = Math.max(0, Math.min(window.innerWidth - 80, dragStartRef.current.x + dx));
        const nextY = Math.max(0, Math.min(window.innerHeight - 80, dragStartRef.current.y + dy));
        setDlgPos({ x: nextX, y: nextY });
      } else if (isResizing && resizeStartRef.current) {
        const dx = e.clientX - resizeStartRef.current.mx;
        const dy = e.clientY - resizeStartRef.current.my;
        const w = Math.min(Math.max(360, resizeStartRef.current.w + dx), window.innerWidth - dlgPos.x - 8);
        const h = Math.min(Math.max(280, resizeStartRef.current.h + dy), window.innerHeight - dlgPos.y - 8);
        setDlgSize({ w, h });
      }
    }
    function onUp() {
      setIsDragging(false);
      setIsResizing(false);
      dragStartRef.current = null;
      resizeStartRef.current = null;
    }
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
  }, [isDragging, isResizing, dlgPos.x, dlgPos.y]);

  const startDrag = (e: React.MouseEvent) => {
    if (isMaximized) return;
    setIsDragging(true);
    dragStartRef.current = { mx: e.clientX, my: e.clientY, x: dlgPos.x, y: dlgPos.y };
    setAutoCenter(false);
  };
  const startResize = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsResizing(true);
    const curH = typeof dlgSize.h === 'number' ? dlgSize.h : (contentRef.current?.getBoundingClientRect().height || 600);
    resizeStartRef.current = { mx: e.clientX, my: e.clientY, w: dlgSize.w, h: curH };
    setAutoCenter(false);
  };
  const toggleMaximize = () => {
    if (!isMaximized) {
      setDlgPos({ x: 8, y: 8 });
      setDlgSize({ w: window.innerWidth - 16, h: window.innerHeight - 16 });
      setIsMaximized(true);
      setAutoCenter(false);
    } else {
      const w = Math.min(Math.floor(window.innerWidth * 0.9), 1100);
      const hPx = Math.min(Math.floor(window.innerHeight * 0.8), 680);
      const x = Math.max(8, Math.floor((window.innerWidth - w) / 2));
      const y = Math.max(8, Math.floor((window.innerHeight - hPx) / 2));
      setDlgPos({ x, y });
      setDlgSize({ w, h: hPx });
      setIsMaximized(false);
    }
  };
  const resetPosition = () => {
    const w = Math.min(Math.floor(window.innerWidth * 0.9), 1100);
    const hPx = Math.min(Math.floor(window.innerHeight * 0.8), 680);
    const x = Math.max(8, Math.floor((window.innerWidth - w) / 2));
    const y = Math.max(8, Math.floor((window.innerHeight - hPx) / 2));
    setDlgPos({ x, y });
    setDlgSize({ w, h: hPx });
    setIsMaximized(false);
    setDlgInitialized(true);
    setAutoCenter(true);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5" /> {t("training.title")}
            </CardTitle>
            <CardDescription>{t("training.overview")}</CardDescription>
          </CardHeader>
          <CardContent className="flex items-center gap-4">
            <Progress value={overallPct} className="w-48" />
            <div className="text-sm text-muted-foreground">
              {t("training.progress")} • {completedPages}/{totalPages} ({overallPct}%)
            </div>
          </CardContent>
        </Card>

        {(videosError) && (
          <Alert variant="destructive">
            <AlertTitle>{t("common.error")}</AlertTitle>
            <AlertDescription>{(videosError as any)?.message || "Failed to load videos"}</AlertDescription>
          </Alert>
        )}

        {/* Completion banner */}
        {totalPages > 0 && completedPages >= totalPages && (
          <Card className="bg-emerald-50 border-emerald-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-emerald-700">
                <Trophy className="h-5 w-5" /> {language === "fr" ? "Formation terminée" : "Training Completed"}
              </CardTitle>
              <CardDescription className="text-emerald-700">
                {language === "fr" ? "Vous avez complété toutes les pages. Téléchargez votre certificat." : "You completed all pages. Download your certificate."}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={() => setShowCertificate(true)}>{language === "fr" ? "Voir le certificat" : "View Certificate"}</Button>
            </CardContent>
          </Card>
        )}

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {modules.map((m) => {
            const prog = Math.round(((moduleProgress[m.id] || 0) / Math.max(1, m.pages.length - 1)) * 100);
            return (
              <Card key={m.id}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2"><Layers3 className="h-5 w-5" /> {m.title}</CardTitle>
                  <CardDescription>{m.summary}</CardDescription>
                </CardHeader>
                <CardContent className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Progress value={prog} className="w-32" />
                    <span className="text-xs text-muted-foreground">{prog}%</span>
                  </div>
                  <Button onClick={() => openModule(m.id)} aria-label={language === "fr" ? `Ouvrir le module ${m.title}` : `Open module ${m.title}`}>
                    {moduleProgress[m.id] ? (language === "fr" ? "Reprendre" : "Resume") : (language === "fr" ? "Commencer" : "Start")}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <Dialog open={!!activeModule} onOpenChange={(open) => (open ? null : closeModule())}>
          {(() => {
            // Compute defaults for first paint when not initialized
            const defaultW = Math.min(Math.floor(window.innerWidth * 0.96), 1100);
            const defaultH = Math.min(Math.floor(window.innerHeight * 0.9), 680);
            const effectiveW = dlgSize.w || defaultW;
            const effectiveH = typeof dlgSize.h === 'number' ? dlgSize.h : defaultH;
            const effectiveX = dlgInitialized ? dlgPos.x : Math.max(8, Math.floor((window.innerWidth - effectiveW) / 2));
            const effectiveY = dlgInitialized ? dlgPos.y : Math.max(8, Math.floor((window.innerHeight - effectiveH) / 2));
            const useFixed = !autoCenter || isMaximized || isDragging || isResizing;
            return (
          <DialogContent
            ref={contentRef as any}
            className="overflow-hidden sm:max-w-4xl md:max-w-5xl w-[min(96vw,1100px)] max-h-[90vh]"
            aria-describedby={undefined}
            style={useFixed ? {
              top: effectiveY,
              left: effectiveX,
              width: effectiveW,
              height: typeof dlgSize.h === 'number' ? dlgSize.h : undefined,
              transform: 'none',
              position: 'fixed',
              maxHeight: '90vh',
            } : {
              maxHeight: '90vh',
            }}
          >
            {/* Background b-roll */}
            {currentPage?.videoUrl && (
              <video
                ref={bgVideoRef}
                src={currentPage.videoUrl}
                className="absolute inset-0 -z-10 h-full w-full object-cover opacity-25 blur-sm pointer-events-none"
                autoPlay
                playsInline
                muted
                loop
              />
            )}
            {active && currentPage && (
              <>
                <DialogHeader onMouseDown={startDrag} onDoubleClick={resetPosition} className="cursor-move select-none">
                  <DialogTitle>{active.title}</DialogTitle>
                  <DialogDescription>
                    {activePageIndex + 1} / {active.pages.length}
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 relative overflow-auto pr-1" style={{ maxHeight: "60vh" }}>
                  <div className="space-y-2">
                    <div className="text-base font-medium">{currentPage.title}</div>
                    <p className="text-sm text-muted-foreground">{currentPage.body}</p>
                  </div>
                  {/* Quiz section if present */}
                  {currentPage.quiz && (
                    <QuizSection
                      moduleId={active.id}
                      pageIndex={activePageIndex}
                      quiz={currentPage.quiz}
                      language={language}
                      onResult={(correct, selectedIndex) => {
                        // merge into server progress
                        if (isAuthenticated) {
                          const scores = { [`${activePageIndex}`]: { correct, selectedIndex } } as any;
                          saveProgressMutation.mutate({
                            moduleId: active.id,
                            lastPage: Math.max(activePageIndex, moduleProgress[active.id] ?? 0),
                            completedPages: Math.min((moduleProgress[active.id] ?? 0) + 1, active.pages.length),
                            totalPages: active.pages.length,
                            quizScores: scores,
                          });
                        }
                      }}
                    />
                  )}
                  {narrationError && (
                    <Alert variant="destructive">
                      <AlertTitle>{t("common.error")}</AlertTitle>
                      <AlertDescription>{narrationError}</AlertDescription>
                    </Alert>
                  )}
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      onClick={() => (narrating ? stopAudio() : playNarration(`${active.title}. ${currentPage.title}. ${currentPage.body}`))}
                      aria-label={narrating ? (language === "fr" ? "Arrêter la narration" : "Stop narration") : (language === "fr" ? "Lire la narration" : "Play narration")}
                    >
                      <Volume2 className="h-4 w-4 mr-2" />
                      {narrating ? (language === "fr" ? "Arrêter" : "Stop") : (language === "fr" ? "Lire la narration" : "Play Narration")}
                    </Button>
                    {moduleProgress[active.id] >= active.pages.length - 1 && (
                      <Badge variant="default"><CheckCircle2 className="h-3 w-3 mr-1" /> {t("training.completed")}</Badge>
                    )}
                    <audio ref={audioRef} hidden />
                  </div>
                </div>
                <DialogFooter className="mt-2 flex justify-between">
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={prevPage} disabled={activePageIndex === 0} aria-label={language === "fr" ? "Page précédente" : "Previous page"}>
                      <ArrowLeft className="h-4 w-4 mr-1" /> {language === "fr" ? "Précédent" : "Back"}
                    </Button>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={resetPosition} aria-label={language === 'fr' ? 'Centrer la fenêtre' : 'Center dialog'}>
                      {language === 'fr' ? 'Centrer' : 'Center'}
                    </Button>
                    <Button variant="outline" onClick={toggleMaximize} aria-label={isMaximized ? (language === 'fr' ? 'Restaurer' : 'Restore') : (language === 'fr' ? 'Maximiser' : 'Maximize')}>
                      {isMaximized ? (language === 'fr' ? 'Restaurer' : 'Restore') : (language === 'fr' ? 'Maximiser' : 'Maximize')}
                    </Button>
                    <Button onClick={nextPage} disabled={activePageIndex >= active.pages.length - 1} aria-label={language === "fr" ? "Page suivante" : "Next page"}>
                      {language === "fr" ? "Suivant" : "Next"} <ArrowRight className="h-4 w-4 ml-1" />
                    </Button>
                  </div>
                </DialogFooter>
                {/* Resize handle */}
                <div
                  onMouseDown={startResize}
                  className="absolute bottom-2 right-2 h-4 w-4 cursor-se-resize rounded-sm bg-muted/60"
                  aria-label="Resize"
                  role="separator"
                />
              </>
            )}
          </DialogContent>
            );
          })()}
        </Dialog>

        {/* Certificate dialog */}
        {showCertificate && (
          <Dialog open={showCertificate} onOpenChange={(open) => setShowCertificate(open)}>
            <DialogContent className="sm:max-w-lg" aria-describedby={undefined}>
              <DialogHeader>
                <DialogTitle>{language === "fr" ? "Certificat d'achèvement" : "Completion Certificate"}</DialogTitle>
              </DialogHeader>
              <div className="space-y-2">
                <p className="text-sm">{language === "fr" ? "Décerné à" : "Awarded to"}: <strong>{user?.name || (language === "fr" ? "Utilisateur" : "User")}</strong></p>
                <p className="text-sm">{language === "fr" ? "Pour avoir complété la formation CongoAddressMapper." : "For completing the CongoAddressMapper training."}</p>
                <p className="text-xs text-muted-foreground">{new Date().toLocaleDateString()}</p>
              </div>
              <DialogFooter>
                <Button onClick={() => window.print()}>{language === "fr" ? "Imprimer" : "Print"}</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </DashboardLayout>
  );
}

type QuizSpec = { question: string; options: string[]; answerIndex: number };
type ModulePage = { title: string; body: string; videoUrl?: string; quiz?: QuizSpec };
type Module = { id: string; title: string; summary: string; pages: ModulePage[] };

function QuizSection({ moduleId, pageIndex, quiz, language, onResult }: { moduleId: string; pageIndex: number; quiz: QuizSpec; language: "en" | "fr"; onResult: (correct: boolean, selectedIndex: number) => void }) {
  const [selected, setSelected] = useState<number | null>(null);
  const [result, setResult] = useState<null | boolean>(null);
  const submit = () => {
    if (selected == null) return;
    const correct = selected === quiz.answerIndex;
    setResult(correct);
    onResult(correct, selected);
  };
  return (
    <Card role="group" aria-labelledby={`quiz-${moduleId}-${pageIndex}-title`}>
      <CardHeader>
        <CardTitle id={`quiz-${moduleId}-${pageIndex}-title`} className="text-sm">
          {quiz.question}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {quiz.options.map((opt, idx) => (
            <Button key={idx} variant={selected === idx ? "default" : "outline"} onClick={() => setSelected(idx)} aria-pressed={selected === idx} className="justify-start">
              {opt}
            </Button>
          ))}
        </div>
        <div className="flex gap-2 items-center">
          <Button onClick={submit} disabled={selected == null} aria-label={language === "fr" ? "Soumettre le quiz" : "Submit quiz"}>
            {language === "fr" ? "Soumettre" : "Submit"}
          </Button>
          {result != null && (
            <Badge variant={result ? "default" : "destructive"} aria-live="polite">
              {result ? (language === "fr" ? "Correct" : "Correct") : (language === "fr" ? "Incorrect" : "Incorrect")}
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
