import { useState } from "react";
import { ArrowRight, Download, FileText, Calendar, TrendingUp, Car } from "lucide-react";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Label } from "../components/ui/label";
import { toast } from "sonner";
import { get_report_summary, download_report_csv } from "./ReportsHandler";

interface ReportSummary {
  period_start: string;
  period_end: string;
  total_entries: number;
  total_exits: number;
  revenue: number;
  avg_duration_hours: number;
  utilization_pct: number;
  total_entries_change_pct: number | null;
  total_exits_change_pct: number | null;
  revenue_change_pct: number | null;
  avg_duration_change_pct: number | null;
  utilization_change_pct: number | null;
}

const periodLabels: Record<string, string> = {
  today: "Today",
  yesterday: "Yesterday",
  "this-week": "This Week",
  "last-week": "Last Week",
  "this-month": "This Month",
  "last-month": "Last Month",
  custom: "Custom Range",
};

export function Reports() {
  const [reportType, setReportType] = useState("daily");
  const [reportPeriod, setReportPeriod] = useState("today");
  const [customStart, setCustomStart] = useState("");
  const [customEnd, setCustomEnd] = useState("");
  const [summary, setSummary] = useState<ReportSummary | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  const reportTypes = [
    { value: "daily", label: "Daily Summary", icon: Calendar },
    { value: "occupancy", label: "Occupancy Report", icon: Car },
    { value: "operator", label: "Operator Performance", icon: TrendingUp },
  ];

  const isCustomRangeIncomplete = reportPeriod === "custom" && (!customStart || !customEnd);
  const isOperatorType = reportType === "operator";

  const handleGenerateReport = async () => {
    if (reportType === "operator") {
      toast.error("Operator performance reports require operator/shift data, which isn't set up yet.");
      return;
    }
    if (isCustomRangeIncomplete) {
      toast.error("Please select both a start and end date");
      return;
    }

    setIsGenerating(true);
    const result = await get_report_summary({
      type: reportType,
      period: reportPeriod,
      start: reportPeriod === "custom" ? customStart : undefined,
      end: reportPeriod === "custom" ? customEnd : undefined,
    });
    setIsGenerating(false);

    if (result.ok) {
      setSummary(result.data);
      const typeLabel = reportTypes.find((t) => t.value === reportType)?.label;
      toast.success(`${typeLabel} generated for ${periodLabels[reportPeriod]}`);
    } else {
      toast.error(result.error);
    }
  };

  const handleDownloadCsv = async () => {
    if (isOperatorType) {
      toast.error("Operator performance reports aren't available yet.");
      return;
    }
    if (isCustomRangeIncomplete) {
      toast.error("Please select both a start and end date");
      return;
    }

    setIsDownloading(true);
    const blob = await download_report_csv({
      period: reportPeriod,
      start: reportPeriod === "custom" ? customStart : undefined,
      end: reportPeriod === "custom" ? customEnd : undefined,
    });
    setIsDownloading(false);

    if (!blob) {
      toast.error("Failed to download CSV report");
      return;
    }

    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `report_${reportPeriod}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    toast.success("CSV report downloaded");
  };

  const statCards = summary
    ? reportType === "occupancy"
      ? [
          { label: "Total Entries", value: summary.total_entries.toString(), change: summary.total_entries_change_pct },
          { label: "Total Exits", value: summary.total_exits.toString(), change: summary.total_exits_change_pct },
          { label: "Utilization", value: `${summary.utilization_pct}%`, change: summary.utilization_change_pct },
          { label: "Avg Duration", value: `${summary.avg_duration_hours.toFixed(1)} hrs`, change: summary.avg_duration_change_pct },
        ]
      : [
          { label: "Total Entries", value: summary.total_entries.toString(), change: summary.total_entries_change_pct },
          { label: "Total Exits", value: summary.total_exits.toString(), change: summary.total_exits_change_pct },
          { label: "Revenue", value: `${summary.revenue.toFixed(2)} T`, change: summary.revenue_change_pct },
          { label: "Avg Duration", value: `${summary.avg_duration_hours.toFixed(1)} hrs`, change: summary.avg_duration_change_pct },
        ]
    : [];

  return (
    <div className="p-8">
      {/* Breadcrumb Navigation */}
      <div className="flex items-center gap-2 text-sm text-gray-600 mb-6">
        <span>Dashboard</span>
        <ArrowRight className="w-4 h-4" />
        <span className="text-gray-900 font-medium">Reports</span>
      </div>

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Reports</h1>
        <p className="text-gray-600 mt-1">Generate and download parking system reports</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Report Generator */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Generate Report</CardTitle>
              <CardDescription>Select report type and period to generate</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="report-type">Report Type</Label>
                    <Select value={reportType} onValueChange={setReportType}>
                      <SelectTrigger id="report-type">
                        <SelectValue placeholder="Select report type" />
                      </SelectTrigger>
                      <SelectContent>
                        {reportTypes.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {isOperatorType && (
                      <p className="text-xs text-gray-500">
                        Requires operator/shift data — coming soon.
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="report-period">Period</Label>
                    <Select value={reportPeriod} onValueChange={setReportPeriod}>
                      <SelectTrigger id="report-period">
                        <SelectValue placeholder="Select period" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="today">Today</SelectItem>
                        <SelectItem value="yesterday">Yesterday</SelectItem>
                        <SelectItem value="this-week">This Week</SelectItem>
                        <SelectItem value="last-week">Last Week</SelectItem>
                        <SelectItem value="this-month">This Month</SelectItem>
                        <SelectItem value="last-month">Last Month</SelectItem>
                        <SelectItem value="custom">Custom Range</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {reportPeriod === "custom" && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="start-date">Start Date</Label>
                      <input
                        id="start-date"
                        type="date"
                        value={customStart}
                        onChange={(e) => setCustomStart(e.target.value)}
                        className="w-full border rounded-md px-3 py-2 text-sm"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="end-date">End Date</Label>
                      <input
                        id="end-date"
                        type="date"
                        value={customEnd}
                        onChange={(e) => setCustomEnd(e.target.value)}
                        className="w-full border rounded-md px-3 py-2 text-sm"
                      />
                    </div>
                  </div>
                )}

                <div className="flex gap-3">
                  <Button
                    onClick={handleGenerateReport}
                    className="flex-1"
                    disabled={isGenerating || isOperatorType}
                  >
                    <FileText className="w-4 h-4 mr-2" />
                    {isGenerating ? "Generating..." : "Generate Report"}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleDownloadCsv}
                    disabled={isDownloading || isOperatorType}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    {isDownloading ? "Downloading..." : "CSV"}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {summary && (
            <Card>
              <CardHeader>
                <CardTitle>Report Summary</CardTitle>
                <CardDescription>Key metrics for {periodLabels[reportPeriod]}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {statCards.map((stat) => (
                    <div key={stat.label} className="space-y-2">
                      <p className="text-sm text-gray-600">{stat.label}</p>
                      <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                      {stat.change !== null && stat.change !== undefined && (
                        <p className={`text-sm ${stat.change >= 0 ? "text-green-600" : "text-red-600"}`}>
                          {stat.change >= 0 ? "+" : ""}
                          {stat.change}% vs previous period
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Export Options Panel */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Export Options</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-gray-600">
              <p>• CSV - Transaction-level data for the selected period, ready for spreadsheet analysis</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
