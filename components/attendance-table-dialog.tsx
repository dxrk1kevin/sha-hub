"use client"

import { useMemo } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar, Users, CheckCircle, XCircle, Clock } from "lucide-react"
import { useTeacherStore } from "@/stores/teacher-store"
import { useAdminStore } from "@/stores/admin-store"
import type { Group } from "@/types/teacher-types"

interface AttendanceTableDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  group: Group
}

export function AttendanceTableDialog({ open, onOpenChange, group }: AttendanceTableDialogProps) {
  const { getAttendanceForGroupByDate } = useTeacherStore()
  const { students } = useAdminStore()

  const attendanceByDate = getAttendanceForGroupByDate(group.id)
  const groupStudents = useMemo(
    () => students.filter((s) => group.studentIds.includes(s.id)),
    [students, group.studentIds],
  )

  // Get all unique dates and sort them
  const dates = useMemo(() => Object.keys(attendanceByDate).sort(), [attendanceByDate])

  // Calculate statistics
  const stats = useMemo(() => {
    const totalRecords = Object.values(attendanceByDate).flatMap((dateRecords) => Object.values(dateRecords))
    const present = totalRecords.filter((r) => r.status === "present").length
    const absent = totalRecords.filter((r) => r.status === "absent").length
    const late = totalRecords.filter((r) => r.status === "late").length
    const total = totalRecords.length

    return {
      avgStudents: groupStudents.length,
      present,
      absent,
      late,
      total,
      presentPercent: total > 0 ? Math.round((present / total) * 100) : 0,
      absentPercent: total > 0 ? Math.round((absent / total) * 100) : 0,
      latePercent: total > 0 ? Math.round((late / total) * 100) : 0,
    }
  }, [attendanceByDate, groupStudents.length])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-7xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-2xl flex items-center gap-2">
            <Calendar className="w-6 h-6 text-indigo-600" />
            Attendance History - {group.name}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 overflow-y-auto flex-1">
          {/* Statistics Cards */}
          <div className="grid grid-cols-4 gap-4">
            <Card className="border-0 shadow-md bg-gradient-to-br from-blue-50 to-white">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-700">Avg Students</CardTitle>
                <Users className="h-5 w-5 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">{stats.avgStudents}</div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-md bg-gradient-to-br from-green-50 to-white">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-700">Present</CardTitle>
                <CheckCircle className="h-5 w-5 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {stats.present} ({stats.presentPercent}%)
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-md bg-gradient-to-br from-yellow-50 to-white">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-700">Late</CardTitle>
                <Clock className="h-5 w-5 text-yellow-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-600">
                  {stats.late} ({stats.latePercent}%)
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-md bg-gradient-to-br from-red-50 to-white">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-700">Absent</CardTitle>
                <XCircle className="h-5 w-5 text-red-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">
                  {stats.absent} ({stats.absentPercent}%)
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Attendance Table */}
          <Card className="border-0 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-indigo-50 to-purple-50 border-b">
              <CardTitle>Attendance Records</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {dates.length > 0 ? (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-gray-50">
                        <TableHead className="font-semibold text-gray-700 sticky left-0 bg-gray-50 z-10">No</TableHead>
                        <TableHead className="font-semibold text-gray-700 sticky left-12 bg-gray-50 z-10">
                          Student name
                        </TableHead>
                        {dates.map((date) => (
                          <TableHead key={date} className="text-center font-semibold text-gray-700 min-w-[100px]">
                            {new Date(date).toLocaleDateString("en-GB", {
                              day: "2-digit",
                              month: "2-digit",
                              year: "numeric",
                            })}
                          </TableHead>
                        ))}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {groupStudents.map((student, index) => (
                        <TableRow key={student.id} className="hover:bg-gray-50 transition-colors">
                          <TableCell className="font-medium sticky left-0 bg-white z-10">{index + 1}</TableCell>
                          <TableCell className="font-medium sticky left-12 bg-white z-10">{student.name}</TableCell>
                          {dates.map((date) => {
                            const record = attendanceByDate[date]?.[student.id]
                            const status = record?.status || "absent"
                            return (
                              <TableCell key={date} className="text-center">
                                <Badge
                                  className={
                                    status === "present"
                                      ? "bg-green-100 text-green-800 border-green-300"
                                      : status === "late"
                                        ? "bg-yellow-100 text-yellow-800 border-yellow-300"
                                        : "bg-red-100 text-red-800 border-red-300"
                                  }
                                >
                                  {status}
                                </Badge>
                              </TableCell>
                            )
                          })}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <Calendar className="size-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-lg font-medium">No attendance records found</p>
                  <p className="text-sm mt-2">Start taking attendance to see the history here</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  )
}
