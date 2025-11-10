import { create } from "zustand"
import { persist } from "zustand/middleware"
import type { Activity, Payment, Product } from "@/types"
import type { Teacher } from "@/types/teacher-types"
import type { Student } from "@/types/student-types"
import { mockActivities, mockPayments, mockProducts, mockStudents, mockTeachers } from "@/mock/data"

interface AdminState {
  teachers: Teacher[]
  students: Student[]
  payments: Payment[]
  products: Product[]
  activities: Activity[]
  groups: any[] // Add groups array

  // Teacher CRUD
  addTeacher: (teacher: Omit<Teacher, "id">) => void
  updateTeacher: (id: string, teacher: Partial<Teacher>) => void
  deleteTeacher: (id: string) => void

  // Student CRUD
  addStudent: (student: Omit<Student, "id">) => void
  updateStudent: (id: string, student: Partial<Student>) => void
  deleteStudent: (id: string) => void

  // Payment CRUD with enhanced logic
  addPayment: (payment: Omit<Payment, "id">) => void
  updatePayment: (id: string, payment: Partial<Payment>) => void
  getStudentPendingPayment: (studentId: string) => Payment | undefined
  getStudentCompletedPayments: (studentId: string) => Payment[]
  completePayment: (paymentId: string, paidAmount: number) => void

  // Group management
  addGroup: (group: any) => void
  updateGroup: (id: string, group: any) => void
  deleteGroup: (id: string) => void
  assignStudentToGroup: (groupId: string, studentId: string) => void
  removeStudentFromGroup: (groupId: string, studentId: string) => void

  // Product CRUD
  addProduct: (product: Omit<Product, "id">) => void
  updateProduct: (id: string, product: Partial<Product>) => void
  deleteProduct: (id: string) => void

  // Activity
  addActivity: (activity: Omit<Activity, "id">) => void
}

