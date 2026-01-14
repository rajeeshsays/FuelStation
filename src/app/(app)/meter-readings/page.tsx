
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getRecentMeterReadings } from "@/lib/queries";
import { format } from "date-fns";
import { MeterReadingForm } from "@/components/meter-reading-form";
import { Button } from "@/components/ui/button";
import { Pencil } from "lucide-react";
import dynamic from "next/dynamic";

const EditMeterReadingDialog = dynamic(() => import('@/components/edit-meter-reading-dialog').then(mod => mod.EditMeterReadingDialog), { ssr: false });
const DeleteMeterReadingAction = dynamic(() => import('@/components/delete-meter-reading-action').then(mod => mod.DeleteMeterReadingAction), { ssr: false });


export default async function MeterReadingsPage() {
  const recentReadings = await getRecentMeterReadings();

  return (
    <>
      <PageHeader
        title="Daily Meter Readings"
        description="Input daily readings for each pump to calculate sales."
      />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
            <MeterReadingForm />
        </div>
        <div className="lg:col-span-1">
            <Card>
                 <CardHeader>
                    <CardTitle>Recent Readings</CardTitle>
                    <CardDescription>History of the last few meter readings.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Date</TableHead>
                                <TableHead>Pump</TableHead>
                                <TableHead className="text-right">Reading</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {recentReadings.map(reading => (
                                 <TableRow key={reading.id}>
                                    <TableCell>{format(reading.date, "PPP")}</TableCell>
                                    <TableCell>{reading.pumpId}</TableCell>
                                    <TableCell className="text-right">{reading.reading.toLocaleString()}</TableCell>
                                    <TableCell>
                                        <div className="flex justify-end gap-1">
                                            <EditMeterReadingDialog reading={reading}>
                                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                                    <Pencil className="h-4 w-4" />
                                                    <span className="sr-only">Edit</span>
                                                </Button>
                                            </EditMeterReadingDialog>
                                            <DeleteMeterReadingAction readingId={reading.id} />
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
      </div>
    </>
  );
}
