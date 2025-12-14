"use client"

import type React from "react"

import { useState } from "react"
import { useSession } from "next-auth/react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useRouter } from "next/navigation"
import { Header } from "@/components/header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { testsApi } from "@/lib/api/tests"
import { Plus, Trash2, ArrowLeft } from "lucide-react"
import Link from "next/link"
import type { Question } from "@/lib/types"

export default function CreateTestPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const queryClient = useQueryClient()

  const [title, setTitle] = useState("")
  const [questions, setQuestions] = useState<Partial<Question>[]>([
    { text: "", options: ["", "", ""], correctIndex: 0 },
  ])

  const createTestMutation = useMutation({
    mutationFn: (data: { title: string; questions: Question[]; authorId: string }) => testsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tests"] })
      router.push("/teacher/dashboard")
    },
  })

  const addQuestion = () => {
    setQuestions([...questions, { text: "", options: ["", "", ""], correctIndex: 0 }])
  }

  const removeQuestion = (index: number) => {
    setQuestions(questions.filter((_, i) => i !== index))
  }

  const updateQuestion = (index: number, field: keyof Question, value: any) => {
    const updated = [...questions]
    updated[index] = { ...updated[index], [field]: value }
    setQuestions(updated)
  }

  const updateOption = (qIndex: number, oIndex: number, value: string) => {
    const updated = [...questions]
    const options = [...(updated[qIndex].options || [])]
    options[oIndex] = value
    updated[qIndex] = { ...updated[qIndex], options }
    setQuestions(updated)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const validQuestions: Question[] = questions
      .filter((q) => q.text && q.options?.every((o) => o))
      .map((q, idx) => ({
        id: `q${idx + 1}`,
        text: q.text!,
        options: q.options!,
        correctIndex: q.correctIndex || 0,
      }))

    if (validQuestions.length === 0) {
      alert("Додайте хоча б одне питання")
      return
    }

    createTestMutation.mutate({
      title,
      questions: validQuestions,
      authorId: (session?.user as any)?.id,
    })
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto p-6">
        <div className="mb-6">
          <Button variant="ghost" asChild>
            <Link href="/teacher/dashboard">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Назад до панелі
            </Link>
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Створити новий тест</CardTitle>
            <CardDescription>Додайте назву тесту та питання з варіантами відповідей</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title">Назва тесту</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Наприклад: Тест з математики"
                  required
                />
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="text-lg">Питання</Label>
                  <Button type="button" variant="outline" size="sm" onClick={addQuestion}>
                    <Plus className="mr-2 h-4 w-4" />
                    Додати питання
                  </Button>
                </div>

                {questions.map((question, qIdx) => (
                  <Card key={qIdx}>
                    <CardContent className="pt-6 space-y-4">
                      <div className="flex items-start gap-4">
                        <div className="flex-1 space-y-4">
                          <div className="space-y-2">
                            <Label>Питання {qIdx + 1}</Label>
                            <Input
                              value={question.text || ""}
                              onChange={(e) => updateQuestion(qIdx, "text", e.target.value)}
                              placeholder="Введіть текст питання"
                              required
                            />
                          </div>

                          <div className="space-y-2">
                            <Label>Варіанти відповідей</Label>
                            {question.options?.map((option, oIdx) => (
                              <div key={oIdx} className="flex items-center gap-2">
                                <Input
                                  value={option}
                                  onChange={(e) => updateOption(qIdx, oIdx, e.target.value)}
                                  placeholder={`Варіант ${oIdx + 1}`}
                                  required
                                />
                                <input
                                  type="radio"
                                  name={`correct-${qIdx}`}
                                  checked={question.correctIndex === oIdx}
                                  onChange={() => updateQuestion(qIdx, "correctIndex", oIdx)}
                                  className="h-4 w-4"
                                />
                              </div>
                            ))}
                            <p className="text-xs text-muted-foreground">
                              Виберіть правильну відповідь за допомогою перемикача
                            </p>
                          </div>
                        </div>

                        {questions.length > 1 && (
                          <Button type="button" variant="ghost" size="icon" onClick={() => removeQuestion(qIdx)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <Button type="submit" className="w-full" disabled={createTestMutation.isPending}>
                {createTestMutation.isPending ? "Створення..." : "Створити тест"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
