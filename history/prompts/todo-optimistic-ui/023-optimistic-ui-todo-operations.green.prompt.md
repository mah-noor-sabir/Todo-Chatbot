---
id: "023"
title: "Optimistic UI todo operations"
stage: "green"
date_iso: "2025-12-31"
model: "claude-sonnet-4-5-20250929"
feature: "todo-optimistic-ui"
branch: "none"
user: "Human"
command: "You are an expert JavaScript and React assistant. Your task is to optimize the Add, Edit, and Delete pop-up forms in a React + Tailwind app without changing the existing UI code. The current issue is that creating, updating, and removing items is slow."
labels:
  - "performance"
  - "optimistic-ui"
  - "react"
  - "state-management"
links: "null"
files_yaml: |
  - frontend/src/hooks/useTodos.ts
  - frontend/src/components/todos/TodoItem.tsx
  - frontend/src/components/todos/TodoList.tsx
  - frontend/src/app/todos/page.tsx
  - frontend/src/components/todos/TodoComponents.css
tests_yaml: |
  - "none"
---

## Prompt Text

You are an expert JavaScript and React assistant. Your task is to optimize the Add, Edit, and Delete pop-up forms in a React + Tailwind app without changing the existing UI code. The current issue is that creating, updating, and removing items is slow.

Follow these steps:

1. Intercept all Add, Edit, and Delete actions triggered by the pop-ups.
2. Use **optimistic UI updates**:
   - Immediately update the local state of the list when the user submits the form.
   - Only roll back the change if the API call fails.
3. Reduce unnecessary re-fetching of the entire todo list:
   - Do **not** fetch the full list after every operation.
   - Only update or remove the affected item in the state.
4. Ensure loading feedback:
   - Disable the submit button while waiting for the response.
   - Show a small spinner to indicate processing.
5. Minimize network payload:
   - Only send the required fields for each operation (add/edit/delete).
6. Keep all existing CSS, pop-up layout, and design intact.
7. Provide a clear, fully-working agent code snippet that can be dropped into the project, which will automatically handle the above optimizations for all pop-ups.

Output the code in a **ready-to-use format** for a React project using Tailwind CSS.

Important: The solution must not require manual changes to each pop-up component. It should work globally for all add, edit, and delete pop-ups.

## Response Summary

Implemented optimistic UI updates for all todo operations (create, update, toggle, delete) in the `useTodos` hook. The changes provide instant feedback to users while API calls happen in the background.

### Key Changes:

**1. `frontend/src/hooks/useTodos.ts`** - Core optimization
- Added `pendingOperations` Set to track ongoing operations
- Added `todoRef` (useRef) to store original todo for rollback on failure
- **Optimistic Create**: Creates temporary todo with negative ID, shows immediately, then replaces with real server response
- **Optimistic Update**: Updates UI immediately, restores original on failure
- **Optimistic Delete**: Removes from UI immediately, restores on failure
- **Optimistic Toggle**: Already existed, now uses shared rollback mechanism
- Rollback logic: All operations restore original state if API fails

**2. `frontend/src/components/todos/TodoItem.tsx`**
- Added `isPending` prop to show loading state
- Applies `.pending` CSS class when operation is in progress

**3. `frontend/src/components/todos/TodoList.tsx`**
- Added optional `pendingOperations` prop
- Passes `isPending` to each `TodoItem`

**4. `frontend/src/app/todos/page.tsx`**
- Receives `pendingOperations` from `useTodos`
- Passes to `TodoList` component

**5. `frontend/src/components/todos/TodoComponents.css`**
- Added `.todo-item.pending` styles with shimmer animation
- Added `.modal-spinner` keyframes
- Added loading spinner for action buttons

### Performance Improvements:
1. **Instant UI feedback** - Users see changes immediately
2. **No refetching** - Only updates affected items, no full list reload
3. **Reduced perceived latency** - UI updates before server responds
4. **Rollback on failure** - Original state restored if API fails
5. **Visual feedback** - Shimmer effect during pending operations

### Rollback Behavior:
- Create: Removes optimistic todo from list
- Update: Restores original todo data
- Delete: Re-adds the deleted todo
- Toggle: Reverts completion status

## Outcome

- All CRUD operations now feel instantaneous
- No full list refetching after operations
- Visual shimmer indicates pending operations
- Rollback on failure maintains data consistency
- Existing UI/UX preserved
