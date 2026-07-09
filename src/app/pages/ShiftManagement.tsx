import React, { useState } from "react";
import { ArrowRight, Clock, Plus, Calendar, X, Edit2, Check } from "lucide-react";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";

// Mock list of all available operators
const ALL_OPERATORS = [
  "John Smith", "Emily Davis", "Sarah Johnson", 
  "James Wilson", "Mike Brown", "Alex Turner", "Lisa Wong"
];

const INITIAL_SCHEDULE = [
  { day: "Monday", morning: ["John Smith"], evening: ["Sarah Johnson"], night: ["Mike Brown"] },
  { day: "Tuesday", morning: ["Emily Davis"], evening: ["James Wilson"], night: ["Mike Brown"] },
  { day: "Wednesday", morning: ["John Smith", "Alex Turner"], evening: ["Sarah Johnson"], night: ["Mike Brown"] },
  { day: "Thursday", morning: ["Emily Davis"], evening: ["James Wilson"], night: ["Mike Brown"] },
  { day: "Friday", morning: ["John Smith"], evening: ["Sarah Johnson", "Lisa Wong"], night: ["Mike Brown"] },
  { day: "Saturday", morning: ["Emily Davis"], evening: ["James Wilson"], night: ["Mike Brown"] },
  { day: "Sunday", morning: ["John Smith"], evening: ["Sarah Johnson"], night: ["Mike Brown"] },
];

