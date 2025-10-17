import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, Globe, Lock, Mail } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function LoginPage() {
  const [email, setEmail] = useState("demo@congo.cd");
  const [password, setPassword] = useState("Demo2024!");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [videoIndex, setVideoIndex] = useState(0);
  const videos = [
    "Video_1_kinshasa_202510171522_jgcpf.mp4",
    "Video_6_interactive_202510171522_354ph.mp4",
    "Video_20_future_202510171525_8wcwq.mp4",
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setVideoIndex((prev) => (prev + 1) % videos.length);
    }, 8000);
    return () => clearInterval(interval);
  }, [videos.length]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      // Validate demo credentials
      const DEMO_EMAIL = "demo@congo.cd";
      const DEMO_PASSWORD = "Demo2024!";

      if (email !== DEMO_EMAIL || password !== DEMO_PASSWORD) {
        setError("Invalid email or password. Please use the demo credentials.");
        setIsLoading(false);
        return;
      }

      // Store authentication state in localStorage
      localStorage.setItem("isAuthenticated", "true");
      localStorage.setItem("user", JSON.stringify({
        id: "demo-user-001",
        name: "Demo User",
        email: DEMO_EMAIL,
        role: "admin",
      }));

      // Redirect to dashboard
      window.location.href = "/";
    } catch (err) {
      setError("Login failed. Please try again.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Video Background */}
      <div className="absolute inset-0 w-full h-full">
        <video
          key={videoIndex}
          className="w-full h-full object-cover"
          autoPlay
          muted
          playsInline
        >
          <source src={`/video/${videos[videoIndex]}`} type="video/mp4" />
        </video>
        {/* Dark Overlay */}
        <div className="absolute inset-0 bg-black/50"></div>
      </div>

      {/* Hero Section Left */}
      <div className="hidden lg:flex absolute left-0 top-0 w-1/2 h-full flex-col justify-center px-12 text-white z-10">
        <div className="max-w-md">
          <div className="inline-flex items-center justify-center gap-2 bg-white/20 border border-white/30 rounded-full px-4 py-2 mb-8">
            <Globe className="h-4 w-4" />
            <span className="text-sm font-semibold">Democratic Republic of Congo</span>
          </div>
          <h1 className="text-5xl font-bold mb-6 leading-tight">CongoAddressMapper</h1>
          <p className="text-xl text-white/90 mb-8">
            Mapping 20 Million Addresses. Building Infrastructure. Transforming Lives.
          </p>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                <span className="text-lg">🗺️</span>
              </div>
              <span>Interactive mapping across all 26 provinces</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                <span className="text-lg">✓</span>
              </div>
              <span>Real-time data verification</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                <span className="text-lg">📊</span>
              </div>
              <span>Comprehensive analytics dashboard</span>
            </div>
          </div>
        </div>
      </div>

      {/* Login Form */}
      <div className="relative z-20 w-full max-w-md lg:ml-auto lg:mr-12">
        <Card className="border-0 shadow-2xl">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl">Welcome Back</CardTitle>
            <CardDescription>Sign in with your credentials to access the platform</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-6">
              {/* Demo Credentials Alert */}
              <Alert className="border-[#F7D618] bg-[#F7D618]/10">
                <Mail className="h-4 w-4 text-[#F7D618]" />
                <AlertDescription className="text-sm">
                  <strong>Demo Credentials:</strong> Email and password are pre-filled for testing.
                </AlertDescription>
              </Alert>

              {/* Error Alert */}
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {/* Email Input */}
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="demo@congo.cd"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              {/* Password Input */}
              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-medium">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              {/* Sign In Button */}
              <Button
                type="submit"
                className="w-full bg-[#007FFF] hover:bg-[#0066cc] text-white font-semibold py-2"
                disabled={isLoading}
              >
                {isLoading ? "Signing in..." : "Sign In"}
              </Button>

              {/* Future SSO Notice */}
              <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                <p className="text-xs text-gray-600 text-center">
                  <strong>Future Enhancement:</strong> Single Sign-On (SSO) coming soon
                </p>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Footer */}
        <p className="text-center text-sm text-gray-600 mt-8">
          Part of the DRC Infrastructure Modernization Initiative
        </p>
      </div>
    </div>
  );
}
