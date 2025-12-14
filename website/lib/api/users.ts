import type { Role, User } from '../types';
import { apiClient } from './client';

export const usersApi = {
	async findByEmail(email: string): Promise<User | undefined> {
		const { data } = await apiClient.get<User>(`/users/by-email`, {
			params: { email },
		});
		return data;
	},

	async getById(id: string): Promise<User | undefined> {
		const { data } = await apiClient.get<User>(`/users/${id}`);
		return data;
	},

	async studentsList(role?: Role): Promise<User[]> {
		const { data } = await apiClient.get<User[]>('/users/students', {
			params: role ? { role } : undefined,
		});
		return data;
	},
};
