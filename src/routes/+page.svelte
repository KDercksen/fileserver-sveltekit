<script lang="ts">
	import { enhance } from '$app/forms';
	import Icon from '@iconify/svelte';
	import type { PageData } from './$types';

	let { data } = $props();

	let uploading = $state(false);

	function formatSize(bytes: number) {
		if (bytes === 0) return '0 Bytes';
		const k = 1024;
		const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
		const i = Math.floor(Math.log(bytes) / Math.log(k));
		return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
	}

	function copyLink(id: string) {
		const url = `${window.location.origin}/f/${id}`;
		navigator.clipboard.writeText(url);
		alert('Link copied to clipboard: ' + url);
	}
</script>

<div class="min-h-screen py-10 px-4 sm:px-6 lg:px-8">
	<div class="max-w-3xl mx-auto">
		<h1 class="text-3xl font-bold text-center text-gray-900 mb-8">avirai file server</h1>

		<!-- Upload Form -->
		<div class="bg-white shadow sm:rounded-lg p-6 mb-8">
			<form
				action="?/upload"
				method="POST"
				enctype="multipart/form-data"
				use:enhance={() => {
					uploading = true;
					return async ({ update }) => {
						await update();
						uploading = false;
					};
				}}
			>
				<div class="grid grid-cols-1 gap-y-6 sm:grid-cols-6 sm:gap-x-4">
					<div class="sm:col-span-4">
						<label for="file-upload" class="block text-sm font-medium text-gray-700 mb-2"
							>Upload a file</label
						>
						<input
							id="file-upload"
							name="file"
							type="file"
							required
							class="block w-full text-sm text-gray-500
                            file:mr-4 file:py-2 file:px-4
                            file:rounded-full file:border-0
                            file:text-sm file:font-semibold
                            file:bg-indigo-50 file:text-indigo-700
                            hover:file:bg-indigo-100
                        "
						/>
					</div>

					<div class="sm:col-span-2">
						<label for="expiresIn" class="block text-sm font-medium text-gray-700 mb-2"
							>Expires in</label
						>
						<select
							id="expiresIn"
							name="expiresIn"
							class="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
						>
							<option value="never">never</option>
							<option value="1h">1 hour</option>
							<option value="1d">1 day</option>
							<option value="1w">1 week</option>
							<option value="4w">1 month</option>
						</select>
					</div>
				</div>

				<div class="mt-4 flex justify-end">
					<button
						type="submit"
						disabled={uploading}
						class="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 cursor-pointer"
					>
						{uploading ? 'Uploading...' : 'Upload'}
					</button>
				</div>
			</form>
		</div>

		<!-- File List -->
		<div class="bg-white shadow overflow-hidden sm:rounded-md">
			<ul class="divide-y divide-gray-200">
				{#each data.files as file}
					<li class="px-4 py-4 sm:px-6 hover:bg-gray-50 flex items-center justify-between">
						<div class="min-w-0 flex-1">
							<h3 class="text-sm font-medium text-indigo-600 truncate">{file.originalName}</h3>
							<p class="text-sm text-gray-500">
								{formatSize(file.size)} • {new Date(file.createdAt).toLocaleString()}
								{#if file.expiresAt}
									<span class="ml-2 text-red-500 text-xs"
										>(Expires: {new Date(file.expiresAt).toLocaleString()})</span
									>
								{/if}
							</p>
						</div>
						<div class="ml-4 flex-shrink-0 flex justify-center items-center gap-2">
							<button
								onclick={() => copyLink(file.id)}
								class="text-gray-400 hover:text-gray-600 cursor-pointer"
								title="Share"
							>
								<Icon icon="mdi:share-variant" width="24" height="24" />
							</button>
							<form action="?/delete" method="POST" use:enhance>
								<input type="hidden" name="id" value={file.id} />
								<button
									type="submit"
									class="text-red-400 hover:text-red-600 cursor-pointer"
									title="Delete"
									onclick={(e) =>
										!confirm('Are you sure you want to delete this file?') && e.preventDefault()}
								>
									<Icon icon="mdi:delete" width="24" height="24" />
								</button>
							</form>
						</div>
					</li>
				{/each}
				{#if data.files.length === 0}
					<li class="px-4 py-8 text-center text-gray-500">No files uploaded yet.</li>
				{/if}
			</ul>
		</div>
	</div>
</div>
