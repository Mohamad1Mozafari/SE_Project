import React, { useState, useEffect } from "react";
import { ArrowRight, Clock, Plus, Calendar, X, Check } from "lucide-react";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import dayjs from 'dayjs';

import {
  Create_shift,
  Morning_shift_load,
  Evening_shift_load,
  Night_shift_load,
  Weekly_Schedule_load,
  Previous_Week_Schedule_load,
  Next_Week_Schedule_load,
  Shift_Coverage_load,
  Weekly_Schedule_edit
} from './ShiftManagement_page';

const ALL_OPERATORS = [
  "John Smith", "Emily Davis", "Sarah Johnson", 
  "James Wilson", "Mike Brown", "Alex Turner", "Lisa Wong"
];

// Fallback initial schedule if API fails
const INITIAL_SCHEDULE = [
  { day: "Monday", morning: [], evening: [], night: [] },
  { day: "Tuesday", morning: [], evening: [], night: [] },
  { day: "Wednesday", morning: [], evening: [], night: [] },
  { day: "Thursday", morning: [], evening: [], night: [] },
  { day: "Friday", morning: [], evening: [], night: [] },
  { day: "Saturday", morning: [], evening: [], night: [] },
  { day: "Sunday", morning: [], evening: [], night: [] },
];

export function ShiftManagement() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  
  const [schedule, setSchedule] = useState(INITIAL_SCHEDULE);
  const [coverage, setCoverage] = useState({ covered: 0, uncovered: 0 });
  const [todayShifts, setTodayShifts] = useState({
    morning: [],
    evening: [],
    night: []
  });

  const [editingCell, setEditingCell] = useState<{
    day: string;
    shiftType: string;
    operators: string[];
  } | null>(null);

  // New Create Shift Modal States
  const [newShiftDate, setNewShiftDate] = useState(dayjs().format('YYYY-MM-DD'));
  const [newShiftTime, setNewShiftTime] = useState("Morning");
  const [newShiftOperators, setNewShiftOperators] = useState<string[]>([]);

  // Calculate standard ISO weekday (1 = Monday, 7 = Sunday) to determine if a day is in the past
  const currentDayIndex = dayjs().day() === 0 ? 7 : dayjs().day();
  const dayNames = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

  const canEditDay = (dayName: string) => {
    const rowDayIndex = dayNames.indexOf(dayName) + 1;
    return rowDayIndex >= currentDayIndex;
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      // Load Today's Shifts
      const morningRes = await Morning_shift_load();
      const eveningRes = await Evening_shift_load();
      const nightRes = await Night_shift_load();
      
      setTodayShifts({
        morning: morningRes?.operators || [],
        evening: eveningRes?.operators || [],
        night: nightRes?.operators || []
      });

      // Load Weekly Schedule
      const weeklyRes = await Weekly_Schedule_load();
      if (weeklyRes && weeklyRes.length > 0) setSchedule(weeklyRes);

      // Load Coverage Stats
      const coverageRes = await Shift_Coverage_load();
      if (coverageRes) setCoverage(coverageRes);

    } catch (error) {
      console.error("Error loading dashboard data", error);
    }
  };

  const loadPreviousWeek = async () => {
    const res = await Previous_Week_Schedule_load();
    if (res) setSchedule(res);
  };

  const loadNextWeek = async () => {
    const res = await Next_Week_Schedule_load();
    if (res) setSchedule(res);
  };

  const handleCellClick = (day: string, shiftType: string, operators: string[]) => {
    if (!isEditMode) return;
    if (!canEditDay(day)) {
      alert(`You cannot edit past schedules for ${day}.`);
      return;
    }
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

  const toggleNewShiftOperator = (operator: string) => {
    setNewShiftOperators(prev => 
      prev.includes(operator) 
        ? prev.filter(op => op !== operator)
        : [...prev, operator]
    );
  };

  const handleCreateNewShift = async () => {
    await Create_shift(newShiftOperators, newShiftTime, newShiftDate);
    setIsCreateModalOpen(false);
    loadDashboardData(); // Refresh UI
  };

  const handleUpdateSchedule = async () => {
    if (!editingCell) return;
    
    // Prepare API JSON Format
    const jsonPayload = editingCell.operators.map(op => ({
      username: op,
      day: editingCell.day,
      shift: editingCell.shiftType.toLowerCase().split(" ")[0] // extracts 'morning', 'evening', etc.
    }));

    await Weekly_Schedule_edit(JSON.stringify(jsonPayload));

    // Optimistic UI Update
    setSchedule(prevSchedule => prevSchedule.map(row => {
      if (row.day === editingCell.day) {
        if (editingCell.shiftType.includes("Morning")) return { ...row, morning: editingCell.operators };
        if (editingCell.shiftType.includes("Evening")) return { ...row, evening: editingCell.operators };
        if (editingCell.shiftType.includes("Night")) return { ...row, night: editingCell.operators };
      }
      return row;
    }));
    
    setEditingCell(null);
  };

  const shifts = [
    { id: 1, name: "Today's Morning Shift", time: "6:00 AM - 2:00 PM", operators: todayShifts.morning, status: "Active" },
    { id: 2, name: "Today's Evening Shift", time: "2:00 PM - 10:00 PM", operators: todayShifts.evening, status: "Active" },
    { id: 3, name: "Today's Night Shift", time: "10:00 PM - 6:00 AM", operators: todayShifts.night, status: "Active" },
  ];

  return (
    <div className="p-8 relative">
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

      {/* Today's Shifts */}
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
                  {shift.operators.length > 0 ? shift.operators.map((operator, index) => (
                    <div key={index} className="text-sm bg-gray-50 p-2 rounded">
                      {operator}
                    </div>
                  )) : (
                    <span className="text-sm text-gray-400 italic">No operators assigned</span>
                  )}
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
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-medium text-gray-900 w-1/4">Day</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900 w-1/4">Morning (6AM-2PM)</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900 w-1/4">Evening (2PM-10PM)</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900 w-1/4">Night (10PM-6AM)</th>
                </tr>
              </thead>
              <tbody>
                {schedule.map((row, index) => {
                  const isPast = !canEditDay(row.day);
                  return (
                    <tr key={index} className={`border-b transition-colors align-top ${isPast && isEditMode ? 'bg-gray-100 opacity-70' : 'hover:bg-gray-50'}`}>
                      <td className="py-4 px-4 font-medium text-gray-900">
                        {row.day}
                        {isPast && isEditMode && <span className="ml-2 text-xs text-red-500">(Past)</span>}
                      </td>
                      
                      {/* Morning Cell */}
                      <td 
                        className={`py-3 px-4 h-full ${isEditMode && !isPast ? 'cursor-pointer hover:bg-blue-50 border-2 border-transparent hover:border-blue-200 rounded-md transition-all' : (isEditMode && isPast ? 'cursor-not-allowed' : '')}`}
                        onClick={() => handleCellClick(row.day, "Morning (6AM-2PM)", row.morning)}
                      >
                        <div className="flex flex-col gap-1.5 items-start">
                          {row.morning.map((op, i) => (
                            <div key={i} className="bg-blue-50 text-blue-700 px-3 py-1.5 rounded text-sm w-full">
                              {op}
                            </div>
                          ))}
                          {isEditMode && !isPast && (
                            <div className="w-full flex justify-center py-1 border-2 border-dashed border-gray-300 rounded text-gray-400 hover:border-blue-400 hover:text-blue-500">
                              <Plus className="w-4 h-4" />
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Evening Cell */}
                      <td 
                        className={`py-3 px-4 h-full ${isEditMode && !isPast ? 'cursor-pointer hover:bg-orange-50 border-2 border-transparent hover:border-orange-200 rounded-md transition-all' : (isEditMode && isPast ? 'cursor-not-allowed' : '')}`}
                        onClick={() => handleCellClick(row.day, "Evening (2PM-10PM)", row.evening)}
                      >
                        <div className="flex flex-col gap-1.5 items-start">
                          {row.evening.map((op, i) => (
                            <div key={i} className="bg-orange-50 text-orange-700 px-3 py-1.5 rounded text-sm w-full">
                              {op}
                            </div>
                          ))}
                          {isEditMode && !isPast && (
                            <div className="w-full flex justify-center py-1 border-2 border-dashed border-gray-300 rounded text-gray-400 hover:border-orange-400 hover:text-orange-500">
                              <Plus className="w-4 h-4" />
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Night Cell */}
                      <td 
                        className={`py-3 px-4 h-full ${isEditMode && !isPast ? 'cursor-pointer hover:bg-purple-50 border-2 border-transparent hover:border-purple-200 rounded-md transition-all' : (isEditMode && isPast ? 'cursor-not-allowed' : '')}`}
                        onClick={() => handleCellClick(row.day, "Night (10PM-6AM)", row.night)}
                      >
                        <div className="flex flex-col gap-1.5 items-start">
                          {row.night.map((op, i) => (
                            <div key={i} className="bg-purple-50 text-purple-700 px-3 py-1.5 rounded text-sm w-full">
                              {op}
                            </div>
                          ))}
                          {isEditMode && !isPast && (
                            <div className="w-full flex justify-center py-1 border-2 border-dashed border-gray-300 rounded text-gray-400 hover:border-purple-400 hover:text-purple-500">
                              <Plus className="w-4 h-4" />
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Bottom Cards Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        <Card>
          <CardHeader>
            <CardTitle>Shift Coverage</CardTitle>
            <CardDescription>Current week coverage statistics</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Covered Shifts</span>
              <span className="text-lg font-semibold text-green-600">{coverage.covered}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Uncovered Shifts</span>
              <span className="text-lg font-semibold text-red-600">{coverage.uncovered}</span>
            </div>
            <div className="pt-4 border-t">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-700">Total Shifts</span>
                <span className="text-xl font-bold text-gray-900">{coverage.covered + coverage.uncovered}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Schedule navigation</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button variant="outline" className="w-full justify-start" onClick={loadPreviousWeek}>
              <ArrowRight className="w-4 h-4 mr-2 rotate-180" />
              View Previous Week Schedule
            </Button>
            <Button variant="outline" className="w-full justify-start" onClick={loadNextWeek}>
              <ArrowRight className="w-4 h-4 mr-2" />
              View Next Week Schedule
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* --- MODALS --- */}

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
                <input 
                  type="date" 
                  className="w-full border rounded-md p-2 text-sm" 
                  value={newShiftDate}
                  onChange={(e) => setNewShiftDate(e.target.value)}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Shift Time</label>
                <select 
                  className="w-full border rounded-md p-2 text-sm bg-white"
                  value={newShiftTime}
                  onChange={(e) => setNewShiftTime(e.target.value)}
                >
                  <option value="Morning">Morning (6:00 AM - 2:00 PM)</option>
                  <option value="Evening">Evening (2:00 PM - 10:00 PM)</option>
                  <option value="Night">Night (10:00 PM - 6:00 AM)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Assign Operators (Multiple)</label>
                <div className="max-h-40 overflow-y-auto border rounded-md p-2 space-y-2">
                  {ALL_OPERATORS.map((op) => (
                    <label key={op} className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 p-1 rounded">
                      <input 
                        type="checkbox" 
                        className="rounded border-gray-300"
                        checked={newShiftOperators.includes(op)}
                        onChange={() => toggleNewShiftOperator(op)}
                      />
                      <span className="text-sm text-gray-700">{op}</span>
                    </label>
                  ))}
                </div>
              </div>

              <Button className="w-full mt-4" onClick={handleCreateNewShift}>
                Save Shift Assignment
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

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