/**
 * User Registration Endpoint
 * Handles new user signup with validation and database operations
 */

// Core Dependencies
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import CryptoJS from 'crypto-js';
import { ObjectId } from 'mongodb';
import { connectToDatabase } from '$lib/server/mongodb';

// Constants
const USER_COLLECTION = 'users';
const MIN_PASSWORD_LENGTH = 6;

/**
 * User interface defining the structure of user documents
 */
interface User {
  _id: any;
  fullname: string;
  email: string;
  password: string;
  salt: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Validates user input data
 * Returns error message if validation fails, null otherwise
 */
const validateInput = (fullname: string, email: string, password: string): string | null => {
  if (!fullname || !email || !password) {
    return 'All fields are required';
  }
  
  if (password.length < MIN_PASSWORD_LENGTH) {
    return `Password must be at least ${MIN_PASSWORD_LENGTH} characters long`;
  }
  
  return null;
};

/**
 * Handles POST requests for user registration
 */
export const POST: RequestHandler = async ({ request }) => {
  try {
    // Parse and validate request data
    const requestData = await request.json();
    const { fullname, email, password } = requestData;

    // Input validation
    const validationError = validateInput(fullname, email, password);
    if (validationError) {
      return json({ error: validationError }, { status: 400 });
    }

    // Initialize database connection
    const database = await connectToDatabase();
    const usersCollection = database.db.collection<User>(USER_COLLECTION);

    // Check for existing user
    const normalizedEmail = email.toLowerCase();
    const existingUser = await usersCollection.findOne({ email: normalizedEmail });
    
    if (existingUser) {
      await database.client.close();
      return json({ 
        success: false,
        error: 'User with this email already exists' 
      }, { status: 409 });
    }

    // Generate a new ObjectId for the user
    const userId = new ObjectId();
    
    // Process user data
    const userData: User = {
      _id: userId,
      fullname: fullname.trim(),
      email: normalizedEmail,
      password: CryptoJS.SHA256(password).toString(), // One-way hash
      salt: CryptoJS.lib.WordArray.random(128/8).toString(), // Generate a random salt
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // Save to database
    const insertResult = await usersCollection.insertOne(userData);
    await database.client.close();

    // Prepare response (exclude sensitive data)
    const { password: _, ...safeUserData } = userData;
    
    return json({
      success: true,
      message: 'User registration successful',
      user: { 
        ...safeUserData, 
        _id: insertResult.insertedId 
      }
    }, { 
      status: 201,
      headers: {
        'Content-Type': 'application/json'
      }
    });

  } catch (error) {
    console.error('Registration error:', error);
    return json({ 
      success: false,
      error: 'An unexpected error occurred during registration' 
    }, { 
      status: 500 
    });
  }
}; 