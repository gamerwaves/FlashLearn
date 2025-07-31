// /Users/dwait/Documents/Coding/Shipwrecked/FlashLearn/src/routes/api/test/+server.ts
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { MongoClient } from 'mongodb';

const MONGODB_URI = 'mongodb+srv://dwaitpandhi:69duAjl4j6r8BAnl@cluster0.z80toii.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';

export const GET: RequestHandler = async () => {
	try {
		// Test MongoDB connection
		const client = new MongoClient(MONGODB_URI);
		await client.connect();
		
		// Test database access
		const db = client.db('flashlearn');
		const collections = await db.listCollections().toArray();
		
		await client.close();
		
		return json({
			message: 'Server is working',
			mongodb: 'Connected successfully',
			collections: collections.map(c => c.name)
		});
	} catch (error) {
		console.error('Test error:', error);
		return json({
			message: 'Server error',
			error: error instanceof Error ? error.message : 'Unknown error'
		}, { status: 500 });
	}
}; 