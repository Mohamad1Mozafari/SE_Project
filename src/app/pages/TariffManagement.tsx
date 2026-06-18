import { useState } from "react";
import { ArrowRight, DollarSign, Edit, Plus, Save } from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "../components/ui/dialog";
import { toast } from "sonner";

export function TariffManagement() {
  const [tariffs, setTariffs] = useState([
    { id: 1, type: "Hourly", rate: 5.0, description: "Standard hourly rate" },
    { id: 2, type: "Daily Max", rate: 40.0, description: "Maximum daily charge" },
    { id: 3, type: "Weekend", rate: 3.0, description: "Weekend hourly rate" },
    { id: 4, type: "Monthly Pass", rate: 250.0, description: "Monthly unlimited access" },
    { id: 5, type: "Grace Period", rate: 0.0, description: "First 15 minutes free" },
  ]);

  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editingTariff, setEditingTariff] = useState<any>(null);
  const [newTariff, setNewTariff] = useState({ type: "", rate: 0, description: "" });

  const handleEdit = (tariff: any) => {
    setEditingTariff({ ...tariff });
    setEditDialogOpen(true);
  };

  const handleSaveEdit = () => {
    if (editingTariff) {
      setTariffs(tariffs.map(t => t.id === editingTariff.id ? editingTariff : t));
      toast.success("Tariff updated successfully");
      setEditDialogOpen(false);
      setEditingTariff(null);
    }
  };

  const handleAdd = () => {
    if (!newTariff.type || !newTariff.description) {
      toast.error("Please fill in all fields");
      return;
    }
    const newId = Math.max(...tariffs.map(t => t.id)) + 1;
    setTariffs([...tariffs, { ...newTariff, id: newId }]);
    toast.success("Tariff added successfully");
    setAddDialogOpen(false);
    setNewTariff({ type: "", rate: 0, description: "" });
  };

  return (
    <div className="p-8">
      {/* Breadcrumb Navigation */}
      <div className="flex items-center gap-2 text-sm text-gray-600 mb-6">
        <span>Dashboard</span>
        <ArrowRight className="w-4 h-4" />
        <span className="text-gray-900 font-medium">Tariff Management</span>
      </div>

      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Tariff Management</h1>
            <p className="text-gray-600 mt-1">Manage parking rates and pricing</p>
          </div>
          <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Add Tariff
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Tariff</DialogTitle>
                <DialogDescription>Create a new tariff type and rate</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="new-type">Tariff Type</Label>
                  <Input
                    id="new-type"
                    placeholder="e.g., Evening Rate"
                    value={newTariff.type}
                    onChange={(e) => setNewTariff({ ...newTariff, type: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="new-rate">Rate ($)</Label>
                  <Input
                    id="new-rate"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={newTariff.rate}
                    onChange={(e) => setNewTariff({ ...newTariff, rate: parseFloat(e.target.value) || 0 })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="new-description">Description</Label>
                  <Input
                    id="new-description"
                    placeholder="Description of tariff"
                    value={newTariff.description}
                    onChange={(e) => setNewTariff({ ...newTariff, description: e.target.value })}
                  />
                </div>
                <Button onClick={handleAdd} className="w-full">
                  <Save className="w-4 h-4 mr-2" />
                  Add Tariff
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Tariff List */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Active Tariffs</CardTitle>
              <CardDescription>Current parking rates and pricing structure</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Type</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead className="text-right">Rate</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tariffs.map((tariff) => (
                    <TableRow key={tariff.id}>
                      <TableCell className="font-medium">{tariff.type}</TableCell>
                      <TableCell className="text-gray-600">{tariff.description}</TableCell>
                      <TableCell className="text-right font-semibold">
                        ${tariff.rate.toFixed(2)}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(tariff)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>

        {/* Info Panel */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <DollarSign className="w-5 h-5" />
                Pricing Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Base Hourly</span>
                <span className="font-semibold">$5.00</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Daily Max</span>
                <span className="font-semibold">$40.00</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Weekend Rate</span>
                <span className="font-semibold">$3.00/hr</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Monthly Pass</span>
                <span className="font-semibold">$250.00</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Tariff Guidelines</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-gray-600">
              <p>• Update tariffs during off-peak hours</p>
              <p>• Notify customers 30 days before rate changes</p>
              <p>• Consider seasonal pricing adjustments</p>
              <p>• Review competitor rates quarterly</p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Tariff</DialogTitle>
            <DialogDescription>Update tariff details</DialogDescription>
          </DialogHeader>
          {editingTariff && (
            <div className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="edit-type">Tariff Type</Label>
                <Input
                  id="edit-type"
                  value={editingTariff.type}
                  onChange={(e) => setEditingTariff({ ...editingTariff, type: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-rate">Rate ($)</Label>
                <Input
                  id="edit-rate"
                  type="number"
                  step="0.01"
                  value={editingTariff.rate}
                  onChange={(e) => setEditingTariff({ ...editingTariff, rate: parseFloat(e.target.value) || 0 })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-description">Description</Label>
                <Input
                  id="edit-description"
                  value={editingTariff.description}
                  onChange={(e) => setEditingTariff({ ...editingTariff, description: e.target.value })}
                />
              </div>
              <Button onClick={handleSaveEdit} className="w-full">
                <Save className="w-4 h-4 mr-2" />
                Save Changes
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
