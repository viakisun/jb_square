# Composables

Reusable logic functions built with Svelte 5 runes for state management and reactivity.

## Overview

Composables are functions that encapsulate common patterns and provide reactive state management using Svelte 5's new runes system (`$state`, `$derived`, `$effect`). They are designed to be framework-agnostic within the Svelte ecosystem and can be easily reused across components.

## Available Composables

### 1. useCrawlWebSocket

Manages WebSocket connections for real-time crawling updates.

**Location**: `useCrawlWebSocket.ts`

**Extracted from**: `routes/notices/business/+page.svelte` (lines 63-208)

**Usage**:
```typescript
import { useCrawlWebSocket } from '$lib/composables';

const ws = useCrawlWebSocket();

ws.connect(
  wsUrl,
  (item) => {
    // Handle new item added
    queueItems = [item, ...queueItems];
  },
  () => {
    // Handle completion
    loadQueue();
  }
);

// Access reactive state
console.log(ws.status); // 'idle' | 'collecting' | 'processing' | 'completed' | 'error' | 'stopped'
console.log(ws.logs); // LogEntry[]
console.log(ws.progress); // { progress, total, success, failed }
console.log(ws.pageProgress); // { page, accumulated }
```

**Features**:
- Real-time WebSocket connection management
- Two-phase crawling (collecting + processing)
- Automatic state updates based on WebSocket events
- Error handling and logging
- Callback support for item additions and completion

---

### 2. useSelection

Manages multi-select functionality for lists and tables.

**Location**: `useSelection.ts`

**Extracted from**:
- `components/notices/CrawlQueueTable.svelte` (lines 42-70)
- `components/notices/PublishedNoticesList.svelte` (lines 104-113)

**Usage**:
```typescript
import { useSelection } from '$lib/composables';

const selection = useSelection<QueueItem>();

// Toggle single item
selection.toggleItem(item.id);

// Toggle all items
selection.toggleAll(items);

// Clear all selections
selection.clearSelection();

// Check if item is selected
const isSelected = selection.isSelected(item.id);

// Access reactive state
console.log(selection.selectedIds); // Set<number>
console.log(selection.selectedCount); // number (derived)
console.log(selection.allSelected); // boolean
```

**Features**:
- Generic type support for any item with `id: number`
- Individual and bulk selection
- Reactive selected count (derived)
- Clear selection method

---

### 3. useFileUpload

Handles file uploads with drag-and-drop support.

**Location**: `useFileUpload.ts`

**Extracted from**: `components/notices/AddNoticeModal.svelte` (lines 143-220)

**Usage**:
```typescript
import { useFileUpload } from '$lib/composables';

const fileUpload = useFileUpload(10); // 10MB max size

// Upload file programmatically
const result = await fileUpload.uploadFile(file);
if (result) {
  console.log(result.filename, result.url);
}

// Use with drag-and-drop
<div
  class:dragging={fileUpload.isDragging}
  ondragenter={fileUpload.handleDragEnter}
  ondragleave={fileUpload.handleDragLeave}
  ondragover={fileUpload.handleDragOver}
  ondrop={fileUpload.handleDrop}
>
  Drop file here
</div>

// Access reactive state
console.log(fileUpload.uploading); // boolean
console.log(fileUpload.isDragging); // boolean
```

**Features**:
- File size validation
- Automatic toast notifications
- Drag-and-drop support
- Upload progress tracking
- Error handling

---

## Design Patterns

All composables follow these patterns:

1. **Svelte 5 Runes**: Use `$state`, `$derived`, and `$effect` for reactivity
2. **Getter Pattern**: State is exposed via getters to maintain reactivity
3. **TypeScript**: Full type safety with exported interfaces
4. **JSDoc**: Comprehensive documentation for all functions and types
5. **Single Responsibility**: Each composable handles one specific concern

## Import Patterns

```typescript
// Import individual composables
import { useCrawlWebSocket, useSelection, useFileUpload } from '$lib/composables';

// Import types
import type { LogEntry, CrawlStatus, SelectableItem, UploadResult } from '$lib/composables';
```

## Migration Notes

When migrating from the original component code:

1. Replace inline state management with composable calls
2. Update event handlers to use composable methods
3. Access state via getters (e.g., `ws.status` instead of local `status`)
4. Keep UI-specific logic in components
5. Move reusable business logic to composables

## Future Composables

Potential candidates for extraction:

- `useNoticeFilters` - Notice filtering and search logic
- `usePagination` - Pagination state management
- `useToast` - Toast notification management (if needed beyond store)
- `useModal` - Modal state management
- `useTagSelector` - Tag selection logic
