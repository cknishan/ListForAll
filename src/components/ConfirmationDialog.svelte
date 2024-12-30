<script lang="ts">
	export let show = false; // Control visibility of the dialog
	export let message = 'Are you sure?'; // Customizable confirmation message
	export let onConfirm: () => void; // Function to call when confirmed
	export let onCancel: () => void; // Function to call when canceled

	const handleConfirm = () => {
		onConfirm();
		show = false; // Hide dialog after confirmation
	};

	const handleCancel = () => {
		onCancel();
		show = false; // Hide dialog after cancellation
	};
</script>

{#if show}
	<div class="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50">
		<div class="bg-white rounded shadow-lg p-6 w-96">
			<p class="text-lg text-gray-700">{message}</p>
			<div class="mt-4 flex justify-end space-x-4">
				<button
					class="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400"
					on:click={handleCancel}
				>
					Cancel
				</button>
				<button
					class="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
					on:click={handleConfirm}
				>
					Confirm
				</button>
			</div>
		</div>
	</div>
{/if}
