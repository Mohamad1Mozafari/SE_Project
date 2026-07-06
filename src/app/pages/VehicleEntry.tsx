import { useState, useEffect } from "react";
import { ArrowRight, Save } from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { toast } from "sonner";
import vehicle_entry_handler, { get_available_spots } from "./VehicleEntryHandler";

export function VehicleEntry() {
  const [plateNumber, setPlateNumber] = useState("");
  const [parkingSpot, setParkingSpot] = useState("");
  const [entryTime] = useState(new Date().toLocaleString());
  const [availableSpots, setAvailableSpots] = useState<string[]>([]);
  const [isLoadingSpots, setIsLoadingSpots] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const refreshSpots = async () => {
    setIsLoadingSpots(true);
    const spots = await get_available_spots();
    setAvailableSpots(spots);
    setIsLoadingSpots(false);
  };

  useEffect(() => {
    refreshSpots();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!plateNumber || !parkingSpot) {
      toast.error("Please fill in all required fields");
      return;
    }

    const platePattern = /^\d{2}-[A-Z]-\d{3}-\d{2}$/;
    if (!platePattern.test(plateNumber)) {
        toast.error("Plate number must be in format: 12-B-345-51");
        return;
    }

    setIsSaving(true);
    const isSuccess = await vehicle_entry_handler(plateNumber, parkingSpot);
    setIsSaving(false);

    if (isSuccess) {
      toast.success(`Vehicle ${plateNumber} registered at spot ${parkingSpot}`);
      setPlateNumber("");
      setParkingSpot("");
      refreshSpots();
    } else {
      toast.error("Failed to register vehicle entry. The plate or spot may already be in use.");
    }
  };

  return (
    <div className="p-8">
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
                      placeholder="e.g., 12-B-345-51"
                      value={plateNumber}
                      maxLength={11}
                      onChange={(e) => setPlateNumber(e.target.value.toUpperCase())}
                      required
                      disabled={isSaving}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="entryTime">Entry Time</Label>
                    <Input id="entryTime" value={entryTime} disabled className="bg-gray-50" />
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="parkingSpot">Assigned Parking Spot *</Label>
                    <Select value={parkingSpot} onValueChange={setParkingSpot} disabled={isSaving || isLoadingSpots}>
                      <SelectTrigger>
                        <SelectValue placeholder={isLoadingSpots ? "Loading spots..." : "Select available spot"} />
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
                  <Button type="submit" className="flex-1" disabled={isSaving}>
                    <Save className="w-4 h-4 mr-2" />
                    {isSaving ? "Saving..." : "Save Entry"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setPlateNumber("");
                      setParkingSpot("");
                    }}
                    disabled={isSaving}
                  >
                    Clear
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Entry Instructions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex gap-3">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-sm font-medium">1</div>
                  <div>
                    <p className="text-sm font-medium">Enter plate number</p>
                    <p className="text-xs text-gray-600">Use format: 12-B-345-51</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-sm font-medium">2</div>
                  <div>
                    <p className="text-sm font-medium">Select parking spot</p>
                    <p className="text-xs text-gray-600">Choose from available spots</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-sm font-medium">3</div>
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
                <span className="font-semibold text-green-600">{availableSpots.length}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
