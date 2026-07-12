// ShiftChangeRequest.tsx
import React, { useState, useEffect } from "react";
import { ArrowRight, CheckCircle, XCircle, Clock, Trash2, Plus } from "lucide-react";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "../components/ui/dialog";
import { Label } from "../components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { get_user_name, get_role } from "./USername_role.js"; 

// Import operator APIs
import {
  new_request,
  current_shift_load,
  requested_shift_load,
  pending_request as op_pending,
  aproved_request as op_approved,
  rejected_request as op_rejected
} from "./ShiftChangeRequest_operator_view.js";

// Import Admin/Owner APIs
import {
  pending_request as admin_pending,
  aproved_request as admin_approved,
  rejected_request as admin_rejected,
  pending_request_approve_button,
  pending_request_reject_button
} from "./ShiftChangeRequest_admin_owner_view.js";

export function ShiftChangeRequest() {
  const [pendingRequests, setPendingRequests] = useState<any[]>([]);
  const [approvedRequests, setApprovedRequests] = useState<any[]>([]);
  const [rejectedRequests, setRejectedRequests] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // States for the new request dialog form
  const [currentShiftsOptions, setCurrentShiftsOptions] = useState<any[]>([]);
  const [requestedShiftsOptions, setRequestedShiftsOptions] = useState<any[]>([]);
  const [selectedCurrentShift, setSelectedCurrentShift] = useState<string>("");
  const [selectedRequestedShift, setSelectedRequestedShift] = useState<string>("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const role = get_role();
  const isAdminOrOwner = role === "admin" || role === "owner";

  // Load Request Lists Data
  const loadData = async () => {
    setIsLoading(true);
    try {
      if (isAdminOrOwner) {
        // Load Admin/Owner Data
        const pending = await admin_pending();
        const approved = await admin_approved();
        const rejected = await admin_rejected();
        
        setPendingRequests(pending || []);
        setApprovedRequests(approved || []);
        setRejectedRequests(rejected || []);
      } else {
        // Load Operator Data
        const pending = await op_pending();
        const approved = await op_approved();
        const rejected = await op_rejected();

        // Combine to find the latest request
        const allRequests = [...(pending || []), ...(approved || []), ...(rejected || [])];
        
        if (allRequests.length > 0) {
          // Sort by ID descending (assuming higher ID = newer request)
          allRequests.sort((a, b) => b.id - a.id);
          const latestRequest = allRequests[0];
          
          // Clear all states
          setPendingRequests([]);
          setApprovedRequests([]);
          setRejectedRequests([]);

          // Only set the state for the table that matches the latest request status
          const statusLower = latestRequest.status?.toLowerCase();
          if (statusLower === "pending") {
            setPendingRequests([latestRequest]);
          } else if (statusLower === "approved") {
            setApprovedRequests([latestRequest]);
          } else {
            setRejectedRequests([latestRequest]);
          }
        } else {
          setPendingRequests([]);
          setApprovedRequests([]);
          setRejectedRequests([]);
        }
      }
    } catch (error) {
      console.error("Failed to load shift requests", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Load shift dropdown listings for Operator view
  const loadDropdownOptions = async () => {
    if (!isAdminOrOwner) {
      try {
        const currentShifts = await current_shift_load();
        const requestedShifts = await requested_shift_load();
        setCurrentShiftsOptions(currentShifts || []);
        setRequestedShiftsOptions(requestedShifts || []);
      } catch (error) {
        console.error("Failed to load shift dropdown select fields", error);
      }
    }
  };

  useEffect(() => {
    loadData();
    loadDropdownOptions();
  }, [role]);

  // Action Handlers
  const handleApprove = async (id: number) => {
    await pending_request_approve_button(id);
    loadData(); 
  };

  const handleReject = async (id: number) => {
    await pending_request_reject_button(id);
    loadData(); 
  };

  const handleOperatorDelete = async (id: number) => {
    console.log("Operator requested to delete request ID:", id);
    // Add delete logic wrapper here if endpoint becomes available
  };

  const handleSubmitNewRequest = async () => {
    if (!selectedCurrentShift || !selectedRequestedShift) {
      alert("Please select both shifts before submitting.");
      return;
    }
    try {
      await new_request(Number(selectedCurrentShift), Number(selectedRequestedShift));
      setIsDialogOpen(false); // Close modal
      setSelectedCurrentShift(""); // Reset selection
      setSelectedRequestedShift(""); // Reset selection
      loadData(); // Re-fetch historical lists
    } catch (error) {
      console.error("Failed to submit new shift change request", error);
    }
  };

  if (isLoading) {
    return <div className="p-8 text-center text-gray-500">Loading shift requests...</div>;
  }

  const totalRequests = pendingRequests.length + approvedRequests.length + rejectedRequests.length;

  return (
    <div className="p-8">
      {/* Breadcrumb Navigation */}
      <div className="flex items-center gap-2 text-sm text-gray-600 mb-6">
        <span>Dashboard</span>
        <ArrowRight className="w-4 h-4" />
        <span className="text-gray-900 font-medium">Shift Change Request</span>
      </div>

      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Shift Change Requests</h1>
          <p className="text-gray-600 mt-1">
            {isAdminOrOwner 
              ? "Review and manage operator shift change requests" 
              : "Track the status of your recent shift change request"}
          </p>
        </div>

        {/* Modal display condition: Rendered ONLY if user is an Operator */}
        {!isAdminOrOwner && (
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                New Request
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Submit Shift Change Request</DialogTitle>
                <DialogDescription>Request a change to your assigned shift</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
  <Label>Current Shift</Label>
  <Select value={selectedCurrentShift} onValueChange={setSelectedCurrentShift}>
    <SelectTrigger>
      <SelectValue placeholder="Select current shift" />
    </SelectTrigger>
    <SelectContent>
      {currentShiftsOptions.map((shift) => (
        <SelectItem key={shift.shiftID} value={String(shift.shiftID)}>
          {new Date(shift.shiftDate).toLocaleDateString()} — {shift.shiftType}
        </SelectItem>
      ))}
    </SelectContent>
  </Select>
</div>
<div className="space-y-2">
  <Label>Requested Shift</Label>
  <Select value={selectedRequestedShift} onValueChange={setSelectedRequestedShift}>
    <SelectTrigger>
      <SelectValue placeholder="Select desired shift" />
    </SelectTrigger>
    <SelectContent>
      {requestedShiftsOptions.map((shift) => (
        <SelectItem key={shift.shiftID} value={String(shift.shiftID)}>
          {new Date(shift.shiftDate).toLocaleDateString()} — {shift.shiftType}
        </SelectItem>
      ))}
    </SelectContent>
  </Select>
</div>
              </div>
              <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                <Button onClick={handleSubmitNewRequest}>Submit Request</Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Stats - Rendered for both, but dynamically populated */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">{isAdminOrOwner ? "Total Requests" : "Active History"}</p>
                <p className="text-3xl font-bold text-gray-900">{totalRequests}</p>
              </div>
              <Clock className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        
        {isAdminOrOwner && (
          <>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Pending</p>
                    <p className="text-3xl font-bold text-orange-600">{pendingRequests.length}</p>
                  </div>
                  <Clock className="w-8 h-8 text-orange-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Approved</p>
                    <p className="text-3xl font-bold text-green-600">{approvedRequests.length}</p>
                  </div>
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Rejected</p>
                    <p className="text-3xl font-bold text-red-600">{rejectedRequests.length}</p>
                  </div>
                  <XCircle className="w-8 h-8 text-red-600" />
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      {/* Requests Lists */}
      <div className="space-y-6">
        {/* Pending Requests */}
        {pendingRequests.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Pending Requests</CardTitle>
              <CardDescription>
                {isAdminOrOwner ? "Requests awaiting approval" : "Your request is under review"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {pendingRequests.map((request) => (
                  <div key={request.id} className="border rounded-lg p-4 hover:bg-gray-50">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-semibold text-gray-900">{request.requestedBy || get_user_name()}</h3>
                        <p className="text-sm text-gray-600">Requested on {request.date || "Recent"}</p>
                      </div>
                      <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
                        {request.status}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Current Shift</p>
                        <p className="text-sm font-medium bg-gray-100 px-3 py-2 rounded">
                          {request.currentShift}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Requested Shift</p>
                        <p className="text-sm font-medium bg-blue-50 text-blue-700 px-3 py-2 rounded">
                          {request.requestedShift}
                        </p>
                      </div>
                    </div>
                    {request.reason && (
                      <div className="mb-4">
                        <p className="text-xs text-gray-500 mb-1">Reason</p>
                        <p className="text-sm text-gray-700">{request.reason}</p>
                      </div>
                    )}
                    
                    {/* Role-based action handlers */}
                    <div className="flex gap-3">
                      {isAdminOrOwner ? (
                        <>
                          <Button size="sm" onClick={() => handleApprove(request.id)} className="bg-green-600 hover:bg-green-700">
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Approve
                          </Button>
                          <Button size="sm" onClick={() => handleReject(request.id)} variant="outline" className="text-red-600 hover:text-red-700">
                            <XCircle className="w-4 h-4 mr-2" />
                            Reject
                          </Button>
                        </>
                      ) : (
                        <Button size="sm" onClick={() => handleOperatorDelete(request.id)} variant="outline" className="text-red-600 hover:text-red-700">
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete Request
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Approved Requests */}
        {approvedRequests.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Approved Requests</CardTitle>
              <CardDescription>
                {isAdminOrOwner ? "Recently approved shift changes" : "Your request was approved"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {approvedRequests.map((request) => (
                  <div key={request.id} className="border rounded-lg p-4 bg-green-50">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-semibold text-gray-900">{request.requestedBy || get_user_name()}</h3>
                        <p className="text-sm text-gray-600">Requested on {request.date || "Recent"}</p>
                      </div>
                      <Badge className="bg-green-600">
                        {request.status}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Current Shift</p>
                        <p className="text-sm font-medium">{request.currentShift}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-1">New Shift</p>
                        <p className="text-sm font-medium">{request.requestedShift}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Rejected Requests */}
        {rejectedRequests.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Rejected Requests</CardTitle>
              <CardDescription>
                {isAdminOrOwner ? "Declined shift change requests" : "Your request was declined"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {rejectedRequests.map((request) => (
                  <div key={request.id} className="border rounded-lg p-4 bg-gray-50">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-semibold text-gray-900">{request.requestedBy || get_user_name()}</h3>
                        <p className="text-sm text-gray-600">Requested on {request.date || "Recent"}</p>
                      </div>
                      <Badge variant="destructive">
                        {request.status}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Current Shift</p>
                        <p className="text-sm font-medium">{request.currentShift}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Requested Shift</p>
                        <p className="text-sm font-medium">{request.requestedShift}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}