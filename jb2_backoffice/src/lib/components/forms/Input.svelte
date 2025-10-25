<script lang="ts">
	/**
	 * JB SQUARE Input Component v2.0
	 * BLACK/WHITE / ZERO-ROUND / INDUSTRIAL
	 * Enhanced with Prefix/Suffix, Clear button, Icons
	 *
	 * Features:
	 * - Prefix/Suffix support (icons, text)
	 * - Clear button (X icon)
	 * - Password toggle
	 * - Character counter
	 * - Improved animations
	 *
	 * Usage:
	 * <Input label="Email" type="email" bind:value={email} />
	 * <Input prefix="$" placeholder="0.00" />
	 * <Input suffix="kg" />
	 * <Input type="search" clearable />
	 * <Input type="password" showPasswordToggle />
	 */

	interface InputProps {
		type?: 'text' | 'email' | 'password' | 'number' | 'search' | 'tel' | 'url';
		value?: string;
		placeholder?: string;
		label?: string;
		hint?: string;
		error?: string;
		disabled?: boolean;
		readonly?: boolean;
		required?: boolean;
		fullWidth?: boolean;
		size?: 'sm' | 'md' | 'lg';
		prefix?: string;
		suffix?: string;
		clearable?: boolean;
		showPasswordToggle?: boolean;
		maxLength?: number;
		showCounter?: boolean;
		id?: string;
		name?: string;
		class?: string;
	}

	let {
		type = 'text',
		value = $bindable(''),
		placeholder = '',
		label = '',
		hint = '',
		error = '',
		disabled = false,
		readonly = false,
		required = false,
		fullWidth = false,
		size = 'md',
		prefix,
		suffix,
		clearable = false,
		showPasswordToggle = false,
		maxLength,
		showCounter = false,
		id = `input-${Math.random().toString(36).substring(2, 9)}`,
		name = '',
		class: className = ''
	}: InputProps = $props();

	let showPassword = $state(false);
	let isFocused = $state(false);

	const hasError = $derived(!!error);
	const hasValue = $derived(!!value);
	const canClear = $derived(clearable && hasValue && !disabled && !readonly);
	const currentType = $derived(type === 'password' && showPassword ? 'text' : type);
	const charCount = $derived(value?.length || 0);
	const showCount = $derived(showCounter && maxLength);

	const sizeClasses = {
		sm: 'input-sm',
		md: 'input-md',
		lg: 'input-lg'
	};

	function handleClear() {
		value = '';
	}

	function togglePasswordVisibility() {
		showPassword = !showPassword;
	}

	function handleFocus() {
		isFocused = true;
	}

	function handleBlur() {
		isFocused = false;
	}
</script>

