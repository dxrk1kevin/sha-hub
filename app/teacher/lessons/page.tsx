"use client"

import type React from "react"
import { useState } from "react"
import { Users } from "lucide-react"
import { Plus, BookOpen, Calendar, Edit, Trash2, Home } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useTeacherStore } from "@/stores/teacher-store"
import { useAuthStore } from "@/stores/auth-store"
import { toast } from "sonner"
import { TeacherLayout } from "@/components/layouts/teacher-layout"
import type { Lesson } from "@/types/teacher-types"

export default function TeacherLessonsPage() {
  const { user } = useAuthStore()
  const { groups, lessons, addLesson, updateLesson, deleteLesson } = useTeacherStore()
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingLesson, setEditingLesson] = useState<Lesson | null>(null)
  const [formData, setFormData] = useState({
    groupId: "",
    topic: "",
    date: "",
    homework: "",
  })

  const totalLessons = lessons.length
  const activeGroupsWithLessons = new Set(lessons.map((l) => l.groupId)).size
  const lessonsThisMonth = lessons.filter((l) => {
    const lessonDate = new Date(l.date)
    const now = new Date()
    return lessonDate.getMonth() === now.getMonth() && lessonDate.getFullYear() === now.getFullYear()
  }).length

  const myGroups = groups.filter((g) => g.teacherId === user?.id)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const lessonData = {
      groupId: formData.groupId,
      topic: formData.topic,
      date: formData.date,
      homework: formData.homework,
    }

    if (editingLesson) {
      updateLesson(editingLesson.id, lessonData)
      toast.success(`Lesson "${formData.topic}" updated successfully`)
    } else {
      addLesson(lessonData)
      toast.success(`Lesson "${formData.topic}" created successfully`)
    }

    resetForm()
  }

  const resetForm = () => {
    setFormData({
      groupId: "",
      topic: "",
      date: "",
      homework: "",
    })
    setEditingLesson(null)
    setIsDialogOpen(false)
  }

  const handleEdit = (lesson: Lesson) => {
    setEditingLesson(lesson)
    setFormData({
      groupId: lesson.groupId,
      topic: lesson.topic,
      date: lesson.date,
      homework: lesson.homework,
    })
    setIsDialogOpen(true)
  }

  const handleDelete = (id: string) => {
    const lesson = lessons.find((l) => l.id === id)
    if (confirm(`Are you sure you want to delete "${lesson?.topic}"?`)) {
      deleteLesson(id)
      toast.success(`Lesson "${lesson?.topic}" deleted successfully`)
    }
  }

  return (
    <TeacherLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Lessons
            </h1>
            <p className="text-gray-600 mt-1">Create and manage lessons for your groups</p>
          </div>

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button
                onClick={() => setEditingLesson(null)}
                className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-lg"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Lesson
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle className="text-xl">{editingLesson ? "Edit Lesson" : "Create New Lesson"}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="groupId" className="text-sm font-semibold text-gray-700">
                    Group
                  </Label>
                  <Select
                    value={formData.groupId}
                    onValueChange={(value) => setFormData({ ...formData, groupId: value })}
                    required
                  >
                    <SelectTrigger className="border-2 border-gray-200 hover:border-indigo-300 transition-colors">
                      <SelectValue placeholder="Select a group" />
                    </SelectTrigger>
                    <SelectContent>
                      {myGroups.map((group) => (
                        <SelectItem key={group.id} value={group.id}>
                          {group.name} ({group.subject}) - {group.lessonTime}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="topic" className="text-sm font-semibold text-gray-700">
                    Topic
                  </Label>
                  <Input
                    id="topic"
                    value={formData.topic}
                    onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                    placeholder="Enter lesson topic"
                    className="border-2 border-gray-200 hover:border-indigo-300 transition-colors"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="date" className="text-sm font-semibold text-gray-700">
                    Date
                  </Label>
                  <Input
                    id="date"
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="border-2 border-gray-200 hover:border-indigo-300 transition-colors"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="homework" className="text-sm font-semibold text-gray-700">
                    Homework
                  </Label>
                  <Textarea
                    id="homework"
                    value={formData.homework}
                    onChange={(e) => setFormData({ ...formData, homework: e.target.value })}
                    placeholder="e.g., Complete exercises 1-10"
                    className="border-2 border-gray-200 hover:border-indigo-300 transition-colors"
                    rows={3}
                  />
                </div>
                <div className="flex gap-2 pt-2">
                  <Button
                    type="submit"
                    className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
                  >
                    {editingLesson ? "Update" : "Create"} Lesson
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
              <CardTitle className="text-sm font-medium text-gray-700">Total Lessons</CardTitle>
              <BookOpen className="h-5 w-5 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-600">{totalLessons}</div>
              <p className="text-xs text-muted-foreground mt-1">Created lessons</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md hover:shadow-lg transition-shadow bg-gradient-to-br from-purple-50 to-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-700">Active Groups</CardTitle>
              <Users className="h-5 w-5 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-purple-600">{activeGroupsWithLessons}</div>
              <p className="text-xs text-muted-foreground mt-1">With lessons</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md hover:shadow-lg transition-shadow bg-gradient-to-br from-green-50 to-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-700">This Month</CardTitle>
              <Calendar className="h-5 w-5 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">{lessonsThisMonth}</div>
              <p className="text-xs text-muted-foreground mt-1">Lessons this month</p>
            </CardContent>
          </Card>
        </div>

        {/* Lessons by Group */}
        <div className="space-y-6">
          {myGroups.map((group) => {
            const groupLessons = lessons.filter((lesson) => lesson.groupId === group.id)
            if (groupLessons.length === 0) return null // Only show groups with lessons

            return (
              <Card key={group.id} className="border-0 shadow-lg">
                <CardHeader className="bg-gradient-to-r from-indigo-50 to-purple-50 border-b">
                  <CardTitle className="text-lg">
                    {group.name} <span className="text-base text-gray-600 font-normal">({group.subject})</span>
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Lessons for {group.name} - {group.lessonDays.join(", ")} at {group.lessonTime}
                  </p>
                </CardHeader>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-gray-50 border-b">
                        <TableHead className="font-semibold text-gray-700">Topic</TableHead>
                        <TableHead className="font-semibold text-gray-700">Date</TableHead>
                        <TableHead className="font-semibold text-gray-700">Homework</TableHead>
                        <TableHead className="text-right font-semibold text-gray-700">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {groupLessons.map((lesson) => (
                        <TableRow key={lesson.id} className="hover:bg-gray-50 transition-colors">
                          <TableCell className="font-medium">{lesson.topic}</TableCell>
                          <TableCell className="text-gray-600">{lesson.date}</TableCell>
                          <TableCell className="flex items-center gap-1">
                            <Home className="w-4 h-4 text-muted-foreground" />
                            <span className="text-gray-600">{lesson.homework}</span>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleEdit(lesson)}
                                className="border-2 hover:border-indigo-600 hover:bg-indigo-50"
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleDelete(lesson.id)}
                                className="border-2 hover:border-red-600 hover:bg-red-50"
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
            )
          })}
        </div>

        {lessons.length === 0 && (
          <Card className="border-2 border-dashed border-gray-300 bg-gradient-to-br from-gray-50 to-white">
            <CardContent className="text-center py-16">
              <BookOpen className="size-20 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg font-medium">No lessons created yet</p>
              <p className="text-gray-400 text-sm mt-2">Create your first lesson to get started</p>
            </CardContent>
          </Card>
        )}
      </div>
    </TeacherLayout>
  )
}
