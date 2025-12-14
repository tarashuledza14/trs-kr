import type { TestResult } from '../types';
import { apiClient } from './client';

export const resultsApi = {
	async submitResult(payload: {
		testId: string;
		studentId: string;
		answers: number[];
		score: number;
	}): Promise<TestResult> {
		const { data } = await apiClient.post<TestResult>('/results', payload);
		return data;
	},

	async listByTest(testId: string): Promise<TestResult[]> {
		const { data } = await apiClient.get<TestResult[]>(
			`/results/by-test/${testId}`
		);
		return data;
	},

	async listByStudent(studentId: string): Promise<TestResult[]> {
		const { data } = await apiClient.get<TestResult[]>(
			`/results/by-student/${studentId}`
		);
		return data;
	},
};
