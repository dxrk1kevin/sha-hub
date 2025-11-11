"use client"

import { useState } from "react"
import { Search, Plus, BookOpen } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useAdminStore } from "@/stores/admin-store"
import { AdminLayout } from "@/components/layouts/admin-layout"
import type { Teacher } from "@/types/teacher-types"
import { TeacherFormDialog, TeachersTable } from "./fragments"
import { PasswordConfirmDialog } from "@/components/password-confirm-dialog"
import { toast } from "sonner"

type TeacherFormValues = {
  name: string
  email: string
  phone: string
  subject: string
  salary: number
  studentCount: number
  status: "active" | "inactive"
  username: string
  password: string
}

export default function TeachersPage() {
  const { teachers, addTeacher, updateTeacher, deleteTeacher } = useAdminStore()
  const [searchTerm, setSearchTerm] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingTeacher, setEditingTeacher] = useState<Teacher | null>(null)
  const [deletingTeacherId, setDeletingTeacherId] = useState<string | null>(null)

  const filteredTeachers = teachers.filter(
    (teacher) =>
      teacher.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      teacher.subject.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const handleFormSubmit = (formData: TeacherFormValues, teacherToEdit: Teacher | null) => {
    try {
      const teacherData = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        subject: formData.subject,
        salary: typeof formData.salary === "string" ? Number(formData.salary) : formData.salary,
        studentCount: typeof formData.studentCount === "string" ? Number(formData.studentCount) : formData.studentCount,
        status: formData.status as "active" | "inactive",
        username: formData.username,
        password: formData.password,
        joinDate: teacherToEdit?.joinDate || new Date().toISOString().split("T")[0],
      }

      if (teacherToEdit) {
        updateTeacher(teacherToEdit.id, teacherData)
        toast.success(`Teacher ${teacherData.name} updated successfully`)
      } else {
        const { joinDate, ...dataForAdd } = teacherData
        addTeacher(dataForAdd as any)
        toast.success(`Teacher ${teacherData.name} added successfully`)
      }

      setIsDialogOpen(false)
      setEditingTeacher(null)
    } catch (error) {
      console.error("[v0] Error submitting teacher form:", error)
      toast.error("Failed to save teacher. Please try again.")
    }
  }

  const handleEdit = (teacher: Teacher) => {
    setEditingTeacher(teacher)
    setIsDialogOpen(true)
  }

  const handleDelete = (id: string) => {
    setDeletingTeacherId(id)
  }

  const confirmDelete = () => {
    if (deletingTeacherId) {
      const teacher = teachers.find((t) => t.id === deletingTeacherId)
      deleteTeacher(deletingTeacherId)
      if (teacher) {
        toast.success(`Teacher ${teacher.name} deleted successfully`)
      }
      setDeletingTeacherId(null)
    }
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Teachers Management</h1>
            <p className="text-gray-600 mt-1">Manage teacher information and login credentials</p>
          </div>
          <Button
            onClick={() => {
              setEditingTeacher(null)
              setIsDialogOpen(true)
            }}
            className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
          >
            <Plus className="size-4 mr-2" />
            Add Teacher
          </Button>
        </div>

        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 size-5 text-gray-400" />
          <Input
            placeholder="Search by name or subject..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-12 py-3 text-base"
          />
        </div>

        <Card className="border-0 shadow-md">
          <CardHeader className="pb-4 border-b">
            <CardTitle className="text-lg">Teachers List ({filteredTeachers.length})</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <TeachersTable teachers={filteredTeachers} onEdit={handleEdit} onDelete={handleDelete} />
          </CardContent>
        </Card>

        {filteredTeachers.length === 0 && (
          <div className="text-center py-16">
            <BookOpen className="size-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 text-lg">No teachers found</p>
          </div>
        )}

        <TeacherFormDialog
          open={isDialogOpen}
          setOpen={setIsDialogOpen}
          onSubmit={handleFormSubmit}
          editingTeacher={editingTeacher}
          setEditingTeacher={setEditingTeacher}
        />

        <PasswordConfirmDialog
          open={deletingTeacherId !== null}
          onOpenChange={(open) => !open && setDeletingTeacherId(null)}
          onConfirm={confirmDelete}
          title="Delete Teacher"
          description="Are you sure you want to delete this teacher? This action cannot be undone and will remove all associated data."
        />
      </div>
    </AdminLayout>
  )
}
