import { ArrowRight, CheckCircle, XCircle, Clock, Plus } from "lucide-react";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "../components/ui/dialog";
import { Label } from "../components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Textarea } from "../components/ui/textarea";
import { get_user_name, get_role } from "./USername_role.js"; 
if (get_role()=="admin"||get_role()=="owner"){
import {pending_request , aproved_request , rejected_request} from "./ShiftChangeRequest_admin_owner_view.js";
}else {
  import {new_request , current_shift_load , requested_shift_load , pending_request , aproved_request , rejected_request} from "./ShiftChangeRequest_operator_view.js";
}


export function ShiftChangeRequest() {
  const requests = [
    {
      id: 1,
      requestedBy: "John Smith",
      currentShift: "Morning - Monday",
      requestedShift: "Evening - Monday",
      reason: "Personal appointment",
      date: "May 28, 2026",
      status: "Pending",
    },
    {
      id: 2,
      requestedBy: "Sarah Johnson",
      currentShift: "Evening - Wednesday",
      requestedShift: "Morning - Wednesday",
      reason: "Family commitment",
      date: "May 27, 2026",
      status: "Approved",
    },
    {
      id: 3,
      requestedBy: "Mike Brown",
      currentShift: "Night - Friday",
      requestedShift: "Night - Saturday",
      reason: "Health checkup",
      date: "May 26, 2026",
      status: "Rejected",
    },
    {
      id: 4,
      requestedBy: "Emily Davis",
      currentShift: "Morning - Thursday",
      requestedShift: "Evening - Thursday",
      reason: "Course enrollment",
      date: "May 29, 2026",
      status: "Pending",
    },
  ];

  const pendingRequests = requests.filter(r => r.status === "Pending");
  const approvedRequests = requests.filter(r => r.status === "Approved");
  const rejectedRequests = requests.filter(r => r.status === "Rejected");
if (get_role()=="operator"){
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
          <p className="text-gray-600 mt-1">Review and manage operator shift change requests</p>
        </div>
       
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Requests</p>
                <p className="text-3xl font-bold text-gray-900">{requests.length}</p>
              </div>
              <Clock className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

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
      </div>

      {/* Requests List */}
      <div className="space-y-6">
        {/* Pending Requests */}
        {pendingRequests.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Pending Requests</CardTitle>
              <CardDescription>Requests awaiting approval</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {pendingRequests.map((request) => (
                  <div key={request.id} className="border rounded-lg p-4 hover:bg-gray-50">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-semibold text-gray-900">{request.requestedBy}</h3>
                        <p className="text-sm text-gray-600">Requested on {request.date}</p>
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
                    <div className="mb-4">
                      <p className="text-xs text-gray-500 mb-1">Reason</p>
                      <p className="text-sm text-gray-700">{request.reason}</p>
                    </div>
                    <div className="flex gap-3">
                      <Button size="sm" className="bg-green-600 hover:bg-green-700">
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Approve
                      </Button>
                      <Button size="sm" variant="outline" className="text-red-600 hover:text-red-700">
                        <XCircle className="w-4 h-4 mr-2" />
                        Reject
                      </Button>
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
              <CardDescription>Recently approved shift changes</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {approvedRequests.map((request) => (
                  <div key={request.id} className="border rounded-lg p-4 bg-green-50">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-semibold text-gray-900">{request.requestedBy}</h3>
                        <p className="text-sm text-gray-600">Requested on {request.date}</p>
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
              <CardDescription>Declined shift change requests</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {rejectedRequests.map((request) => (
                  <div key={request.id} className="border rounded-lg p-4 bg-gray-50">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-semibold text-gray-900">{request.requestedBy}</h3>
                        <p className="text-sm text-gray-600">Requested on {request.date}</p>
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
} else {
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
          <p className="text-gray-600 mt-1">Review and manage operator shift change requests</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Requests</p>
                <p className="text-3xl font-bold text-gray-900">{requests.length}</p>
              </div>
              <Clock className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

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
      </div>

      {/* Requests List */}
      <div className="space-y-6">
        {/* Pending Requests */}
        {pendingRequests.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Pending Requests</CardTitle>
              <CardDescription>Requests awaiting approval</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {pendingRequests.map((request) => (
                  <div key={request.id} className="border rounded-lg p-4 hover:bg-gray-50">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-semibold text-gray-900">{request.requestedBy}</h3>
                        <p className="text-sm text-gray-600">Requested on {request.date}</p>
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
                    <div className="mb-4">
                      <p className="text-xs text-gray-500 mb-1">Reason</p>
                      <p className="text-sm text-gray-700">{request.reason}</p>
                    </div>
                    <div className="flex gap-3">
                      <Button size="sm" className="bg-green-600 hover:bg-green-700">
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Approve
                      </Button>
                      <Button size="sm" variant="outline" className="text-red-600 hover:text-red-700">
                        <XCircle className="w-4 h-4 mr-2" />
                        Reject
                      </Button>
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
              <CardDescription>Recently approved shift changes</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {approvedRequests.map((request) => (
                  <div key={request.id} className="border rounded-lg p-4 bg-green-50">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-semibold text-gray-900">{request.requestedBy}</h3>
                        <p className="text-sm text-gray-600">Requested on {request.date}</p>
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
              <CardDescription>Declined shift change requests</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {rejectedRequests.map((request) => (
                  <div key={request.id} className="border rounded-lg p-4 bg-gray-50">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-semibold text-gray-900">{request.requestedBy}</h3>
                        <p className="text-sm text-gray-600">Requested on {request.date}</p>
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
}
