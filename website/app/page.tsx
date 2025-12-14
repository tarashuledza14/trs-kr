import { authOptions } from '@/lib/auth-options';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';

export default async function HomePage() {
	const session = await getServerSession(authOptions);

	if (!session) {
		redirect('/login');
	}

	// Redirect based on role
	const role = (session.user as any).role;

	if (role === 'teacher') {
		redirect('/teacher/dashboard');
	} else {
		redirect('/student/dashboard');
	}
}
