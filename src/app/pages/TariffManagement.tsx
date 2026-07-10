import { useState, useEffect } from "react";
import { ArrowRight, DollarSign, Edit, Save } from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "../components/ui/dialog";
import { toast } from "sonner";
import { getTariffs, updateTariffRate } from "../services/TariffServices";

// ->OMID: make the 'description' field of the edit form constant (user shouldn't change it)
// ->OMID: if we are going to make the 'description' field constant like the 'Tariff type' field
// then maybe we should remove both of them altogether.

interface Tariff {
    id: number;
    type: string;
    rate: number;
    description: string;
}

export function TariffManagement() {

  const [tariffs, setTariffs] =
    useState<Tariff[]>([]);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingTariff, setEditingTariff] = useState<any>(null);

  const entranceFee =
    tariffs.find(t => t.type === "Entrance fee");

  const hourlyTariff =
    tariffs.find(t => t.type === "Hourly");

  useEffect(() => {
    async function load() {
        const loadedTariffs =
            await getTariffs();
        setTariffs(loadedTariffs);
    }
    load();
  }, []);

  const handleEdit = (tariff: any) => {
    setEditingTariff({ ...tariff });
    setEditDialogOpen(true);
  };

  const handleSaveEdit = async () => {
    if (!editingTariff)
        return;
    await updateTariffRate(
        editingTariff,
        editingTariff.rate
    );
    const refreshed =
        await getTariffs();
    setTariffs(refreshed);
    toast.success("Tariff updated successfully");
    setEditDialogOpen(false);
    setEditingTariff(null);
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
                        {tariff.rate.toFixed(2)} TMN
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
                <span className="text-sm text-gray-600">Entrance fee</span>
                <span className="font-semibold">
                  {entranceFee?.rate.toFixed(2)} TMN
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Hourly</span>
                <span className="font-semibold">
                  {hourlyTariff?.rate.toFixed(2)} TMN
                </span>
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
                <div className="rounded-md border px-3 py-2 bg-gray-100 text-gray-700">{editingTariff.type}</div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-rate">Rate (TMN)</Label>
                <Input
                  id="edit-rate"
                  type="number"
                  min={0}
                  step="5"
                  value={editingTariff.rate}
                  onChange={(e) =>
                    setEditingTariff({
                      ...editingTariff,
                      rate: Math.max(0, Number(e.target.value) || 0)
                    })
                  }
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
