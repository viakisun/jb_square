# Composables Usage Examples

This document provides practical examples of how to use the composables in your Svelte 5 components.

## Example 1: Using useCrawlWebSocket in a Page

```svelte
<script lang="ts">
  import { onMount } from 'svelte';
  import { useCrawlWebSocket } from '$lib/composables';
  import { WS_BASE_URL } from '$lib/config/api';
  import { CrawlingStatus } from '$lib/components/crawling';

  let queueItems = $state([]);

  // Initialize the WebSocket composable
  const crawlWS = useCrawlWebSocket();

  async function startCrawling() {
    const wsUrl = `${WS_BASE_URL}/api/notices/crawl/bizinfo`;

    crawlWS.connect(
      wsUrl,
      // Callback when new item is added
      (item) => {
        queueItems = [item, ...queueItems];
      },
      // Callback when crawling completes
      () => {
        console.log('Crawling completed!');
        loadQueue();
      }
    );
  }

  async function loadQueue() {
    // Load queue data...
  }
</script>

{#if crawlWS.status !== 'idle'}
  <div class="crawl-status">
    <CrawlingStatus
      status={crawlWS.status === 'collecting' || crawlWS.status === 'processing'
        ? 'running'
        : crawlWS.status}
      progress={crawlWS.progress.progress}
      total={crawlWS.progress.total}
      success={crawlWS.progress.success}
      failed={crawlWS.progress.failed}
      logs={crawlWS.logs}
      errorMessage={crawlWS.errorMessage}
    />

    {#if crawlWS.status === 'collecting'}
      <p>Page {crawlWS.pageProgress.page} | Accumulated: {crawlWS.pageProgress.accumulated}</p>
    {/if}
  </div>
{/if}

<button onclick={startCrawling} disabled={crawlWS.loading}>
  {crawlWS.loading ? 'Crawling...' : 'Start Crawling'}
</button>
```

---

## Example 2: Using useSelection in a Table Component

```svelte
<script lang="ts">
  import { useSelection } from '$lib/composables';
  import type { SelectableItem } from '$lib/composables';

  type QueueItem = SelectableItem & {
    title: string;
    deadline: string;
    organization: string;
  };

  type Props = {
    items: QueueItem[];
    onSelectionChange?: (ids: number[]) => void;
  };

  let { items, onSelectionChange }: Props = $props();

  // Initialize selection composable
  const selection = useSelection<QueueItem>();

  // Watch for selection changes
  $effect(() => {
    if (onSelectionChange) {
      onSelectionChange(Array.from(selection.selectedIds));
    }
  });
</script>

<div class="table-header">
  <p>{selection.selectedCount} items selected</p>
  {#if selection.selectedCount > 0}
    <button onclick={() => selection.clearSelection()}>
      Clear Selection
    </button>
  {/if}
</div>

<table>
  <thead>
    <tr>
      <th>
        <input
          type="checkbox"
          checked={selection.allSelected}
          onchange={() => selection.toggleAll(items)}
        />
      </th>
      <th>Title</th>
      <th>Deadline</th>
    </tr>
  </thead>
  <tbody>
    {#each items as item}
      <tr class:selected={selection.isSelected(item.id)}>
        <td>
          <input
            type="checkbox"
            checked={selection.isSelected(item.id)}
            onchange={() => selection.toggleItem(item.id)}
          />
        </td>
        <td>{item.title}</td>
        <td>{item.deadline}</td>
      </tr>
    {/each}
  </tbody>
</table>

<style>
  tr.selected {
    background-color: var(--surface-1);
  }
</style>
```

---

## Example 3: Using useFileUpload in a Modal

