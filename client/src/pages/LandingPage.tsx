import { useState, useEffect } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  MapPin,
  Zap,
  Users,
  TrendingUp,
  Globe,
  Smartphone,
  Shield,
  CheckCircle,
  ArrowRight,
  Play,
  AlertCircle,
} from "lucide-react";
import { Link } from "wouter";

function AnimatedCounter({ target, suffix = "" }: { target: number; suffix?: string }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let current = 0;
    const increment = target / 30;
    const interval = setInterval(() => {
      current += increment;
      if (current >= target) {
        setCount(target);
        clearInterval(interval);
      } else {
        setCount(Math.floor(current));
      }
    }, 50);

    return () => clearInterval(interval);
  }, [target]);

  return (
    <span className="font-bold text-4xl text-[#007FFF]">
      {count.toLocaleString()}
      {suffix}
    </span>
  );
}

export default function LandingPage() {
  const { isAuthenticated } = useAuth();
  const [videoIndex, setVideoIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const videos = [
    "Video_1_kinshasa_202510171522_jgcpf.mp4",
    "Video_6_interactive_202510171522_354ph.mp4",
    "Video_20_future_202510171525_8wcwq.mp4",
  ];

  // Shuffle array function
  const shuffleArray = (array: string[]) => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  const [shuffledVideos, setShuffledVideos] = useState(() => shuffleArray(videos));

  useEffect(() => {
    const interval = setInterval(() => {
      setIsTransitioning(true);
      setTimeout(() => {
        setVideoIndex((prev) => (prev + 1) % shuffledVideos.length);
        setIsTransitioning(false);
      }, 500); // Half of transition time
    }, 8000);
    return () => clearInterval(interval);
  }, [shuffledVideos.length]);

  // Redirect authenticated users to dashboard
  if (isAuthenticated) {
    return <Link href="/">Dashboard</Link>;
  }

  return (
    <div className="w-full bg-white overflow-hidden">
      {/* Hero Section with Video Background */}
      <section className="relative w-full h-screen overflow-hidden flex items-center justify-center">
        {/* Video Background */}
        <div className="absolute inset-0 w-full h-full">
          <video
            key={videoIndex}
            className={`w-full h-full object-cover transition-opacity duration-1000 ${
              isTransitioning ? 'opacity-0' : 'opacity-100'
            }`}
            autoPlay
            muted
            playsInline
          >
            <source src={`/video/${shuffledVideos[videoIndex]}`} type="video/mp4" />
          </video>
          {/* Dark Overlay */}
          <div className="absolute inset-0 bg-black/40"></div>
        </div>

        {/* Hero Content */}
        <div className="relative z-10 text-center text-white px-4 max-w-4xl">
          <div className="mb-6 inline-block">
            <div className="inline-flex items-center justify-center gap-2 bg-[#007FFF]/20 border border-[#007FFF]/50 rounded-full px-4 py-2">
              <Globe className="h-4 w-4" />
              <span className="text-sm font-semibold">Democratic Republic of Congo</span>
            </div>
          </div>

          <h1 className="text-5xl md:text-6xl font-bold mb-4 leading-tight">
            CongoAddressMapper
          </h1>
          <p className="text-xl md:text-2xl text-white/90 mb-8 max-w-2xl mx-auto">
            Mapping 20 Million Addresses. Building Infrastructure. Transforming Lives.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Link href="/map">
              <Button size="lg" className="bg-[#007FFF] hover:bg-[#0066cc] text-white px-8">
                Explore Interactive Map
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link href="/addresses">
              <Button
                size="lg"
                variant="outline"
                className="text-white border-white hover:bg-white/20 px-8"
              >
                View Demo Data
              </Button>
            </Link>
          </div>

          {/* Demo Credentials */}
          <div className="bg-black/30 backdrop-blur-sm border border-white/20 rounded-lg px-6 py-4 inline-block">
            <p className="text-sm text-white/80 mb-2">Demo Credentials (for testing)</p>
            <p className="text-white font-mono">
              <strong>Email:</strong> demo@congo.cd | <strong>Password:</strong> Demo2024!
            </p>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-10">
          <div className="animate-bounce">
            <div className="w-6 h-10 border-2 border-white rounded-full flex items-start justify-center p-2">
              <div className="w-1 h-2 bg-white rounded-full"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Statistics Section */}
      <section className="py-20 px-4 bg-gradient-to-b from-white to-slate-50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-16">
            <span className="text-[#007FFF]">Impact</span> at Scale
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardContent className="pt-8 text-center">
                <MapPin className="h-12 w-12 text-[#007FFF] mx-auto mb-4" />
                <div className="mb-2">
                  <AnimatedCounter target={20000000} />
                </div>
                <p className="text-gray-600 font-semibold">Addresses Mapped</p>
                <p className="text-sm text-gray-500">Across entire DRC</p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardContent className="pt-8 text-center">
                <Globe className="h-12 w-12 text-[#10b981] mx-auto mb-4" />
                <div className="mb-2">
                  <AnimatedCounter target={26} />
                </div>
                <p className="text-gray-600 font-semibold">Provinces Covered</p>
                <p className="text-sm text-gray-500">All regions included</p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardContent className="pt-8 text-center">
                <CheckCircle className="h-12 w-12 text-[#F7D618] mx-auto mb-4" />
                <div className="mb-2">
                  <span className="font-bold text-4xl text-[#F7D618]">85</span>
                  <span className="font-bold text-4xl text-[#007FFF]">%</span>
                </div>
                <p className="text-gray-600 font-semibold">Verification Rate</p>
                <p className="text-sm text-gray-500">Data quality assured</p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardContent className="pt-8 text-center">
                <Users className="h-12 w-12 text-[#CE1126] mx-auto mb-4" />
                <div className="mb-2">
                  <AnimatedCounter target={15000} suffix="+" />
                </div>
                <p className="text-gray-600 font-semibold">Active Surveyors</p>
                <p className="text-sm text-gray-500">Field teams deployed</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-16">
            Powered by <span className="text-[#007FFF]">Advanced Technology</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="border-[#007FFF]/20 hover:border-[#007FFF]/50 transition-all">
              <CardHeader>
                <div className="w-12 h-12 bg-[#007FFF]/10 rounded-lg flex items-center justify-center mb-4">
                  <Zap className="h-6 w-6 text-[#007FFF]" />
                </div>
                <CardTitle>AI-Powered Detection</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Advanced machine learning models identify buildings and settlements from satellite
                  imagery with 85%+ accuracy.
                </p>
              </CardContent>
            </Card>

            <Card className="border-[#10b981]/20 hover:border-[#10b981]/50 transition-all">
              <CardHeader>
                <div className="w-12 h-12 bg-[#10b981]/10 rounded-lg flex items-center justify-center mb-4">
                  <Smartphone className="h-6 w-6 text-[#10b981]" />
                </div>
                <CardTitle>Mobile-First Collection</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Field teams collect real-time GPS coordinates, photos, and occupant information
                  with offline capabilities.
                </p>
              </CardContent>
            </Card>

            <Card className="border-[#F7D618]/20 hover:border-[#F7D618]/50 transition-all">
              <CardHeader>
                <div className="w-12 h-12 bg-[#F7D618]/10 rounded-lg flex items-center justify-center mb-4">
                  <Shield className="h-6 w-6 text-[#F7D618]" />
                </div>
                <CardTitle>Secure & Verified</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Multi-source verification ensures data integrity and enables transparent quality
                  assurance workflows.
                </p>
              </CardContent>
            </Card>

            <Card className="border-[#CE1126]/20 hover:border-[#CE1126]/50 transition-all">
              <CardHeader>
                <div className="w-12 h-12 bg-[#CE1126]/10 rounded-lg flex items-center justify-center mb-4">
                  <TrendingUp className="h-6 w-6 text-[#CE1126]" />
                </div>
                <CardTitle>Real-Time Analytics</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Track progress by province, monitor data quality metrics, and visualize impact
                  across all 26 regions.
                </p>
              </CardContent>
            </Card>

            <Card className="border-[#007FFF]/20 hover:border-[#007FFF]/50 transition-all">
              <CardHeader>
                <div className="w-12 h-12 bg-[#007FFF]/10 rounded-lg flex items-center justify-center mb-4">
                  <MapPin className="h-6 w-6 text-[#007FFF]" />
                </div>
                <CardTitle>Interactive Mapping</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Search, filter, and explore all 20M+ addresses on an intuitive map with heat maps
                  and clustering.
                </p>
              </CardContent>
            </Card>

            <Card className="border-[#10b981]/20 hover:border-[#10b981]/50 transition-all">
              <CardHeader>
                <div className="w-12 h-12 bg-[#10b981]/10 rounded-lg flex items-center justify-center mb-4">
                  <Globe className="h-6 w-6 text-[#10b981]" />
                </div>
                <CardTitle>Service Integration</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Enables postal delivery, emergency response, financial services, and government
                  administration.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Impact Stories Section */}
      <section className="py-20 px-4 bg-slate-50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-16">
            Transforming <span className="text-[#007FFF]">Critical Services</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="overflow-hidden hover:shadow-xl transition-shadow">
              <div className="h-48 bg-gradient-to-br from-[#007FFF]/20 to-[#007FFF]/5 flex items-center justify-center">
                <Play className="h-16 w-16 text-[#007FFF] opacity-50" />
              </div>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-[#CE1126]" />
                  Emergency Response
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Emergency services locate addresses with precision, reducing response times and
                  saving lives during critical situations.
                </p>
              </CardContent>
            </Card>

            <Card className="overflow-hidden hover:shadow-xl transition-shadow">
              <div className="h-48 bg-gradient-to-br from-[#F7D618]/20 to-[#F7D618]/5 flex items-center justify-center">
                <Play className="h-16 w-16 text-[#F7D618] opacity-50" />
              </div>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-[#F7D618]" />
                  Postal Delivery
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Reliable address system enables nationwide postal service, connecting remote
                  communities to economic opportunities.
                </p>
              </CardContent>
            </Card>

            <Card className="overflow-hidden hover:shadow-xl transition-shadow">
              <div className="h-48 bg-gradient-to-br from-[#10b981]/20 to-[#10b981]/5 flex items-center justify-center">
                <Play className="h-16 w-16 text-[#10b981] opacity-50" />
              </div>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-[#10b981]" />
                  Financial Inclusion
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Banks and fintechs leverage verified addresses for customer verification,
                  expanding formal financial services access.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-16">
            How It <span className="text-[#007FFF]">Works</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              {
                number: "01",
                title: "Satellite Detection",
                description: "AI analyzes satellite imagery to identify buildings and settlements",
              },
              {
                number: "02",
                title: "Field Verification",
                description: "Survey teams collect GPS coordinates and photos on the ground",
              },
              {
                number: "03",
                title: "Data Processing",
                description: "Multiple sources merged and verified for accuracy",
              },
              {
                number: "04",
                title: "Live Integration",
                description: "Addresses integrated into services and government systems",
              },
            ].map((step, idx) => (
              <div key={idx} className="relative">
                <div className="bg-gradient-to-br from-[#007FFF]/5 to-[#F7D618]/5 rounded-lg p-6 border border-[#007FFF]/10">
                  <div className="text-4xl font-bold text-[#007FFF] mb-2">{step.number}</div>
                  <h3 className="text-lg font-semibold mb-2">{step.title}</h3>
                  <p className="text-gray-600 text-sm">{step.description}</p>
                </div>
                {idx < 3 && (
                  <div className="hidden md:block absolute top-8 -right-3 transform translate-x-1/2">
                    <ArrowRight className="h-6 w-6 text-[#F7D618]" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-r from-[#007FFF] to-[#0066cc]">
        <div className="max-w-4xl mx-auto text-center text-white">
          <h2 className="text-4xl font-bold mb-6">Ready to Explore CongoAddressMapper?</h2>
          <p className="text-xl text-white/90 mb-8">
            Log in with demo credentials or browse the interactive map to see how we're mapping
            the future of the DRC.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/map">
              <Button size="lg" className="bg-white text-[#007FFF] hover:bg-gray-100 px-8">
                View Interactive Map
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link href="/analytics">
              <Button
                size="lg"
                variant="outline"
                className="text-white border-white hover:bg-white/20 px-8"
              >
                View Analytics
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="text-white font-semibold mb-4">Platform</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="/map">
                    <span className="hover:text-white transition">Interactive Map</span>
                  </Link>
                </li>
                <li>
                  <Link href="/addresses">
                    <span className="hover:text-white transition">Addresses</span>
                  </Link>
                </li>
                <li>
                  <Link href="/analytics">
                    <span className="hover:text-white transition">Analytics</span>
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-4">About</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <a href="#" className="hover:text-white transition">
                    DRC Infrastructure
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition">
                    Impact Stories
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-4">Demo</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <span className="text-gray-500">Email: demo@congo.cd</span>
                </li>
                <li>
                  <span className="text-gray-500">Password: Demo2024!</span>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-4">Future</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <a href="#" className="hover:text-white transition">
                    Single Sign-On
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition">
                    API Access
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm mb-4 md:mb-0">
              &copy; 2025 CongoAddressMapper. Building infrastructure for the Democratic Republic
              of Congo.
            </p>
            <p className="text-sm">Mapping the Future</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
