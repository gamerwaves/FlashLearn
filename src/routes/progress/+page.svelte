<!-- /Users/dwait/Documents/Coding/Shipwrecked/FlashLearn/src/routes/progress/+page.svelte -->
<script lang="ts">
	import { Heading, P, Button, Card } from 'flowbite-svelte';
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';

	let user: any = null;
	let progress: any = null;
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
			await loadProgress();
		} catch (error) {
			goto('/login');
		}
	});

	async function loadProgress() {
		try {
			const response = await fetch(`/api/progress?userId=${user._id}`);
			const data = await response.json();

			if (response.ok) {
				progress = data.progress;
			} else {
				error = data.error || 'Failed to load progress';
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
				Your Learning Progress
			</Heading>
			<P class="text-xl text-gray-600">
				Track your flashcard learning journey
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
				<p class="mt-4 text-gray-600">Loading your progress...</p>
			</div>
		{:else if progress}
			<!-- Overall Stats -->
			<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
				<Card class="p-6 text-center">
					<div class="text-3xl mb-2">📚</div>
					<div class="text-2xl font-bold text-gray-800">{progress.totalDecks}</div>
					<div class="text-gray-600">Total Decks</div>
				</Card>
				<Card class="p-6 text-center">
					<div class="text-3xl mb-2">🎯</div>
					<div class="text-2xl font-bold text-gray-800">{progress.totalCards}</div>
					<div class="text-gray-600">Total Cards</div>
				</Card>
				<Card class="p-6 text-center">
					<div class="text-3xl mb-2">📊</div>
					<div class="text-2xl font-bold text-gray-800">{progress.totalReviews}</div>
					<div class="text-gray-600">Total Reviews</div>
				</Card>
				<Card class="p-6 text-center">
					<div class="text-3xl mb-2">✅</div>
					<div class="text-2xl font-bold text-gray-800">{progress.accuracy}%</div>
					<div class="text-gray-600">Accuracy</div>
				</Card>
			</div>

			<!-- Progress Metrics -->
			<div class="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
				<Card class="p-6">
					<h3 class="text-xl font-bold text-gray-800 mb-4">Learning Progress</h3>
					<div class="space-y-4">
						<div>
							<div class="flex justify-between text-sm mb-1">
								<span>Completion Rate</span>
								<span>{progress.completionRate}%</span>
							</div>
							<div class="w-full bg-gray-200 rounded-full h-2">
								<div class="bg-orange-500 h-2 rounded-full" style="width: {progress.completionRate}%"></div>
							</div>
						</div>
						<div>
							<div class="flex justify-between text-sm mb-1">
								<span>Studied Decks</span>
								<span>{progress.studiedDecks} / {progress.totalDecks}</span>
							</div>
							<div class="w-full bg-gray-200 rounded-full h-2">
								<div class="bg-blue-500 h-2 rounded-full" style="width: {progress.totalDecks > 0 ? (progress.studiedDecks / progress.totalDecks) * 100 : 0}%"></div>
							</div>
						</div>
					</div>
				</Card>

				<Card class="p-6">
					<h3 class="text-xl font-bold text-gray-800 mb-4">Performance Stats</h3>
					<div class="space-y-4">
						<div class="flex justify-between">
							<span class="text-gray-600">Correct Answers:</span>
							<span class="font-bold text-green-600">{progress.totalCorrect}</span>
						</div>
						<div class="flex justify-between">
							<span class="text-gray-600">Incorrect Answers:</span>
							<span class="font-bold text-red-600">{progress.totalReviews - progress.totalCorrect}</span>
						</div>
						<div class="flex justify-between">
							<span class="text-gray-600">Success Rate:</span>
							<span class="font-bold text-blue-600">{progress.accuracy}%</span>
						</div>
					</div>
				</Card>
			</div>

			<!-- Recent Activity -->
			{#if progress.recentActivity && progress.recentActivity.length > 0}
				<Card class="p-6">
					<h3 class="text-xl font-bold text-gray-800 mb-6">Recent Activity</h3>
					<div class="space-y-4">
						{#each progress.recentActivity as activity}
							<div class="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
								<div>
									<div class="font-semibold text-gray-800">{activity.title}</div>
									<div class="text-sm text-gray-600">
										Last studied: {new Date(activity.lastStudied).toLocaleDateString()}
									</div>
								</div>
								<div class="text-right">
									<div class="font-bold text-gray-800">{activity.reviews}</div>
									<div class="text-sm text-gray-600">reviews</div>
								</div>
							</div>
						{/each}
					</div>
				</Card>
			{/if}

			<!-- Call to Action -->
			<div class="text-center mt-12">
				<Button href="/study-decks" color="orange" size="lg" class="bg-orange-500 hover:bg-orange-600 text-white font-semibold px-8 py-3 rounded-lg shadow-lg transition-all duration-200 transform hover:scale-105">
					Continue Studying
				</Button>
			</div>
		{:else}
			<div class="text-center py-12">
				<div class="text-6xl mb-4">📈</div>
				<Heading tag="h2" class="text-2xl font-bold text-gray-800 mb-2">
					No Progress Data Yet
				</Heading>
				<P class="text-gray-600 mb-6">
					Start studying your flashcards to see your progress here
				</P>
				<Button href="/study-decks" color="orange" size="lg" class="bg-orange-500 hover:bg-orange-600 text-white font-semibold px-8 py-3 rounded-lg shadow-lg transition-all duration-200 transform hover:scale-105">
					Start Studying
				</Button>
			</div>
		{/if}
	</div>
</div> 