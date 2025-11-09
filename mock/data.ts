import type { User, Activity, Payment, Product, UserRole } from "@/types"
import type { Student, Achievement } from "@/types/student-types"
import type { Teacher, AttendanceRecord, Group, Lesson, StudentPoint, TeacherActivity } from "@/types/teacher-types"
import { Award, BookCheck, CalendarCheck, MessageSquare, Shield, ShoppingCart } from "lucide-react"

// * Demo accounts data for display
const demoAccounts = [
  {
    role: "admin" as UserRole,
    title: "Admin",
    username: "admin",
    password: "password",
    icon: Shield,
    color: "text-blue-600 bg-blue-50",
  },
  {
    role: "teacher" as UserRole,
    title: "Teacher",
    username: "teacher",
    password: "password",
    icon: MessageSquare,
    color: "text-green-600 bg-green-50",
  },
  {
    role: "student" as UserRole,
    title: "Student",
    username: "student",
    password: "password",
    icon: ShoppingCart,
    color: "text-purple-600 bg-purple-50",
  },
]

// * Mock users data
const mockUsers: User[] = [
  { id: "1", username: "admin", role: "admin", name: "Admin User" },
  { id: "2", username: "teacher", role: "teacher", name: "John Teacher" },
  { id: "3", username: "student", role: "student", name: "Jane Student" },
]

// * Mock data
const mockTeachers: Teacher[] = []

const mockStudents: Student[] = []

const mockPayments: Payment[] = []

const mockProducts: Product[] = [
  {
    id: "1",
    name: "Premium Notebook",
    description: "High-quality notebook for students",
    price: 25,
    category: "Stationery",
    stock: 50,
    image: "/notebook.png",
  },
  {
    id: "2",
    name: "Scientific Calculator",
    description: "Advanced calculator for math classes",
    price: 85,
    category: "Electronics",
    stock: 20,
    image: "/scientific-calculator.webp",
  },
]

const mockActivities: Activity[] = []

// * Mock Achievements for student role
const mockAchievements: Achievement[] = [
  {
    id: "ach1",
    name: "Perfect Attendance",
    description: "Achieved perfect attendance for a month",
    icon: CalendarCheck,
    earnedDate: null,
  },
  {
    id: "ach2",
    name: "Top Scorer",
    description: "Scored 90%+ in a major exam",
    icon: Award,
    earnedDate: null,
  },
  {
    id: "ach3",
    name: "Homework Master",
    description: "Completed all homework assignments for a subject",
    icon: BookCheck,
    earnedDate: null,
  },
  {
    id: "ach4",
    name: "Active Participant",
    description: "Consistently participated in class discussions",
    icon: MessageSquare,
    earnedDate: null,
  },
]

// * Mock Data for teacher role
const mockGroups: Group[] = []

const mockLessons: Lesson[] = []

const mockAttendanceRecords: AttendanceRecord[] = []

const mockStudentPoints: StudentPoint[] = []

const mockTeacherActivities: TeacherActivity[] = []

export {
  demoAccounts,
  mockUsers,
  mockTeachers,
  mockStudents,
  mockPayments,
  mockProducts,
  mockActivities,
  mockAchievements,
  mockGroups,
  mockLessons,
  mockAttendanceRecords,
  mockStudentPoints,
  mockTeacherActivities,
}
