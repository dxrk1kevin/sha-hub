"use client"

import { useState } from "react"
import { AdminLayout } from "@/components/layouts/admin-layout"
import { RecentActivity, RevenueChart, TeacherPerformance, UserDistribution } from "./fragments"
import { Card, CardContent } from "@/components/ui/card"
import { useTeacherStore } from "@/stores/teacher-store"
import { useAdminStore } from "@/stores/admin-store"
import { Users, BookOpen, TrendingUp, Clock, X } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"

export default function AdminDashboard() {
  console.log("[v0] Admin Dashboard rendering")

  const { groups, lessons, attendanceRecords } = useTeacherStore()
  const { students, teachers } = useAdminStore()
  const [selectedModal, setSelectedModal] = useState<"students" | "teachers" | null>(null)
  const [groupsExpanded, setGroupsExpanded] = useState(false)

  const totalGroups = groups.length
  const activeGroups = groups.filter((g) => g.active).length
  const studentsInGroups = groups.reduce((sum, g) => sum + g.studentIds.length, 0)
  const recentLessons = lessons.filter((l) => {
    const lessonDate = new Date(l.date)
    const weekAgo = new Date()
    weekAgo.setDate(weekAgo.getDate() - 7)
    return lessonDate >= weekAgo
  }).length

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-lg p-8 text-white shadow-lg">
          <h1 className="text-4xl font-bold">Welcome to Shon's-HUB Dashboard</h1>
          <p className="text-blue-100 mt-3 text-lg">Monitor your education center in real-time</p>
        </div>

        {/* Main Stats - Clickable Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Total Students */}
          <Card
            className="border-l-4 border-l-blue-500 cursor-pointer hover:shadow-lg hover:scale-105 transition-all"
            onClick={() => setSelectedModal("students")}
          >
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 font-semibold">Total Students</p>
                  <p className="text-3xl font-bold text-blue-600">{students.length}</p>
                  <p className="text-xs text-gray-500 mt-2">Click to view list</p>
                </div>
                <Users className="size-14 text-blue-400 opacity-30" />
              </div>
            </CardContent>
          </Card>

          {/* Total Teachers */}
          <Card
            className="border-l-4 border-l-purple-500 cursor-pointer hover:shadow-lg hover:scale-105 transition-all"
            onClick={() => setSelectedModal("teachers")}
          >
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 font-semibold">Total Teachers</p>
                  <p className="text-3xl font-bold text-purple-600">{teachers.length}</p>
                  <p className="text-xs text-gray-500 mt-2">Click to view list</p>
                </div>
                <BookOpen className="size-14 text-purple-400 opacity-30" />
              </div>
            </CardContent>
          </Card>

          {/* Total Groups */}
          <Card
            className="border-l-4 border-l-emerald-500 cursor-pointer hover:shadow-lg hover:scale-105 transition-all"
            onClick={() => setGroupsExpanded(!groupsExpanded)}
          >
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 font-semibold">Total Groups</p>
                  <p className="text-3xl font-bold text-emerald-600">{totalGroups}</p>
                  <p className="text-xs text-gray-500 mt-2">{activeGroups} active</p>
                </div>
                <BookOpen className="size-14 text-emerald-400 opacity-30" />
              </div>
            </CardContent>
          </Card>

          {/* Attendance Rate */}
          <Card className="border-l-4 border-l-orange-500">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 font-semibold">Attendance Rate</p>
                  <p className="text-3xl font-bold text-orange-600">
                    {attendanceRecords.length > 0
                      ? Math.round(
                          (attendanceRecords.filter((a) => a.status === "present").length / attendanceRecords.length) *
                            100,
                        )
                      : 0}
                    %
                  </p>
                  <p className="text-xs text-gray-500 mt-2">Overall average</p>
                </div>
                <TrendingUp className="size-14 text-orange-400 opacity-30" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Groups Section - Expandable */}
        {groupsExpanded && (
          <Card className="border-2 border-emerald-200 bg-emerald-50">
            <div className="flex justify-between items-center p-6 border-b">
              <h3 className="text-lg font-bold text-emerald-900">Active Groups</h3>
              <button onClick={() => setGroupsExpanded(false)} className="text-gray-500 hover:text-gray-700">
                <X className="size-5" />
              </button>
            </div>
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {groups.map((group) => (
                  <div
                    key={group.id}
                    className="bg-white p-4 rounded-lg border border-emerald-200 hover:shadow-md transition"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h4 className="font-bold text-gray-900">{group.name}</h4>
                        <p className="text-sm text-gray-600">{group.subject}</p>
                      </div>
                      <Badge variant={group.active ? "default" : "secondary"}>
                        {group.active ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2 text-gray-700">
                        <Users className="size-4" />
                        <span>{group.studentIds.length} students</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-700">
                        <Clock className="size-4" />
                        <span>{group.lessonTime}</span>
                      </div>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {group.lessonDays.map((day) => (
                          <Badge key={day} variant="outline" className="text-xs">
                            {day.slice(0, 3)}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Revenue Chart */}
          <RevenueChart />

          {/* User Distribution */}
          <UserDistribution />
        </div>

        {/* Teacher Performance & Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Teacher Performance */}
          <TeacherPerformance />

          {/* Recent Activity */}
          <RecentActivity />
        </div>
      </div>

      {/* Students Modal */}
      <Dialog open={selectedModal === "students"} onOpenChange={(open) => !open && setSelectedModal(null)}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl">All Students ({students.length})</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            {students.map((student) => (
              <div
                key={student.id}
                className="flex justify-between items-center p-4 border rounded-lg hover:bg-gray-50"
              >
                <div>
                  <p className="font-semibold text-gray-900">{student.name}</p>
                  <p className="text-sm text-gray-600">{student.email}</p>
                </div>
                <div className="text-right">
                  <Badge variant={student.status === "active" ? "default" : "secondary"}>{student.status}</Badge>
                  <p className="text-xs text-gray-500 mt-1">{student.course}</p>
                </div>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* Teachers Modal */}
      <Dialog open={selectedModal === "teachers"} onOpenChange={(open) => !open && setSelectedModal(null)}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl">All Teachers ({teachers.length})</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            {teachers.map((teacher) => (
              <div
                key={teacher.id}
                className="flex justify-between items-center p-4 border rounded-lg hover:bg-gray-50"
              >
                <div>
                  <p className="font-semibold text-gray-900">{teacher.name}</p>
                  <p className="text-sm text-gray-600">
                    {teacher.email} • {teacher.phone}
                  </p>
                </div>
                <div className="text-right">
                  <Badge>{teacher.subject}</Badge>
                  <p className="text-xs text-gray-500 mt-1">Joined {formatDate(teacher.joinDate)}</p>
                </div>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  )
}
