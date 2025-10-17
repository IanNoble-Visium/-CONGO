import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { MapPin, CheckCircle, Users, Map as MapIcon, TrendingUp, AlertCircle } from "lucide-react";
import { Link } from "wouter";
import DashboardLayout from "@/components/DashboardLayout";

function DashboardStats() {
  const { data: stats, isLoading } = trpc.analytics.dashboard.useQuery();

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-4 rounded" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-20 mb-2" />
              <Skeleton className="h-3 w-32" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const metrics = [
    {
      title: "Total Addresses",
      value: stats?.totalAddresses.toLocaleString() || "0",
      description: "Mapped across DRC",
      icon: MapPin,
      color: "text-blue-600",
    },
    {
      title: "Verified Addresses",
      value: stats?.verifiedAddresses.toLocaleString() || "0",
      description: `${stats?.totalAddresses ? ((stats.verifiedAddresses / stats.totalAddresses) * 100).toFixed(1) : 0}% verification rate`,
      icon: CheckCircle,
      color: "text-emerald-500",
    },
    {
      title: "Provinces",
      value: stats?.totalProvinces.toString() || "0",
      description: "Administrative regions",
      icon: MapIcon,
      color: "text-purple-600",
    },
    {
      title: "Active Surveyors",
      value: stats?.activeSurveyors.toString() || "0",
      description: "Currently collecting data",
      icon: Users,
      color: "text-amber-500",
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {metrics.map((metric) => {
        const Icon = metric.icon;
        return (
          <Card key={metric.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{metric.title}</CardTitle>
              <Icon className={`h-4 w-4 ${metric.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metric.value}</div>
              <p className="text-xs text-muted-foreground">{metric.description}</p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

function ProvinceStats() {
  const { data: provinceStats, isLoading } = trpc.analytics.byProvince.useQuery();

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-64 mt-2" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center justify-between">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-20" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const topProvinces = (provinceStats || []).slice(0, 10);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Mapping Progress by Province</CardTitle>
        <CardDescription>Top 10 provinces by address count</CardDescription>
      </CardHeader>
      <CardContent>
        {topProvinces.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <AlertCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No province data available yet</p>
          </div>
        ) : (
          <div className="space-y-4">
            {topProvinces.map((province) => {
              const verificationRate = province.total > 0 ? (Number(province.verified) / province.total) * 100 : 0;

              return (
                <div key={province.provinceId} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="text-sm font-medium">{province.provinceName || "Unknown Province"}</p>
                      <p className="text-xs text-muted-foreground">
                        {province.total.toLocaleString()} addresses • {verificationRate.toFixed(1)}% verified
                      </p>
                    </div>
                    <div className="flex gap-2 text-xs">
                      <span className="px-2 py-1 bg-emerald-100 text-emerald-700 rounded">
                        {Number(province.verified).toLocaleString()} ✓
                      </span>
                      <span className="px-2 py-1 bg-amber-100 text-amber-700 rounded">
                        {Number(province.pending).toLocaleString()} ⏱
                      </span>
                    </div>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div
                      className="bg-primary h-2 rounded-full transition-all"
                      style={{ width: `${Math.min(verificationRate, 100)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function QuickActions() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
        <CardDescription>Common tasks and navigation</CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        <Link href="/map">
          <Button variant="outline" className="w-full justify-start">
            <MapIcon className="mr-2 h-4 w-4" />
            View Interactive Map
          </Button>
        </Link>
        <Link href="/addresses">
          <Button variant="outline" className="w-full justify-start">
            <MapPin className="mr-2 h-4 w-4" />
            Browse All Addresses
          </Button>
        </Link>
        <Link href="/analytics">
          <Button variant="outline" className="w-full justify-start">
            <TrendingUp className="mr-2 h-4 w-4" />
            View Analytics
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}

export default function Home() {
  const { user, isAuthenticated } = useAuth();

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome to CongoAddressMapper{isAuthenticated && user ? `, ${user.name}` : ""}
          </p>
        </div>

        {/* Stats Cards */}
        <DashboardStats />

        {/* Province Stats and Quick Actions */}
        <div className="grid gap-6 md:grid-cols-3">
          <div className="md:col-span-2">
            <ProvinceStats />
          </div>
          <div>
            <QuickActions />
          </div>
        </div>

        {/* Info Card with Congo Colors */}
        <Card className="bg-gradient-to-r from-[#007FFF]/10 to-[#F7D618]/10 dark:bg-gradient-to-r dark:from-[#007FFF]/20 dark:to-[#F7D618]/20 border-[#007FFF]/30 dark:border-[#007FFF]/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-[#007FFF]" />
              About CongoAddressMapper
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              CongoAddressMapper is a comprehensive geospatial application designed to create a nationwide physical
              address and mapping system for the Democratic Republic of the Congo. This platform supports the DRC
              infrastructure modernization initiative, enabling critical services including telecommunications, postal
              tracking, emergency services, and financial technologies.
            </p>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
