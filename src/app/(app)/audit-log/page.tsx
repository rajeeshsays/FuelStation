
import { PageHeader } from "@/components/page-header";
import { Suspense } from "react";
import { AuditLogFilters } from "@/components/audit-log-filters";
import { getAuditLogs } from "@/lib/queries";
import type { AuditLogMethod } from "@/lib/types";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";

const MethodBadge = ({ method }: { method: AuditLogMethod }) => {
    const variant = {
        'INSERT': 'default',
        'UPDATE': 'secondary',
        'DELETE': 'destructive'
    }[method] as "default" | "secondary" | "destructive";
    
    return <Badge variant={variant}>{method}</Badge>
}

export default async function AuditLogPage({
  searchParams,
}: {
  searchParams?: { [key: string]: string | undefined };
}) {
    const month = searchParams?.month;
    const date = searchParams?.date;
    const method = (searchParams?.method as AuditLogMethod | 'all') || 'all';
    
    const logs = await getAuditLogs({ month, date, method });

    return (
        <>
            <PageHeader
                title="Audit Log"
                description="View a history of all data modification events."
            />
            
            <Suspense fallback={<div>Loading filters...</div>}>
                <AuditLogFilters />
            </Suspense>

            <Card className="mt-6">
                 <CardHeader>
                    <CardTitle>Activity History</CardTitle>
                    <CardDescription>
                       {logs.length > 0
                            ? `Showing ${logs.length} event(s) for the selected period.`
                            : "No logs found for the selected filters. Select a month to begin."
                       }
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[200px]">Date & Time</TableHead>
                                <TableHead className="w-[120px]">Method</TableHead>
                                <TableHead>Description</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {logs.map((log) => (
                                <TableRow key={log.id}>
                                    <TableCell>{format(log.createdAt, "PPP p")}</TableCell>
                                    <TableCell><MethodBadge method={log.method} /></TableCell>
                                    <TableCell>{log.description}</TableCell>
                                </TableRow>
                            ))}
                            {logs.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={3} className="h-24 text-center">
                                        Please select a month to view activity logs.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

        </>
    );
}
