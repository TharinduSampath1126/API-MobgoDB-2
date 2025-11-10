import axios from 'axios';
import { User } from '@/components/data-table/columns';

// Base API configuration
const API_BASE_URL = `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'}/users`;

// User API functions with React Query integration
export async function fetchUsers(): Promise<User[]> {
	const res = await axios.get(API_BASE_URL);
	const users: User[] = res.data.users.map((user: any) => ({
		id: user.id,
		firstName: user.firstName,
		lastName: user.lastName,
		age: user.age,
		email: user.email,
		phone: user.phone,
		birthDate: user.birthDate,
	}));
	return users;
}

export async function fetchUserById(id: number): Promise<User> {
	const res = await axios.get(`${API_BASE_URL}/${id}`);
	return {
		id: res.data.id,
		firstName: res.data.firstName,
		lastName: res.data.lastName,
		age: res.data.age,
		email: res.data.email,
		phone: res.data.phone,
		birthDate: res.data.birthDate,
	};
}

export async function createUser(userData: User): Promise<User> {
	console.log('Creating user with data:', userData);
	const res = await axios.post(`${API_BASE_URL}/add`, userData);
	console.log('Create response:', res.data);
	return {
		id: res.data.id,
		firstName: res.data.firstName,
		lastName: res.data.lastName,
		age: res.data.age,
		email: res.data.email,
		phone: res.data.phone,
		birthDate: res.data.birthDate,
	};
}

export async function updateUser(userData: User): Promise<User> {
	console.log('Sending PUT request to:', `${API_BASE_URL}/${userData.id}`, 'with data:', userData);
	const res = await axios.put(`${API_BASE_URL}/${userData.id}`, userData);
	console.log('Update response:', res.data);
	return {
		id: res.data.id,
		firstName: res.data.firstName,
		lastName: res.data.lastName,
		age: res.data.age,
		email: res.data.email,
		phone: res.data.phone,
		birthDate: res.data.birthDate,
	};
}

export async function deleteUser(id: number): Promise<void> {
	await axios.delete(`${API_BASE_URL}/${id}`);
}

// Export individual functions for React Query hooks
export const userApi = {
	fetchUsers,
	fetchUserById,
	createUser,
	updateUser,
	deleteUser,
};

export default fetchUsers;