export const useAdminStore = create<AdminState>()(
  persist(
    (set, get) => ({
      teachers: mockTeachers,
      students: mockStudents,
      payments: mockPayments,
      products: mockProducts,
      activities: mockActivities,
      groups: [], // Initialize groups array

      // Teacher CRUD
      addTeacher: (teacher) => {
        const newTeacher = { ...teacher, id: Date.now().toString(), joinDate: new Date().toISOString().split("T")[0] }
        set((state) => ({
          teachers: [...state.teachers, newTeacher],
          activities: [
            {
              id: Date.now().toString(),
              type: "teacher",
              message: `New teacher ${teacher.name} added (username: ${teacher.username})`,
              timestamp: "Just now",
            },
            ...state.activities,
          ],
        }))
      },

      updateTeacher: (id, updates) => {
        set((state) => ({
          teachers: state.teachers.map((teacher) => (teacher.id === id ? { ...teacher, ...updates } : teacher)),
        }))
      },

      deleteTeacher: (id) => {
        const teacher = get().teachers.find((t) => t.id === id)
        set((state) => ({
          teachers: state.teachers.filter((teacher) => teacher.id !== id),
          activities: [
            {
              id: Date.now().toString(),
              type: "teacher",
              message: `Teacher ${teacher?.name} removed`,
              timestamp: "Just now",
            },
            ...state.activities,
          ],
        }))
      },

      // Student CRUD
      addStudent: (student) => {
        const newStudent = { ...student, id: Date.now().toString() }
        set((state) => ({
          students: [...state.students, newStudent],
          activities: [
            {
              id: Date.now().toString(),
              type: "registration",
              message: `${student.name} registered for ${student.course}`,
              timestamp: "Just now",
            },
            ...state.activities,
          ],
        }))
      },

      updateStudent: (id, updates) => {
        set((state) => ({
          students: state.students.map((student) => (student.id === id ? { ...student, ...updates } : student)),
        }))
      },

      deleteStudent: (id) => {
        const student = get().students.find((s) => s.id === id)
        set((state) => ({
          students: state.students.filter((student) => student.id !== id),
          activities: [
            {
              id: Date.now().toString(),
              type: "registration",
              message: `Student ${student?.name} removed`,
              timestamp: "Just now",
            },
            ...state.activities,
          ],
        }))
      },

      // Payment CRUD with enhanced logic
      addPayment: (payment) => {
        const newPayment = { ...payment, id: Date.now().toString() }
        set((state) => ({
          payments: [...state.payments, newPayment],
          activities: [
            {
              id: Date.now().toString(),
              type: "payment",
              message: `Payment ${payment.status === "pending" ? "pending" : "received"} from ${payment.studentName}`,
              timestamp: "Just now",
            },
            ...state.activities,
          ],
        }))
      },

      updatePayment: (id, updates) => {
        set((state) => ({
          payments: state.payments.map((payment) => (payment.id === id ? { ...payment, ...updates } : payment)),
        }))
      },

      getStudentPendingPayment: (studentId: string) => {
        return get().payments.find((p) => p.studentId === studentId && p.status === "pending")
      },

      getStudentCompletedPayments: (studentId: string) => {
        return get().payments.filter((p) => p.studentId === studentId && p.status === "completed")
      },

      completePayment: (paymentId: string, paidAmount: number) => {
        const payment = get().payments.find((p) => p.id === paymentId)
        if (!payment) return

        set((state) => ({
          payments: state.payments.map((p) =>
            p.id === paymentId
              ? { ...p, status: "completed" as const, paidAmount, date: new Date().toISOString().split("T")[0] }
              : p,
          ),
          activities: [
            {
              id: Date.now().toString(),
              type: "payment",
              message: `Payment completed for ${payment.studentName} (${paidAmount} ${payment.currency})`,
              timestamp: "Just now",
            },
            ...state.activities,
          ],
        }))
      },

      // Group management
      addGroup: (group) => {
        const newGroup = { ...group, id: Date.now().toString(), students: [] }
        set((state) => ({
          groups: [...state.groups, newGroup],
        }))
      },

      updateGroup: (id, updates) => {
        set((state) => ({
          groups: state.groups.map((group) => (group.id === id ? { ...group, ...updates } : group)),
        }))
      },

      deleteGroup: (id) => {
        set((state) => ({
          groups: state.groups.filter((group) => group.id !== id),
        }))
      },

      assignStudentToGroup: (groupId: string, studentId: string) => {
        set((state) => ({
          groups: state.groups.map((group) =>
            group.id === groupId && !group.students?.includes(studentId)
              ? { ...group, students: [...(group.students || []), studentId] }
              : group,
          ),
          students: state.students.map((student) => (student.id === studentId ? { ...student, groupId } : student)),
        }))
      },

      removeStudentFromGroup: (groupId: string, studentId: string) => {
        set((state) => ({
          groups: state.groups.map((group) =>
            group.id === groupId
              ? { ...group, students: group.students?.filter((id: string) => id !== studentId) || [] }
              : group,
          ),
          students: state.students.map((student) =>
            student.id === studentId ? { ...student, groupId: undefined } : student,
          ),
        }))
      },

      // Product CRUD
      addProduct: (product) => {
        const newProduct = { ...product, id: Date.now().toString() }
        set((state) => ({
          products: [...state.products, newProduct],
          activities: [
            {
              id: Date.now().toString(),
              type: "product",
              message: `${product.name} added to shop`,
              timestamp: "Just now",
            },
            ...state.activities,
          ],
        }))
      },

      updateProduct: (id, updates) => {
        set((state) => ({
          products: state.products.map((product) => (product.id === id ? { ...product, ...updates } : product)),
        }))
      },

      deleteProduct: (id) => {
        const product = get().products.find((p) => p.id === id)
        set((state) => ({
          products: state.products.filter((product) => product.id !== id),
          activities: [
            {
              id: Date.now().toString(),
              type: "product",
              message: `${product?.name} removed from shop`,
              timestamp: "Just now",
            },
            ...state.activities,
          ],
        }))
      },

      // Activity
      addActivity: (activity) => {
        set((state) => ({
          activities: [{ ...activity, id: Date.now().toString() }, ...state.activities],
        }))
      },
    }),
    {
      name: "admin-store",
      version: 1,
    },
  ),
)
