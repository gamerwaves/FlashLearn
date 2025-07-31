<!-- /Users/dwait/Documents/Coding/Shipwrecked/FlashLearn/src/routes/dashboard/+page.svelte -->
<script lang="ts">
	import { Heading, P, Button, Card } from 'flowbite-svelte';
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';

	let user: any = null;

	onMount(() => {
		// Check if user is logged in
		const storedUser = localStorage.getItem('user') || sessionStorage.getItem('user');
		if (!storedUser) {
			goto('/login');
			return;
		}
		
		try {
			user = JSON.parse(storedUser);
		} catch (error) {
			goto('/login');
		}
	});

	function logout() {
		localStorage.removeItem('user');
		sessionStorage.removeItem('user');
		goto('/');
	}
</script>

<!-- Navigation Header -->
<div class="flex justify-between items-center px-6 py-4 bg-white shadow-sm">
	<div class="text-2xl font-bold text-gray-800">FlashLearn</div>
	<div class="flex items-center gap-4">
		{#if user}
			<span class="text-gray-600">Welcome, {user.fullname}</span>
		{/if}
		<Button onclick={logout} class="bg-gray-500 hover:bg-gray-600 text-white font-semibold px-4 py-2 rounded-lg shadow-md transition-all duration-200 transform hover:scale-105 text-sm">Logout</Button>
	</div>
</div>

<div class="min-h-screen bg-gradient-to-b from-cyan-100 to-blue-300 py-12 px-4">
	<div class="max-w-6xl mx-auto">
		<div class="text-center mb-12">
			<Heading tag="h1" class="text-4xl font-bold text-gray-800 mb-4">
				Welcome to FlashLearn
			</Heading>
			<P class="text-xl text-gray-600">
				Start creating and studying your flashcards
			</P>
		</div>

		<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
			<Card class="p-6 shadow-lg rounded-lg border border-gray-200 bg-white hover:shadow-xl transition cursor-pointer">
				<div class="text-center">
					<div class="text-4xl mb-4">📚</div>
					<h3 class="text-xl font-bold text-gray-800 mb-2">Create New Deck</h3>
					<p class="text-gray-600 mb-4">
						Start a new flashcard deck for any subject
					</p>
					<Button href="/create-deck" color="orange" size="sm" class="bg-orange-500 hover:bg-orange-600 text-white">
						Create Deck
					</Button>
				</div>
			</Card>

			<Card class="p-6 shadow-lg rounded-lg border border-gray-200 bg-white hover:shadow-xl transition cursor-pointer">
				<div class="text-center">
					<div class="text-4xl mb-4">🎯</div>
					<h3 class="text-xl font-bold text-gray-800 mb-2">Study Decks</h3>
					<p class="text-gray-600 mb-4">
						Review your existing flashcard decks
					</p>
					<Button href="/study-decks" color="orange" size="sm" class="bg-orange-500 hover:bg-orange-600 text-white">
						Study Now
					</Button>
				</div>
			</Card>

			<Card class="p-6 shadow-lg rounded-lg border border-gray-200 bg-white hover:shadow-xl transition cursor-pointer">
				<div class="text-center">
					<div class="text-4xl mb-4">📊</div>
					<h3 class="text-xl font-bold text-gray-800 mb-2">Progress</h3>
					<p class="text-gray-600 mb-4">
						Track your learning progress
					</p>
					<Button href="/progress" color="orange" size="sm" class="bg-orange-500 hover:bg-orange-600 text-white">
						View Stats
					</Button>
				</div>
			</Card>
		</div>

		{#if user}
			<div class="mt-12 text-center">
				<Card class="p-6 shadow-lg rounded-lg border border-gray-200 bg-white">
					<h3 class="text-xl font-bold text-gray-800 mb-4">Your Account</h3>
					<div class="text-left max-w-md mx-auto">
						<p class="text-gray-600 mb-2"><strong>Name:</strong> {user.fullname}</p>
						<p class="text-gray-600 mb-2"><strong>Email:</strong> {user.email}</p>
						<p class="text-gray-600"><strong>Member since:</strong> {new Date(user.createdAt).toLocaleDateString()}</p>
					</div>
				</Card>
			</div>
		{/if}
	</div>
</div> 