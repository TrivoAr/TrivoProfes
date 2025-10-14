import { PageHeader } from "@/components/page-header";
import { StatCard } from "@/components/dashboard/stat-card";
import { RevenueChart } from "@/components/dashboard/revenue-chart";
import { socialOutings, teams, academies, members, payments, revenueData } from "@/lib/data";
import { PartyPopper, Users, School, UserCheck, Wallet, DollarSign } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function DashboardPage() {
  const totalSocialOutings = socialOutings.length;
  const totalTeams = teams.length;
  const totalAcademies = academies.length;
  const totalMembers = members.length;
  const pendingPayments = payments.filter(p => p.status === 'Pending').length;
  const totalRevenue = payments
    .filter(p => p.status === 'Approved')
    .reduce((sum, p) => sum + p.amount, 0);

  const recentMembers = members.slice(0, 5);

  return (
    <>
      <PageHeader
        title="Welcome, Admin!"
        description="Here's a summary of Trivo's activity."
      />
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <StatCard title="Social Outings" value={String(totalSocialOutings)} icon={PartyPopper} />
        <StatCard title="Teams" value={String(totalTeams)} icon={Users} />
        <StatCard title="Academies" value={String(totalAcademies)} icon={School} />
        <StatCard title="Registered Members" value={String(totalMembers)} icon={UserCheck} />
        <StatCard title="Pending Payments" value={String(pendingPayments)} icon={Wallet} />
        <StatCard title="Approved Revenue" value={`$${totalRevenue.toLocaleString()}`} icon={DollarSign} />
      </div>
      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-5">
        <RevenueChart data={revenueData} />
        <Card className="lg:col-span-2">
            <CardHeader>
                <CardTitle>Recent Members</CardTitle>
                <CardDescription>The latest members to join.</CardDescription>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Member</TableHead>
                            <TableHead>Type</TableHead>
                            <TableHead>Status</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {recentMembers.map((member) => (
                            <TableRow key={member.id}>
                                <TableCell>
                                    <div className="flex items-center gap-3">
                                        <Avatar className="h-9 w-9">
                                            <AvatarImage src={member.avatar} alt={member.name} data-ai-hint="person face" />
                                            <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                                        </Avatar>
                                        <div className="grid gap-0.5">
                                          <p className="font-medium">{member.name}</p>
                                          <p className="text-xs text-muted-foreground">{member.email}</p>
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell>{member.type}</TableCell>
                                <TableCell>
                                    <Badge variant={member.status === 'Approved' ? 'default' : 'secondary'} className={member.status === 'Approved' ? 'bg-green-500/20 text-green-700' : ''}>
                                        {member.status}
                                    </Badge>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
      </div>
    </>
  );
}
