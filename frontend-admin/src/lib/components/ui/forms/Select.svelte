<script lang="ts">
	/**
	 * JB SQUARE Select Component
	 * BLACK/WHITE / ZERO-ROUND / INDUSTRIAL
	 *
	 * Features:
	 * - 1px hairline border
	 * - Square dropdown
	 * - Custom arrow (▼)
	 * - Accessible
	 *
	 * Usage:
	 * <Select label="Category" options={[{value: '1', label: 'Option 1'}]} bind:value={selected} />
	 */

	interface SelectOption {
		value: string;
		label: string;
		disabled?: boolean;
	}

	interface SelectProps {
		value?: string;
		options: SelectOption[];
		placeholder?: string;
		label?: string;
		error?: string;
		disabled?: boolean;
		required?: boolean;
		fullWidth?: boolean;
		id?: string;
		name?: string;
		class?: string;
	}

	let {
		value = $bindable(''),
		options = [],
		placeholder = 'Select an option',
		label = '',
		error = '',
		disabled = false,
		required = false,
		fullWidth = false,
		id = `select-${Math.random().toString(36).substring(2, 9)}`,
		name = '',
		class: className = ''
	}: SelectProps = $props();

	const wrapperClass = fullWidth ? 'w-full' : '';
	const selectClass = fullWidth ? 'w-full' : '';
	const hasError = $derived(!!error);
</script>

<div class="select-wrapper {wrapperClass} {className}">
	{#if label}
		<label for={id} class="select-label">
			{label}
			{#if required}
				<span class="text-muted" aria-label="required">*</span>
			{/if}
		</label>
	{/if}

	<div class="select-container">
		<select
			{id}
			{name}
			{disabled}
			{required}
			bind:value
			class="select {selectClass}"
			class:select-error={hasError}
			aria-invalid={hasError}
			aria-describedby={error ? `${id}-error` : undefined}
		>
			{#if placeholder}
				<option value="" disabled selected>{placeholder}</option>
			{/if}
			{#each options as option}
				<option value={option.value} disabled={option.disabled}>
					{option.label}
				</option>
			{/each}
		</select>
		<span class="select-arrow" aria-hidden="true">▼</span>
	</div>

	{#if error}
		<span id="{id}-error" class="select-error-text" role="alert">
			{error}
		</span>
	{/if}
</div>

<style>
	/* ========================================
     SELECT WRAPPER
     ======================================== */

	.select-wrapper {
		display: flex;
		flex-direction: column;
		gap: var(--space-2);
	}

	/* ========================================
     LABEL
     ======================================== */

	.select-label {
		font-size: var(--text-sm);
		font-weight: var(--font-medium);
		color: var(--fg);
		display: block;
	}

	/* ========================================
     SELECT CONTAINER
     ======================================== */

	.select-container {
		position: relative;
		display: inline-block;
	}

	/* ========================================
     SELECT
     ======================================== */

	.select {
		height: 40px;
		padding: 0 var(--space-8) 0 var(--space-3);
		font-size: var(--text-base);
		color: var(--fg);
		background-color: var(--bg);
		border: var(--border-width) solid var(--hair);
		outline: none;
		cursor: pointer;
		appearance: none;
		-webkit-appearance: none;
		-moz-appearance: none;
		transition: border-color var(--duration-base) var(--ease-out);
	}

	.select:hover:not(:disabled):not(:focus) {
		border-color: var(--muted);
	}

	.select:focus {
		border-color: var(--fg);
		outline: var(--focus-ring-width) solid var(--focus-black);
		outline-offset: 0;
	}

	.select:disabled {
		cursor: not-allowed;
		opacity: 0.5;
		background-color: var(--ghost);
	}

	/* ========================================
     ARROW
     ======================================== */

	.select-arrow {
		position: absolute;
		right: var(--space-3);
		top: 50%;
		transform: translateY(-50%);
		font-size: var(--text-xs);
		color: var(--fg);
		pointer-events: none;
	}

	.select:disabled + .select-arrow {
		opacity: 0.5;
	}

	/* ========================================
     ERROR STATE
     ======================================== */

	.select-error {
		border-color: var(--fg);
	}

	.select-error-text {
		font-size: var(--text-xs);
		color: var(--fg);
		display: block;
	}
</style>
