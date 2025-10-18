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
import { Search, Filter, MapPin, CheckCircle, Clock, AlertTriangle, XCircle } from "lucide-react";

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
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Interactive Map</h1>
          <p className="text-muted-foreground">Explore addresses across the Democratic Republic of the Congo</p>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filters
            </CardTitle>
            <CardDescription>Filter addresses by province, status, or search</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              {/* Province Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Province</label>
                <Select value={provinceFilter || "all"} onValueChange={(v) => setProvinceFilter(v === "all" ? undefined : v)}>
                  <SelectTrigger>
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
              <div className="space-y-2">
                <label className="text-sm font-medium">Verification Status</label>
                <Select value={statusFilter || "all"} onValueChange={(v) => setStatusFilter(v === "all" ? undefined : v)}>
                  <SelectTrigger>
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
              <div className="space-y-2">
                <label className="text-sm font-medium">Search</label>
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search addresses..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-8"
                  />
                </div>
              </div>
            </div>

            {/* Results Summary */}
            <div className="mt-4 flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4" />
                <span>
                  Showing <strong>{addresses.length.toLocaleString()}</strong> of{" "}
                  <strong>{total.toLocaleString()}</strong> addresses
                </span>
              </div>
              {(provinceFilter || statusFilter || searchQuery) && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setProvinceFilter(undefined);
                    setStatusFilter(undefined);
                    setSearchQuery("");
                  }}
                >
                  Clear Filters
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Map */}
        <Card className="flex-1 min-h-0">
          <CardContent className="p-0 h-full">
            {isLoading ? (
              <div className="h-full flex items-center justify-center">
                <div className="text-center space-y-4">
                  <Skeleton className="h-12 w-12 rounded-full mx-auto" />
                  <Skeleton className="h-4 w-48 mx-auto" />
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

