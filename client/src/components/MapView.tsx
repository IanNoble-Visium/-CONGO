import { useEffect, useRef, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap, LayersControl, LayerGroup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MapPin, CheckCircle, Clock, AlertTriangle, Layers, Database, Satellite, Users, Eye, EyeOff } from "lucide-react";

// Fix for default marker icons in Leaflet with webpack
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

interface Address {
  id: string;
  fullAddress: string;
  latitude: string | number | null;
  longitude: string | number | null;
  verificationStatus: "unverified" | "pending" | "verified" | "disputed" | null;
  quartier?: string | null;
  commune?: string | null;
  street?: string | null;
  doorNumber?: string | null;
  dataSource?: string | null;
}

// Helper function to convert latitude/longitude to number
function toNumber(value: string | number | null | undefined): number | null {
  if (value === null || value === undefined) return null;
  const num = typeof value === "string" ? parseFloat(value) : Number(value);
  return isNaN(num) ? null : num;
}

interface MapViewProps {
  addresses: Address[];
  onAddressClick?: (address: Address) => void;
  center?: [number, number];
  zoom?: number;
  showLegend?: boolean;
  showHeatMap?: boolean;
}

// Component to handle map centering
function MapCenterController({ center }: { center: [number, number] }) {
  const map = useMap();

  useEffect(() => {
    map.setView(center, map.getZoom());
  }, [center, map]);

  return null;
}

// Custom marker icon based on data source - Congo themed colors
function getMarkerIcon(dataSource: string, verificationStatus: string) {
  const dataSourceColors = {
    "ai_detected": "#0085CA", // DRC Blue for AI
    "manual_survey": "#FFD100", // DRC Yellow for manual surveys
    "crowdsourced": "#8B5CF6", // Purple for crowdsourced
    "imported": "#EF3340", // DRC Red for imported
    "satellite": "#00A86B", // Green for satellite
  };

  const verificationColors = {
    verified: "#10b981", // Emerald for verified
    pending: "#F7D618", // Congo yellow for pending
    disputed: "#CE1126", // Congo red for disputed
    unverified: "#007FFF", // Congo sky blue for unverified
  };

  // Use data source color if available, otherwise fall back to verification status
  const color = dataSourceColors[dataSource as keyof typeof dataSourceColors] || verificationColors[verificationStatus as keyof typeof verificationColors] || "#007FFF";

  return L.divIcon({
    className: "custom-marker",
    html: `
      <div style="
        background-color: ${color};
        width: 28px;
        height: 28px;
        border-radius: 50%;
        border: 3px solid white;
        box-shadow: 0 2px 12px rgba(0,0,0,0.4);
        display: flex;
        align-items: center;
        justify-content: center;
      ">
        <div style="
          width: 4px;
          height: 4px;
          background-color: white;
          border-radius: 50%;
        "></div>
      </div>
    `,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
  });
}

function getStatusBadge(status: string) {
  const variants = {
    verified: { icon: CheckCircle, className: "bg-emerald-500 text-white" },
    pending: { icon: Clock, className: "bg-[#F7D618] text-gray-900 font-semibold" },
    disputed: { icon: AlertTriangle, className: "bg-[#CE1126] text-white" },
    unverified: { icon: MapPin, className: "bg-[#007FFF] text-white" },
  };

  const variant = variants[status as keyof typeof variants] || variants.unverified;
  const Icon = variant.icon;

  return (
    <Badge className={variant.className}>
      <Icon className="w-3 h-3 mr-1" />
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </Badge>
  );
}

function getDataSourceBadge(dataSource: string) {
  const variants = {
    "ai_detected": { icon: Database, label: "AI Detected", className: "bg-[#0085CA] text-white" },
    "manual_survey": { icon: Users, label: "Manual Survey", className: "bg-[#FFD100] text-gray-900 font-semibold" },
    "crowdsourced": { icon: Users, label: "Crowdsourced", className: "bg-[#8B5CF6] text-white" },
    "imported": { icon: Database, label: "Imported", className: "bg-[#EF3340] text-white" },
    "satellite": { icon: Satellite, label: "Satellite", className: "bg-[#00A86B] text-white" },
  };

  const variant = variants[dataSource as keyof typeof variants] || { icon: Database, label: "Unknown", className: "bg-gray-500 text-white" };
  const Icon = variant.icon;

  return (
    <Badge className={variant.className}>
      <Icon className="w-3 h-3 mr-1" />
      {variant.label}
    </Badge>
  );
}

