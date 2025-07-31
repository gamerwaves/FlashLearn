// /Users/dwait/Documents/Coding/Shipwrecked/FlashLearn/src/routes/api/progress/+server.ts
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { connectToDatabase } from '$lib/server/mongodb';

interface Deck {
  _id: any;
  userId: string;
  title: string;
  totalCards: number;
  totalReviews: number;
  correctAnswers: number;
  updatedAt: Date;
}

// Get user progress
export const GET: RequestHandler = async ({ url }) => {
	try {
		const userId = url.searchParams.get('userId');
		
		if (!userId) {
			return json({ error: 'User ID is required' }, { status: 400 });
		}

		const { db, client } = await connectToDatabase();
		const collection = db.collection<Deck>('decks');

		// Get all user's decks
		const decks = await collection.find({ userId }).toArray();
		
		// Calculate overall progress
		let totalCards = 0;
		let totalReviews = 0;
		let totalCorrect = 0;
		const totalDecks = decks.length;
		let studiedDecks = 0;

		for (const deck of decks) {
			totalCards += deck.totalCards || 0;
			totalReviews += deck.totalReviews || 0;
			totalCorrect += deck.correctAnswers || 0;
			
			if (deck.totalReviews && deck.totalReviews > 0) {
				studiedDecks++;
			}
		}

		const accuracy = totalReviews > 0 ? Math.round((totalCorrect / totalReviews) * 100) : 0;
		const completionRate = totalCards > 0 ? Math.round((totalReviews / totalCards) * 100) : 0;

		const progress = {
			totalDecks,
			studiedDecks,
			totalCards,
			totalReviews,
			totalCorrect,
			accuracy,
			completionRate,
			recentActivity: decks
				.filter((deck: Deck) => deck.updatedAt)
				.sort((a: Deck, b: Deck) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
				.slice(0, 5)
				.map((deck: Deck) => ({
					deckId: deck._id,
					title: deck.title,
					lastStudied: deck.updatedAt,
					reviews: deck.totalReviews || 0
				}))
		};

		await client.close();

		return json({ progress });

	} catch (error) {
		console.error('Get progress error:', error);
		return json({ error: 'Internal server error' }, { status: 500 });
	}
}; 