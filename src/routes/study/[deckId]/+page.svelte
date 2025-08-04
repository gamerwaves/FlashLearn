<!-- /Users/dwait/Documents/Coding/Shipwrecked/FlashLearn/src/routes/study/[deckId]/+page.svelte -->
<script lang="ts">
	import { Heading, P, Button, Card, Modal } from 'flowbite-svelte';
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';

	let user: any = null;
	let deck: any = null;
	let currentCardIndex = 0;
	let showAnswer = false;
	let loading = true;
	let error = '';
	let studyComplete = false;
	let studyStats = {
		correct: 0,
		incorrect: 0,
		total: 0
	};

	// Gamification state
	let showLevelUpModal = false;
	let currentLevel = 1;
	let showAchievementModal = false;
	let latestAchievement: any = null;

	$: deckId = $page.params.deckId;

	onMount(async () => {
		const storedUser = localStorage.getItem('user') || sessionStorage.getItem('user');
		if (!storedUser) {
			goto('/login');
			return;
		}
		try {
			user = JSON.parse(storedUser);
			await loadDeck();
		} catch (error) {
			goto('/login');
		}

		// Set up event listeners for gamification
		document.addEventListener('levelUp', handleLevelUp);
		document.addEventListener('achievement', handleAchievement);

		return () => {
			document.removeEventListener('levelUp', handleLevelUp);
			document.removeEventListener('achievement', handleAchievement);
		};
	});

	function handleLevelUp(event: any) {
		currentLevel = event.detail.level;
		showLevelUpModal = true;
		setTimeout(() => {
			showLevelUpModal = false;
		}, 3000);
	}

	function handleAchievement(event: any) {
		latestAchievement = event.detail;
		showAchievementModal = true;
		setTimeout(() => {
			showAchievementModal = false;
		}, 3000);
	}

	function showCardAnswer() {
		showAnswer = true;
	}

	async function loadDeck() {
		try {
			const response = await fetch(`/api/study?deckId=${deckId}`);
			const data = await response.json();
			if (response.ok) {
				deck = data.deck;
				studyStats.total = deck.cards.length;
			} else {
				error = data.error || 'Failed to load deck';
			}
		} catch (err) {
			error = 'Network error. Please try again.';
		} finally {
			loading = false;
		}
	}

	async function answerCard(isCorrect: boolean) {
		if (!deck || currentCardIndex >= deck.cards.length) return;
		const cardId = Number(deck.cards[currentCardIndex].id);
		try {
			// Save the study progress
			await fetch('/api/study', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					deckId: deck._id,
					cardId,
					isCorrect
				})
			});

			// Record study session for gamification
			try {
				const response = await fetch('/api/gamification/record-session', {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({
						userId: user._id,
						cardsStudied: 1,
						correctAnswers: isCorrect ? 1 : 0
					})
				});

				if (response.ok) {
					const result = await response.json();
					
					// Show level up notification if applicable
					if (result.levelUp) {
						const event = new CustomEvent('levelUp', { 
							detail: { level: result.progress.level } 
						});
						document.dispatchEvent(event);
					}

					// Show achievement notifications
					if (result.newAchievements && result.newAchievements.length > 0) {
						result.newAchievements.forEach((achievement: any) => {
							const event = new CustomEvent('achievement', { 
								detail: achievement 
							});
							document.dispatchEvent(event);
						});
					}
				}
			} catch (error) {
				console.error('Error recording study session:', error);
			}

			// Update study stats
			if (isCorrect) {
				studyStats.correct++;
			} else {
				studyStats.incorrect++;
			}

			// Move to next card or complete session
			if (currentCardIndex < deck.cards.length - 1) {
				currentCardIndex++;
				showAnswer = false;
			} else {
				studyComplete = true;
			}
		} catch (err) {
			error = 'Failed to save progress';
		}
	}

	function restartStudy() {
		currentCardIndex = 0;
		showAnswer = false;
		studyComplete = false;
		studyStats = {
			correct: 0,
			incorrect: 0,
			total: deck.cards.length
		};
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

<!-- Level Up Modal -->
<Modal bind:open={showLevelUpModal} class="z-50">
  <div class="text-center p-8">
    <div class="mx-auto flex items-center justify-center h-24 w-24 rounded-full bg-blue-100 mb-4">
      <span class="text-4xl">🎉</span>
    </div>
    <h3 class="text-2xl font-bold text-gray-900 mb-2">Level Up!</h3>
    <p class="text-gray-600 mb-6">You've reached level <span class="font-bold text-blue-600">{currentLevel}</span>!</p>
    <div class="flex justify-center">
      <Button color="blue" on:click={() => showLevelUpModal = false} class="px-6">Awesome!</Button>
    </div>
  </div>
</Modal>

<!-- Achievement Unlocked Modal -->
<Modal bind:open={showAchievementModal} class="z-50">
  <div class="text-center p-8">
    <div class="mx-auto flex items-center justify-center h-24 w-24 rounded-full bg-yellow-100 mb-4">
      <span class="text-4xl">{latestAchievement?.icon || '🏆'}</span>
    </div>
    <h3 class="text-2xl font-bold text-gray-900 mb-2">Achievement Unlocked!</h3>
    <p class="text-xl font-semibold text-yellow-600 mb-2">{latestAchievement?.name || 'New Achievement'}</p>
    <p class="text-gray-600 mb-6">{latestAchievement?.description || 'You earned a new achievement!'}</p>
    <div class="bg-yellow-50 text-yellow-800 text-sm p-3 rounded-lg mb-6">
      +{latestAchievement?.xpReward || 0} XP
    </div>
    <div class="flex justify-center">
      <Button color="yellow" on:click={() => showAchievementModal = false} class="px-6">Got it!</Button>
    </div>
  </div>
</Modal>

<div class="min-h-screen bg-gradient-to-b from-cyan-100 to-blue-300 py-12 px-4">
	<div class="max-w-4xl mx-auto">
		{#if loading}
			<div class="text-center py-12">
				<div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
				<p class="mt-4 text-gray-600">Loading deck...</p>
			</div>
		{:else if error}
			<div class="text-center py-12">
				<div class="text-6xl mb-4">❌</div>
				<Heading tag="h1" class="text-2xl font-bold text-gray-800 mb-2">
					Error Loading Deck
				</Heading>
				<P class="text-gray-600 mb-6">{error}</P>
				<Button href="/study-decks" color="orange" size="lg" class="bg-orange-500 hover:bg-orange-600 text-white">
					Back to Decks
				</Button>
			</div>
		{:else if studyComplete}
			<div class="text-center py-12">
				<div class="text-6xl mb-4">🎉</div>
				<Heading tag="h1" class="text-3xl font-bold text-gray-800 mb-4">
					Study Session Complete!
				</Heading>
				<P class="text-xl text-gray-600 mb-8">
					You've completed studying "{deck.title}"
				</P>
				<Card class="max-w-md mx-auto p-6 mb-8">
					<h3 class="text-xl font-bold text-gray-800 mb-4">Session Results</h3>
					<div class="grid grid-cols-2 gap-4 mb-4">
						<div class="text-center">
							<div class="text-2xl font-bold text-green-600">{studyStats.correct}</div>
							<div class="text-gray-600">Correct</div>
						</div>
						<div class="text-center">
							<div class="text-2xl font-bold text-red-600">{studyStats.incorrect}</div>
							<div class="text-gray-600">Incorrect</div>
						</div>
					</div>
					<div class="text-center">
						<div class="text-2xl font-bold text-blue-600">
							{Math.round((studyStats.correct / studyStats.total) * 100)}%
						</div>
						<div class="text-gray-600">Accuracy</div>
					</div>
				</Card>
				<div class="flex gap-4 justify-center">
					<Button onclick={restartStudy} color="orange" size="lg" class="bg-orange-500 hover:bg-orange-600 text-white">
						Study Again
					</Button>
					<Button href="/study-decks" color="gray" size="lg" class="bg-gray-500 hover:bg-gray-600 text-white">
						Back to Decks
					</Button>
				</div>
			</div>
		{:else if deck}
			<div class="text-center mb-8">
				<Heading tag="h1" class="text-3xl font-bold text-gray-800 mb-2">
					{deck.title}
				</Heading>
				<P class="text-gray-600">
					Card {currentCardIndex + 1} of {deck.cards.length}
				</P>
			</div>
			<!-- Progress Bar -->
			<div class="mb-8">
				<div class="w-full bg-gray-200 rounded-full h-2 mb-2">
					<div class="bg-orange-500 h-2 rounded-full" style="width: {(currentCardIndex / deck.cards.length) * 100}%"></div>
				</div>
				<div class="flex justify-between text-sm text-gray-600">
					<span>Progress</span>
					<span>{Math.round((currentCardIndex / deck.cards.length) * 100)}%</span>
				</div>
			</div>
			<!-- Study Stats -->
			<div class="flex justify-center mb-8">
				<div class="flex gap-8">
					<div class="text-center">
						<div class="text-xl font-bold text-green-600">{studyStats.correct}</div>
						<div class="text-sm text-gray-600">Correct</div>
					</div>
					<div class="text-center">
						<div class="text-xl font-bold text-red-600">{studyStats.incorrect}</div>
						<div class="text-sm text-gray-600">Incorrect</div>
					</div>
				</div>
			</div>
			<!-- Flashcard -->
			<Card class="max-w-2xl mx-auto p-8 shadow-xl">
				<div class="text-center">
					{#if !showAnswer}
						<!-- Front of card -->
						<div class="mb-8">
							<h3 class="text-lg font-medium text-gray-600 mb-4">Question</h3>
							<div class="text-2xl font-bold text-gray-800 min-h-[100px] flex items-center justify-center">
								{deck.cards[currentCardIndex].front}
							</div>
						</div>
						<Button onclick={showCardAnswer} class="bg-blue-500 hover:bg-blue-600 text-white font-semibold px-8 py-3 rounded-lg shadow-lg transition-all duration-200 transform hover:scale-105 text-lg">
							Show Answer
						</Button>
					{:else}
						<!-- Back of card -->
						<div class="mb-8">
							<h3 class="text-lg font-medium text-gray-600 mb-4">Answer</h3>
							<div class="text-2xl font-bold text-gray-800 min-h-[100px] flex items-center justify-center">
								{deck.cards[currentCardIndex].back}
							</div>
						</div>
						<div class="flex gap-4 justify-center">
							<Button onclick={() => answerCard(false)} class="bg-red-500 hover:bg-red-600 text-white font-semibold px-8 py-3 rounded-lg shadow-lg transition-all duration-200 transform hover:scale-105 text-lg">
								❌ Incorrect
							</Button>
							<Button onclick={() => answerCard(true)} class="bg-green-500 hover:bg-green-600 text-white font-semibold px-8 py-3 rounded-lg shadow-lg transition-all duration-200 transform hover:scale-105 text-lg">
								✅ Correct
							</Button>
						</div>
					{/if}
				</div>
			</Card>
			<div class="text-center mt-8">
				<Button href="/study-decks" color="gray" size="sm" class="bg-gray-500 hover:bg-gray-600 text-white">
					Exit Study Session
				</Button>
			</div>
		{/if}
	</div>
</div> 