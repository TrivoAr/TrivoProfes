"use client";

import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, FilePenLine, Trash2 } from "lucide-react";
import type { SocialOuting } from "@/lib/types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

export function OutingsTable({ outings }: { outings: SocialOuting[] }) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedOuting, setSelectedOuting] = useState<SocialOuting | null>(null);
  const { toast } = useToast();

  const handleEdit = (outing: SocialOuting) => {
    setSelectedOuting(outing);
    setIsDialogOpen(true);
  };
  
  const handleCreateNew = () => {
    setSelectedOuting(null);
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    toast({
      title: "Outing Deleted",
      description: `Outing with ID ${id} has been deleted.`,
    });
  };

  const handleFormSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const name = formData.get("name") as string;
    
    toast({
      title: selectedOuting ? "Outing Updated" : "Outing Created",
      description: `${name} has been successfully ${selectedOuting ? 'updated' : 'created'}.`,
    });
    setIsDialogOpen(false);
  };

  return (
    <>
      <div className="mb-6 flex justify-end">
        <Button onClick={handleCreateNew}>Create New Outing</Button>
      </div>
      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Schedule</TableHead>
              <TableHead>Limit</TableHead>
              <TableHead>Participants</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {outings.map((outing) => (
              <TableRow key={outing.id}>
                <TableCell className="font-medium">{outing.name}</TableCell>
                <TableCell>{outing.schedule.toLocaleString()}</TableCell>
                <TableCell>{outing.limit}</TableCell>
                <TableCell>{outing.participants}</TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Open menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleEdit(outing)}>
                        <FilePenLine className="mr-2 h-4 w-4" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleDelete(outing.id)} className="text-destructive">
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{selectedOuting ? "Edit Outing" : "Create New Outing"}</DialogTitle>
            <DialogDescription>
              {selectedOuting ? "Update the details of the social outing." : "Fill in the details for the new social outing."}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleFormSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">Name</Label>
                <Input id="name" name="name" defaultValue={selectedOuting?.name} className="col-span-3" required />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="limit" className="text-right">Limit</Label>
                <Input id="limit" name="limit" type="number" defaultValue={selectedOuting?.limit} className="col-span-3" required />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
              <Button type="submit">Save changes</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
