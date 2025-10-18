import React from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Satellite } from "lucide-react";
import SatelliteDataIngestionPage from "@/pages/SatelliteDataIngestionPage";

interface SatelliteDataModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function SatelliteDataModal({ open, onOpenChange }: SatelliteDataModalProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-4xl overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Satellite className="h-5 w-5" />
            Satellite Data Ingestion Hub
          </SheetTitle>
        </SheetHeader>
        <div className="mt-6">
          <SatelliteDataIngestionPage />
        </div>
      </SheetContent>
    </Sheet>
  );
}