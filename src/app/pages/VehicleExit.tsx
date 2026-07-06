import { useState, useEffect } from "react";
import { ArrowRight, Search, CheckCircle, DollarSign } from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { toast } from "sonner";
import vehicle_exit_handler, { get_vehicle_info, get_current_pricing } from "./VehicleExitHandler";

export function VehicleExit() {
  const [searchPlate, setSearchPlate] = useState("");
  const [vehicleFound, setVehicleFound] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [isProcessingExit, setIsProcessingExit] = useState(false);
  const [pricing, setPricing] = useState({ entranceFee: 0, hourlyFee: 0 });
  const [vehicleData, setVehicleData] = useState({
    plateNumber: "",
    location: "",
    entryTime: "",
    estimatedExitTime: "",
    durationHours: 0,
    estimatedFee: 0,
  });

  useEffect(() => {
    const loadPricing = async () => {
      const result = await get_current_pricing();
      if (result) {
        setPricing({
          entranceFee: Number(result.entrance_fee) || 0,
          hourlyFee: Number(result.hourly_fee) || 0,
        });
      }
    };
    loadPricing();
  }, []);

  const handleSearch = async () => {
    if (!searchPlate) {
      toast.error("Please enter a plate number");
      return;
    }

    setIsSearching(true);
    const result = await get_vehicle_info(searchPlate);
    setIsSearching(false);

    if (!result) {
      toast.error("Vehicle not found in the parking facility");
      setVehicleFound(false);
      return;
    }

    setVehicleData({
      plateNumber: result.plate_number,
      location: result.location,
      entryTime: new Date(result.entrance_time).toLocaleString(),
      estimatedExitTime: new Date(result.estimated_exit_time).toLocaleString(),
      durationHours: result.estimated_duration_hours,
      estimatedFee: Number(result.estimated_fee),
    });
    setVehicleFound(true);
  };

  const handleConfirmExit = async () => {
    setIsProcessingExit(true);
    const result = await vehicle_exit_handler(vehicleData.plateNumber);
    setIsProcessingExit(false);

    if (result) {
      toast.success(
        `Vehicle ${vehicleData.plateNumber} exit confirmed. Fee: $${Number(result.TotalCost).toFixed(2)}`
      );
      setSearchPlate("");
      setVehicleFound(false);
    } else {
      toast.error("Failed to process vehicle exit. Please try again.");
    }
  };

  return (
    <div className="p-8">
      {/* Breadcrumb Navigation */}
      <div className="flex items-center gap-2 text-sm text-gray-600 mb-6">
        <span>Dashboard</span>
        <ArrowRight className="w-4 h-4" />
        <span className="text-gray-900 font-medium">Vehicle Exit</span>
      </div>

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Vehicle Exit</h1>
        <p className="text-gray-600 mt-1">Process vehicle exit and calculate parking fee</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Exit Form */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Search Vehicle</CardTitle>
              <CardDescription>Enter the plate number to find the vehicle</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-3">
                <div className="flex-1">
                  <Input
                    placeholder="e.g., 12B345-51"
                    value={searchPlate}
                    maxLength={11}
                    onChange={(e) => setSearchPlate(e.target.value.toUpperCase())}
                    onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                    disabled={isSearching}
                  />
                </div>
                <Button onClick={handleSearch} disabled={isSearching}>
                  <Search className="w-4 h-4 mr-2" />
                  {isSearching ? "Searching..." : "Search"}
                </Button>
              </div>
            </CardContent>
          </Card>

          {vehicleFound && (
            <>
              <Card>
                <CardHeader>
                  <CardTitle>Vehicle Details</CardTitle>
                  <CardDescription>Review the parking session information</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label>Plate Number</Label>
                      <div className="p-3 bg-gray-50 rounded-lg font-medium">
                        {vehicleData.plateNumber}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Parking Spot</Label>
                      <div className="p-3 bg-gray-50 rounded-lg font-medium">
                        {vehicleData.location}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Entry Time</Label>
                      <div className="p-3 bg-gray-50 rounded-lg">
                        {vehicleData.entryTime}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Exit Time (estimated)</Label>
                      <div className="p-3 bg-gray-50 rounded-lg">
                        {vehicleData.estimatedExitTime}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Parking Duration</Label>
                      <div className="p-3 bg-blue-50 rounded-lg font-medium text-blue-700">
                        {vehicleData.durationHours} hours
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Estimated Fee</Label>
                      <div className="p-3 bg-green-50 rounded-lg font-bold text-green-700 text-xl">
                        ${vehicleData.estimatedFee.toFixed(2)}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-green-200 bg-green-50">
                <CardHeader>
                  <CardTitle className="text-green-900">Confirm Exit</CardTitle>
                  <CardDescription className="text-green-700">
                    Review the details and confirm vehicle exit
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-3">
                    <Button
                      onClick={handleConfirmExit}
                      className="flex-1 bg-green-600 hover:bg-green-700"
                      disabled={isProcessingExit}
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      {isProcessingExit ? "Processing..." : "Confirm Exit & Process Payment"}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setVehicleFound(false);
                        setSearchPlate("");
                      }}
                      disabled={isProcessingExit}
                    >
                      Cancel
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </div>

        {/* Info Panel */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Exit Instructions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex gap-3">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-sm font-medium">
                    1
                  </div>
                  <div>
                    <p className="text-sm font-medium">Search vehicle</p>
                    <p className="text-xs text-gray-600">Enter plate number to find</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-sm font-medium">
                    2
                  </div>
                  <div>
                    <p className="text-sm font-medium">Review details</p>
                    <p className="text-xs text-gray-600">Check duration and fee</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-sm font-medium">
                    3
                  </div>
                  <div>
                    <p className="text-sm font-medium">Confirm exit</p>
                    <p className="text-xs text-gray-600">Process payment and exit</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <DollarSign className="w-5 h-5" />
                Pricing
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Entrance Fee</span>
                <span className="font-semibold">${pricing.entranceFee.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Hourly Rate</span>
                <span className="font-semibold">${pricing.hourlyFee.toFixed(2)}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
