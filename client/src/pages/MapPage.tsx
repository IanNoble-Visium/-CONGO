import { useState } from "react";
import { trpc } from "@/lib/trpc";
import DashboardLayout from "@/components/DashboardLayout";
import MapView from "@/components/MapView";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, Filter, MapPin, CheckCircle, Clock, AlertTriangle, XCircle, Globe } from "lucide-react";

export default function MapPage() {
  const [provinceFilter, setProvinceFilter] = useState<string | undefined>(undefined);
  const [statusFilter, setStatusFilter] = useState<string | undefined>(undefined);
  const [searchQuery, setSearchQuery] = useState("");

  const { data: provinces } = trpc.provinces.list.useQuery();
  const { data: addressData, isLoading } = trpc.addresses.list.useQuery({
    provinceId: provinceFilter,
    verificationStatus: statusFilter,
    search: searchQuery || undefined,
    limit: 1000, // Limit for performance
  });

  const addresses = addressData?.addresses || [];
  const total = addressData?.total || 0;

  const statusOptions = [
    { value: "all", label: "All Statuses", icon: MapPin },
    { value: "verified", label: "Verified", icon: CheckCircle },
    { value: "pending", label: "Pending", icon: Clock },
    { value: "unverified", label: "Unverified", icon: XCircle },
    { value: "disputed", label: "Disputed", icon: AlertTriangle },
  ];

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-6 h-[calc(100vh-8rem)]">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Interactive Map</h1>
            <p className="text-muted-foreground">Explore addresses across the Democratic Republic of the Congo</p>
          </div>

          {/* Quick Stats */}
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-primary" />
              <span className="text-muted-foreground">
                <strong className="text-foreground">{addresses.length.toLocaleString()}</strong> addresses
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Globe className="h-4 w-4 text-primary" />
              <span className="text-muted-foreground">
                <strong className="text-foreground">{total.toLocaleString()}</strong> total
              </span>
            </div>
          </div>
        </div>

        {/* Filters - More compact */}
        <Card className="dashboard-card">
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
              {/* Province Filter */}
              <div className="flex items-center gap-2 min-w-0 flex-1">
                <Filter className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                <Select value={provinceFilter || "all"} onValueChange={(v) => setProvinceFilter(v === "all" ? undefined : v)}>
                  <SelectTrigger className="w-full sm:w-[180px]">
                    <SelectValue placeholder="All Provinces" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Provinces</SelectItem>
                    {provinces?.map((province) => (
                      <SelectItem key={province.id} value={province.id}>
                        {province.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Status Filter */}
              <div className="flex items-center gap-2 min-w-0 flex-1">
                <Select value={statusFilter || "all"} onValueChange={(v) => setStatusFilter(v === "all" ? undefined : v)}>
                  <SelectTrigger className="w-full sm:w-[180px]">
                    <SelectValue placeholder="All Statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    {statusOptions.map((option) => {
                      const Icon = option.icon;
                      return (
                        <SelectItem key={option.value} value={option.value}>
                          <div className="flex items-center gap-2">
                            <Icon className="h-4 w-4" />
                            {option.label}
                          </div>
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>

              {/* Search */}
              <div className="flex items-center gap-2 min-w-0 flex-1 max-w-md">
                <div className="relative flex-1">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search addresses..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-8"
                  />
                </div>
              </div>

              {/* Clear Filters */}
              {(provinceFilter || statusFilter || searchQuery) && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setProvinceFilter(undefined);
                    setStatusFilter(undefined);
                    setSearchQuery("");
                  }}
                  className="flex-shrink-0"
                >
                  Clear
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Map */}
        <Card className="flex-1 min-h-0 dashboard-card">
          <CardContent className="p-0 h-full">
            {isLoading ? (
              <div className="h-full flex items-center justify-center">
                <div className="text-center space-y-4">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                  <p className="text-muted-foreground">Loading map data...</p>
                </div>
              </div>
            ) : (
              <div className="h-full rounded-lg overflow-hidden">
                <MapView
                  addresses={addresses}
                  showLegend={true}
                  showHeatMap={true}
                  onAddressClick={(address) => {
                    console.log("Address clicked:", address);
                    // TODO: Open address details dialog
                  }}
                />
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}

