import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Upload, Satellite, Database, Users, Activity, Globe, FileText, Image, MapPin } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface DataSource {
  id: string;
  name: string;
  type: "satellite" | "survey" | "crowdsourced" | "dataset";
  status: "active" | "processing" | "completed" | "error";
  progress: number;
  records: number;
  lastUpdate: Date;
  icon: React.ReactNode;
  color: string;
}

const SatelliteDataIngestionPage: React.FC = () => {
  const [dataSources, setDataSources] = useState<DataSource[]>([
    {
      id: "landsat",
      name: "Landsat 8/9 Satellite",
      type: "satellite",
      status: "active",
      progress: 78,
      records: 1254300,
      lastUpdate: new Date(),
      icon: <Satellite className="h-5 w-5" />,
      color: "#0085CA"
    },
    {
      id: "sentinel",
      name: "Sentinel-2",
      type: "satellite",
      status: "processing",
      progress: 45,
      records: 892000,
      lastUpdate: new Date(),
      icon: <Globe className="h-5 w-5" />,
      color: "#FFD100"
    },
    {
      id: "grid3",
      name: "GRID3 Dataset",
      type: "dataset",
      status: "completed",
      progress: 100,
      records: 2100000,
      lastUpdate: new Date(),
      icon: <Database className="h-5 w-5" />,
      color: "#EF3340"
    },
    {
      id: "mobile-surveys",
      name: "Mobile GPS Surveys",
      type: "survey",
      status: "active",
      progress: 32,
      records: 45600,
      lastUpdate: new Date(),
      icon: <MapPin className="h-5 w-5" />,
      color: "#00A86B"
    },
    {
      id: "openstreetmap",
      name: "OpenStreetMap",
      type: "crowdsourced",
      status: "processing",
      progress: 67,
      records: 234000,
      lastUpdate: new Date(),
      icon: <Users className="h-5 w-5" />,
      color: "#8B5CF6"
    }
  ]);

  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [totalRecords, setTotalRecords] = useState(4127900);

  useEffect(() => {
    const interval = setInterval(() => {
      setDataSources(prev => prev.map(source => {
        if (source.status === "active" || source.status === "processing") {
          const newProgress = Math.min(100, source.progress + Math.random() * 3);
          return {
            ...source,
            progress: newProgress,
            status: newProgress >= 100 ? "completed" : source.status,
            records: source.records + Math.floor(Math.random() * 100),
            lastUpdate: new Date()
          };
        }
        return source;
      }));

      setTotalRecords(prev => prev + Math.floor(Math.random() * 50));
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      setUploadedFiles(prev => [...prev, ...Array.from(files)]);
      setIsProcessing(true);

      // Simulate processing
      setTimeout(() => {
        setIsProcessing(false);
        setDataSources(prev => prev.map(source =>
          source.id === "mobile-surveys"
            ? { ...source, records: source.records + files.length * 100, progress: Math.min(100, source.progress + 10) }
            : source
        ));
      }, 3000);
    }
  };

  const formatNumber = (num: number) => {
    return num.toLocaleString();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "bg-green-500";
      case "processing": return "bg-yellow-500";
      case "completed": return "bg-blue-500";
      case "error": return "bg-red-500";
      default: return "bg-gray-500";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-4"
        >
          <h1 className="text-4xl font-bold text-foreground mb-2">
            Satellite Data Ingestion Hub
          </h1>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Real-time data collection from satellites, ground surveys, and crowdsourced inputs.
            AI-powered processing for building footprints and address generation across DRC's 26 provinces.
          </p>

          {/* Live Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-8">
            {[
              { label: "Total Records", value: formatNumber(totalRecords), icon: <Database className="h-5 w-5" /> },
              { label: "Active Sources", value: dataSources.filter(s => s.status === "active").length.toString(), icon: <Activity className="h-5 w-5" /> },
              { label: "Provinces Covered", value: "26", icon: <Globe className="h-5 w-5" /> },
              { label: "Processing Jobs", value: dataSources.filter(s => s.status === "processing").length.toString(), icon: <Satellite className="h-5 w-5" /> }
            ].map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                className="bg-card border border-border rounded-lg p-4 shadow-lg"
              >
                <div className="flex items-center gap-3">
                  <div className="text-primary">{stat.icon}</div>
                  <div>
                    <div className="text-2xl font-bold text-primary">{stat.value}</div>
                    <div className="text-sm text-muted-foreground">{stat.label}</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Main Content */}
        <Tabs defaultValue="sources" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="sources">Data Sources</TabsTrigger>
            <TabsTrigger value="upload">File Upload</TabsTrigger>
            <TabsTrigger value="processing">AI Processing</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="sources" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {dataSources.map((source, index) => (
                <motion.div
                  key={source.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="dashboard-card p-6"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div style={{ color: source.color }}>{source.icon}</div>
                      <div>
                        <h3 className="font-semibold text-lg">{source.name}</h3>
                        <Badge variant="secondary" className="capitalize">
                          {source.type}
                        </Badge>
                      </div>
                    </div>
                    <div className={`w-3 h-3 rounded-full ${getStatusColor(source.status)} animate-pulse`} />
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Progress</span>
                      <span className="font-medium">{source.progress.toFixed(1)}%</span>
                    </div>
                    <Progress value={source.progress} className="h-2" />

                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">
                        {formatNumber(source.records)} records
                      </span>
                      <span className="text-xs text-muted-foreground">
                        Updated {source.lastUpdate.toLocaleTimeString()}
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="upload" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* File Upload */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                <Card className="dashboard-card">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Upload className="h-5 w-5 text-primary" />
                      Data File Upload
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
                      <Upload className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground mb-4">
                        Drag and drop files here or click to browse
                      </p>
                      <input
                        type="file"
                        multiple
                        accept=".csv,.geojson,.json,.jpg,.jpeg,.png"
                        onChange={handleFileUpload}
                        className="hidden"
                        id="file-upload"
                      />
                      <label htmlFor="file-upload">
                        <Button className="action-button cursor-pointer">
                          Choose Files
                        </Button>
                      </label>
                    </div>

                    <div className="text-sm text-muted-foreground">
                      <p className="font-medium mb-2">Supported formats:</p>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4" />
                          <span>CSV, GeoJSON</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Image className="h-4 w-4" />
                          <span>Images for OCR</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Upload Progress */}
                <AnimatePresence>
                  {isProcessing && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="bg-card border border-border rounded-lg p-4"
                    >
                      <div className="flex items-center gap-3 mb-3">
                        <Activity className="h-5 w-5 text-primary animate-spin" />
                        <span className="font-medium">Processing Files...</span>
                      </div>
                      <Progress value={65} className="mb-2" />
                      <p className="text-sm text-muted-foreground">
                        Extracting address data and coordinates...
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>

              {/* Upload History */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-4"
              >
                <Card className="dashboard-card">
                  <CardHeader>
                    <CardTitle>Recent Uploads</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {uploadedFiles.length === 0 ? (
                      <p className="text-muted-foreground text-center py-8">
                        No files uploaded yet
                      </p>
                    ) : (
                      <div className="space-y-3">
                        {uploadedFiles.slice(-5).map((file, index) => (
                          <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                            <div className="flex items-center gap-3">
                              <FileText className="h-4 w-4 text-muted-foreground" />
                              <span className="text-sm font-medium">{file.name}</span>
                            </div>
                            <Badge variant="outline" className="text-xs">
                              {(file.size / 1024).toFixed(1)} KB
                            </Badge>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </TabsContent>

          <TabsContent value="processing" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* AI Processing Pipeline */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="lg:col-span-2 space-y-6"
              >
                <Card className="dashboard-card">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Activity className="h-5 w-5 text-primary" />
                      AI Processing Pipeline
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Processing Steps */}
                    {[
                      { step: "1. Satellite Imagery Ingestion", progress: 85, status: "active" },
                      { step: "2. Building Footprint Detection", progress: 72, status: "processing" },
                      { step: "3. Address Codification", progress: 45, status: "processing" },
                      { step: "4. Quality Validation", progress: 23, status: "pending" }
                    ].map((item, index) => (
                      <div key={index} className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="font-medium">{item.step}</span>
                          <span className="text-muted-foreground">{item.progress}%</span>
                        </div>
                        <Progress value={item.progress} className="h-2" />
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </motion.div>

              {/* Processing Stats */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="space-y-4"
              >
                <Card className="dashboard-card">
                  <CardHeader>
                    <CardTitle className="text-lg">Processing Stats</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">AI Accuracy</span>
                      <span className="font-bold text-primary">87.3%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Buildings Detected</span>
                      <span className="font-bold text-primary">1.2M</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Addresses Generated</span>
                      <span className="font-bold text-primary">890K</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Human Validations</span>
                      <span className="font-bold text-primary">156K</span>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Data Quality Metrics */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="dashboard-card p-6"
              >
                <h3 className="text-xl font-semibold mb-6 flex items-center gap-2">
                  <Database className="h-6 w-6 text-primary" />
                  Data Quality Metrics
                </h3>

                <div className="space-y-4">
                  {[
                    { metric: "Geolocation Accuracy", value: "94.2%", trend: "+2.1%" },
                    { metric: "Address Completeness", value: "89.7%", trend: "+1.3%" },
                    { metric: "OCR Extraction Rate", value: "91.5%", trend: "+0.8%" },
                    { metric: "Conflict Resolution", value: "96.8%", trend: "+3.2%" }
                  ].map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                      <span className="font-medium">{item.metric}</span>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-primary">{item.value}</span>
                        <Badge variant="outline" className="text-green-600">
                          {item.trend}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* Coverage Map */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="dashboard-card p-6"
              >
                <h3 className="text-xl font-semibold mb-6 flex items-center gap-2">
                  <Globe className="h-6 w-6 text-primary" />
                  Provincial Coverage
                </h3>

                <div className="space-y-3">
                  {[
                    { province: "Kinshasa", coverage: 95, addresses: "2.1M" },
                    { province: "Nord-Kivu", coverage: 87, addresses: "1.8M" },
                    { province: "Sud-Kivu", coverage: 82, addresses: "1.4M" },
                    { province: "Katanga", coverage: 78, addresses: "1.2M" },
                    { province: "Orientale", coverage: 65, addresses: "890K" }
                  ].map((item, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="font-medium">{item.province}</span>
                        <span className="text-muted-foreground">{item.addresses} addresses</span>
                      </div>
                      <Progress value={item.coverage} className="h-2" />
                    </div>
                  ))}
                </div>
              </motion.div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default SatelliteDataIngestionPage;
