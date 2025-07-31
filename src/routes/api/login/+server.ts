// /Users/dwait/Documents/Coding/Shipwrecked/FlashLearn/src/routes/api/login/+server.ts
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import CryptoJS from 'crypto-js';
import { connectToDatabase } from '$lib/server/mongodb';

const COLLECTION_NAME = 'users';

interface User {
  _id: any;
  email: string;
  password: string;
  salt: string;
  createdAt: Date;
}

export const POST: RequestHandler = async ({ request }) => {
	try {
		const { email, password } = await request.json();

		// Validate input
		if (!email || !password) {
			return json({ error: 'Email and password are required' }, { status: 400 });
		}

		// Connect to MongoDB
		const { db, client } = await connectToDatabase();
		const collection = db.collection(COLLECTION_NAME);

		// Hash password with SHA256
		const hashedPassword = CryptoJS.SHA256(password).toString();

		// Find user by email and password
		const user = await collection.findOne({ 
			email: email.toLowerCase(),
			password: hashedPassword
		});

		await client.close();

		if (!user) {
			return json({ error: 'Invalid email or password' }, { status: 401 });
		}

		// Return user data (without password)
		const { password: _, ...userWithoutPassword } = user;
		return json({
			message: 'Login successful',
			user: userWithoutPassword
		});

	} catch (error) {
		console.error('Login error:', error);
		return json({ error: 'Internal server error' }, { status: 500 });
	}
}; 