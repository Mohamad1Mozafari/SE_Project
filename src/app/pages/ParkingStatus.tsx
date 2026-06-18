import { ArrowRight, Car, CheckCircle } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";

export function ParkingStatus() {
  // Generate parking spots
  const sections = ["A", "B", "C", "D"];
  const spotsPerSection = 25;

  const generateSpots = () => {
    const spots = [];
    for (const section of sections) {
      for (let i = 1; i <= spotsPerSection; i++) {
        const spotNumber = i.toString().padStart(2, "0");
        const spotId = `${section}-${spotNumber}`;
        // Mock occupied status - roughly 75% occupied
        const isOccupied = Math.random() > 0.25;
        spots.push({
          id: spotId,
          section,
          isOccupied,
          plateNumber: isOccupied ? `ABC-${Math.floor(Math.random() * 9000) + 1000}` : null,
        });
      }
    }
    return spots;
  };

  const parkingSpots = generateSpots();
  const totalSpots = parkingSpots.length;
  const occupiedSpots = parkingSpots.filter(s => s.isOccupied).length;
  const availableSpots = totalSpots - occupiedSpots;

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
        <p className="text-gray-600 mt-1">Real-time view of all parking spots</p>
      </div>

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
          const sectionSpots = parkingSpots.filter(s => s.section === section);
          const sectionOccupied = sectionSpots.filter(s => s.isOccupied).length;
          const sectionAvailable = sectionSpots.length - sectionOccupied;

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
                  <Badge variant={sectionAvailable > 5 ? "default" : "destructive"}>
                    {Math.round((sectionAvailable / sectionSpots.length) * 100)}% Available
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-5 sm:grid-cols-10 md:grid-cols-15 lg:grid-cols-20 gap-2">
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
                        <div className="font-semibold">{spot.id.split('-')[1]}</div>
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
    </div>
  );
}
