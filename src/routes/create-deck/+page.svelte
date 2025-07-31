<!-- /Users/dwait/Documents/Coding/Shipwrecked/FlashLearn/src/routes/create-deck/+page.svelte -->
<script lang="ts">
	import { Heading, P, Button, Card, Label, Input, Textarea } from 'flowbite-svelte';
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';

	let user: any = null;
	let title = '';
	let description = '';
	let subject = '';
	let cards: Array<{ front: string; back: string }> = [{ front: '', back: '' }];
	let loading = false;
	let error = '';
	let success = '';

	onMount(() => {
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

	function addCard() {
		cards = [...cards, { front: '', back: '' }];
	}

	function removeCard(index: number) {
		if (cards.length > 1) {
			cards = cards.filter((_, i) => i !== index);
		}
	}

	async function createDeck() {
		error = '';
		success = '';
		if (!title.trim()) {
			error = 'Deck title is required';
			return;
		}
		if (cards.length === 0) {
			error = 'At least one card is required';
			return;
		}
		for (let i = 0; i < cards.length; i++) {
			if (!cards[i].front.trim() || !cards[i].back.trim()) {
				error = `Card ${i + 1} must have both front and back content`;
				return;
			}
		}
		loading = true;
		try {
			const response = await fetch('/api/decks', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					userId: user._id,
					title: title.trim(),
					description: description.trim(),
					subject: subject.trim() || 'General',
					cards: cards.filter(card => card.front.trim() && card.back.trim())
				})
			});
			const data = await response.json();
			if (response.ok) {
				success = 'Deck created successfully! Redirecting to dashboard...';
				setTimeout(() => { goto('/dashboard'); }, 2000);
			} else {
				error = data.error || 'Failed to create deck';
			}
		} catch (err) {
			error = 'Network error. Please try again.';
		} finally {
			loading = false;
		}
	}

	function logout() {
		localStorage.removeItem('user');
		sessionStorage.removeItem('user');
		user = null;
		window.location.reload();
	}

	function cancel() {
		goto('/dashboard');
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
		<button on:click={logout} class="bg-gray-500 hover:bg-gray-600 text-white font-semibold px-4 py-2 rounded-lg shadow-md transition-all duration-200 transform hover:scale-105 text-sm">Logout</button>
	</div>
</div>

<div class="min-h-screen bg-gradient-to-b from-cyan-100 to-blue-300 py-12 px-4">
	<div class="max-w-4xl mx-auto">
		<Card class="p-8 shadow-xl">
			<div class="text-center mb-8">
				<Heading tag="h1" class="text-3xl font-bold text-gray-800 mb-2">
					Create New Deck
				</Heading>
				<P class="text-gray-600">
					Build your personalized flashcard deck
				</P>
			</div>

			{#if error}
				<div class="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
					{error}
				</div>
			{/if}

			{#if success}
				<div class="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded">
					{success}
				</div>
			{/if}

			<form on:submit|preventDefault={createDeck} class="space-y-6">
				<!-- Deck Info -->
				<div class="grid grid-cols-1 md:grid-cols-2 gap-6">
					<div>
						<Label for="title" class="text-gray-700 font-medium">Deck Title *</Label>
						<Input id="title" type="text" placeholder="Enter deck title" class="mt-1" bind:value={title} required />
					</div>
					<div>
						<Label for="subject" class="text-gray-700 font-medium">Subject</Label>
						<Input id="subject" type="text" placeholder="e.g., Math, Science, History" class="mt-1" bind:value={subject} />
					</div>
				</div>
				<div>
					<Label for="description" class="text-gray-700 font-medium">Description</Label>
					<Textarea id="description" placeholder="Optional description of your deck" class="mt-1" bind:value={description} rows={3} />
				</div>
				<!-- Cards Section -->
				<div>
					<div class="flex justify-between items-center mb-4">
						<Label class="text-gray-700 font-medium">Flashcards</Label>
						<button type="button" on:click={addCard} class="bg-blue-500 hover:bg-blue-600 text-white font-semibold px-4 py-2 rounded-lg shadow-md transition-all duration-200 transform hover:scale-105 text-sm">+ Add Card</button>
					</div>
					<div class="space-y-4">
						{#each cards as card, index}
							<div class="border border-gray-200 rounded-lg p-4 bg-gray-50">
								<div class="flex justify-between items-center mb-3">
									<span class="font-medium text-gray-700">Card {index + 1}</span>
									{#if cards.length > 1}
										<button type="button" on:click={() => removeCard(index)} class="bg-red-500 hover:bg-red-600 text-white font-semibold px-3 py-1 rounded shadow text-xs">Remove</button>
									{/if}
								</div>
								<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
									<div>
										<Label class="text-sm text-gray-600">Front</Label>
										<Textarea placeholder="Question or term" class="mt-1" bind:value={card.front} required rows={3} />
									</div>
									<div>
										<Label class="text-sm text-gray-600">Back</Label>
										<Textarea placeholder="Answer or definition" class="mt-1" bind:value={card.back} required rows={3} />
									</div>
								</div>
							</div>
						{/each}
					</div>
				</div>
				<div class="flex gap-4 pt-6">
					<Button type="submit" color="orange" size="lg" class="flex-1 bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 rounded-lg shadow-lg transition-all duration-200 transform hover:scale-105" disabled={loading}>
						{loading ? 'Creating Deck...' : 'Create Deck'}
					</Button>
					<button type="button" on:click={cancel} class="bg-gray-500 hover:bg-gray-600 text-white font-semibold py-3 px-8 rounded-lg shadow-lg transition-all duration-200 transform hover:scale-105 text-lg">
						Cancel
					</button>
				</div>
			</form>
		</Card>
	</div>
</div> 