```svelte
<script lang="ts">
  import { useFileUpload } from '$lib/composables';
  import { Button } from '$lib/components/ui/buttons';

  let attachments = $state<Array<{ filename: string; url: string }>>([]);

  // Initialize file upload composable with 10MB limit
  const fileUpload = useFileUpload(10);

  async function handleFileInput(e: Event) {
    const input = e.target as HTMLInputElement;
    const file = input.files?.[0];

    if (!file) return;

    const result = await fileUpload.uploadFile(file);
    if (result) {
      attachments = [...attachments, result];
    }

    input.value = ''; // Reset input
  }

  async function handleFileDrop(e: DragEvent) {
    const result = await fileUpload.handleDrop(e);
    if (result) {
      attachments = [...attachments, result];
    }
  }
</script>

<div class="upload-section">
  <h3>Upload Attachments</h3>

  <!-- Drag and Drop Area -->
  <div
    class="drop-zone"
    class:dragging={fileUpload.isDragging}
    ondragenter={fileUpload.handleDragEnter}
    ondragleave={fileUpload.handleDragLeave}
    ondragover={fileUpload.handleDragOver}
    ondrop={handleFileDrop}
  >
    <input
      type="file"
      id="file-input"
      class="hidden"
      onchange={handleFileInput}
      disabled={fileUpload.uploading}
    />

    <label for="file-input" class="upload-label">
      {#if fileUpload.uploading}
        <span>Uploading...</span>
      {:else if fileUpload.isDragging}
        <span>Drop file here</span>
      {:else}
        <span>Click or drag file here</span>
      {/if}
    </label>
  </div>

  <!-- Attachment List -->
  {#if attachments.length > 0}
    <div class="attachments">
      <h4>Uploaded Files:</h4>
      {#each attachments as attachment}
        <div class="attachment-item">
          <span>{attachment.filename}</span>
          <a href={attachment.url} target="_blank">View</a>
        </div>
      {/each}
    </div>
  {/if}
</div>

<style>
  .drop-zone {
    border: 2px dashed var(--hair);
    padding: 2rem;
    text-align: center;
    transition: all 0.2s;
  }

  .drop-zone.dragging {
    border-color: var(--fg);
    background-color: var(--surface-1);
  }

  .hidden {
    display: none;
  }
</style>
```

---

## Example 4: Combining Multiple Composables

```svelte
<script lang="ts">
  import { useSelection, useCrawlWebSocket } from '$lib/composables';
  import { WS_BASE_URL } from '$lib/config/api';

  type QueueItem = {
    id: number;
    title: string;
    deadline: string;
  };

  let queueItems = $state<QueueItem[]>([]);

  // Use multiple composables together
  const selection = useSelection<QueueItem>();
  const crawlWS = useCrawlWebSocket();

  async function startCrawling() {
    // Clear selection before crawling
    selection.clearSelection();

    const wsUrl = `${WS_BASE_URL}/api/notices/crawl/bizinfo`;

    crawlWS.connect(
      wsUrl,
      (item) => {
        queueItems = [item, ...queueItems];
      },
      () => {
        console.log('Crawling completed!');
      }
    );
  }

  async function publishSelected() {
    const selectedIds = Array.from(selection.selectedIds);
    if (selectedIds.length === 0) return;

    // Publish logic here...
    console.log('Publishing:', selectedIds);

    // Clear selection after publishing
    selection.clearSelection();
  }
</script>

<div class="page">
  <button onclick={startCrawling} disabled={crawlWS.loading}>
    {crawlWS.loading ? 'Crawling...' : 'Start Crawl'}
  </button>

  {#if crawlWS.status !== 'idle'}
    <div class="status">
      <p>Status: {crawlWS.status}</p>
      <p>Progress: {crawlWS.progress.progress} / {crawlWS.progress.total}</p>
    </div>
  {/if}

  <div class="selection-info">
    <p>{selection.selectedCount} items selected</p>
    {#if selection.selectedCount > 0}
      <button onclick={publishSelected}>
        Publish Selected ({selection.selectedCount})
      </button>
    {/if}
  </div>

  <table>
    <thead>
      <tr>
        <th>
          <input
            type="checkbox"
            checked={selection.allSelected}
            onchange={() => selection.toggleAll(queueItems)}
          />
        </th>
        <th>Title</th>
      </tr>
    </thead>
    <tbody>
      {#each queueItems as item}
        <tr class:selected={selection.isSelected(item.id)}>
          <td>
            <input
              type="checkbox"
              checked={selection.isSelected(item.id)}
              onchange={() => selection.toggleItem(item.id)}
            />
          </td>
          <td>{item.title}</td>
        </tr>
      {/each}
    </tbody>
  </table>
</div>
```

---

## Best Practices

1. **Initialize composables in `<script>` block**: Create composable instances at the component level
2. **Use getters for state access**: Access state via `composable.property` to maintain reactivity
3. **Combine with $effect**: Watch composable state changes with Svelte 5's `$effect`
4. **Type safety**: Always provide generic types for `useSelection<T>`
5. **Error handling**: Composables handle errors internally but expose error state
6. **Single instance per component**: Create one instance of each composable per component
7. **Pass callbacks**: Use callback functions for side effects (e.g., `onItemAdded`, `onComplete`)

---

## Migration Guide

### Before (inline logic):
```svelte
<script lang="ts">
  let selectedIds = $state<Set<number>>(new Set());

  function toggleItem(id: number) {
    const newSelectedIds = new Set(selectedIds);
    if (newSelectedIds.has(id)) {
      newSelectedIds.delete(id);
    } else {
      newSelectedIds.add(id);
    }
    selectedIds = newSelectedIds;
  }
</script>
```

### After (using composable):
```svelte
<script lang="ts">
  import { useSelection } from '$lib/composables';

  const selection = useSelection<Item>();

  // Use selection.toggleItem(id) directly
</script>
```
