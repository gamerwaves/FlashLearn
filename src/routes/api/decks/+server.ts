// /Users/dwait/Documents/Coding/Shipwrecked/FlashLearn/src/routes/api/decks/+server.ts
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { connectToDatabase } from '$lib/server/mongodb';

interface Card {
  id: number;
  question: string;
  answer: string;
  lastReviewed: Date | null;
  reviewCount: number;
  correctCount: number;
  incorrectCount: number;
  nextReview: Date;
}

interface Deck {
  _id?: any; // Make _id optional for new documents
  userId: string;
  title: string;
  description: string;
  subject: string;
  cards: Card[];
  createdAt: Date;
  updatedAt: Date;
  totalCards: number;
  studiedCards: number;
  correctAnswers: number;
  totalReviews: number;
}

// Create new deck
export const POST: RequestHandler = async ({ request }) => {
	try {
		const { userId, title, description, subject, cards } = await request.json();

		if (!userId || !title || !cards || !Array.isArray(cards)) {
			return json({ error: 'Invalid deck data' }, { status: 400 });
		}

		const { db, client } = await connectToDatabase();
		const collection = db.collection<Deck>('decks');

		const deck = {
			userId,
			title,
			description: description || '',
			subject: subject || 'General',
			cards: cards.map((card: any, index: number) => ({
				...card,
				id: index + 1,
				lastReviewed: null,
				reviewCount: 0,
				correctCount: 0,
				incorrectCount: 0,
				nextReview: new Date()
			})),
			createdAt: new Date(),
			updatedAt: new Date(),
			totalCards: cards.length,
			studiedCards: 0,
			correctAnswers: 0,
			totalReviews: 0
		};

		const result = await collection.insertOne(deck);
		await client.close();

		return json({
			message: 'Deck created successfully',
			deck: { ...deck, _id: result.insertedId }
		}, { status: 201 });

	} catch (error) {
		console.error('Create deck error:', error);
		return json({ error: 'Internal server error' }, { status: 500 });
	}
};

// Get user's decks
export const GET: RequestHandler = async ({ url }) => {
	try {
		const userId = url.searchParams.get('userId');
		
		if (!userId) {
			return json({ error: 'User ID is required' }, { status: 400 });
		}

		const { db, client } = await connectToDatabase();
		const collection = db.collection<Deck>('decks');

		const decks = await collection.find({ userId }).sort({ createdAt: -1 }).toArray();
		await client.close();

		return json({ decks });

	} catch (error) {
		console.error('Get decks error:', error);
		return json({ error: 'Internal server error' }, { status: 500 });
	}
};