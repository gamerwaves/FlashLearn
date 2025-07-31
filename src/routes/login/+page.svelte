<!-- /Users/dwait/Documents/Coding/Shipwrecked/FlashLearn/src/routes/login/+page.svelte -->
<script lang="ts">
	import { Heading, P, Button, Card, Label, Input } from 'flowbite-svelte';
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';

	let email = '';
	let password = '';
	let rememberMe = false;
	let loading = false;
	let error = '';
	let success = '';
	let user: any = null;

	onMount(() => {
		// Check if user is already logged in
		const storedUser = localStorage.getItem('user') || sessionStorage.getItem('user');
		if (storedUser) {
			try {
				user = JSON.parse(storedUser);
				// Redirect to dashboard if already logged in
				goto('/dashboard');
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
		window.location.reload();
	}

	async function handleLogin() {
		// Reset messages
		error = '';
		success = '';

		// Validate form
		if (!email || !password) {
			error = 'Email and password are required';
			return;
		}

		// Email validation
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		if (!emailRegex.test(email)) {
			error = 'Please enter a valid email address';
			return;
		}

		loading = true;

		try {
			const response = await fetch('/api/login', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					email,
					password
				})
			});

			const data = await response.json();

			if (response.ok) {
				success = 'Login successful! Redirecting to dashboard...';
				
				// Store user data in localStorage if remember me is checked
				if (rememberMe) {
					localStorage.setItem('user', JSON.stringify(data.user));
				} else {
					sessionStorage.setItem('user', JSON.stringify(data.user));
				}
				
				// Clear form
				email = '';
				password = '';
				
				// Redirect to dashboard after 2 seconds
				setTimeout(() => {
					goto('/dashboard');
				}, 2000);
			} else {
				error = data.error || 'Login failed';
			}
		} catch (err) {
			error = 'Network error. Please try again.';
		} finally {
			loading = false;
		}
	}
</script>

<!-- Navigation Header -->
<div class="flex justify-between items-center px-6 py-4 bg-white shadow-sm">
	<div class="text-2xl font-bold text-gray-800">FlashLearn</div>
	<div class="flex gap-4">
		{#if user}
			<span class="text-gray-600">Welcome, {user.fullname}</span>
			<Button href="/dashboard" color="gray" size="sm" class="bg-gray-500 hover:bg-gray-600 text-white font-semibold px-4 py-2 rounded-lg shadow-md transition-all duration-200 transform hover:scale-105">Dashboard</Button>
		{:else}
			<Button href="/login" color="gray" size="sm" class="bg-gray-500 hover:bg-gray-600 text-white font-semibold px-4 py-2 rounded-lg shadow-md transition-all duration-200 transform hover:scale-105">Login</Button>
			<Button href="/signup" color="orange" size="sm" class="bg-orange-500 hover:bg-orange-600 text-white font-semibold px-4 py-2 rounded-lg shadow-md transition-all duration-200 transform hover:scale-105">Sign Up</Button>
		{/if}
	</div>
</div>

<div class="min-h-screen bg-gradient-to-b from-cyan-100 to-blue-300 py-12 px-4">
	<div class="max-w-md mx-auto">
		<Card class="p-8 shadow-xl">
			<div class="text-center mb-8">
				<Heading tag="h1" class="text-3xl font-bold text-gray-800 mb-2">
					Welcome Back
				</Heading>
				<P class="text-gray-600">
					Sign in to continue your learning journey
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

			<form on:submit|preventDefault={handleLogin} class="space-y-6">
				<div>
					<Label for="email" class="text-gray-700 font-medium">Email Address</Label>
					<Input 
						id="email" 
						type="email" 
						placeholder="Enter your email" 
						class="mt-1"
						bind:value={email}
						required
					/>
				</div>

				<div>
					<Label for="password" class="text-gray-700 font-medium">Password</Label>
					<Input 
						id="password" 
						type="password" 
						placeholder="Enter your password" 
						class="mt-1"
						bind:value={password}
						required
					/>
				</div>

				<div class="flex items-center justify-between">
					<label class="flex items-center">
						<input 
							type="checkbox" 
							class="rounded border-gray-300 text-orange-500 focus:ring-orange-500"
							bind:checked={rememberMe}
						/>
						<span class="ml-2 text-sm text-gray-600">Remember me</span>
					</label>
					<a href="/forgot-password" class="text-sm text-orange-500 hover:text-orange-600 font-medium">
						Forgot password?
					</a>
				</div>

				<Button 
					type="submit" 
					color="orange" 
					size="lg" 
					class="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 rounded-lg shadow-lg transition-all duration-200 transform hover:scale-105"
					disabled={loading}
				>
					{loading ? 'Signing In...' : 'Sign In'}
				</Button>
			</form>

			<div class="mt-6 text-center">
				<P class="text-gray-600">
					Don't have an account? 
					<a href="/signup" class="text-orange-500 hover:text-orange-600 font-semibold">Sign up here</a>
				</P>
			</div>
		</Card>
	</div>
</div>