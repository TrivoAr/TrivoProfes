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
import type { Academy } from "@/lib/types";
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

export function AcademiesTable({ academies }: { academies: Academy[] }) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedAcademy, setSelectedAcademy] = useState<Academy | null>(null);
  const { toast } = useToast();

  const handleEdit = (academy: Academy) => {
    setSelectedAcademy(academy);
    setIsDialogOpen(true);
  };
  
  const handleCreateNew = () => {
    setSelectedAcademy(null);
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    toast({
      title: "Academy Deleted",
      description: `Academy with ID ${id} has been deleted.`,
    });
  };

  const handleFormSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const name = formData.get("name") as string;
    
    toast({
      title: selectedAcademy ? "Academy Updated" : "Academy Created",
      description: `${name} has been successfully ${selectedAcademy ? 'updated' : 'created'}.`,
    });
    setIsDialogOpen(false);
  };

  return (
    <>
      <div className="mb-6 flex justify-end">
        <Button onClick={handleCreateNew}>Create New Academy</Button>
      </div>
      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Discipline</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Memberships</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {academies.map((academy) => (
              <TableRow key={academy.id}>
                <TableCell className="font-medium">{academy.name}</TableCell>
                <TableCell>{academy.discipline}</TableCell>
                <TableCell>{academy.location}</TableCell>
                <TableCell>{academy.memberships}</TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Open menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleEdit(academy)}>
                        <FilePenLine className="mr-2 h-4 w-4" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleDelete(academy.id)} className="text-destructive">
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
            <DialogTitle>{selectedAcademy ? "Edit Academy" : "Create New Academy"}</DialogTitle>
            <DialogDescription>
              {selectedAcademy ? "Update the details of the academy." : "Fill in the details for the new academy."}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleFormSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">Name</Label>
                <Input id="name" name="name" defaultValue={selectedAcademy?.name} className="col-span-3" required />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="discipline" className="text-right">Discipline</Label>
                <Input id="discipline" name="discipline" defaultValue={selectedAcademy?.discipline} className="col-span-3" required />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="location" className="text-right">Location</Label>
                <Input id="location" name="location" defaultValue={selectedAcademy?.location} className="col-span-3" required />
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
