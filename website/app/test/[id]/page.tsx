"use client"

import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useSession } from "next-auth/react"
import { useParams, useRouter } from "next/navigation"
import { Header } from "@/components/header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { testsApi } from "@/lib/api/tests"
import { resultsApi } from "@/lib/api/results"
import { CheckCircle, ArrowRight, ArrowLeft } from "lucide-react"

export default function TestPage() {
  const params = useParams()
  const router = useRouter()
  const queryClient = useQueryClient()
  const { data: session } = useSession()
  const testId = params.id as string
  const studentId = (session?.user as any)?.id
  const userRole = (session?.user as any)?.role

  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState<number[]>([])
  const [showResults, setShowResults] = useState(false)
  const [score, setScore] = useState(0)

  const { data: test, isLoading } = useQuery({
    queryKey: ["test", testId],
    queryFn: () => testsApi.getById(testId),
  })

  const submitResultMutation = useMutation({
    mutationFn: (data: { testId: string; studentId: string; answers: number[]; score: number }) =>
      resultsApi.submitResult(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["student-results", studentId] })
    },
  })

  const handleAnswerSelect = (answerIndex: number) => {
    const newAnswers = [...answers]
    newAnswers[currentQuestion] = answerIndex
    setAnswers(newAnswers)
  }

  const handleNext = () => {
    if (test && currentQuestion < test.questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1)
    }
  }

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1)
    }
  }

  const handleSubmit = async () => {
    if (!test) return

    // Calculate score
    let correctAnswers = 0
    test.questions.forEach((question, index) => {
      if (answers[index] === question.correctIndex) {
        correctAnswers++
      }
    })

    const finalScore = Math.round((correctAnswers / test.questions.length) * 100)
    setScore(finalScore)

    // Submit results
    if (userRole === "student") {
      await submitResultMutation.mutateAsync({
        testId,
        studentId,
        answers,
        score: finalScore,
      })
    }

    setShowResults(true)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto p-6">
          <p>Завантаження тесту...</p>
        </main>
      </div>
    )
  }

  if (!test) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto p-6">
          <Card>
            <CardContent className="pt-6">
              <p className="text-center text-muted-foreground">Тест не знайдено</p>
            </CardContent>
          </Card>
        </main>
      </div>
    )
  }

  if (showResults) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto p-6 max-w-3xl">
          <Card>
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
                <CheckCircle className="h-10 w-10 text-green-600" />
              </div>
              <CardTitle className="text-2xl">Тест завершено!</CardTitle>
              <CardDescription>Ваш результат</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center">
                <div
                  className={`text-6xl font-bold ${
                    score >= 80 ? "text-green-600" : score >= 60 ? "text-yellow-600" : "text-red-600"
                  }`}
                >
                  {score}%
                </div>
                <p className="mt-2 text-muted-foreground">
                  Правильних відповідей: {test.questions.filter((q, i) => answers[i] === q.correctIndex).length} з{" "}
                  {test.questions.length}
                </p>
              </div>

              <div className="space-y-4">
                <h3 className="font-semibold">Деталі відповідей:</h3>
                {test.questions.map((question, index) => {
                  const isCorrect = answers[index] === question.correctIndex
                  return (
                    <div key={question.id} className="rounded-lg border p-4">
                      <div className="mb-2 flex items-start justify-between">
                        <p className="font-medium">
                          {index + 1}. {question.text}
                        </p>
                        {isCorrect ? (
                          <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
                        ) : (
                          <span className="flex-shrink-0 text-red-600">✗</span>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Ваша відповідь: {question.options[answers[index]] || "Не відповіли"}
                      </p>
                      {!isCorrect && (
                        <p className="text-sm text-green-600">
                          Правильна відповідь: {question.options[question.correctIndex]}
                        </p>
                      )}
                    </div>
                  )
                })}
              </div>

              <Button className="w-full" onClick={() => router.push(`/${userRole}/dashboard`)}>
                Повернутися до панелі
              </Button>
            </CardContent>
          </Card>
        </main>
      </div>
    )
  }

  const question = test.questions[currentQuestion]
  const progress = ((currentQuestion + 1) / test.questions.length) * 100

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto p-6 max-w-3xl">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between mb-4">
              <CardTitle>{test.title}</CardTitle>
              <span className="text-sm text-muted-foreground">
                Питання {currentQuestion + 1} з {test.questions.length}
              </span>
            </div>
            <div className="h-2 w-full rounded-full bg-secondary overflow-hidden">
              <div className="h-full bg-primary transition-all duration-300" style={{ width: `${progress}%` }} />
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold mb-4">{question.text}</h2>

              <RadioGroup value={answers[currentQuestion]?.toString()} onValueChange={(v) => handleAnswerSelect(+v)}>
                <div className="space-y-3">
                  {question.options.map((option, index) => (
                    <div
                      key={index}
                      className={`flex items-center space-x-3 rounded-lg border p-4 cursor-pointer transition-colors ${
                        answers[currentQuestion] === index ? "border-primary bg-primary/5" : "hover:bg-muted/50"
                      }`}
                      onClick={() => handleAnswerSelect(index)}
                    >
                      <RadioGroupItem value={index.toString()} id={`option-${index}`} />
                      <Label htmlFor={`option-${index}`} className="flex-1 cursor-pointer">
                        {option}
                      </Label>
                    </div>
                  ))}
                </div>
              </RadioGroup>
            </div>

            <div className="flex items-center justify-between pt-4">
              <Button variant="outline" onClick={handlePrevious} disabled={currentQuestion === 0}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Назад
              </Button>

              {currentQuestion === test.questions.length - 1 ? (
                <Button onClick={handleSubmit} disabled={answers.length !== test.questions.length}>
                  Завершити тест
                </Button>
              ) : (
                <Button onClick={handleNext} disabled={answers[currentQuestion] === undefined}>
                  Далі
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              )}
            </div>

            {answers[currentQuestion] === undefined && (
              <p className="text-sm text-center text-muted-foreground">Оберіть відповідь для продовження</p>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
