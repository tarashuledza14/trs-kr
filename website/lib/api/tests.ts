import type { Question, Test } from '../types';
import { apiClient } from './client';

export const testsApi = {
	async list(): Promise<Test[]> {
		const { data } = await apiClient.get<Test[]>('/tests');
		return data;
	},

	async getById(id: string): Promise<Test | undefined> {
		const { data } = await apiClient.get<Test>(`/tests/${id}`);
		return data;
	},

	async create(payload: {
		title: string;
		questions: Question[];
		authorId: string;
	}): Promise<Test> {
		const { data } = await apiClient.post<Test>('/tests', payload);
		return data;
	},

	async delete(id: string): Promise<void> {
		await apiClient.delete(`/tests/${id}`);
	},
};
