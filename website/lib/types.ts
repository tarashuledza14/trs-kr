export type Role = "teacher" | "student"

export interface User {
  id: string
  email: string
  role: Role
  name: string
}

export interface Question {
  id: string
  text: string
  options: string[]
  correctIndex: number
}

export interface Test {
  id: string
  title: string
  authorId: string
  questions: Question[]
  createdAt: Date
}

export interface TestResult {
  id: string
  testId: string
  studentId: string
  score: number
  answers: number[]
  completedAt: Date
}
