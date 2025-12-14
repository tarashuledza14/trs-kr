'use client';

import { Header } from '@/components/header';
import { Button } from '@/components/ui/button';
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '@/components/ui/card';
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@/components/ui/table';
import { resultsApi } from '@/lib/api/results';
import { testsApi } from '@/lib/api/tests';
import { usersApi } from '@/lib/api/users';
import { useQuery } from '@tanstack/react-query';
import { BarChart, ClipboardList, Plus, Users } from 'lucide-react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';

export default function TeacherDashboard() {
	const { data: session } = useSession();

	const { data: tests = [], isLoading: testsLoading } = useQuery({
		queryKey: ['tests'],
		queryFn: () => testsApi.list(),
	});

	const { data: allResults = [] } = useQuery({
		queryKey: ['all-results'],
		queryFn: async () => {
			const results = [];
			for (const test of tests) {
				const testResults = await resultsApi.listByTest(test.id);
				results.push(...testResults);
			}
			return results;
		},
		enabled: tests.length > 0,
	});

	const { data: students = [] } = useQuery({
		queryKey: ['students'],
		queryFn: () => usersApi.studentsList(),
	});

	const averageScore =
		allResults.length > 0
			? Math.round(
					allResults.reduce((sum, result) => sum + result.score, 0) /
						allResults.length
			  )
			: 0;

	return (
		<div className='min-h-screen bg-background'>
			<Header />

			<main className='container mx-auto p-6 space-y-6'>
				<div className='flex items-center justify-between'>
					<div>
						<h1 className='text-3xl font-bold'>Панель викладача</h1>
						<p className='text-muted-foreground'>
							Керуйте тестами та переглядайте результати
						</p>
					</div>
					<Button asChild>
						<Link href='/teacher/create-test'>
							<Plus className='mr-2 h-4 w-4' />
							Створити тест
						</Link>
					</Button>
				</div>

				<div className='grid gap-4 md:grid-cols-4'>
					<Card>
						<CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
							<CardTitle className='text-sm font-medium'>
								Всього тестів
							</CardTitle>
							<ClipboardList className='h-4 w-4 text-muted-foreground' />
						</CardHeader>
						<CardContent>
							<div className='text-2xl font-bold'>{tests.length}</div>
						</CardContent>
					</Card>

					<Card>
						<CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
							<CardTitle className='text-sm font-medium'>Студентів</CardTitle>
							<Users className='h-4 w-4 text-muted-foreground' />
						</CardHeader>
						<CardContent>
							<div className='text-2xl font-bold'>{students.length}</div>
						</CardContent>
					</Card>

					<Card>
						<CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
							<CardTitle className='text-sm font-medium'>
								Завершених тестів
							</CardTitle>
							<ClipboardList className='h-4 w-4 text-muted-foreground' />
						</CardHeader>
						<CardContent>
							<div className='text-2xl font-bold'>{allResults.length}</div>
						</CardContent>
					</Card>

					<Card>
						<CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
							<CardTitle className='text-sm font-medium'>
								Середній бал
							</CardTitle>
							<BarChart className='h-4 w-4 text-muted-foreground' />
						</CardHeader>
						<CardContent>
							<div className='text-2xl font-bold'>{averageScore}%</div>
							<p className='text-xs text-muted-foreground'>
								Загальна успішність
							</p>
						</CardContent>
					</Card>
				</div>

				<Card>
					<CardHeader>
						<CardTitle>Мої тести</CardTitle>
						<CardDescription>
							Список створених тестів з результатами
						</CardDescription>
					</CardHeader>
					<CardContent>
						{testsLoading ? (
							<p className='text-muted-foreground'>Завантаження...</p>
						) : tests.length === 0 ? (
							<p className='text-muted-foreground'>Тести ще не створені</p>
						) : (
							<Table>
								<TableHeader>
									<TableRow>
										<TableHead>Назва тесту</TableHead>
										<TableHead>Питань</TableHead>
										<TableHead>Пройдено студентами</TableHead>
										<TableHead>Середній %</TableHead>
										<TableHead>Дата створення</TableHead>
										<TableHead>Дії</TableHead>
									</TableRow>
								</TableHeader>
								<TableBody>
									{tests.map(test => {
										const testResults = allResults.filter(
											r => r.testId === test.id
										);
										const testAverage =
											testResults.length > 0
												? Math.round(
														testResults.reduce((sum, r) => sum + r.score, 0) /
															testResults.length
												  )
												: 0;

										return (
											<TableRow key={test.id}>
												<TableCell className='font-medium'>
													{test.title}
												</TableCell>
												<TableCell>{test.questions.length}</TableCell>
												<TableCell>{testResults.length}</TableCell>
												<TableCell>
													<span className='font-medium'>{testAverage}%</span>
												</TableCell>
												<TableCell>
													{new Date(test.createdAt).toLocaleDateString('uk-UA')}
												</TableCell>
												<TableCell>
													<Button variant='outline' size='sm' asChild>
														<Link href={`/teacher/test/${test.id}`}>
															Деталі
														</Link>
													</Button>
												</TableCell>
											</TableRow>
										);
									})}
								</TableBody>
							</Table>
						)}
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<CardTitle>Останні результати студентів</CardTitle>
						<CardDescription>Останні проходження тестів</CardDescription>
					</CardHeader>
					<CardContent>
						{allResults.length === 0 ? (
							<p className='text-muted-foreground'>Результатів ще немає</p>
						) : (
							<Table>
								<TableHeader>
									<TableRow>
										<TableHead>Студент</TableHead>
										<TableHead>Тест</TableHead>
										<TableHead>Результат</TableHead>
										<TableHead>Дата проходження</TableHead>
									</TableRow>
								</TableHeader>
								<TableBody>
									{allResults
										.sort(
											(a, b) =>
												new Date(b.completedAt).getTime() -
												new Date(a.completedAt).getTime()
										)
										.slice(0, 10)
										.map(result => {
											const student = students.find(
												s => s.id === result.studentId
											);
											const test = tests.find(t => t.id === result.testId);
											const scoreColor =
												result.score >= 90
													? 'text-green-600'
													: result.score >= 70
													? 'text-blue-600'
													: result.score >= 50
													? 'text-yellow-600'
													: 'text-red-600';

											return (
												<TableRow key={result.id}>
													<TableCell className='font-medium'>
														{student?.name || 'Невідомий'}
													</TableCell>
													<TableCell>
														{test?.title || 'Невідомий тест'}
													</TableCell>
													<TableCell>
														<span className={`font-semibold ${scoreColor}`}>
															{result.score}%
														</span>
													</TableCell>
													<TableCell>
														{new Date(result.completedAt).toLocaleString(
															'uk-UA'
														)}
													</TableCell>
												</TableRow>
											);
										})}
								</TableBody>
							</Table>
						)}
					</CardContent>
				</Card>
			</main>
		</div>
	);
}