<div class="input-wrapper {className}" class:full-width={fullWidth} class:focused={isFocused}>
	{#if label}
		<label for={id} class="input-label">
			{label}
			{#if required}
				<span class="required" aria-label="required">*</span>
			{/if}
		</label>
	{/if}

	<div
		class="input-container {sizeClasses[size]}"
		class:has-error={hasError}
		class:has-prefix={!!prefix}
		class:has-suffix={!!suffix || canClear || (type === 'password' && showPasswordToggle)}
		class:disabled
		class:focused={isFocused}
	>
		{#if prefix}
			<span class="input-affix input-prefix" aria-hidden="true">{prefix}</span>
		{/if}

		<input
			{id}
			type={currentType}
			{name}
			{placeholder}
			{disabled}
			{readonly}
			{required}
			{maxLength}
			bind:value
			onfocus={handleFocus}
			onblur={handleBlur}
			class="input"
			class:has-prefix={!!prefix}
			class:has-suffix={!!suffix || canClear || (type === 'password' && showPasswordToggle)}
			aria-invalid={hasError}
			aria-describedby={error ? `${id}-error` : hint ? `${id}-hint` : undefined}
		/>

		{#if canClear}
			<button
				type="button"
				class="input-action"
				onclick={handleClear}
				tabindex="-1"
				aria-label="Clear input"
			>
				✕
			</button>
		{/if}

		{#if type === 'password' && showPasswordToggle && !canClear}
			<button
				type="button"
				class="input-action"
				onclick={togglePasswordVisibility}
				tabindex="-1"
				aria-label={showPassword ? 'Hide password' : 'Show password'}
			>
				{showPassword ? '◉' : '○'}
			</button>
		{/if}

		{#if suffix && !canClear && !(type === 'password' && showPasswordToggle)}
			<span class="input-affix input-suffix" aria-hidden="true">{suffix}</span>
		{/if}
	</div>

	{#if hint && !error}
		<span id="{id}-hint" class="input-hint">{hint}</span>
	{/if}

	{#if error}
		<span id="{id}-error" class="input-error-text" role="alert">
			{error}
		</span>
	{/if}

	{#if showCount}
		<span class="input-counter" aria-live="polite">
			{charCount}/{maxLength}
		</span>
	{/if}
</div>

<style>
	/* ========================================
     INPUT WRAPPER
     ======================================== */

	.input-wrapper {
		display: inline-flex;
		flex-direction: column;
		gap: var(--space-2);
	}

	.input-wrapper.full-width {
		width: 100%;
	}

	/* ========================================
     LABEL
     ======================================== */

	.input-label {
		font-size: var(--text-sm);
		font-weight: var(--font-medium);
		color: var(--fg);
		display: block;
		letter-spacing: var(--tracking-normal);
	}

	.required {
		color: var(--muted);
		margin-left: var(--space-1);
	}

	/* ========================================
     INPUT CONTAINER
     ======================================== */

	.input-container {
		position: relative;
		display: flex;
		align-items: center;
		gap: var(--space-2);
		background-color: var(--bg);
		border: var(--border-width) solid var(--hair);
		transition: all var(--duration-fast) var(--ease-out-expo);
	}

	.input-container:hover:not(.disabled) {
		border-color: var(--muted);
	}

	.input-container.focused {
		border-color: var(--fg);
		outline: var(--focus-ring-width) solid var(--focus-black);
		outline-offset: 0;
	}

	.input-container.has-error {
		border-color: var(--color-error);
	}

	.input-container.disabled {
		cursor: not-allowed;
		opacity: 0.5;
		background-color: var(--ghost);
	}

	/* ========================================
     SIZES
     ======================================== */

	.input-sm {
		height: var(--input-height-sm);
		padding: 0 var(--space-3);
	}

	.input-md {
		height: var(--input-height-md);
		padding: 0 var(--space-3);
	}

	.input-lg {
		height: var(--input-height-lg);
		padding: 0 var(--space-4);
	}

	/* ========================================
     INPUT
     ======================================== */

	.input {
		flex: 1;
		min-width: 0;
		height: 100%;
		padding: 0;
		font-size: var(--text-base);
		color: var(--fg);
		background: transparent;
		border: none;
		outline: none;
		letter-spacing: var(--tracking-normal);
	}

	.input::placeholder {
		color: var(--subtle);
	}

	.input:disabled {
		cursor: not-allowed;
	}

	.input[readonly] {
		cursor: default;
	}

	/* ========================================
     AFFIX (PREFIX/SUFFIX)
     ======================================== */

	.input-affix {
		flex-shrink: 0;
		font-size: var(--text-sm);
		color: var(--muted);
		user-select: none;
	}

	/* ========================================
     ACTION BUTTONS
     ======================================== */

	.input-action {
		flex-shrink: 0;
		display: flex;
		align-items: center;
		justify-content: center;
		width: 20px;
		height: 20px;
		padding: 0;
		background: none;
		border: none;
		color: var(--muted);
		cursor: pointer;
		font-size: var(--text-sm);
		transition: color var(--duration-fast) var(--ease-out);
	}

	.input-action:hover {
		color: var(--fg);
	}

	.input-action:focus-visible {
		outline: var(--focus-ring-width) solid var(--focus-black);
		outline-offset: -2px;
	}

	/* ========================================
     HINT & ERROR
     ======================================== */

	.input-hint {
		font-size: var(--text-xs);
		color: var(--muted);
		display: block;
	}

	.input-error-text {
		font-size: var(--text-xs);
		color: var(--color-error);
		display: block;
	}

	/* ========================================
     COUNTER
     ======================================== */

	.input-counter {
		font-size: var(--text-xs);
		color: var(--subtle);
		text-align: right;
		font-variant-numeric: tabular-nums;
	}

	/* ========================================
     SPECIAL INPUT TYPES
     ======================================== */

	/* Remove spin buttons from number inputs */
	input[type='number']::-webkit-inner-spin-button,
	input[type='number']::-webkit-outer-spin-button {
		-webkit-appearance: none;
		margin: 0;
	}

	input[type='number'] {
		-moz-appearance: textfield;
	}

	/* ========================================
     ACCESSIBILITY
     ======================================== */

	/* Increase touch target on mobile */
	@media (hover: none) and (pointer: coarse) {
		.input-container {
			min-height: var(--touch-target-min);
		}
	}

	/* ========================================
     REDUCED MOTION
     ======================================== */

	@media (prefers-reduced-motion: reduce) {
		.input-container {
			transition: none;
		}
	}
</style>
