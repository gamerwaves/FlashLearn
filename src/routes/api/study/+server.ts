// /Users/dwait/Documents/Coding/Shipwrecked/FlashLearn/src/routes/api/study/+server.ts
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { ObjectId } from 'mongodb';
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
  _id: ObjectId;
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

// Get deck for studying
export const GET: RequestHandler = async ({ url }) => {
	let client;
	try {
		const deckId = url.searchParams.get('deckId');
		if (!deckId) {
			return json({ error: 'Deck ID is required' }, { status: 400 });
		}

		// Connect to the database
		const dbInfo = await connectToDatabase();
		client = dbInfo.client;
		const collection = dbInfo.db.collection<Deck>('decks');

		// Find the deck by ID
		const deck = await collection.findOne({ _id: new ObjectId(deckId) });
		
		if (!deck) {
			return json({ error: 'Deck not found' }, { status: 404 });
		}
		
		return json({ deck });
	} catch (error) {
		console.error('Get deck error:', error);
		return json({ error: 'Internal server error' }, { status: 500 });
	} finally {
		// Make sure to close the client connection
		if (client) {
			await client.close().catch(console.error);
		}
	}
};

// Update card progress
export const POST: RequestHandler = async ({ request }) => {
	let client;
	try {
		const { deckId, cardId, isCorrect } = await request.json();
		if (!deckId || typeof cardId === 'undefined' || typeof isCorrect !== 'boolean') {
			return json({ error: 'Invalid study data' }, { status: 400 });
		}

		// Connect to the database
		const dbInfo = await connectToDatabase();
		client = dbInfo.client;
		const collection = dbInfo.db.collection<Deck>('decks');

		// Make sure cardId is a number
		const cardIdNum = typeof cardId === 'string' ? parseInt(cardId, 10) : cardId;

		// Update the card progress
		const updateResult = await collection.updateOne(
			{
				_id: new ObjectId(deckId),
				'cards.id': cardIdNum
			},
			{
				$inc: {
					'cards.$.reviewCount': 1,
					'cards.$.correctCount': isCorrect ? 1 : 0,
					'cards.$.incorrectCount': isCorrect ? 0 : 1,
					'totalReviews': 1,
					'correctAnswers': isCorrect ? 1 : 0
				},
				$set: {
					'cards.$.lastReviewed': new Date(),
					'cards.$.nextReview': new Date(Date.now() + 24 * 60 * 60 * 1000),
					'updatedAt': new Date()
				}
			}
		);

		console.log('Update result:', updateResult);

		// Get the updated deck to return
		const deck = await collection.findOne({ _id: new ObjectId(deckId) });

		return json({
			message: 'Progress updated successfully',
			deck
		});
	} catch (error) {
		console.error('Update progress error:', error);
		return json({ error: 'Internal server error' }, { status: 500 });
	} finally {
		// Make sure to close the client connection
		if (client) {
			await client.close().catch(console.error);
		}
	}
};