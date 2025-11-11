"use client"

import type React from "react"
import { useState, useMemo } from "react"
import { Plus, Users, BookOpen, Calendar, Clock, Edit, Trash2, UserPlus, Eye, ClipboardList } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useTeacherStore } from "@/stores/teacher-store"
import { useAdminStore } from "@/stores/admin-store"
import { useAuthStore } from "@/stores/auth-store"
import { TeacherLayout } from "@/components/layouts/teacher-layout"
import { toast } from "sonner"
import { PasswordConfirmDialog } from "@/components/password-confirm-dialog"
import { AttendanceTableDialog } from "@/components/attendance-table-dialog"
import type { Group, LessonDay } from "@/types/teacher-types"

export default function TeacherGroupsPage() {
  const { user } = useAuthStore()
  const { groups, addGroup, updateGroup, deleteGroup, assignStudentsToGroup, saveAttendanceForDate } = useTeacherStore()
  const { students } = useAdminStore()

  const myGroups = useMemo(() => groups.filter((g) => g.teacherId === user?.id), [groups, user?.id])

  const [isAddGroupDialogOpen, setIsAddGroupDialogOpen] = useState(false)
  const [isAssignStudentsDialogOpen, setIsAssignStudentsDialogOpen] = useState(false)
  const [editingGroup, setEditingGroup] = useState<Group | null>(null)
  const [assigningGroup, setAssigningGroup] = useState<Group | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    subject: "",
    lessonTime: "",
    lessonDays: [] as LessonDay[],
    studentCount: 0,
  })
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([])
  const [selectedGroupForStudents, setSelectedGroupForStudents] = useState<string | null>(null)
  const [deletingGroupId, setDeletingGroupId] = useState<string | null>(null)
  const [isAttendanceDialogOpen, setIsAttendanceDialogOpen] = useState(false)
  const [selectedGroupForAttendance, setSelectedGroupForAttendance] = useState<string | null>(null)
  const [isViewAttendanceOpen, setIsViewAttendanceOpen] = useState(false)
  const [selectedGroupForView, setSelectedGroupForView] = useState<Group | null>(null)
  const [attendanceDate, setAttendanceDate] = useState(new Date().toISOString().split("T")[0])
  const [currentAttendance, setCurrentAttendance] = useState<Record<string, "present" | "absent" | "late">>({})

  const totalGroups = myGroups.length
  const totalStudentsInGroups = myGroups.reduce((sum, group) => sum + group.studentIds.length, 0)
  const uniqueSubjects = new Set(myGroups.map((g) => g.subject)).size

  const lessonDaysOptions: LessonDay[] = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]

  const handleAddGroupSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const groupData = {
      name: formData.name,
      subject: formData.subject,
      lessonTime: formData.lessonTime,
      lessonDays: formData.lessonDays,
      studentIds: editingGroup ? editingGroup.studentIds : [],
      active: true,
      teacherId: user?.id,
    }

    if (editingGroup) {
      updateGroup(editingGroup.id, groupData)
      toast.success(`Group "${formData.name}" updated successfully`)
    } else {
      addGroup(groupData)
      toast.success(`Group "${formData.name}" created successfully`)
    }

    resetAddGroupForm()
  }

  const resetAddGroupForm = () => {
    setFormData({
      name: "",
      subject: "",
      lessonTime: "",
      lessonDays: [],
      studentCount: 0,
    })
    setEditingGroup(null)
    setIsAddGroupDialogOpen(false)
  }

  const handleEditGroup = (group: Group) => {
    setEditingGroup(group)
    setFormData({
      name: group.name,
      subject: group.subject,
      lessonTime: group.lessonTime,
      lessonDays: group.lessonDays,
      studentCount: group.studentIds.length,
    })
    setIsAddGroupDialogOpen(true)
  }

  const handleDeleteGroup = (id: string) => {
    setDeletingGroupId(id)
  }

  const confirmDelete = () => {
    if (deletingGroupId) {
      const group = myGroups.find((g) => g.id === deletingGroupId)
      deleteGroup(deletingGroupId)
      toast.success(`Group "${group?.name}" deleted successfully`)
      setDeletingGroupId(null)
    }
  }

  const openManageStudents = (group: Group) => {
    setAssigningGroup(group)
    setSelectedGroupForStudents(group.id)
    setIsAssignStudentsDialogOpen(true)
  }

  const handleStudentToggle = (studentId: string) => {
    if (!assigningGroup) return

    const isCurrentlyInGroup = assigningGroup.studentIds.includes(studentId)

    if (isCurrentlyInGroup) {
      const updatedStudentIds = assigningGroup.studentIds.filter((id) => id !== studentId)
      assignStudentsToGroup(assigningGroup.id, updatedStudentIds)
      const student = students.find((s) => s.id === studentId)
      toast.success(`${student?.name} removed from group`)
      setAssigningGroup({ ...assigningGroup, studentIds: updatedStudentIds })
    } else {
      const updatedStudentIds = [...assigningGroup.studentIds, studentId]
      assignStudentsToGroup(assigningGroup.id, updatedStudentIds)
      const student = students.find((s) => s.id === studentId)
      toast.success(`${student?.name} added to group`)
      setAssigningGroup({ ...assigningGroup, studentIds: updatedStudentIds })
    }
  }

  const resetAssignStudentsForm = () => {
    setAssigningGroup(null)
    setSelectedStudentIds([])
    setIsAssignStudentsDialogOpen(false)
  }

  const handleAssignStudentsSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (assigningGroup) {
      assignStudentsToGroup(assigningGroup.id, selectedStudentIds)
      toast.success(`Students assigned to group "${assigningGroup.name}"`)
      resetAssignStudentsForm()
    }
  }

  const openAttendanceDialog = (groupId: string) => {
    setSelectedGroupForAttendance(groupId)
    setIsAttendanceDialogOpen(true)
    const group = myGroups.find((g) => g.id === groupId)
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

  const attendanceGroup = myGroups.find((g) => g.id === selectedGroupForAttendance)
  const attendanceStudents = students.filter((s) => attendanceGroup?.studentIds.includes(s.id))

  return (
    <TeacherLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              My Groups
            </h1>
            <p className="text-gray-600 mt-1">Manage your assigned groups, students and attendance</p>
          </div>

          <Dialog open={isAddGroupDialogOpen} onOpenChange={setIsAddGroupDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => setEditingGroup(null)}>
                <Plus className="w-4 h-4 mr-2" />
                Add Group
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>{editingGroup ? "Edit Group" : "Add New Group"}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleAddGroupSubmit} className="space-y-4">
                <div className="flex items-center gap-2 text-gray-600">
                  <Users className="w-5 h-5" />
                  <span className="font-semibold">BASIC INFORMATION</span>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="groupName">Group Name</Label>
                    <Input
                      id="groupName"
                      placeholder="Enter group name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="subject">Subject</Label>
                    <Input
                      id="subject"
                      placeholder="Enter subject"
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2 text-gray-600">
                  <Calendar className="w-5 h-5" />
                  <span className="font-semibold">SCHEDULE</span>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="lessonTime">Lesson Time</Label>
                    <Input
                      id="lessonTime"
                      type="text"
                      placeholder="HH:MM - HH:MM"
                      value={formData.lessonTime}
                      onChange={(e) => setFormData({ ...formData, lessonTime: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="studentCount">Student Count</Label>
                    <Input
                      id="studentCount"
                      type="number"
                      value={formData.studentCount}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          studentCount: Number(e.target.value),
                        })
                      }
                      disabled // This will be updated when students are assigned
                    />
                  </div>
                </div>

                <div>
                  <Label>Lesson Days</Label>
                  <div className="grid grid-cols-3 gap-2 mt-2">
                    {lessonDaysOptions.map((day) => (
                      <div key={day} className="flex items-center space-x-2">
                        <Checkbox
                          id={day}
                          checked={formData.lessonDays.includes(day)}
                          onCheckedChange={(checked) => {
                            setFormData((prev) => ({
                              ...prev,
                              lessonDays: checked
                                ? [...prev.lessonDays, day]
                                : prev.lessonDays.filter((d) => d !== day),
                            }))
                          }}
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

                <div className="flex gap-2">
                  <Button type="submit" className="flex-1 bg-gradient-to-r from-green-500 to-blue-500 text-white">
                    {editingGroup ? "Update Group" : "Add Group"}
                  </Button>
                  <Button type="button" variant="outline" onClick={resetAddGroupForm}>
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
              <Users className="h-5 w-5 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-600">{totalGroups}</div>
              <p className="text-xs text-muted-foreground mt-1">Active groups</p>
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
              <CardTitle className="text-sm font-medium text-gray-700">Subjects</CardTitle>
              <BookOpen className="h-5 w-5 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">{uniqueSubjects}</div>
              <p className="text-xs text-muted-foreground mt-1">Different subjects</p>
            </CardContent>
          </Card>
        </div>

        {/* My Groups Table */}
        <Card className="border-0 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-indigo-50 to-purple-50 border-b">
            <CardTitle>My Groups</CardTitle>
            <p className="text-sm text-muted-foreground">Overview of all groups assigned to you</p>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50 border-b">
                  <TableHead className="font-semibold text-gray-700">Group Name</TableHead>
                  <TableHead className="font-semibold text-gray-700">Subject</TableHead>
                  <TableHead className="font-semibold text-gray-700">Students</TableHead>
                  <TableHead className="font-semibold text-gray-700">Lesson Days</TableHead>
                  <TableHead className="font-semibold text-gray-700">Lesson Time</TableHead>
                  <TableHead className="text-right font-semibold text-gray-700">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {myGroups.map((group) => (
                  <TableRow key={group.id} className="hover:bg-gray-50 transition-colors">
                    <TableCell className="font-medium">{group.name}</TableCell>
                    <TableCell>{group.subject}</TableCell>
                    <TableCell className="flex items-center gap-1">
                      <Users className="w-4 h-4 text-muted-foreground" />
                      {group.studentIds.length} students
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
                    <TableCell className="flex items-center gap-1">
                      <Clock className="w-4 h-4 text-muted-foreground" />
                      {group.lessonTime}
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
                          onClick={() => openManageStudents(group)}
                          className="border-2 hover:border-purple-600 hover:bg-purple-50"
                          title="Manage Students"
                        >
                          <UserPlus className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEditGroup(group)}
                          className="border-2 hover:border-indigo-600 hover:bg-indigo-50"
                          title="Edit Group"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDeleteGroup(group.id)}
                          className="border-2 hover:border-red-600 hover:bg-red-50"
                          title="Delete Group"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {myGroups.length === 0 && (
          <Card className="border-2 border-dashed border-gray-300 bg-gradient-to-br from-gray-50 to-white">
            <CardContent className="text-center py-16">
              <BookOpen className="size-20 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg font-medium">No groups assigned to you yet</p>
              <p className="text-gray-400 text-sm mt-2">Contact admin to get assigned to groups</p>
            </CardContent>
          </Card>
        )}

        {/* Manage Students Dialog */}
        <Dialog open={isAssignStudentsDialogOpen} onOpenChange={setIsAssignStudentsDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Manage Students - {assigningGroup?.name}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">Select students to add or remove from this group</p>
              <div className="max-h-96 overflow-y-auto border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50">
                      <TableHead>Student Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {students.map((student) => {
                      const isInGroup = assigningGroup?.studentIds.includes(student.id)
                      return (
                        <TableRow key={student.id}>
                          <TableCell className="font-medium">{student.name}</TableCell>
                          <TableCell className="text-muted-foreground">{student.email}</TableCell>
                          <TableCell className="text-right">
                            {isInGroup ? (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleStudentToggle(student.id)}
                                className="border-red-600 text-red-600 hover:bg-red-50"
                              >
                                <UserPlus className="w-4 h-4 mr-1" />
                                Remove
                              </Button>
                            ) : (
                              <Button
                                size="sm"
                                onClick={() => handleStudentToggle(student.id)}
                                className="bg-green-600 hover:bg-green-700"
                              >
                                <UserPlus className="w-4 h-4 mr-1" />
                                Add
                              </Button>
                            )}
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </div>
              <div className="flex justify-end gap-2 pt-4 border-t">
                <Button variant="outline" onClick={resetAssignStudentsForm}>
                  Close
                </Button>
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

        {/* Password Confirmation Dialog for deletions */}
        <PasswordConfirmDialog
          open={deletingGroupId !== null}
          onOpenChange={(open) => !open && setDeletingGroupId(null)}
          onConfirm={confirmDelete}
          title="Delete Group"
          description="Are you sure you want to delete this group? All students will be unassigned and group data will be lost."
        />
      </div>
    </TeacherLayout>
  )
}
