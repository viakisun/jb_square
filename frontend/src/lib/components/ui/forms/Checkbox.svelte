<script lang="ts">
	/**
	 * JB SQUARE Checkbox Component
	 * BLACK/WHITE / ZERO-ROUND / INDUSTRIAL
	 *
	 * Features:
	 * - Square checkbox (■ instead of ✓)
	 * - 1px hairline border
	 * - Black fill when checked
	 * - Accessible
	 *
	 * Usage:
	 * <Checkbox label="Remember me" bind:checked={rememberMe} />
	 * <Checkbox>Accept terms and conditions</Checkbox>
	 */

	interface CheckboxProps {
		checked?: boolean;
		label?: string;
		disabled?: boolean;
		id?: string;
		name?: string;
		value?: string;
		class?: string;
		children?: any;
	}

	let {
		checked = $bindable(false),
		label = '',
		disabled = false,
		id = `checkbox-${Math.random().toString(36).substring(2, 9)}`,
		name = '',
		value = '',
		class: className = '',
		children
	}: CheckboxProps = $props();

	const displayLabel = $derived(label || children);
</script>

<div class="checkbox-wrapper {className}">
	<input
		{id}
		{name}
		{value}
		{disabled}
		type="checkbox"
		bind:checked
		class="checkbox-input"
		aria-checked={checked}
	/>
	<label for={id} class="checkbox-label">
		<span class="checkbox-box" aria-hidden="true">
			{#if checked}
				<span class="checkbox-check">■</span>
			{/if}
		</span>
		{#if displayLabel}
			<span class="checkbox-text">
				{#if label}
					{label}
				{:else}
					{@render children?.()}
				{/if}
			</span>
		{/if}
	</label>
</div>

<style>
	/* ========================================
     CHECKBOX WRAPPER
     ======================================== */

	.checkbox-wrapper {
		display: inline-flex;
		align-items: flex-start;
	}

	/* ========================================
     HIDDEN INPUT
     ======================================== */

	.checkbox-input {
		position: absolute;
		width: 1px;
		height: 1px;
		padding: 0;
		margin: -1px;
		overflow: hidden;
		clip: rect(0, 0, 0, 0);
		white-space: nowrap;
		border-width: 0;
	}

	/* ========================================
     LABEL
     ======================================== */

	.checkbox-label {
		display: inline-flex;
		align-items: flex-start;
		gap: var(--space-2);
		cursor: pointer;
		user-select: none;
	}

	.checkbox-input:disabled + .checkbox-label {
		cursor: not-allowed;
		opacity: 0.5;
	}

	/* ========================================
     CHECKBOX BOX
     ======================================== */

	.checkbox-box {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 18px;
		height: 18px;
		border: var(--border-width) solid var(--hair);
		background-color: var(--bg);
		transition: all var(--duration-base) var(--ease-out);
		flex-shrink: 0;
		margin-top: 1px;
	}

	.checkbox-label:hover .checkbox-box {
		border-color: var(--muted);
	}

	.checkbox-input:checked + .checkbox-label .checkbox-box {
		background-color: var(--fg);
		border-color: var(--fg);
	}

	.checkbox-input:focus-visible + .checkbox-label .checkbox-box {
		outline: var(--focus-ring-width) solid var(--focus-black);
		outline-offset: 2px;
	}

	/* ========================================
     CHECK MARK
     ======================================== */

	.checkbox-check {
		color: var(--bg);
		font-size: 14px;
		line-height: 1;
	}

	/* ========================================
     TEXT
     ======================================== */

	.checkbox-text {
		font-size: var(--text-base);
		color: var(--fg);
		line-height: var(--leading-normal);
	}
</style>
