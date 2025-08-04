<!-- /Users/dwait/Documents/Coding/Shipwrecked/FlashLearn/src/routes/study-decks/+page.svelte -->
<script lang="ts">
	import { Heading, P, Button, Card, Badge } from 'flowbite-svelte';
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';

	let user: any = null;
	let decks: any[] = [];
	let loading = true;
	let error = '';

	onMount(async () => {
		// Check if user is logged in
		const storedUser = localStorage.getItem('user') || sessionStorage.getItem('user');
		if (!storedUser) {
			goto('/login');
			return;
		}
		
		try {
			user = JSON.parse(storedUser);
			await loadDecks();
		} catch (error) {
			goto('/login');
		}
	});

	async function loadDecks() {
		try {
			const response = await fetch(`/api/decks?userId=${user._id}`);
			const data = await response.json();

			if (response.ok) {
				decks = data.decks;
			} else {
				error = data.error || 'Failed to load decks';
			}
		} catch (err) {
			error = 'Network error. Please try again.';
		} finally {
			loading = false;
		}
	}

	function startStudying(deckId: string) {
		goto(`/study/${deckId}`);
	}

	function logout() {
		localStorage.removeItem('user');
		sessionStorage.removeItem('user');
		user = null;
		window.location.reload();
	}
</script>

<!-- Navigation Header -->
<div class="flex justify-between items-center px-6 py-4 bg-white shadow-sm">
	<div class="text-2xl font-bold text-gray-800">FlashLearn</div>
	<div class="flex items-center gap-4">
		{#if user}
			<span class="text-gray-600">Welcome, {user.fullname}</span>
		{/if}
		<Button href="/dashboard" color="gray" size="sm" class="bg-gray-500 hover:bg-gray-600 text-white font-semibold px-4 py-2 rounded-lg shadow-md transition-all duration-200 transform hover:scale-105">Dashboard</Button>
		<Button onclick={logout} class="bg-gray-500 hover:bg-gray-600 text-white font-semibold px-4 py-2 rounded-lg shadow-md transition-all duration-200 transform hover:scale-105 text-sm">Logout</Button>
	</div>
</div>

<div class="min-h-screen bg-gradient-to-b from-cyan-100 to-blue-300 py-12 px-4">
	<div class="max-w-6xl mx-auto">
		<div class="text-center mb-12">
			<Heading tag="h1" class="text-4xl font-bold text-gray-800 mb-4">
				Study Decks
			</Heading>
			<P class="text-xl text-gray-600">
				Choose a deck to start studying
			</P>
		</div>

		{#if error}
			<div class="mb-8 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg text-center">
				{error}
			</div>
		{/if}

		{#if loading}
			<div class="text-center py-12">
				<div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
				<p class="mt-4 text-gray-600">Loading your decks...</p>
			</div>
		{:else if decks.length === 0}
			<div class="text-center py-12">
				<div class="text-6xl mb-4">📚</div>
				<Heading tag="h2" class="text-2xl font-bold text-gray-800 mb-2">
					No Decks Yet
				</Heading>
				<P class="text-gray-600 mb-6">
					Create your first flashcard deck to start studying
				</P>
				<Button href="/create-deck" color="orange" size="lg" class="bg-orange-500 hover:bg-orange-600 text-white font-semibold px-4 py-2 rounded-lg shadow-md transition-all duration-200 transform hover:scale-105">
					Create Your First Deck
				</Button>
			</div>
		{:else}
		<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
			{#each decks as deck}
				<Card class="p-6 shadow-lg rounded-lg border border-gray-200 bg-white hover:shadow-xl transition cursor-pointer">
					<div class="text-center">
						<div class="text-4xl mb-4">🎯</div>
						<h3 class="text-xl font-bold text-gray-800 mb-2">{deck.title}</h3>
						{#if deck.subject}
							<Badge color="blue" class="mb-3">{deck.subject}</Badge>
						{/if}
						{#if deck.description}
							<p class="text-gray-600 mb-4 text-sm">{deck.description}</p>
						{/if}
		
						<div class="grid grid-cols-2 gap-4 mb-4 text-sm">
							<div class="text-center">
								<div class="font-bold text-gray-800">{deck.totalCards}</div>
								<div class="text-gray-600">Cards</div>
							</div>
							<div class="text-center">
								<div class="font-bold text-gray-800">{deck.totalReviews || 0}</div>
								<div class="text-gray-600">Reviews</div>
							</div>
						</div>
		
						{#if deck.totalReviews > 0}
							<div class="mb-4">
								<div class="flex justify-between text-sm mb-1">
									<span>Progress</span>
									<span>{Math.round((deck.totalReviews / deck.totalCards) * 100)}%</span>
								</div>
								<div class="w-full bg-gray-200 rounded-full h-2">
									<div class="bg-orange-500 h-2 rounded-full" style="width: {Math.min((deck.totalReviews / deck.totalCards) * 100, 100)}%"></div>
								</div>
							</div>
						{/if}
		
						<Button 
							onclick={() => startStudying(typeof deck._id === 'string' ? deck._id : deck._id.$oid)} 
							color="orange" 
							size="sm" 
							class="w-full bg-orange-500 hover:bg-orange-600 text-white"
						>
							Study Now
						</Button>
					</div>
				</Card>
			{/each}
		</div>		

			<div class="text-center mt-12">
				<Button href="/create-deck" size="lg" class="bg-orange-500 hover:bg-orange-600 text-white font-semibold px-8 py-3 rounded-lg shadow-lg transition-all duration-200 transform hover:scale-105">
					+ Create New Deck
				</Button>
			</div>
		{/if}
	</div>
</div> 