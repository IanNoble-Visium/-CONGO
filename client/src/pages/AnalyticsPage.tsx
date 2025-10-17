import { trpc } from "@/lib/trpc";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { BarChart3, MapPin, CheckCircle, TrendingUp, Database } from "lucide-react";

export default function AnalyticsPage() {
  const { data: stats, isLoading: statsLoading } = trpc.analytics.dashboard.useQuery();
  const { data: provinceStats, isLoading: provinceLoading } = trpc.analytics.byProvince.useQuery();
  const { data: dataSourceStats, isLoading: sourceLoading } = trpc.analytics.byDataSource.useQuery();

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
          <p className="text-muted-foreground">Comprehensive statistics and insights for CongoAddressMapper</p>
        </div>

        {/* Overview Stats */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {statsLoading ? (
            [...Array(4)].map((_, i) => (
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
            ))
          ) : (
            <>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Addresses</CardTitle>
                  <MapPin className="h-4 w-4 text-blue-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats?.totalAddresses.toLocaleString() || "0"}</div>
                  <p className="text-xs text-muted-foreground">Mapped across DRC</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Verification Rate</CardTitle>
                  <CheckCircle className="h-4 w-4 text-emerald-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {stats?.totalAddresses
                      ? ((stats.verifiedAddresses / stats.totalAddresses) * 100).toFixed(1)
                      : "0"}
                    %
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {stats?.verifiedAddresses.toLocaleString() || "0"} verified
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Coverage</CardTitle>
                  <TrendingUp className="h-4 w-4 text-purple-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats?.totalProvinces || "0"}</div>
                  <p className="text-xs text-muted-foreground">Provinces covered</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Surveyors</CardTitle>
                  <Database className="h-4 w-4 text-amber-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats?.activeSurveyors || "0"}</div>
                  <p className="text-xs text-muted-foreground">Currently collecting data</p>
                </CardContent>
              </Card>
            </>
          )}
        </div>

        {/* Province Statistics */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Address Distribution by Province
            </CardTitle>
            <CardDescription>Top provinces by address count and verification status</CardDescription>
          </CardHeader>
          <CardContent>
            {provinceLoading ? (
              <div className="space-y-4">
                {[...Array(10)].map((_, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-4 w-20" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-6">
                {(provinceStats || []).slice(0, 15).map((province) => {
                  const verificationRate = province.total > 0 ? (Number(province.verified) / province.total) * 100 : 0;
                  const maxAddresses = Math.max(...(provinceStats || []).map((p) => p.total));
                  const barWidth = province.total > 0 ? (province.total / maxAddresses) * 100 : 0;

                  return (
                    <div key={province.provinceId} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <p className="text-sm font-medium">{province.provinceName || "Unknown Province"}</p>
                            <p className="text-sm text-muted-foreground">{province.total.toLocaleString()} addresses</p>
                          </div>
                          <div className="flex gap-4 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <span className="w-2 h-2 bg-emerald-500 rounded-full" />
                              {Number(province.verified).toLocaleString()} verified
                            </span>
                            <span className="flex items-center gap-1">
                              <span className="w-2 h-2 bg-amber-500 rounded-full" />
                              {Number(province.pending).toLocaleString()} pending
                            </span>
                            <span className="flex items-center gap-1">
                              <span className="w-2 h-2 bg-blue-600 rounded-full" />
                              {Number(province.unverified).toLocaleString()} unverified
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="relative w-full bg-muted rounded-full h-6 overflow-hidden">
                        <div
                          className="absolute left-0 top-0 h-full bg-gradient-to-r from-blue-600 via-amber-500 to-emerald-500 transition-all"
                          style={{ width: `${barWidth}%` }}
                        />
                        <div className="absolute inset-0 flex items-center justify-end px-2">
                          <span className="text-xs font-medium text-white drop-shadow-md">
                            {verificationRate.toFixed(1)}% verified
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Data Source Statistics */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Data Sources
            </CardTitle>
            <CardDescription>Address collection methods and sources</CardDescription>
          </CardHeader>
          <CardContent>
            {sourceLoading ? (
              <div className="space-y-4">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-4 w-20" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {(dataSourceStats || []).map((source) => {
                  const totalAddresses = (dataSourceStats || []).reduce((sum, s) => sum + s.count, 0);
                  const percentage = totalAddresses > 0 ? (source.count / totalAddresses) * 100 : 0;

                  const sourceLabels: Record<string, { label: string; color: string }> = {
                    manual_survey: { label: "Manual Survey", color: "bg-blue-600" },
                    ai_detected: { label: "AI Detected", color: "bg-purple-600" },
                    crowdsourced: { label: "Crowdsourced", color: "bg-green-600" },
                    imported: { label: "Imported", color: "bg-gray-600" },
                  };

                  const sourceInfo = sourceLabels[source.dataSource || ""] || {
                    label: source.dataSource || "Unknown",
                    color: "bg-gray-600",
                  };

                  return (
                    <div key={source.dataSource} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className={`w-3 h-3 rounded-full ${sourceInfo.color}`} />
                          <span className="text-sm font-medium">{sourceInfo.label}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-sm text-muted-foreground">{source.count.toLocaleString()} addresses</span>
                          <span className="text-sm font-medium">{percentage.toFixed(1)}%</span>
                        </div>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div className={`${sourceInfo.color} h-2 rounded-full transition-all`} style={{ width: `${percentage}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Insights Card */}
        <Card className="bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-blue-600" />
              Key Insights
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p>
              <strong>Coverage:</strong> CongoAddressMapper currently covers {stats?.totalProvinces || 0} provinces across
              the DRC with {stats?.totalAddresses.toLocaleString() || 0} mapped addresses.
            </p>
            <p>
              <strong>Data Quality:</strong> {stats?.verifiedAddresses.toLocaleString() || 0} addresses have been verified,
              representing a{" "}
              {stats?.totalAddresses ? ((stats.verifiedAddresses / stats.totalAddresses) * 100).toFixed(1) : 0}% verification
              rate.
            </p>
            <p>
              <strong>Active Collection:</strong> {stats?.activeSurveyors || 0} surveyors are currently active in the field,
              collecting and verifying address data.
            </p>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}

