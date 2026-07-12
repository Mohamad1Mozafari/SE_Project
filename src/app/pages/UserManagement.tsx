// UserManagement.tsx

import { useState, useEffect } from "react";
import { ArrowRight, UserPlus, Edit, Trash2, Shield, UserCog, Loader2 } from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "../components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { toast } from "sonner";
import { getUsers, addUser, editUser, deleteUser } from "./UserManagement_page";

interface User {
  id: string | number;
  username: string;
  name: string;
  email: string;
  role: string;
  password?: string; // Optional field for runtime tracking during edits
}

export function UserManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [originalUser, setOriginalUser] = useState<User | null>(null); // Track original state for comparison
  const [newUser, setNewUser] = useState({ username: "", name: "", email: "", password: "", role: "Operator" });

  // Load users from API on component mount
  const loadUserData = async () => {
    try {
      setIsLoading(true);
      const data = await getUsers();
      
      const mappedUsers: User[] = data.map((dbUser: any) => ({
        id: dbUser.username,
        username: dbUser.username,
        name: dbUser.full_name || "Unknown User",
        email: dbUser.email,
        role: dbUser.role
      }));

      setUsers(mappedUsers);
    } catch (error) {
      console.error("Database connection error:", error);
      toast.error("Failed to fetch users from database.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadUserData();
  }, []);

  const handleEdit = (user: User) => {
    setEditingUser({ ...user, password: "" });
    setOriginalUser({ ...user }); // Save exact replica to pass as oldUser context to API
    setEditDialogOpen(true);
  };

  const handleSaveEdit = async () => {
    if (!editingUser || !originalUser) return;

    // Call API Edit function
    const response = await editUser(originalUser, editingUser);

    if (response.success) {
      toast.success("User updated successfully");
      setEditDialogOpen(false);
      setEditingUser(null);
      setOriginalUser(null);
      loadUserData(); // Refresh local list state from server
    } else {
      toast.error(response.message || "Failed to update user");
    }
  };

  const handleAdd = async () => {
    if (!newUser.username || !newUser.name || !newUser.email || !newUser.password) {
      toast.error("Please fill in all required fields");
      return;
    }

    // Call API Add function
    const response = await addUser(newUser);

    if (response.success) {
      toast.success("User added successfully");
      setAddDialogOpen(false);
      setNewUser({ username: "", name: "", email: "", password: "", role: "Operator" });
      loadUserData(); // Refresh local list state from server
    } else {
      toast.error(response.message || "Failed to add user");
    }
  };

  const handleDelete = async (username: string) => {
    const isDeleted = await deleteUser(username);

    if (isDeleted) {
      setUsers(users.filter(u => u.username !== username));
      toast.success("User deleted successfully");
    } else {
      toast.error("Could not delete user from system");
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "Admin": return "bg-purple-100 text-purple-700";
      case "owner": return "bg-blue-100 text-blue-700";
      case "Operator": return "bg-green-100 text-green-700";
      default: return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <div className="p-8">
      {/* Breadcrumb Navigation */}
      <div className="flex items-center gap-2 text-sm text-gray-600 mb-6">
        <span>Dashboard</span>
        <ArrowRight className="w-4 h-4" />
        <span className="text-gray-900 font-medium">User Management</span>
      </div>

      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
            <p className="text-gray-600 mt-1">Manage system users and permissions</p>
          </div>
          <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <UserPlus className="w-4 h-4 mr-2" />
                Add User
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New User</DialogTitle>
                <DialogDescription>Create a new user account</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="new-username">Username</Label>
                  <Input
                    id="new-username"
                    placeholder="Enter username"
                    value={newUser.username}
                    onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="new-name">Full Name</Label>
                  <Input
                    id="new-name"
                    placeholder="Enter full name"
                    value={newUser.name}
                    onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="new-email">Email</Label>
                  <Input
                    id="new-email"
                    type="email"
                    placeholder="user@parking.com"
                    value={newUser.email}
                    onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="new-password">Password</Label>
                  <Input
                    id="new-password"
                    type="password"
                    placeholder="Enter password"
                    value={newUser.password}
                    onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="new-role">Role</Label>
                  <Select value={newUser.role} onValueChange={(value) => setNewUser({ ...newUser, role: value })}>
                    <SelectTrigger id="new-role">
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Admin">Admin</SelectItem>
                      <SelectItem value="owner">owner</SelectItem>
                      <SelectItem value="Operator">Operator</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button onClick={handleAdd} className="w-full">
                  <UserPlus className="w-4 h-4 mr-2" />
                  Add User
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* User List Layout Card */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>System Users</CardTitle>
              <CardDescription>All registered users and their roles</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex flex-col items-center justify-center p-12 text-gray-500 space-y-3">
                  <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
                  <p className="text-sm">Fetching active configuration parameters...</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Username</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium">{user.username}</TableCell>
                        <TableCell>{user.name}</TableCell>
                        <TableCell className="text-gray-600">{user.email}</TableCell>
                        <TableCell>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleBadgeColor(user.role)}`}>
                            {user.role}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex gap-2 justify-end">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEdit(user)}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(user.username)}
                            >
                              <Trash2 className="w-4 h-4 text-red-600" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Info Sidebar Section */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">User Statistics</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Total Users</span>
                <span className="font-semibold">{users.length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Administrators</span>
                <span className="font-semibold text-purple-600">
                  {users.filter(u => u.role === "Admin").length}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Operators</span>
                <span className="font-semibold text-blue-600">
                  {users.filter(u => u.role === "Operator").length}
                </span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Role Permissions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="font-medium text-sm mb-2">Admin</p>
                <p className="text-xs text-gray-600">Full system access and configuration</p>
              </div>
              <div>
                <p className="font-medium text-sm mb-2">owner</p>
                <p className="text-xs text-gray-600">Reports, users, and operations</p>
              </div>
              <div>
                <p className="font-medium text-sm mb-2">Operator</p>
                <p className="text-xs text-gray-600">Vehicle entry/exit only</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Security</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-gray-600">
              <p>• Password must be 8+ characters</p>
              <p>• Passwords expire every 90 days</p>
              <p>• Session timeout after 30 min inactivity</p>
              <p>• Two-factor authentication available</p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Edit Dialog Form modal view */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>Update user information</DialogDescription>
          </DialogHeader>
          {editingUser && (
            <div className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name">Full Name</Label>
                <Input
                  id="edit-name"
                  value={editingUser.name}
                  onChange={(e) => setEditingUser({ ...editingUser, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-email">Email</Label>
                <Input
                  id="edit-email"
                  type="email"
                  value={editingUser.email}
                  onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-password">New Password (optional)</Label>
                <Input
                  id="edit-password"
                  type="password"
                  placeholder="Enter new password to change"
                  value={editingUser.password || ""}
                  onChange={(e) => setEditingUser({ ...editingUser, password: e.target.value })}
                />
                <p className="text-xs text-gray-500">Leave blank to keep current password</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-role">Role</Label>
                <Select value={editingUser.role} onValueChange={(value) => setEditingUser({ ...editingUser, role: value })}>
                  <SelectTrigger id="edit-role">
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Admin">Admin</SelectItem>
                    <SelectItem value="owner">owner</SelectItem>
                    <SelectItem value="Operator">Operator</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={handleSaveEdit} className="w-full">
                <UserCog className="w-4 h-4 mr-2" />
                Save Changes
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}