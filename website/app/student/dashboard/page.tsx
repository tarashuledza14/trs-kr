"use client"

import { useQuery } from "@tanstack/react-query"
import { useSession } from "next-auth/react"
import { Header } from "@/components/header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { resultsApi } from "@/lib/api/results"
import { testsApi } from "@/lib/api/tests"
import { ClipboardList, Trophy, TrendingUp } from "lucide-react"

export default function StudentDashboard() {
  const { data: session } = useSession()
  const studentId = (session?.user as any)?.id

  const { data: results = [] } = useQuery({
    queryKey: ["student-results", studentId],
    queryFn: () => resultsApi.listByStudent(studentId),
    enabled: !!studentId,
  })

  const { data: tests = [] } = useQuery({
    queryKey: ["tests"],
    queryFn: () => testsApi.list(),
  })

  const getTestName = (testId: string) => {
    const test = tests.find((t) => t.id === testId)
    return test?.title || "Невідомий тест"
  }

  const averageScore =
    results.length > 0 ? Math.round(results.reduce((acc, r) => acc + r.score, 0) / results.length) : 0

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto p-6 space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Панель студента</h1>
          <p className="text-muted-foreground">Переглядайте свої результати тестування</p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Пройдено тестів</CardTitle>
              <ClipboardList className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{results.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Середній бал</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{averageScore}%</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Найкращий результат</CardTitle>
              <Trophy className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {results.length > 0 ? Math.max(...results.map((r) => r.score)) : 0}%
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Історія результатів</CardTitle>
            <CardDescription>Ваші пройдені тести</CardDescription>
          </CardHeader>
          <CardContent>
            {results.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground mb-4">Ви ще не проходили тести</p>
                <p className="text-sm text-muted-foreground">Отримайте посилання на тест від вашого викладача</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Тест</TableHead>
                    <TableHead>Результат</TableHead>
                    <TableHead>Статус</TableHead>
                    <TableHead>Дата</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {results.map((result) => (
                    <TableRow key={result.id}>
                      <TableCell className="font-medium">{getTestName(result.testId)}</TableCell>
                      <TableCell>
                        <span
                          className={`font-bold ${
                            result.score >= 80
                              ? "text-green-600"
                              : result.score >= 60
                                ? "text-yellow-600"
                                : "text-red-600"
                          }`}
                        >
                          {result.score}%
                        </span>
                      </TableCell>
                      <TableCell>
                        {result.score >= 80 ? (
                          <span className="rounded-full bg-green-100 px-2 py-1 text-xs text-green-700">Відмінно</span>
                        ) : result.score >= 60 ? (
                          <span className="rounded-full bg-yellow-100 px-2 py-1 text-xs text-yellow-700">Добре</span>
                        ) : (
                          <span className="rounded-full bg-red-100 px-2 py-1 text-xs text-red-700">
                            Потребує покращення
                          </span>
                        )}
                      </TableCell>
                      <TableCell>
                        {new Date(result.completedAt).toLocaleDateString("uk-UA", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
