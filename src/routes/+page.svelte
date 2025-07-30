<!-- /Users/dwait/Documents/Coding/Shipwrecked/FlashLearn/src/routes/+page.svelte -->
<script lang="ts">
	import { Heading, P, Button, Card } from 'flowbite-svelte';
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';

	let user: any = null;

	onMount(() => {
		// Check if user is logged in
		const storedUser = localStorage.getItem('user') || sessionStorage.getItem('user');
		if (storedUser) {
			try {
				user = JSON.parse(storedUser);
			} catch (error) {
				// Invalid stored user data, clear it
				localStorage.removeItem('user');
				sessionStorage.removeItem('user');
			}
		}
	});

	function logout() {
		localStorage.removeItem('user');
		sessionStorage.removeItem('user');
		user = null;
		// Refresh the page to update the UI
		window.location.reload();
	}

	function handleGetStarted() {
		if (user) {
			goto('/dashboard');
		} else {
			goto('/signup');
		}
	}
</script>

<style>
    .header-gradient {
        max-width: 1200px;
        align-items: center;
        margin-top: 20px;
    }
</style>

<!-- Navigation Header -->
<div class="flex justify-between items-center px-6 py-4 bg-white shadow-sm">
	<div class="text-2xl font-bold text-gray-800">FlashLearn</div>
	<div class="flex gap-4">
		{#if user}
			<span class="text-gray-600">Welcome, {user.fullname}</span>
			<button on:click={logout} class="bg-gray-500 hover:bg-gray-600 text-white font-semibold px-4 py-2 rounded-lg shadow-md transition-all duration-200 transform hover:scale-105 text-sm">Logout</button>
		{:else}
			<Button href="/login" color="gray" size="sm" class="bg-gray-500 hover:bg-gray-600 text-white font-semibold px-4 py-2 rounded-lg shadow-md transition-all duration-200 transform hover:scale-105">Login</Button>
			<Button href="/signup" color="orange" size="sm" class="bg-orange-500 hover:bg-orange-600 text-white font-semibold px-4 py-2 rounded-lg shadow-md transition-all duration-200 transform hover:scale-105">Sign Up</Button>
		{/if}
	</div>
</div>

<div class="header-gradient mx-auto text-center bg-gradient-to-b from-cyan-100 to-blue-300 shadow-md p-8 mb-8 rounded-xl">
	<Heading
		tag="h1"
		class="mb-4 text-center text-4xl font-extrabold md:text-5xl lg:text-6xl"
		>FlashLearn</Heading
	>
	<P class="mb-6 text-center text-lg sm:px-16 lg:text-xl xl:px-48 dark:text-gray-400"
		>Master Any Subject with Smart Flashcards and Spaced Repetition</P
	>
	<button on:click={handleGetStarted} class="bg-orange-500 hover:bg-orange-600 text-white font-semibold px-8 py-3 rounded-lg shadow-lg transition-all duration-200 transform hover:scale-105 whitespace-nowrap text-lg">
		{user ? 'Go to Dashboard' : 'Get Started'} →
	</button>
</div>

<div class="services flex flex-col justify-content-center items-center py-12">
    <Heading tag="h2" class="text-3xl font-semibold text-gray-800 text-center mb-4">
        Why Choose FlashLearn?
    </Heading>
    <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        <Card class="p-6 shadow-lg rounded-lg border border-gray-200 bg-white hover:shadow-xl transition">
            <h3 class="text-xl font-bold text-primary-600 mb-4">Simple & Clean</h3>
            <p class="text-gray-600">
                Focus on what matters most - learning. Our clean, distraction-free interface keeps you engaged without complexity.
            </p>
        </Card>
        <Card class="p-6 shadow-lg rounded-lg border border-gray-200 bg-white hover:shadow-xl transition">
            <h3 class="text-xl font-bold text-primary-600 mb-4">Create Custom Decks</h3>
            <p class="text-gray-600">
                Build personalized flashcard decks for any subject - from languages to science, history to math.
            </p>
        </Card>
        <Card class="p-6 shadow-lg rounded-lg border border-gray-200 bg-white hover:shadow-xl transition">
            <h3 class="text-xl font-bold text-primary-600 mb-4">Track Your Progress</h3>
            <p class="text-gray-600">
                Monitor your learning journey with detailed analytics and see your knowledge grow over time.
            </p>
        </Card>
    </div>
</div>