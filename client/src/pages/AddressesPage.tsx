import { useState } from "react";
import { trpc } from "@/lib/trpc";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { MapPin, CheckCircle, Clock, AlertTriangle, XCircle, Search, Filter, ChevronLeft, ChevronRight } from "lucide-react";

const ITEMS_PER_PAGE = 10;

export default function AddressesPage() {
  const [page, setPage] = useState(0);
  const [provinceFilter, setProvinceFilter] = useState<string | undefined>(undefined);
  const [statusFilter, setStatusFilter] = useState<string | undefined>(undefined);
  const [searchQuery, setSearchQuery] = useState("");

  const { data: provinces } = trpc.provinces.list.useQuery();
  const { data: addressData, isLoading } = trpc.addresses.list.useQuery({
    provinceId: provinceFilter,
    verificationStatus: statusFilter,
    search: searchQuery || undefined,
    limit: ITEMS_PER_PAGE,
    offset: page * ITEMS_PER_PAGE,
  });

  const addresses = addressData?.addresses || [];
  const total = addressData?.total || 0;
  const totalPages = Math.ceil(total / ITEMS_PER_PAGE);

  const getStatusBadge = (status: string | null) => {
    const statusValue = status || "unverified";
    const variants = {
      verified: { icon: CheckCircle, className: "bg-emerald-500 text-white" },
      pending: { icon: Clock, className: "bg-amber-500 text-white" },
      disputed: { icon: AlertTriangle, className: "bg-red-500 text-white" },
      unverified: { icon: XCircle, className: "bg-blue-600 text-white" },
    };

    const variant = variants[statusValue as keyof typeof variants] || variants.unverified;
    const Icon = variant.icon;

    return (
      <Badge className={variant.className}>
        <Icon className="w-3 h-3 mr-1" />
        {statusValue.charAt(0).toUpperCase() + statusValue.slice(1)}
      </Badge>
    );
  };

  const getDataSourceBadge = (source: string | null) => {
    const sourceValue = source || "unknown";
    const colors = {
      manual_survey: "bg-blue-100 text-blue-800",
      ai_detected: "bg-purple-100 text-purple-800",
      crowdsourced: "bg-green-100 text-green-800",
      imported: "bg-gray-100 text-gray-800",
      unknown: "bg-gray-100 text-gray-800",
    };

    return (
      <Badge variant="outline" className={colors[sourceValue as keyof typeof colors]}>
        {sourceValue.replace("_", " ").toUpperCase()}
      </Badge>
    );
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Addresses</h1>
          <p className="text-muted-foreground">Browse and manage all mapped addresses</p>
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
                <Select
                  value={provinceFilter || "all"}
                  onValueChange={(v) => {
                    setProvinceFilter(v === "all" ? undefined : v);
                    setPage(0);
                  }}
                >
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
                <Select
                  value={statusFilter || "all"}
                  onValueChange={(v) => {
                    setStatusFilter(v === "all" ? undefined : v);
                    setPage(0);
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All Statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="verified">Verified</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="unverified">Unverified</SelectItem>
                    <SelectItem value="disputed">Disputed</SelectItem>
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
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setPage(0);
                    }}
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
                  Showing <strong>{page * ITEMS_PER_PAGE + 1}</strong> to{" "}
                  <strong>{Math.min((page + 1) * ITEMS_PER_PAGE, total)}</strong> of <strong>{total.toLocaleString()}</strong>{" "}
                  addresses
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
                    setPage(0);
                  }}
                >
                  Clear Filters
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Addresses Table */}
        <Card>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="p-6 space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex items-center gap-4">
                    <Skeleton className="h-12 flex-1" />
                  </div>
                ))}
              </div>
            ) : addresses.length === 0 ? (
              <div className="text-center py-12">
                <MapPin className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                <h3 className="text-lg font-semibold mb-2">No addresses found</h3>
                <p className="text-sm text-muted-foreground">Try adjusting your filters or search query</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Address</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Coordinates</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Source</TableHead>
                    <TableHead>Confidence</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {addresses.map((address) => (
                    <TableRow key={address.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{address.fullAddress}</div>
                          {address.doorNumber && (
                            <div className="text-xs text-muted-foreground">Door: {address.doorNumber}</div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {address.quartier && <div>{address.quartier}</div>}
                          {address.commune && <div className="text-muted-foreground">{address.commune}</div>}
                        </div>
                      </TableCell>
                      <TableCell>
                        {address.latitude && address.longitude ? (
                          <div className="text-xs font-mono">
                            {parseFloat(address.latitude).toFixed(4)}, {parseFloat(address.longitude).toFixed(4)}
                          </div>
                        ) : (
                          <span className="text-xs text-muted-foreground">N/A</span>
                        )}
                      </TableCell>
                      <TableCell>{getStatusBadge(address.verificationStatus)}</TableCell>
                      <TableCell>{getDataSourceBadge(address.dataSource)}</TableCell>
                      <TableCell>
                        {address.confidenceScore ? (
                          <div className="flex items-center gap-2">
                            <div className="w-16 bg-muted rounded-full h-2">
                              <div
                                className="bg-primary h-2 rounded-full"
                                style={{ width: `${parseFloat(address.confidenceScore) * 100}%` }}
                              />
                            </div>
                            <span className="text-xs">{(parseFloat(address.confidenceScore) * 100).toFixed(0)}%</span>
                          </div>
                        ) : (
                          <span className="text-xs text-muted-foreground">N/A</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              Page {page + 1} of {totalPages}
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => setPage(Math.max(0, page - 1))} disabled={page === 0}>
                <ChevronLeft className="h-4 w-4 mr-1" />
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
                disabled={page >= totalPages - 1}
              >
                Next
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

