import { useEffect, useRef, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, CheckCircle, Clock, AlertTriangle } from "lucide-react";

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
  latitude: string | null;
  longitude: string | null;
  verificationStatus: "unverified" | "pending" | "verified" | "disputed" | null;
  quartier?: string | null;
  commune?: string | null;
  street?: string | null;
  doorNumber?: string | null;
  dataSource?: string | null;
}

interface MapViewProps {
  addresses: Address[];
  onAddressClick?: (address: Address) => void;
  center?: [number, number];
  zoom?: number;
}

// Component to handle map centering
function MapCenterController({ center }: { center: [number, number] }) {
  const map = useMap();

  useEffect(() => {
    map.setView(center, map.getZoom());
  }, [center, map]);

  return null;
}

// Custom marker icon based on verification status
function getMarkerIcon(status: string) {
  const colors = {
    verified: "#10b981", // emerald-500
    pending: "#f59e0b", // amber-500
    disputed: "#ef4444", // red-500
    unverified: "#2563eb", // blue-600
  };

  const color = colors[status as keyof typeof colors] || colors.unverified;

  return L.divIcon({
    className: "custom-marker",
    html: `
      <div style="
        background-color: ${color};
        width: 24px;
        height: 24px;
        border-radius: 50%;
        border: 2px solid white;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
      "></div>
    `,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  });
}

function getStatusBadge(status: string) {
  const variants = {
    verified: { icon: CheckCircle, className: "bg-emerald-500 text-white" },
    pending: { icon: Clock, className: "bg-amber-500 text-white" },
    disputed: { icon: AlertTriangle, className: "bg-red-500 text-white" },
    unverified: { icon: MapPin, className: "bg-blue-600 text-white" },
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

export default function MapView({ addresses, onAddressClick, center = [-4.3276, 15.3136], zoom = 6 }: MapViewProps) {
  const [mapCenter, setMapCenter] = useState<[number, number]>(center);
  const [mapZoom, setMapZoom] = useState(zoom);

  // Filter addresses with valid coordinates
  const validAddresses = addresses.filter(
    (addr) => addr.latitude && addr.longitude && !isNaN(parseFloat(addr.latitude)) && !isNaN(parseFloat(addr.longitude))
  );

  // Calculate center if addresses are available
  useEffect(() => {
    if (validAddresses.length > 0) {
      const lats = validAddresses.map((a) => parseFloat(a.latitude!));
      const lngs = validAddresses.map((a) => parseFloat(a.longitude!));
      const centerLat = lats.reduce((a, b) => a + b, 0) / lats.length;
      const centerLng = lngs.reduce((a, b) => a + b, 0) / lngs.length;
      setMapCenter([centerLat, centerLng]);
      setMapZoom(10);
    }
  }, [validAddresses.length]);

  return (
    <div className="w-full h-full">
      {validAddresses.length === 0 ? (
        <Card className="w-full h-full flex items-center justify-center">
          <CardContent className="text-center py-12">
            <MapPin className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <CardTitle className="mb-2">No Addresses with Coordinates</CardTitle>
            <CardDescription>Add addresses with GPS coordinates to see them on the map.</CardDescription>
          </CardContent>
        </Card>
      ) : (
        <MapContainer center={mapCenter} zoom={mapZoom} className="w-full h-full rounded-lg" style={{ height: "100%" }}>
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <MapCenterController center={mapCenter} />
          {validAddresses.map((address) => {
            const lat = parseFloat(address.latitude!);
            const lng = parseFloat(address.longitude!);

            return (
              <Marker key={address.id} position={[lat, lng]} icon={getMarkerIcon(address.verificationStatus || "unverified")}>
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
                        <div>
                          <span className="font-medium">Source:</span> {address.dataSource}
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
      )}
    </div>
  );
}

