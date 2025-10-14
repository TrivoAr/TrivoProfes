"use client";

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
import { MoreHorizontal, CheckCircle, XCircle } from "lucide-react";
import type { Payment } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";

export function PaymentsTable({ payments }: { payments: Payment[] }) {
  const { toast } = useToast();

  const handleApprove = (payment: Payment) => {
    toast({
      title: "Payment Approved",
      description: `Payment from ${payment.memberName} has been approved.`,
    });
  };

  const handleReject = (payment: Payment) => {
    toast({
      title: "Payment Rejected",
      description: `Payment from ${payment.memberName} has been rejected.`,
      variant: "destructive",
    });
  };

  const getStatusBadge = (status: Payment['status']) => {
    switch (status) {
      case 'Approved':
        return `bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-400 border-green-200 dark:border-green-800`;
      case 'Pending':
        return `bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800`;
      case 'Rejected':
        return `bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-400 border-red-200 dark:border-red-800`;
    }
  };

  return (
    <div className="rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Member</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Item</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {payments.map((payment) => (
            <TableRow key={payment.id}>
              <TableCell>
                <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                        <AvatarImage src={payment.memberAvatar} alt={payment.memberName} data-ai-hint="person face"/>
                        <AvatarFallback>{payment.memberName.slice(0, 2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <p className="font-medium">{payment.memberName}</p>
                </div>
              </TableCell>
              <TableCell className="font-medium">${payment.amount.toFixed(2)}</TableCell>
              <TableCell>{payment.item}</TableCell>
              <TableCell>{payment.date.toLocaleDateString()}</TableCell>
              <TableCell>
                <Badge variant="outline" className={getStatusBadge(payment.status)}>
                  {payment.status}
                </Badge>
              </TableCell>
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                      <span className="sr-only">Open menu</span>
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleApprove(payment)}>
                      <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                      Approve
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleReject(payment)} className="text-destructive">
                      <XCircle className="mr-2 h-4 w-4" />
                      Reject
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
