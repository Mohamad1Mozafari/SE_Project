import { useState } from "react";
import { ArrowRight, Search, CheckCircle, DollarSign } from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { toast } from "sonner";

export function VehicleExit() {
  const [searchPlate, setSearchPlate] = useState("");
  const [vehicleFound, setVehicleFound] = useState(false);
  const [vehicleData, setVehicleData] = useState({
    plateNumber: "",
    entryTime: "",
    exitTime: "",
    parkingSpot: "",
    duration: "",
    calculatedFee: 0,
  });

  const handleSearch = () => {
    if (!searchPlate) {
      toast.error("Please enter a plate number");
      return;
    }

    // Mock search - in real app would query database
    const entryDate = new Date();
    entryDate.setHours(entryDate.getHours() - 3);
    const exitDate = new Date();
    
    const durationHours = 3;
    const hourlyRate = 5;
    const calculatedFee = durationHours * hourlyRate;

    setVehicleData({
      plateNumber: searchPlate,
      entryTime: entryDate.toLocaleString(),
      exitTime: exitDate.toLocaleString(),
      parkingSpot: "A-15",
      duration: `${durationHours} hours`,
      calculatedFee: calculatedFee,
    });
    setVehicleFound(true);
  };

  const handleConfirmExit = () => {
    toast.success(`Vehicle ${vehicleData.plateNumber} exit confirmed. Fee: $${vehicleData.calculatedFee}`);
    setSearchPlate("");
    setVehicleFound(false);
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
                    placeholder="Enter plate number (e.g., ABC-1234)"
                    value={searchPlate}
                    onChange={(e) => setSearchPlate(e.target.value.toUpperCase())}
                    onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  />
                </div>
                <Button onClick={handleSearch}>
                  <Search className="w-4 h-4 mr-2" />
                  Search
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
                        {vehicleData.parkingSpot}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Entry Time</Label>
                      <div className="p-3 bg-gray-50 rounded-lg">
                        {vehicleData.entryTime}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Exit Time</Label>
                      <div className="p-3 bg-gray-50 rounded-lg">
                        {vehicleData.exitTime}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Parking Duration</Label>
                      <div className="p-3 bg-blue-50 rounded-lg font-medium text-blue-700">
                        {vehicleData.duration}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Calculated Fee</Label>
                      <div className="p-3 bg-green-50 rounded-lg font-bold text-green-700 text-xl">
                        ${vehicleData.calculatedFee.toFixed(2)}
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
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Confirm Exit & Process Payment
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => {
                        setVehicleFound(false);
                        setSearchPlate("");
                      }}
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
                <span className="text-sm text-gray-600">Hourly Rate</span>
                <span className="font-semibold">$5.00</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Daily Max</span>
                <span className="font-semibold">$40.00</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Grace Period</span>
                <span className="font-semibold">15 mins</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