export function ShiftManagement() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  
  // Converted schedule to state so edits reflect dynamically on the UI
  const [schedule, setSchedule] = useState(INITIAL_SCHEDULE);

  // State for the cell currently being edited
  const [editingCell, setEditingCell] = useState<{
    day: string;
    shiftType: string;
    operators: string[];
  } | null>(null);

  const shifts = [
    { id: 1, name: "Morning Shift", time: "6:00 AM - 2:00 PM", operators: ["John Smith", "Emily Davis"], status: "Active" },
    { id: 2, name: "Evening Shift", time: "2:00 PM - 10:00 PM", operators: ["Sarah Johnson", "James Wilson"], status: "Active" },
    { id: 3, name: "Night Shift", time: "10:00 PM - 6:00 AM", operators: ["Mike Brown"], status: "Active" },
  ];

  const handleCellClick = (day: string, shiftType: string, operators: string[]) => {
    if (!isEditMode) return;
    setEditingCell({ day, shiftType, operators });
  };

  const toggleOperatorSelection = (operator: string) => {
    if (!editingCell) return;
    const currentOps = editingCell.operators;
    const newOps = currentOps.includes(operator)
      ? currentOps.filter(op => op !== operator)
      : [...currentOps, operator];
    
    setEditingCell({ ...editingCell, operators: newOps });
  };

  // Function to save the edited cell back to the table state
  const handleUpdateSchedule = () => {
    if (!editingCell) return;
    
    setSchedule(prevSchedule => prevSchedule.map(row => {
      if (row.day === editingCell.day) {
        // Determine which column we are updating based on the shiftType string
        if (editingCell.shiftType.includes("Morning")) return { ...row, morning: editingCell.operators };
        if (editingCell.shiftType.includes("Evening")) return { ...row, evening: editingCell.operators };
        if (editingCell.shiftType.includes("Night")) return { ...row, night: editingCell.operators };
      }
      return row;
    }));
    
    setEditingCell(null);
  };

  // Get today's date in YYYY-MM-DD format for the default input value
  const todayDate = new Date().toISOString().split('T')[0];

  return (
    <div className="p-8 relative">
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
        <Button onClick={() => setIsCreateModalOpen(true)}>
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
            <Button 
              variant={isEditMode ? "default" : "outline"} 
              onClick={() => setIsEditMode(!isEditMode)}
            >
              {isEditMode ? "Done Editing" : "Edit Schedule"}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-medium text-gray-900 w-1/4">Day</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900 w-1/4">Morning (6AM-2PM)</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900 w-1/4">Evening (2PM-10PM)</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900 w-1/4">Night (10PM-6AM)</th>
                </tr>
              </thead>
              <tbody>
                {schedule.map((row, index) => (
                  <tr key={index} className="border-b hover:bg-gray-50 transition-colors align-top">
                    <td className="py-4 px-4 font-medium text-gray-900">{row.day}</td>
                    
                    {/* Morning Cell */}
                    <td 
                      className={`py-3 px-4 h-full ${isEditMode ? 'cursor-pointer hover:bg-blue-50 border-2 border-transparent hover:border-blue-200 rounded-md transition-all' : ''}`}
                      onClick={() => handleCellClick(row.day, "Morning (6AM-2PM)", row.morning)}
                    >
                      {/* Flex-col used here to stack items vertically */}
                      <div className="flex flex-col gap-1.5 items-start">
                        {row.morning.map((op, i) => (
                          <div key={i} className="bg-blue-50 text-blue-700 px-3 py-1.5 rounded text-sm w-full">
                            {op}
                          </div>
                        ))}
                        {isEditMode && (
                          <div className="w-full flex justify-center py-1 border-2 border-dashed border-gray-300 rounded text-gray-400 hover:border-blue-400 hover:text-blue-500">
                            <Plus className="w-4 h-4" />
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Evening Cell */}
                    <td 
                      className={`py-3 px-4 h-full ${isEditMode ? 'cursor-pointer hover:bg-orange-50 border-2 border-transparent hover:border-orange-200 rounded-md transition-all' : ''}`}
                      onClick={() => handleCellClick(row.day, "Evening (2PM-10PM)", row.evening)}
                    >
                      {/* Flex-col used here to stack items vertically */}
                      <div className="flex flex-col gap-1.5 items-start">
                        {row.evening.map((op, i) => (
                          <div key={i} className="bg-orange-50 text-orange-700 px-3 py-1.5 rounded text-sm w-full">
                            {op}
                          </div>
                        ))}
                        {isEditMode && (
                          <div className="w-full flex justify-center py-1 border-2 border-dashed border-gray-300 rounded text-gray-400 hover:border-orange-400 hover:text-orange-500">
                            <Plus className="w-4 h-4" />
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Night Cell */}
                    <td 
                      className={`py-3 px-4 h-full ${isEditMode ? 'cursor-pointer hover:bg-purple-50 border-2 border-transparent hover:border-purple-200 rounded-md transition-all' : ''}`}
                      onClick={() => handleCellClick(row.day, "Night (10PM-6AM)", row.night)}
                    >
                      {/* Flex-col used here to stack items vertically */}
                      <div className="flex flex-col gap-1.5 items-start">
                        {row.night.map((op, i) => (
                          <div key={i} className="bg-purple-50 text-purple-700 px-3 py-1.5 rounded text-sm w-full">
                            {op}
                          </div>
                        ))}
                        {isEditMode && (
                          <div className="w-full flex justify-center py-1 border-2 border-dashed border-gray-300 rounded text-gray-400 hover:border-purple-400 hover:text-purple-500">
                            <Plus className="w-4 h-4" />
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Restored Bottom Cards Section */}
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

        {/* The Quick Actions card contains the View Next Week Schedule button */}
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

      {/* --- MODALS --- */}

      {/* Create Shift Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md shadow-xl">
            <CardHeader className="flex flex-row items-center justify-between border-b pb-4">
              <CardTitle>Create New Shift</CardTitle>
              <Button variant="ghost" size="sm" onClick={() => setIsCreateModalOpen(false)}>
                <X className="w-4 h-4" />
              </Button>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                {/* Default value set to today */}
                <input 
                  type="date" 
                  className="w-full border rounded-md p-2 text-sm" 
                  defaultValue={todayDate} 
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Shift Time</label>
                <select className="w-full border rounded-md p-2 text-sm bg-white">
                  <option>Morning (6:00 AM - 2:00 PM)</option>
                  <option>Evening (2:00 PM - 10:00 PM)</option>
                  <option>Night (10:00 PM - 6:00 AM)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Assign Operators (Multiple)</label>
                <div className="max-h-40 overflow-y-auto border rounded-md p-2 space-y-2">
                  {ALL_OPERATORS.map((op) => (
                    <label key={op} className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 p-1 rounded">
                      <input type="checkbox" className="rounded border-gray-300" />
                      <span className="text-sm text-gray-700">{op}</span>
                    </label>
                  ))}
                </div>
              </div>

              <Button className="w-full mt-4" onClick={() => setIsCreateModalOpen(false)}>
                Save Shift Assignment
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Edit Cell Modal */}
      {editingCell && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-sm shadow-xl">
            <CardHeader className="flex flex-row items-center justify-between border-b pb-4">
              <div>
                <CardTitle className="text-lg">Edit Shift</CardTitle>
                <CardDescription>{editingCell.day} • {editingCell.shiftType}</CardDescription>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setEditingCell(null)}>
                <X className="w-4 h-4" />
              </Button>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Select Operators</label>
                <div className="space-y-2 border rounded-md p-2 max-h-60 overflow-y-auto">
                  {ALL_OPERATORS.map((op) => {
                    const isSelected = editingCell.operators.includes(op);
                    return (
                      <div 
                        key={op}
                        onClick={() => toggleOperatorSelection(op)}
                        className={`flex items-center justify-between p-2 rounded cursor-pointer transition-colors ${
                          isSelected ? 'bg-blue-50 border border-blue-200' : 'hover:bg-gray-50 border border-transparent'
                        }`}
                      >
                        <span className={`text-sm ${isSelected ? 'text-blue-700 font-medium' : 'text-gray-700'}`}>
                          {op}
                        </span>
                        {isSelected && <Check className="w-4 h-4 text-blue-600" />}
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <Button 
                  variant="outline" 
                  className="flex-1" 
                  onClick={() => setEditingCell(null)}
                >
                  Cancel
                </Button>
                <Button 
                  className="flex-1" 
                  onClick={handleUpdateSchedule}
                >
                  Update
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}