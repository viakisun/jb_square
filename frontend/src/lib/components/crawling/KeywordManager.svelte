<script lang="ts">
	/**
	 * JB SQUARE KeywordManager Component
	 * BLACK/WHITE / ZERO-ROUND / INDUSTRIAL
	 *
	 * 크롤러별 키워드 관리
	 */

	import { Button } from '$lib/components/ui/buttons';
	import { toast } from '$lib/stores/toast';

	interface KeywordManagerProps {
		sourceId: string;
		sourceName: string;
		onClose?: () => void;
		class?: string;
	}

	let {
		sourceId,
		sourceName,
		onClose,
		class: className = ''
	}: KeywordManagerProps = $props();

	let keywords = $state<string[]>([]);
	let newKeyword = $state('');
	let isLoading = $state(false);

	$effect(() => {
		loadKeywords();
	});

	async function loadKeywords() {
		isLoading = true;
		try {
			const response = await fetch(`http://localhost:8000/api/crawling/keywords/${sourceId}`);
			const data = await response.json();
			keywords = data.keywords || [];
		} catch (error) {
			console.error('Failed to load keywords:', error);
			toast.error('키워드를 불러오는데 실패했습니다.');
		} finally {
			isLoading = false;
		}
	}

	async function saveKeywords() {
		isLoading = true;
		try {
			const response = await fetch(`http://localhost:8000/api/crawling/keywords/${sourceId}`, {
				method: 'PUT',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify(keywords)
			});

			if (response.ok) {
				toast.success('키워드가 저장되었습니다.');
			} else {
				toast.error('키워드 저장에 실패했습니다.');
			}
		} catch (error) {
			console.error('Failed to save keywords:', error);
			toast.error('키워드 저장에 실패했습니다.');
		} finally {
			isLoading = false;
		}
	}

	function addKeyword() {
		const keyword = newKeyword.trim();
		if (!keyword) return;

		if (keywords.includes(keyword)) {
			toast.info('이미 추가된 키워드입니다.');
			return;
		}

		keywords = [...keywords, keyword];
		newKeyword = '';
	}

	function removeKeyword(keyword: string) {
		keywords = keywords.filter((k) => k !== keyword);
	}

	function handleKeyPress(event: KeyboardEvent) {
		if (event.key === 'Enter') {
			event.preventDefault();
			addKeyword();
		}
	}

	async function handleSaveAndClose() {
		await saveKeywords();
		onClose?.();
	}
</script>

