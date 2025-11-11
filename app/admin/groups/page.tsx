"use client"

import type React from "react"
import { useState } from "react"
import {
  Plus,
  Users,
  BookOpen,
  Clock,
  Award,
  Edit,
  Trash2,
  UserPlus,
  UserMinus,
  ClipboardList,
  Eye,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useTeacherStore } from "@/stores/teacher-store"
import { useAdminStore } from "@/stores/admin-store"
import { AdminLayout } from "@/components/layouts/admin-layout"
import type { Group, LessonDay } from "@/types/teacher-types"
import { Checkbox } from "@/components/ui/checkbox"
import { PasswordConfirmDialog } from "@/components/password-confirm-dialog"
import { toast } from "sonner"
import { AttendanceTableDialog } from "@/components/attendance-table-dialog"

export default function AdminGroupsPage() {
  const { groups, addGroup, updateGroup, deleteGroup, assignStudentsToGroup, saveAttendanceForDate } = useTeacherStore()
  const { students, teachers } = useAdminStore()
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingGroup, setEditingGroup] = useState<Group | null>(null)
  const [isManageStudentsOpen, setIsManageStudentsOpen] = useState(false)
  const [selectedGroupForStudents, setSelectedGroupForStudents] = useState<string | null>(null)
  const [deletingGroupId, setDeletingGroupId] = useState<string | null>(null)
  const [isAttendanceDialogOpen, setIsAttendanceDialogOpen] = useState(false)
  const [selectedGroupForAttendance, setSelectedGroupForAttendance] = useState<string | null>(null)
  const [isViewAttendanceOpen, setIsViewAttendanceOpen] = useState(false)
  const [selectedGroupForView, setSelectedGroupForView] = useState<Group | null>(null)
  const [attendanceDate, setAttendanceDate] = useState(new Date().toISOString().split("T")[0])
  const [currentAttendance, setCurrentAttendance] = useState<Record<string, "present" | "absent" | "late">>({})
  const [formData, setFormData] = useState({
    name: "",
    subject: "",
    lessonTime: "",
    lessonDays: [],
    teacherId: "",
    description: "",
  })

  const weekDays: LessonDay[] = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]

  const totalGroups = groups.length
  const totalStudentsInGroups = groups.reduce((sum, group) => sum + group.studentIds.length, 0)
  const activeGroups = groups.filter((g) => g.active).length

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const groupData = {
      name: formData.name,
      subject: formData.subject,
      lessonTime: formData.lessonTime,
      lessonDays: formData.lessonDays,
      teacherId: formData.teacherId || undefined,
      description: formData.description,
      studentIds: editingGroup?.studentIds || [],
    }

    if (editingGroup) {
      updateGroup(editingGroup.id, groupData)
      toast.success(`Group "${formData.name}" updated successfully`)
    } else {
      addGroup(groupData)
      toast.success(`Group "${formData.name}" created successfully`)
    }

    resetForm()
  }

  const resetForm = () => {
    setFormData({
      name: "",
      subject: "",
      lessonTime: "",
      lessonDays: [],
      teacherId: "",
      description: "",
    })
    setEditingGroup(null)
    setIsDialogOpen(false)
  }

  const handleEdit = (group: Group) => {
    setEditingGroup(group)
    setFormData({
      name: group.name,
      subject: group.subject,
      lessonTime: group.lessonTime,
      lessonDays: group.lessonDays,
      teacherId: group.teacherId || "",
      description: group.description || "",
    })
    setIsDialogOpen(true)
  }

  const handleDelete = (id: string) => {
    setDeletingGroupId(id)
  }

  const confirmDelete = () => {
    if (deletingGroupId) {
      const group = groups.find((g) => g.id === deletingGroupId)
      deleteGroup(deletingGroupId)
      toast.success(`Group "${group?.name}" deleted successfully`)
      setDeletingGroupId(null)
    }
  }

  const handleDayToggle = (day: LessonDay) => {
    setFormData((prev) => ({
      ...prev,
      lessonDays: prev.lessonDays.includes(day) ? prev.lessonDays.filter((d) => d !== day) : [...prev.lessonDays, day],
    }))
  }

  const openManageStudents = (groupId: string) => {
    setSelectedGroupForStudents(groupId)
    setIsManageStudentsOpen(true)
  }

  const handleStudentToggle = (studentId: string) => {
    if (!selectedGroupForStudents) return

    const group = groups.find((g) => g.id === selectedGroupForStudents)
    if (!group) return

    const isCurrentlyInGroup = group.studentIds.includes(studentId)

    if (isCurrentlyInGroup) {
      // Remove student from group
      assignStudentsToGroup(
        selectedGroupForStudents,
        group.studentIds.filter((id) => id !== studentId),
      )
      const student = students.find((s) => s.id === studentId)
      toast.success(`${student?.name} removed from group`)
    } else {
      // Add student to group
      assignStudentsToGroup(selectedGroupForStudents, [...group.studentIds, studentId])
      const student = students.find((s) => s.id === studentId)
      toast.success(`${student?.name} added to group`)
    }
  }

  const openAttendanceDialog = (groupId: string) => {
    setSelectedGroupForAttendance(groupId)
    setIsAttendanceDialogOpen(true)
    // Initialize attendance for all students in group
    const group = groups.find((g) => g.id === groupId)
    if (group) {
      const initialAttendance: Record<string, "present" | "absent" | "late"> = {}
      group.studentIds.forEach((studentId) => {
        initialAttendance[studentId] = "absent"
      })
      setCurrentAttendance(initialAttendance)
    }
  }

  const handleAttendanceChange = (studentId: string, status: "present" | "absent" | "late") => {
    setCurrentAttendance((prev) => ({ ...prev, [studentId]: status }))
  }

  const handleSaveAttendance = () => {
    if (!selectedGroupForAttendance) return
    saveAttendanceForDate(selectedGroupForAttendance, attendanceDate, currentAttendance)
    toast.success(`Attendance saved for ${attendanceDate}`)
    setIsAttendanceDialogOpen(false)
  }

  const openViewAttendance = (group: Group) => {
    setSelectedGroupForView(group)
    setIsViewAttendanceOpen(true)
  }

  const selectedGroup = groups.find((g) => g.id === selectedGroupForStudents)
  const attendanceGroup = groups.find((g) => g.id === selectedGroupForAttendance)
  const attendanceStudents = students.filter((s) => attendanceGroup?.studentIds.includes(s.id))

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Groups Management
            </h1>
            <p className="text-gray-600 mt-1">Create and manage student groups with attendance tracking</p>
          </div>

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button
                onClick={() => setEditingGroup(null)}
                className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-lg"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Group
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle className="text-xl">{editingGroup ? "Edit Group" : "Create New Group"}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name" className="text-sm font-semibold text-gray-700">
                      Group Name
                    </Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g., Math A1"
                      className="border-2 border-gray-200 hover:border-indigo-300 transition-colors"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="subject" className="text-sm font-semibold text-gray-700">
                      Subject
                    </Label>
                    <Input
                      id="subject"
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      placeholder="e.g., Mathematics"
                      className="border-2 border-gray-200 hover:border-indigo-300 transition-colors"
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="lessonTime" className="text-sm font-semibold text-gray-700">
                    Lesson Time
                  </Label>
                  <Input
                    id="lessonTime"
                    value={formData.lessonTime}
                    onChange={(e) => setFormData({ ...formData, lessonTime: e.target.value })}
                    placeholder="e.g., 09:00 - 10:30"
                    className="border-2 border-gray-200 hover:border-indigo-300 transition-colors"
                    required
                  />
                </div>

                <div>
                  <Label className="text-sm font-semibold text-gray-700">Lesson Days</Label>
                  <div className="flex flex-wrap gap-3 mt-2">
                    {weekDays.map((day) => (
                      <div key={day} className="flex items-center space-x-2">
                        <Checkbox
                          id={day}
                          checked={formData.lessonDays.includes(day)}
                          onCheckedChange={() => handleDayToggle(day)}
                        />
                        <label
                          htmlFor={day}
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          {day}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <Label htmlFor="teacherId" className="text-sm font-semibold text-gray-700">
                    Assign Teacher (Optional)
                  </Label>
                  <Select
                    value={formData.teacherId}
                    onValueChange={(value) => setFormData({ ...formData, teacherId: value })}
                  >
                    <SelectTrigger className="border-2 border-gray-200 hover:border-indigo-300 transition-colors">
                      <SelectValue placeholder="Select a teacher" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">No teacher assigned</SelectItem>
                      {teachers.map((teacher) => (
                        <SelectItem key={teacher.id} value={teacher.id}>
                          {teacher.name} - {teacher.subject}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="description" className="text-sm font-semibold text-gray-700">
                    Description
                  </Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Brief description of the group"
                    className="border-2 border-gray-200 hover:border-indigo-300 transition-colors"
                    rows={3}
                  />
                </div>

                <div className="flex gap-2 pt-2">
                  <Button
                    type="submit"
                    className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
                  >
                    {editingGroup ? "Update" : "Create"} Group
                  </Button>
                  <Button type="button" variant="outline" onClick={resetForm} className="border-2 bg-transparent">
                    Cancel
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="border-0 shadow-md hover:shadow-lg transition-shadow bg-gradient-to-br from-blue-50 to-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-700">Total Groups</CardTitle>
              <BookOpen className="h-5 w-5 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-600">{totalGroups}</div>
              <p className="text-xs text-muted-foreground mt-1">{activeGroups} active</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md hover:shadow-lg transition-shadow bg-gradient-to-br from-purple-50 to-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-700">Total Students</CardTitle>
              <Users className="h-5 w-5 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-purple-600">{totalStudentsInGroups}</div>
              <p className="text-xs text-muted-foreground mt-1">Across all groups</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md hover:shadow-lg transition-shadow bg-gradient-to-br from-green-50 to-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-700">Avg Group Size</CardTitle>
              <Award className="h-5 w-5 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">
                {totalGroups > 0 ? Math.round(totalStudentsInGroups / totalGroups) : 0}
              </div>
              <p className="text-xs text-muted-foreground mt-1">Students per group</p>
            </CardContent>
          </Card>
        </div>

        {/* Groups Table */}
        <Card className="border-0 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-indigo-50 to-purple-50 border-b">
            <CardTitle className="text-xl">All Groups</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50 border-b">
                  <TableHead className="font-semibold text-gray-700">Group Name</TableHead>
                  <TableHead className="font-semibold text-gray-700">Subject</TableHead>
                  <TableHead className="font-semibold text-gray-700">Teacher</TableHead>
                  <TableHead className="font-semibold text-gray-700">Students</TableHead>
                  <TableHead className="font-semibold text-gray-700">Schedule</TableHead>
                  <TableHead className="font-semibold text-gray-700">Time</TableHead>
                  <TableHead className="font-semibold text-gray-700">Status</TableHead>
                  <TableHead className="text-right font-semibold text-gray-700">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {groups.map((group) => {
                  const teacher = teachers.find((t) => t.id === group.teacherId)
                  return (
                    <TableRow key={group.id} className="hover:bg-gray-50 transition-colors">
                      <TableCell className="font-medium">{group.name}</TableCell>
                      <TableCell>{group.subject}</TableCell>
                      <TableCell>
                        {teacher ? (
                          <span className="text-sm">{teacher.name}</span>
                        ) : (
                          <Badge variant="secondary">No teacher</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Users className="w-4 h-4 text-muted-foreground" />
                          {group.studentIds.length}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {group.lessonDays.map((day) => (
                            <Badge key={day} variant="secondary" className="text-xs">
                              {day.slice(0, 3)}
                            </Badge>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4 text-muted-foreground" />
                          <span className="text-sm">{group.lessonTime}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={group.active ? "default" : "secondary"}
                          className={group.active ? "bg-green-600" : ""}
                        >
                          {group.active ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => openViewAttendance(group)}
                            className="border-2 hover:border-cyan-600 hover:bg-cyan-50"
                            title="View Attendance History"
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => openAttendanceDialog(group.id)}
                            className="border-2 hover:border-blue-600 hover:bg-blue-50"
                            title="Mark Attendance"
                          >
                            <ClipboardList className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => openManageStudents(group.id)}
                            className="border-2 hover:border-purple-600 hover:bg-purple-50"
                            title="Manage Students"
                          >
                            <UserPlus className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEdit(group)}
                            className="border-2 hover:border-indigo-600 hover:bg-indigo-50"
                            title="Edit Group"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDelete(group.id)}
                            className="border-2 hover:border-red-600 hover:bg-red-50"
                            title="Delete Group"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Manage Students Dialog */}
        <Dialog open={isManageStudentsOpen} onOpenChange={setIsManageStudentsOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="text-xl">Manage Students - {selectedGroup?.name}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="text-sm text-muted-foreground">Select students to add or remove from this group</div>
              <div className="max-h-96 overflow-y-auto space-y-2">
                {students.map((student) => {
                  const isInGroup = selectedGroup?.studentIds.includes(student.id)
                  return (
                    <div
                      key={student.id}
                      className="flex items-center justify-between p-3 border-2 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div>
                        <div className="font-medium">{student.name}</div>
                        <div className="text-sm text-muted-foreground">{student.email}</div>
                      </div>
                      <Button
                        size="sm"
                        variant={isInGroup ? "destructive" : "default"}
                        onClick={() => handleStudentToggle(student.id)}
                        className={isInGroup ? "bg-red-600 hover:bg-red-700" : "bg-indigo-600 hover:bg-indigo-700"}
                      >
                        {isInGroup ? (
                          <>
                            <UserMinus className="w-4 h-4 mr-1" />
                            Remove
                          </>
                        ) : (
                          <>
                            <UserPlus className="w-4 h-4 mr-1" />
                            Add
                          </>
                        )}
                      </Button>
                    </div>
                  )
                })}
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Attendance Dialog */}
        <Dialog open={isAttendanceDialogOpen} onOpenChange={setIsAttendanceDialogOpen}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle className="text-xl flex items-center gap-2">
                <ClipboardList className="w-6 h-6 text-indigo-600" />
                Attendance - {attendanceGroup?.name}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <Label htmlFor="attendanceDate" className="text-sm font-semibold text-gray-700">
                    Date
                  </Label>
                  <Input
                    id="attendanceDate"
                    type="date"
                    value={attendanceDate}
                    onChange={(e) => setAttendanceDate(e.target.value)}
                    className="border-2 border-gray-200 hover:border-indigo-300 transition-colors"
                  />
                </div>
                <div className="flex gap-2 items-end">
                  <Badge className="bg-green-100 text-green-800 border-green-300 px-3 py-1">
                    Present: {Object.values(currentAttendance).filter((s) => s === "present").length}
                  </Badge>
                  <Badge className="bg-red-100 text-red-800 border-red-300 px-3 py-1">
                    Absent: {Object.values(currentAttendance).filter((s) => s === "absent").length}
                  </Badge>
                </div>
              </div>
              <div className="max-h-96 overflow-y-auto border-2 rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50">
                      <TableHead className="font-semibold text-gray-700">Student Name</TableHead>
                      <TableHead className="text-center font-semibold text-gray-700">Status</TableHead>
                      <TableHead className="text-right font-semibold text-gray-700">Mark Attendance</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {attendanceStudents.map((student) => (
                      <TableRow key={student.id} className="hover:bg-gray-50 transition-colors">
                        <TableCell className="font-medium">{student.name}</TableCell>
                        <TableCell className="text-center">
                          <Badge
                            className={
                              currentAttendance[student.id] === "present"
                                ? "bg-green-100 text-green-800 border-green-300"
                                : currentAttendance[student.id] === "late"
                                  ? "bg-yellow-100 text-yellow-800 border-yellow-300"
                                  : "bg-red-100 text-red-800 border-red-300"
                            }
                          >
                            {currentAttendance[student.id] || "Absent"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              size="sm"
                              variant={currentAttendance[student.id] === "present" ? "default" : "outline"}
                              onClick={() => handleAttendanceChange(student.id, "present")}
                              className={
                                currentAttendance[student.id] === "present"
                                  ? "bg-green-600 hover:bg-green-700"
                                  : "border-2 hover:border-green-600 hover:bg-green-50"
                              }
                            >
                              Present
                            </Button>
                            <Button
                              size="sm"
                              variant={currentAttendance[student.id] === "late" ? "default" : "outline"}
                              onClick={() => handleAttendanceChange(student.id, "late")}
                              className={
                                currentAttendance[student.id] === "late"
                                  ? "bg-yellow-600 hover:bg-yellow-700"
                                  : "border-2 hover:border-yellow-600 hover:bg-yellow-50"
                              }
                            >
                              Late
                            </Button>
                            <Button
                              size="sm"
                              variant={currentAttendance[student.id] === "absent" ? "default" : "outline"}
                              onClick={() => handleAttendanceChange(student.id, "absent")}
                              className={
                                currentAttendance[student.id] === "absent"
                                  ? "bg-red-600 hover:bg-red-700"
                                  : "border-2 hover:border-red-600 hover:bg-red-50"
                              }
                            >
                              Absent
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              <div className="flex justify-end gap-2 pt-4 border-t">
                <Button variant="outline" onClick={() => setIsAttendanceDialogOpen(false)} className="border-2">
                  Cancel
                </Button>
                <Button
                  onClick={handleSaveAttendance}
                  className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
                >
                  Save Attendance
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Attendance History Dialog */}
        {selectedGroupForView && (
          <AttendanceTableDialog
            open={isViewAttendanceOpen}
            onOpenChange={setIsViewAttendanceOpen}
            group={selectedGroupForView}
          />
        )}

        {/* Password Confirmation Dialog */}
        <PasswordConfirmDialog
          open={deletingGroupId !== null}
          onOpenChange={(open) => !open && setDeletingGroupId(null)}
          onConfirm={confirmDelete}
          title="Delete Group"
          description="Are you sure you want to delete this group? All students will be unassigned and group data will be lost."
        />

        {groups.length === 0 && (
          <Card className="border-2 border-dashed border-gray-300 bg-gradient-to-br from-gray-50 to-white">
            <CardContent className="text-center py-16">
              <BookOpen className="size-20 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg font-medium">No groups found yet</p>
              <p className="text-gray-400 text-sm mt-2">Create your first group to get started</p>
            </CardContent>
          </Card>
        )}
      </div>
    </AdminLayout>
  )
}
