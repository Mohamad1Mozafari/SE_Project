
//ShiftManagement.tsx
import { ArrowRight, Clock, Plus, Calendar } from "lucide-react";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";

export function ShiftManagement() {
  const shifts = [
    { id: 1, name: "Morning Shift", time: "6:00 AM - 2:00 PM", operators: ["John Smith", "Emily Davis"], status: "Active" },
    { id: 2, name: "Evening Shift", time: "2:00 PM - 10:00 PM", operators: ["Sarah Johnson", "James Wilson"], status: "Active" },
    { id: 3, name: "Night Shift", time: "10:00 PM - 6:00 AM", operators: ["Mike Brown"], status: "Active" },
  ];

  const currentWeekSchedule = [
    { day: "Monday", morning: "John Smith", evening: "Sarah Johnson", night: "Mike Brown" },
    { day: "Tuesday", morning: "Emily Davis", evening: "James Wilson", night: "Mike Brown" },
    { day: "Wednesday", morning: "John Smith", evening: "Sarah Johnson", night: "Mike Brown" },
    { day: "Thursday", morning: "Emily Davis", evening: "James Wilson", night: "Mike Brown" },
    { day: "Friday", morning: "John Smith", evening: "Sarah Johnson", night: "Mike Brown" },
    { day: "Saturday", morning: "Emily Davis", evening: "James Wilson", night: "Mike Brown" },
    { day: "Sunday", morning: "John Smith", evening: "Sarah Johnson", night: "Mike Brown" },
  ];

  return (
    <div className="p-8">
      {/* Breadcrumb Navigation */}
      <div className="flex items-center gap-2 text-sm text-gray-600 mb-6">
        <span>Dashboard</span>
        <ArrowRight className="w-4 h-4" />
        <span className="text-gray-900 font-medium">Shift Management</span>
      </div>

      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Shift Management</h1>
          <p className="text-gray-600 mt-1">Manage operator shifts and schedules</p>
        </div>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Create Shift
        </Button>
      </div>

      {/* Shift Types */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {shifts.map((shift) => (
          <Card key={shift.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <Clock className="w-8 h-8 text-blue-600" />
                <Badge>{shift.status}</Badge>
              </div>
              <CardTitle className="mt-4">{shift.name}</CardTitle>
              <CardDescription>{shift.time}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-700">Assigned Operators:</p>
                <div className="space-y-1">
                  {shift.operators.map((operator, index) => (
                    <div key={index} className="text-sm bg-gray-50 p-2 rounded">
                      {operator}
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Weekly Schedule */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Weekly Schedule
              </CardTitle>
              <CardDescription>Current week operator assignments</CardDescription>
            </div>
            <Button variant="outline">Edit Schedule</Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Day</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Morning (6AM-2PM)</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Evening (2PM-10PM)</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Night (10PM-6AM)</th>
                </tr>
              </thead>
              <tbody>
                {currentWeekSchedule.map((schedule, index) => (
                  <tr key={index} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4 font-medium text-gray-900">{schedule.day}</td>
                    <td className="py-3 px-4">
                      <div className="bg-blue-50 text-blue-700 px-3 py-1.5 rounded text-sm inline-block">
                        {schedule.morning}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="bg-orange-50 text-orange-700 px-3 py-1.5 rounded text-sm inline-block">
                        {schedule.evening}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="bg-purple-50 text-purple-700 px-3 py-1.5 rounded text-sm inline-block">
                        {schedule.night}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Shift Coverage */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        <Card>
          <CardHeader>
            <CardTitle>Shift Coverage</CardTitle>
            <CardDescription>Current week coverage statistics</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Fully Covered Shifts</span>
              <span className="text-lg font-semibold text-green-600">21/21</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Partially Covered</span>
              <span className="text-lg font-semibold text-orange-600">0/21</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Uncovered Shifts</span>
              <span className="text-lg font-semibold text-red-600">0/21</span>
            </div>
            <div className="pt-4 border-t">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-700">Coverage Rate</span>
                <span className="text-xl font-bold text-green-600">100%</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common shift management tasks</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button variant="outline" className="w-full justify-start">
              <Calendar className="w-4 h-4 mr-2" />
              View Next Week Schedule
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <Clock className="w-4 h-4 mr-2" />
              Create Shift Template
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <ArrowRight className="w-4 h-4 mr-2" />
              View Shift Change Requests
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