<div class="keyword-manager {className}">
	<div class="manager-header">
		<h3 class="manager-title">{sourceName} 키워드 설정</h3>
		{#if onClose}
			<button class="close-button" onclick={onClose} aria-label="닫기">✕</button>
		{/if}
	</div>

	<div class="manager-body">
		<!-- Keyword Input -->
		<div class="keyword-input-group">
			<input
				type="text"
				class="keyword-input"
				placeholder="키워드 입력 (엔터로 추가)"
				bind:value={newKeyword}
				onkeypress={handleKeyPress}
				disabled={isLoading}
			/>
			<Button variant="outline" onclick={addKeyword} disabled={isLoading || !newKeyword.trim()}>
				추가
			</Button>
		</div>

		<!-- Keywords List -->
		<div class="keywords-list">
			{#if keywords.length === 0}
				<div class="empty-state">
					<span class="empty-icon">🔍</span>
					<p class="empty-message">등록된 키워드가 없습니다.</p>
					<p class="empty-hint">키워드를 추가하면 해당 키워드가 포함된 공고만 강조됩니다.</p>
				</div>
			{:else}
				<div class="keyword-tags">
					{#each keywords as keyword (keyword)}
						<div class="keyword-tag">
							<span class="keyword-text">{keyword}</span>
							<button
								class="keyword-remove"
								onclick={() => removeKeyword(keyword)}
								aria-label="키워드 삭제"
								disabled={isLoading}
							>
								✕
							</button>
						</div>
					{/each}
				</div>
			{/if}
		</div>

		<!-- Actions -->
		<div class="manager-actions">
			<Button variant="outline" onclick={onClose} disabled={isLoading}>취소</Button>
			<Button variant="primary" onclick={handleSaveAndClose} disabled={isLoading}>
				{isLoading ? '저장중...' : '저장'}
			</Button>
		</div>
	</div>
</div>

<style>
	/* ========================================
     KEYWORD MANAGER
     ======================================== */

	.keyword-manager {
		display: flex;
		flex-direction: column;
		background-color: var(--bg);
		border: var(--border-width) solid var(--hair);
		min-width: 500px;
		max-width: 600px;
	}

	/* ========================================
     MANAGER HEADER
     ======================================== */

	.manager-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: var(--space-5);
		border-bottom: var(--border-width) solid var(--hair);
	}

	.manager-title {
		font-size: var(--text-lg);
		font-weight: var(--font-semibold);
		color: var(--fg);
		letter-spacing: var(--tracking-tight);
		margin: 0;
	}

	.close-button {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 32px;
		height: 32px;
		padding: 0;
		background: none;
		border: var(--border-width) solid var(--hair);
		color: var(--fg);
		font-size: var(--text-lg);
		cursor: pointer;
		transition: all var(--duration-fast) var(--ease-out);
	}

	.close-button:hover {
		background-color: var(--surface-1);
		border-color: var(--muted);
	}

	/* ========================================
     MANAGER BODY
     ======================================== */

	.manager-body {
		padding: var(--space-6);
		display: flex;
		flex-direction: column;
		gap: var(--space-6);
	}

	/* ========================================
     KEYWORD INPUT
     ======================================== */

	.keyword-input-group {
		display: flex;
		gap: var(--space-3);
	}

	.keyword-input {
		flex: 1;
		padding: var(--space-3) var(--space-4);
		background-color: var(--bg);
		border: var(--border-width) solid var(--hair);
		color: var(--fg);
		font-size: var(--text-base);
		font-family: var(--font-sans);
		transition: border-color var(--duration-fast) var(--ease-out);
	}

	.keyword-input:focus {
		outline: none;
		border-color: var(--fg);
	}

	.keyword-input::placeholder {
		color: var(--muted);
	}

	.keyword-input:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	/* ========================================
     KEYWORDS LIST
     ======================================== */

	.keywords-list {
		min-height: 200px;
		padding: var(--space-4);
		border: var(--border-width) solid var(--hair);
		background-color: var(--surface-1);
	}

	.empty-state {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		height: 200px;
		gap: var(--space-3);
	}

	.empty-icon {
		font-size: var(--text-3xl);
	}

	.empty-message {
		font-size: var(--text-base);
		font-weight: var(--font-medium);
		color: var(--fg);
		margin: 0;
	}

	.empty-hint {
		font-size: var(--text-sm);
		color: var(--muted);
		text-align: center;
		max-width: 300px;
		margin: 0;
	}

	.keyword-tags {
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-2);
	}

	.keyword-tag {
		display: flex;
		align-items: center;
		gap: var(--space-2);
		padding: var(--space-2) var(--space-3);
		background-color: var(--bg);
		border: var(--border-width) solid var(--hair);
		transition: border-color var(--duration-fast) var(--ease-out);
	}

	.keyword-tag:hover {
		border-color: var(--muted);
	}

	.keyword-text {
		font-size: var(--text-sm);
		font-weight: var(--font-medium);
		color: var(--fg);
	}

	.keyword-remove {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 20px;
		height: 20px;
		padding: 0;
		background: none;
		border: none;
		color: var(--muted);
		font-size: var(--text-xs);
		cursor: pointer;
		transition: color var(--duration-fast) var(--ease-out);
	}

	.keyword-remove:hover {
		color: var(--fg);
	}

	.keyword-remove:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	/* ========================================
     MANAGER ACTIONS
     ======================================== */

	.manager-actions {
		display: flex;
		gap: var(--space-3);
		justify-content: flex-end;
		padding-top: var(--space-4);
		border-top: var(--border-width) solid var(--hair);
	}

	/* ========================================
     RESPONSIVE
     ======================================== */

	@media (max-width: 640px) {
		.keyword-manager {
			min-width: 100%;
		}

		.keyword-input-group {
			flex-direction: column;
		}
	}
</style>
