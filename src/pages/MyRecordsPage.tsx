import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileText, Upload, Download, Eye, Trash2, Filter } from "lucide-react";
import { useNavigate } from "react-router-dom";
import MobileLayout from "@/components/MobileLayout";
import MobileHeader from "@/components/MobileHeader";
import { useToast } from "@/hooks/use-toast";

const MyRecordsPage = () => {
  const [records, setRecords] = useState<any[]>([]);
  const [filterType, setFilterType] = useState("all");
  const navigate = useNavigate();
  const { toast } = useToast();

  const sampleRecords = [
    { id: 1, name: "Blood Test Report", type: "Lab Report", date: "2025-01-15", size: "2.3 MB" },
    { id: 2, name: "X-Ray Chest", type: "Imaging", date: "2024-12-20", size: "5.1 MB" },
    { id: 3, name: "Prescription Dr. Sharma", type: "Prescription", date: "2025-01-10", size: "0.8 MB" }
  ];

  const types = ["all", "Lab Report", "Imaging", "Prescription", "Discharge Summary"];

  const filteredRecords = filterType === "all"
    ? sampleRecords
    : sampleRecords.filter(r => r.type === filterType);

  const handleUpload = () => {
    toast({
      title: "Upload Feature",
      description: "File upload will be available soon.",
      duration: 2000
    });
  };

  return (
    <MobileLayout showNavigation={true} className="bg-gradient-app-bg">
      <MobileHeader
        title="My Records"
        showBack={true}
        showNotifications={false}
      />

      <div className="p-4 space-y-4">
        {/* Upload Button */}
        <Button className="w-full" onClick={handleUpload}>
          <Upload className="mr-2 h-4 w-4" />
          Upload Document
        </Button>

        {/* Filter */}
        <Card className="mobile-card">
          <CardContent className="p-3">
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              <Filter className="h-4 w-4 text-muted-foreground shrink-0" />
              {types.map((type) => (
                <Badge
                  key={type}
                  variant={filterType === type ? "default" : "outline"}
                  className="cursor-pointer whitespace-nowrap text-xs"
                  onClick={() => setFilterType(type)}
                >
                  {type === "all" ? "All" : type}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Records List */}
        {filteredRecords.length > 0 ? (
          <div className="space-y-3">
            {filteredRecords.map((record) => (
              <Card key={record.id} className="mobile-card">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-blue-500/10 shrink-0">
                      <FileText className="h-5 w-5 text-blue-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold truncate">{record.name}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className="text-xs">{record.type}</Badge>
                        <span className="text-xs text-muted-foreground">{record.date}</span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">{record.size}</p>
                    </div>
                    <div className="flex flex-col gap-2">
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            <FileText className="h-12 w-12 mx-auto mb-3 opacity-40" />
            <p className="text-sm">No health records uploaded yet.</p>
            <Button variant="outline" className="mt-4" onClick={handleUpload}>
              <Upload className="mr-2 h-4 w-4" />
              Upload First Document
            </Button>
          </div>
        )}
      </div>
    </MobileLayout>
  );
};

export default MyRecordsPage;