// Legend Component
function MapLegend() {
  const legendItems = [
    { color: "#0085CA", label: "AI Detected", icon: Database },
    { color: "#FFD100", label: "Manual Survey", icon: Users },
    { color: "#8B5CF6", label: "Crowdsourced", icon: Users },
    { color: "#EF3340", label: "Imported", icon: Database },
    { color: "#00A86B", label: "Satellite", icon: Satellite },
    { color: "#007FFF", label: "Unverified", icon: MapPin },
    { color: "#10b981", label: "Verified", icon: CheckCircle },
    { color: "#F7D618", label: "Pending", icon: Clock },
    { color: "#CE1126", label: "Disputed", icon: AlertTriangle },
  ];

  return (
    <div className="absolute top-4 right-4 bg-white rounded-lg shadow-lg p-4 z-[1000] min-w-[200px]">
      <h4 className="font-semibold text-sm mb-3 flex items-center gap-2">
        <Layers className="h-4 w-4" />
        Legend
      </h4>
      <div className="space-y-2">
        {legendItems.map((item, index) => {
          const Icon = item.icon;
          return (
            <div key={index} className="flex items-center gap-2 text-xs">
              <div
                className="w-4 h-4 rounded-full border border-gray-300"
                style={{ backgroundColor: item.color }}
              />
              <Icon className="h-3 w-3 text-gray-600" />
              <span className="text-gray-700">{item.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Heat Map Layer Component
function HeatMapLayer({ addresses, timeFilter }: { addresses: Address[], timeFilter: string }) {
  const map = useMap();

  useEffect(() => {
    if (!map || addresses.length === 0) return;

    // Dynamically load heat map library
    const loadHeatMap = async () => {
      try {
        // Check if heat layer is already available
        if (!(L as any).heatLayer) {
          const script = document.createElement('script');
          script.src = 'https://unpkg.com/leaflet.heat@0.2.0/dist/leaflet-heat.js';
          script.onload = () => createHeatLayer();
          document.head.appendChild(script);
        } else {
          createHeatLayer();
        }
      } catch (error) {
        console.error('Failed to load heat map library:', error);
      }
    };

    const createHeatLayer = () => {
      // Generate heat map data based on time filter
      const heatData = addresses
        .filter(addr => {
          const lat = toNumber(addr.latitude);
          const lng = toNumber(addr.longitude);
          return lat !== null && lng !== null;
        })
        .map(addr => {
          const lat = toNumber(addr.latitude)!;
          const lng = toNumber(addr.longitude)!;

          // Simulate intensity based on time filter and data source
          let intensity = 0.5;
          if (timeFilter === "week") intensity = 0.8;
          if (timeFilter === "month") intensity = 0.6;
          if (timeFilter === "year") intensity = 0.4;

          return [lat, lng, intensity];
        });

      // Create heat layer
      const heatLayer = (L as any).heatLayer(heatData, {
        radius: 25,
        blur: 15,
        maxZoom: 10,
        max: 1.0,
        gradient: {
          0.2: '#007FFF', // DRC Blue (low intensity)
          0.4: '#0085CA', // DRC Blue
          0.6: '#FFD100', // DRC Yellow
          0.8: '#EF3340', // DRC Red
          1.0: '#CE1126'  // Darker red (high intensity)
        }
      });

      heatLayer.addTo(map);

      return () => {
        map.removeLayer(heatLayer);
      };
    };

    const cleanup = loadHeatMap();

    return () => {
      if (cleanup && typeof cleanup === 'function') {
        cleanup();
      }
    };
  }, [map, addresses, timeFilter]);

  return null;
}

export default function MapView({ addresses, onAddressClick, center = [-4.3276, 15.3136], zoom = 6, showLegend = true, showHeatMap = false }: MapViewProps) {
  const [mapCenter, setMapCenter] = useState<[number, number]>(center);
  const [mapZoom, setMapZoom] = useState(zoom);
  const [heatMapVisible, setHeatMapVisible] = useState(showHeatMap);
  const [timeFilter, setTimeFilter] = useState("month");
  const [mapProvider, setMapProvider] = useState<"openstreetmap" | "yandex">("openstreetmap");

  // Debug logging
  console.log("MapView received addresses:", addresses);
  console.log("Total addresses:", addresses.length);

  // Filter addresses with valid coordinates
  const validAddresses = addresses.filter((addr) => {
    const lat = toNumber(addr.latitude);
    const lng = toNumber(addr.longitude);
    const isValid = lat !== null && lng !== null;
    console.log(`Address ${addr.id}: lat=${addr.latitude} (${lat}), lng=${addr.longitude} (${lng}), valid=${isValid}`);
    return isValid;
  });

  console.log("Valid addresses with coordinates:", validAddresses.length);

  // Calculate center if addresses are available
  useEffect(() => {
    if (validAddresses.length > 0) {
      const lats = validAddresses.map((a) => toNumber(a.latitude)!);
      const lngs = validAddresses.map((a) => toNumber(a.longitude)!);
      const centerLat = lats.reduce((a, b) => a + b, 0) / lats.length;
      const centerLng = lngs.reduce((a, b) => a + b, 0) / lngs.length;
      setMapCenter([centerLat, centerLng]);
      setMapZoom(10);
    }
  }, [validAddresses.length]);

  // Get tile layer URL based on provider
  const getTileLayerUrl = () => {
    switch (mapProvider) {
      case "yandex":
        return "https://core-renderer-tiles.maps.yandex.net/tiles?l=map&x={x}&y={y}&z={z}&scale=1&lang=ru_RU";
      default:
        return "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";
    }
  };

  const getTileLayerAttribution = () => {
    switch (mapProvider) {
      case "yandex":
        return '&copy; <a href="https://yandex.com/maps/">Yandex Maps</a>';
      default:
        return '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';
    }
  };

  return (
    <div className="w-full h-full relative">
      {validAddresses.length === 0 ? (
        <Card className="w-full h-full flex items-center justify-center">
          <CardContent className="text-center py-12">
            <MapPin className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <CardTitle className="mb-2">No Addresses with Coordinates</CardTitle>
            <CardDescription>Add addresses with GPS coordinates to see them on the map.</CardDescription>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Map Controls */}
          <div className="absolute top-4 left-4 z-[1000] space-y-2">
            {/* Map Provider Selector */}
            <Card className="bg-white shadow-lg">
              <CardContent className="p-3">
                <Select value={mapProvider} onValueChange={(value: "openstreetmap" | "yandex") => setMapProvider(value)}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="openstreetmap">OpenStreetMap</SelectItem>
                    <SelectItem value="yandex">Yandex Maps</SelectItem>
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>

            {/* Heat Map Toggle */}
            <Card className="bg-white shadow-lg">
              <CardContent className="p-3">
                <div className="space-y-2">
                  <Button
                    variant={heatMapVisible ? "default" : "outline"}
                    size="sm"
                    onClick={() => setHeatMapVisible(!heatMapVisible)}
                    className="w-full flex items-center gap-2"
                  >
                    {heatMapVisible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    Heat Map
                  </Button>

                  {heatMapVisible && (
                    <Select value={timeFilter} onValueChange={setTimeFilter}>
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="week">This Week</SelectItem>
                        <SelectItem value="month">This Month</SelectItem>
                        <SelectItem value="year">This Year</SelectItem>
                        <SelectItem value="all">All Time</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Legend */}
          {showLegend && <MapLegend />}

          <MapContainer center={mapCenter} zoom={mapZoom} className="w-full h-full rounded-lg" style={{ height: "100%" }}>
            <LayersControl position="topright">
              <LayersControl.BaseLayer checked name="OpenStreetMap">
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
              </LayersControl.BaseLayer>
              <LayersControl.BaseLayer name="Yandex Maps">
                <TileLayer
                  attribution='&copy; <a href="https://yandex.com/maps/">Yandex Maps</a>'
                  url="https://core-renderer-tiles.maps.yandex.net/tiles?l=map&x={x}&y={y}&z={z}&scale=1&lang=ru_RU"
                />
              </LayersControl.BaseLayer>
            </LayersControl>

            <MapCenterController center={mapCenter} />

            {/* Heat Map Layer */}
            {heatMapVisible && <HeatMapLayer addresses={validAddresses} timeFilter={timeFilter} />}

            {/* Address Markers */}
            {validAddresses.map((address) => {
              const lat = toNumber(address.latitude)!;
              const lng = toNumber(address.longitude)!;

              return (
                <Marker key={address.id} position={[lat, lng]} icon={getMarkerIcon(address.dataSource || "unknown", address.verificationStatus || "unverified")}>
                  <Popup>
                    <div className="p-2 min-w-[250px]">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-semibold text-sm">{address.fullAddress}</h3>
                      </div>
                      <div className="space-y-1 text-xs text-muted-foreground mb-3">
                        {address.street && (
                          <div>
                            <span className="font-medium">Street:</span> {address.street}
                          </div>
                        )}
                        {address.doorNumber && (
                          <div>
                            <span className="font-medium">Door:</span> {address.doorNumber}
                          </div>
                        )}
                        {address.quartier && (
                          <div>
                            <span className="font-medium">Quartier:</span> {address.quartier}
                          </div>
                        )}
                        {address.commune && (
                          <div>
                            <span className="font-medium">Commune:</span> {address.commune}
                          </div>
                        )}
                        <div>
                          <span className="font-medium">Coordinates:</span> {lat.toFixed(6)}, {lng.toFixed(6)}
                        </div>
                        {address.dataSource && (
                          <div className="flex items-center gap-2">
                            <span className="font-medium">Source:</span>
                            {getDataSourceBadge(address.dataSource)}
                          </div>
                        )}
                      </div>
                      <div className="flex items-center justify-between">
                        {getStatusBadge(address.verificationStatus || "unverified")}
                        {onAddressClick && (
                          <Button size="sm" variant="outline" onClick={() => onAddressClick(address)}>
                            View Details
                          </Button>
                        )}
                      </div>
                    </div>
                  </Popup>
                </Marker>
              );
            })}
          </MapContainer>
        </>
      )}
    </div>
  );
}
