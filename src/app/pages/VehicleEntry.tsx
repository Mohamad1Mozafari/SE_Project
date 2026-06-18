import { useState } from "react";
import { ArrowRight, Save, Car } from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { toast } from "sonner";

export function VehicleEntry() {
  const [plateNumber, setPlateNumber] = useState("");
  const [parkingSpot, setParkingSpot] = useState("");
  const [entryTime] = useState(new Date().toLocaleString());

  const availableSpots = [
    "A-01", "A-05", "A-12", "A-15", "A-23",
    "B-03", "B-08", "B-14", "B-19", "B-22",
    "C-02", "C-07", "C-11", "C-16", "C-25",
    "D-04", "D-09", "D-13", "D-18", "D-21",
  ];

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!plateNumber || !parkingSpot) {
      toast.error("Please fill in all required fields");
      return;
    }
    toast.success(`Vehicle ${plateNumber} registered at spot ${parkingSpot}`);
    // Reset form
    setPlateNumber("");
    setParkingSpot("");
  };

  return (
    <div className="p-8">
      {/* Breadcrumb Navigation */}
      <div className="flex items-center gap-2 text-sm text-gray-600 mb-6">
        <span>Dashboard</span>
        <ArrowRight className="w-4 h-4" />
        <span className="text-gray-900 font-medium">Vehicle Entry</span>
      </div>

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Vehicle Entry</h1>
        <p className="text-gray-600 mt-1">Register a new vehicle entering the parking facility</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Entry Form */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Entry Information</CardTitle>
              <CardDescription>Fill in the vehicle details to register entry</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSave} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="plateNumber">Plate Number *</Label>
                    <Input
                      id="plateNumber"
                      placeholder="e.g., ABC-1234"
                      value={plateNumber}
                      onChange={(e) => setPlateNumber(e.target.value.toUpperCase())}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="entryTime">Entry Time</Label>
                    <Input
                      id="entryTime"
                      value={entryTime}
                      disabled
                      className="bg-gray-50"
                    />
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="parkingSpot">Assigned Parking Spot *</Label>
                    <Select value={parkingSpot} onValueChange={setParkingSpot}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select available spot" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableSpots.map((spot) => (
                          <SelectItem key={spot} value={spot}>
                            Spot {spot}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <Button type="submit" className="flex-1">
                    <Save className="w-4 h-4 mr-2" />
                    Save Entry
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline"
                    onClick={() => {
                      setPlateNumber("");
                      setParkingSpot("");
                    }}
                  >
                    Clear
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Info Panel */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Entry Instructions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex gap-3">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-sm font-medium">
                    1
                  </div>
                  <div>
                    <p className="text-sm font-medium">Enter plate number</p>
                    <p className="text-xs text-gray-600">Use format: ABC-1234</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-sm font-medium">
                    2
                  </div>
                  <div>
                    <p className="text-sm font-medium">Select parking spot</p>
                    <p className="text-xs text-gray-600">Choose from available spots</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-sm font-medium">
                    3
                  </div>
                  <div>
                    <p className="text-sm font-medium">Save entry</p>
                    <p className="text-xs text-gray-600">Entry time is auto-recorded</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Current Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Available Spots</span>
                <span className="font-semibold text-green-600">63</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Occupied Spots</span>
                <span className="font-semibold text-red-600">187</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Total Capacity</span>
                <span className="font-semibold text-blue-600">250</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
