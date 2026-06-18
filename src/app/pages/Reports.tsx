import { useState } from "react";
import { ArrowRight, Download, FileText, Calendar, TrendingUp, DollarSign, Car } from "lucide-react";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Label } from "../components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { toast } from "sonner";

export function Reports() {
  const [reportType, setReportType] = useState("daily");
  const [reportPeriod, setReportPeriod] = useState("today");

  const handleGenerateReport = () => {
    toast.success(`${reportType} report generated for ${reportPeriod}`);
  };

  const handleDownloadReport = (format: string) => {
    toast.success(`Downloading report as ${format.toUpperCase()}`);
  };

  const reportTypes = [
    { value: "daily", label: "Daily Summary", icon: Calendar },
    { value: "revenue", label: "Revenue Report", icon: DollarSign },
    { value: "occupancy", label: "Occupancy Report", icon: Car },
    { value: "operator", label: "Operator Performance", icon: TrendingUp },
  ];

  const summaryStats = [
    { label: "Total Entries", value: "342", change: "+12%", positive: true },
    { label: "Total Exits", value: "328", change: "+8%", positive: true },
    { label: "Revenue", value: "$2,450", change: "+15%", positive: true },
    { label: "Avg Duration", value: "3.2 hrs", change: "-5%", positive: false },
  ];

  const recentReports = [
    { name: "Daily Summary - May 29, 2026", date: "Yesterday", type: "Daily" },
    { name: "Revenue Report - Week 21", date: "2 days ago", type: "Revenue" },
    { name: "Occupancy Report - May 2026", date: "5 days ago", type: "Occupancy" },
    { name: "Operator Performance - Q2 2026", date: "1 week ago", type: "Operator" },
  ];

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

                <div className="flex gap-3">
                  <Button onClick={handleGenerateReport} className="flex-1">
                    <FileText className="w-4 h-4 mr-2" />
                    Generate Report
                  </Button>
                  <Button variant="outline" onClick={() => handleDownloadReport("pdf")}>
                    <Download className="w-4 h-4 mr-2" />
                    PDF
                  </Button>
                  <Button variant="outline" onClick={() => handleDownloadReport("csv")}>
                    <Download className="w-4 h-4 mr-2" />
                    CSV
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Today's Summary</CardTitle>
              <CardDescription>Key metrics for May 30, 2026</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {summaryStats.map((stat) => (
                  <div key={stat.label} className="space-y-2">
                    <p className="text-sm text-gray-600">{stat.label}</p>
                    <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                    <p className={`text-sm ${stat.positive ? "text-green-600" : "text-red-600"}`}>
                      {stat.change} vs yesterday
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent Reports</CardTitle>
              <CardDescription>Previously generated reports</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentReports.map((report, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-50 rounded-lg">
                        <FileText className="w-4 h-4 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{report.name}</p>
                        <p className="text-sm text-gray-500">{report.date} · {report.type}</p>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm">
                      <Download className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Reports Panel */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Quick Reports</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {reportTypes.map((type) => {
                const Icon = type.icon;
                return (
                  <Button
                    key={type.value}
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => {
                      setReportType(type.value);
                      handleGenerateReport();
                    }}
                  >
                    <Icon className="w-4 h-4 mr-2" />
                    {type.label}
                  </Button>
                );
              })}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Report Schedule</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-medium">Daily Summary</p>
                  <p className="text-xs text-gray-500">Every day at 11:59 PM</p>
                </div>
                <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">Active</span>
              </div>
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-medium">Weekly Revenue</p>
                  <p className="text-xs text-gray-500">Sundays at 11:59 PM</p>
                </div>
                <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">Active</span>
              </div>
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-medium">Monthly Analysis</p>
                  <p className="text-xs text-gray-500">Last day of month</p>
                </div>
                <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">Active</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Export Options</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-gray-600">
              <p>• PDF - Formatted reports</p>
              <p>• CSV - Data analysis</p>
              <p>• Excel - Detailed spreadsheets</p>
              <p>• JSON - API integration</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
