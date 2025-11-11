import { create } from "zustand"
import { persist } from "zustand/middleware"
import type { User, UserRole } from "@/types"
import { useAdminStore } from "./admin-store"

interface AuthState {
  user: User | null
  isLoading: boolean
  hardcodedUsers: Array<{
    id: string
    username: string
    password: string
    role: UserRole
    name: string
    email?: string
    phone?: string
  }>
  login: (username: string, password: string, role: UserRole) => Promise<boolean>
  logout: () => void
  updateUser: (updates: Partial<User & { password?: string }>) => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isLoading: false,
      hardcodedUsers: [
        { id: "admin-1", username: "admin", password: "password", role: "admin" as UserRole, name: "Admin User" },
        {
          id: "teacher-1",
          username: "teacher",
          password: "password",
          role: "teacher" as UserRole,
          name: "Teacher User",
        },
        {
          id: "student-1",
          username: "student",
          password: "password",
          role: "student" as UserRole,
          name: "Student User",
        },
      ],

      login: async (username: string, password: string, role: UserRole) => {
        set({ isLoading: true })

        await new Promise((resolve) => setTimeout(resolve, 500))

        const hardcodedUser = get().hardcodedUsers.find(
          (u) => u.username === username && u.password === password && u.role === role,
        )

        if (hardcodedUser) {
          set({ user: { ...hardcodedUser }, isLoading: false })
          return true
        }

        if (role === "teacher") {
          const teachers = useAdminStore.getState().teachers
          const teacher = teachers.find(
            (t) => t.username === username && t.password === password && t.status === "active",
          )

          if (teacher) {
            const user: User = {
              id: teacher.id,
              username: teacher.username,
              role: "teacher",
              name: teacher.name,
              email: teacher.email,
              phone: teacher.phone,
            }
            set({ user, isLoading: false })
            return true
          }
        }

        if (role === "student") {
          const students = useAdminStore.getState().students
          const student = students.find(
            (s) => s.username === username && s.password === password && s.status === "active",
          )

          if (student) {
            const user: User = {
              id: student.id,
              username: student.username,
              role: "student",
              name: student.name,
              email: student.email,
              phone: student.phone,
            }
            set({ user, isLoading: false })
            return true
          }
        }

        set({ isLoading: false })
        return false
      },

      logout: () => set({ user: null }),

      updateUser: (updates: Partial<User & { password?: string }>) => {
        const currentUser = get().user
        if (!currentUser) return

        const updatedUser = { ...currentUser, ...updates }
        set({ user: updatedUser })

        if (
          currentUser.id.startsWith("admin-") ||
          currentUser.id.startsWith("teacher-") ||
          currentUser.id.startsWith("student-")
        ) {
          const isHardcoded = get().hardcodedUsers.some((u) => u.id === currentUser.id)
          if (isHardcoded) {
            const newHardcodedUsers = get().hardcodedUsers.map((u) =>
              u.id === currentUser.id
                ? {
                    ...u,
                    name: updates.name || u.name,
                    username: updates.username || u.username,
                    password: updates.password || u.password,
                    email: updates.email || u.email,
                    phone: updates.phone || u.phone,
                  }
                : u,
            )
            set({ hardcodedUsers: newHardcodedUsers })
          }
        }

        if (currentUser.role === "teacher") {
          const updateData: any = {
            name: updatedUser.name,
            email: updatedUser.email,
            phone: updatedUser.phone,
            username: updatedUser.username,
          }
          if (updates.password) {
            updateData.password = updates.password
          }
          useAdminStore.getState().updateTeacher(currentUser.id, updateData)
        } else if (currentUser.role === "student") {
          const updateData: any = {
            name: updatedUser.name,
            email: updatedUser.email,
            phone: updatedUser.phone,
            username: updatedUser.username,
          }
          if (updates.password) {
            updateData.password = updates.password
          }
          useAdminStore.getState().updateStudent(currentUser.id, updateData)
        }
      },
    }),
    {
      name: "auth-store",
    },
  ),
)
