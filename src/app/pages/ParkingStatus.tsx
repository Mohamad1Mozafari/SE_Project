import { useState, useEffect, useCallback } from "react";
import { ArrowRight, Car, CheckCircle } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { toast } from "sonner";
import get_parking_status from "./ParkingStatusHandler";

interface ParkingSpotStatus {
  id: string;
  section: string;
  number: string;
  isOccupied: boolean;
  plateNumber: string | null;
}

function parseSpot(location: string): { section: string; number: string } {
  const parts = location.split("-");
  if (parts.length === 2) {
    return { section: parts[0], number: parts[1] };
  }
  return { section: location.charAt(0), number: location.slice(1) };
}

export function ParkingStatus() {
  const [spots, setSpots] = useState<ParkingSpotStatus[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadStatus = useCallback(async (showErrorToast = true) => {
    const result = await get_parking_status();

    if (result) {
      const mapped: ParkingSpotStatus[] = result.map((r: any) => {
        const { section, number } = parseSpot(r.location);
        return {
          id: r.location,
          section,
          number,
          isOccupied: r.is_occupied,
          plateNumber: r.plate_number,
        };
      });
      setSpots(mapped);
    } else if (showErrorToast) {
      toast.error("Failed to load parking status");
    }

    setIsLoading(false);
  }, []);

  useEffect(() => {
    loadStatus();
  }, [loadStatus]);

  const totalSpots = spots.length;
  const occupiedSpots = spots.filter((s) => s.isOccupied).length;
  const availableSpots = totalSpots - occupiedSpots;
  const sections = Array.from(new Set(spots.map((s) => s.section))).sort();

  return (
    <div className="p-8">
      {/* Breadcrumb Navigation */}
      <div className="flex items-center gap-2 text-sm text-gray-600 mb-6">
        <span>Dashboard</span>
        <ArrowRight className="w-4 h-4" />
        <span className="text-gray-900 font-medium">Parking Status</span>
      </div>

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Parking Status</h1>
        <p className="text-gray-600 mt-1">The status of all parking spots</p>
      </div>

      {isLoading ? (
        <div className="text-center text-gray-500 py-12">Loading parking status...</div>
      ) : totalSpots === 0 ? (
        <div className="text-center text-gray-500 py-12">No parking spots found.</div>
      ) : (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Total Spots</p>
                    <p className="text-3xl font-bold text-gray-900">{totalSpots}</p>
                  </div>
                  <div className="bg-blue-50 text-blue-600 p-3 rounded-lg">
                    <Car className="w-6 h-6" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Occupied</p>
                    <p className="text-3xl font-bold text-red-600">{occupiedSpots}</p>
                  </div>
                  <div className="bg-red-50 text-red-600 p-3 rounded-lg">
                    <Car className="w-6 h-6" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Available</p>
                    <p className="text-3xl font-bold text-green-600">{availableSpots}</p>
                  </div>
                  <div className="bg-green-50 text-green-600 p-3 rounded-lg">
                    <CheckCircle className="w-6 h-6" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Parking Grid by Section */}
          <div className="space-y-6">
            {sections.map((section) => {
              const sectionSpots = spots.filter((s) => s.section === section);
              const sectionOccupied = sectionSpots.filter((s) => s.isOccupied).length;
              const sectionAvailable = sectionSpots.length - sectionOccupied;
              const availablePercent = Math.round((sectionAvailable / sectionSpots.length) * 100);

              return (
                <Card key={section}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle>Section {section}</CardTitle>
                        <CardDescription>
                          {sectionAvailable} available · {sectionOccupied} occupied
                        </CardDescription>
                      </div>
                      <Badge variant={availablePercent > 20 ? "default" : "destructive"}>
                        {availablePercent}% Available
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-5 sm:grid-cols-10 md:grid-cols-[repeat(15,minmax(0,1fr))] lg:grid-cols-[repeat(20,minmax(0,1fr))] gap-2">
                      {sectionSpots.map((spot) => (
                        <div
                          key={spot.id}
                          className={`aspect-square rounded-lg flex flex-col items-center justify-center text-xs font-medium transition-colors cursor-pointer ${
                            spot.isOccupied
                              ? "bg-red-100 text-red-700 hover:bg-red-200"
                              : "bg-green-100 text-green-700 hover:bg-green-200"
                          }`}
                          title={spot.isOccupied ? `Occupied: ${spot.plateNumber}` : "Available"}
                        >
                          <div className="text-center">
                            <div className="font-semibold">{spot.number}</div>
                            {spot.isOccupied && <Car className="w-3 h-3 mx-auto mt-0.5" />}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Legend */}
          <Card className="mt-6">
            <CardContent className="p-4">
              <div className="flex items-center gap-6">
                <span className="text-sm font-medium text-gray-700">Legend:</span>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-green-100 rounded border border-green-200"></div>
                  <span className="text-sm text-gray-600">Available</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-red-100 rounded border border-red-200"></div>
                  <span className="text-sm text-gray-600">Occupied</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
