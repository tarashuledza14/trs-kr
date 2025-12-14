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
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, CheckCircle, Copy } from 'lucide-react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';

export default function TestResultsPage() {
	const params = useParams();
	const router = useRouter();
	const testId = params.id as string;
	const [copied, setCopied] = useState(false);
	const queryClient = useQueryClient();

	const { data: test } = useQuery({
		queryKey: ['test', testId],
		queryFn: () => testsApi.getById(testId),
	});

	const { data: results = [] } = useQuery({
		queryKey: ['test-results', testId],
		queryFn: () => resultsApi.listByTest(testId),
		enabled: !!testId,
	});

	const { data: students = [] } = useQuery({
		queryKey: ['students'],
		queryFn: () => usersApi.studentsList(),
	});

	const { mutate: deleteTest } = useMutation({
		mutationKey: ['delete-test', testId],
		mutationFn: (data: string) => testsApi.delete(data),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['tests'] });
			router.replace('/teacher/dashboard');
		},
	});

	const getStudentName = (studentId: string) => {
		const student = students.find(s => s.id === studentId);
		return student?.name || 'Невідомий студент';
	};

	const copyTestLink = () => {
		const url = `${window.location.origin}/test/${testId}`;
		navigator.clipboard.writeText(url);
		setCopied(true);
		setTimeout(() => setCopied(false), 2000);
	};

	if (!test) {
		return (
			<div className='min-h-screen bg-background'>
				<Header />
				<main className='container mx-auto p-6'>
					<p>Завантаження...</p>
				</main>
			</div>
		);
	}

	return (
		<div className='min-h-screen bg-background'>
			<Header />

			<main className='container mx-auto p-6 space-y-6'>
				<div className='mb-6'>
					<Button variant='ghost' asChild>
						<Link href='/teacher/dashboard'>
							<ArrowLeft className='mr-2 h-4 w-4' />
							Назад до панелі
						</Link>
					</Button>
				</div>

				<Card>
					<CardHeader>
						<CardTitle>{test.title}</CardTitle>
						<CardDescription>Питань: {test.questions.length}</CardDescription>
					</CardHeader>
					<CardContent>
						<div className='flex items-center gap-2'>
							<Button onClick={copyTestLink} variant='outline'>
								{copied ? (
									<>
										<CheckCircle className='mr-2 h-4 w-4' />
										Скопійовано!
									</>
								) : (
									<>
										<Copy className='mr-2 h-4 w-4' />
										Копіювати посилання на тест
									</>
								)}
							</Button>
							<Button variant='destructive' onClick={() => deleteTest(testId)}>
								Видалити тест
							</Button>
						</div>
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<CardTitle>Результати студентів</CardTitle>
						<CardDescription>
							Завершених тестів: {results.length}
						</CardDescription>
					</CardHeader>
					<CardContent>
						{results.length === 0 ? (
							<p className='text-muted-foreground'>Поки немає результатів</p>
						) : (
							<Table>
								<TableHeader>
									<TableRow>
										<TableHead>Студент</TableHead>
										<TableHead>Результат</TableHead>
										<TableHead>Дата</TableHead>
									</TableRow>
								</TableHeader>
								<TableBody>
									{results.map(result => (
										<TableRow key={result.id}>
											<TableCell className='font-medium'>
												{getStudentName(result.studentId)}
											</TableCell>
											<TableCell>
												<span
													className={`font-bold ${
														result.score >= 80
															? 'text-green-600'
															: result.score >= 60
															? 'text-yellow-600'
															: 'text-red-600'
													}`}
												>
													{result.score}%
												</span>
											</TableCell>
											<TableCell>
												{new Date(result.completedAt).toLocaleDateString(
													'uk-UA',
													{
														year: 'numeric',
														month: 'long',
														day: 'numeric',
														hour: '2-digit',
														minute: '2-digit',
													}
												)}
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
	);
}
