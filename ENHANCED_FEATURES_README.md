# Enhanced Todo App Features - Integration Guide

## Overview

This implementation adds intermediate and advanced features to your Todo app frontend:

### Intermediate Level Features
1. **View Task List** - Enhanced display with visual indicators
2. **Priorities & Tags** - Three priority levels (high/medium/low) with visual indicators and custom tags
3. **Search & Filter** - Search by keyword, filter by status, priority, and tags
4. **Sort Tasks** - Sort by due date, priority, title, or created date

### Advanced Level Features
1. **Recurring Tasks** - Support for daily, weekly, monthly, and yearly recurring tasks
2. **Due Dates & Time Reminders** - Date/time picker with browser notifications 15 minutes before due time

---

## Files Created

### Components

1. **`SearchBar.tsx`** - Search input with clear button
2. **`FilterPanel.tsx`** - Comprehensive filtering UI (status, priority, tags)
3. **`SortControls.tsx`** - Dropdown for sorting options
4. **`PriorityBadge.tsx`** - Visual priority indicators with colors
5. **`TagsList.tsx`** - Tag display with optional remove functionality
6. **`DateTimePicker.tsx`** - Date and time selection component

### Updated Components

1. **`TodoItem.tsx`** - Now displays priority, tags, due dates, recurrence, and overdue status
2. **`AddTodoForm.tsx`** - Enhanced with priority, tags, due date, and recurrence fields
3. **`EditTodoForm.tsx`** - Enhanced with all new fields

### Utilities

1. **`notifications.ts`** - Browser notification manager for todo reminders
2. **`todoHelpers.ts`** - Filtering, sorting, and helper functions

### Types

1. **`todo.ts`** - Updated with new fields:
   - `priority`: 'high' | 'medium' | 'low'
   - `tags`: string[]
   - `due_date`: string | null
   - `recurrence`: 'daily' | 'weekly' | 'monthly' | 'yearly' | null

### Page

1. **`page_new.tsx`** - Complete enhanced todos page with all features integrated

### Styling

1. **`EnhancedTodos.css`** - Comprehensive CSS for all new components

---

## Integration Steps

### Step 1: Import CSS in Components

Add the CSS import to your component files:

```tsx
// In SearchBar.tsx, FilterPanel.tsx, SortControls.tsx, etc.
import './EnhancedTodos.css';
```

Or import globally in your main layout:

```tsx
// In src/app/layout.tsx
import '../components/todos/EnhancedTodos.css';
```

### Step 2: Replace Current Todos Page

Replace the contents of `src/app/todos/page.tsx` with the contents of `page_new.tsx`, or rename:

```bash
mv src/app/todos/page.tsx src/app/todos/page_old.tsx
mv src/app/todos/page_new.tsx src/app/todos/page.tsx
```

### Step 3: Update Backend API (Important!)

Your backend needs to support the new fields. Update your backend Todo model:

```python
# Backend Todo model should include:
class Todo(BaseModel):
    id: int
    user_id: int
    title: str
    description: str | None
    is_completed: bool
    priority: Literal['high', 'medium', 'low'] = 'medium'
    tags: list[str] = []
    due_date: datetime | None = None
    recurrence: Literal['daily', 'weekly', 'monthly', 'yearly'] | None = None
    created_at: datetime
    updated_at: datetime
```

### Step 4: Test Notifications

For browser notifications to work, users need to grant permission. The app will request permission automatically when the todos page loads.

---

## Usage Guide

### Adding a Todo

1. Click "**+ Add Todo**" button
2. Fill in:
   - **Title** (required)
   - **Description** (optional)
   - **Priority**: Select high (🔴), medium (🟡), or low (🟢)
   - **Tags**: Type and press Enter to add tags
   - **Due Date**: Select date and time
   - **Recurrence**: Choose if task repeats

### Searching Todos

- Type in the search bar to filter by title, description, or tags
- Search is case-insensitive and matches partial words

### Filtering Todos

Click "**Filters**" button to toggle filter panel:

- **Status**: All, Active (incomplete), Completed
- **Priority**: All, High, Medium, Low
- **Tags**: Click tags to filter (multiple selection supported)
- Click "**Clear Filters**" to reset

### Sorting Todos

Use the "**Sort by**" dropdown:
- **Created Date**: Newest first (default)
- **Due Date**: Earliest due date first (no due date goes last)
- **Priority**: High → Medium → Low
- **Alphabetical**: A-Z by title

### Browser Notifications

- Grant permission when prompted
- Notifications appear 15 minutes before due time
- Only for incomplete todos with due dates

---

## Visual Indicators

### Priority Colors
- 🔴 **High**: Red border and background
- 🟡 **Medium**: Yellow/amber border and background
- 🟢 **Low**: Green border and background

### Due Date Status
- **Normal**: Purple/blue indicator
- **Due Soon** (< 24 hours): Yellow/amber indicator
- **Overdue**: Red indicator with red border on entire todo item

### Recurrence
- Green indicator with repeat icon
- Shows recurrence pattern (daily, weekly, etc.)

---

## Component API Reference

### SearchBar
```tsx
<SearchBar
  value={string}
  onChange={(value: string) => void}
  placeholder?: string
/>
```

### FilterPanel
```tsx
<FilterPanel
  filters={TodoFilters}
  availableTags={string[]}
  onFilterChange={(filters: TodoFilters) => void}
/>
```

### SortControls
```tsx
<SortControls
  sortBy={SortOption}
  onSortChange={(sortBy: SortOption) => void}
/>
```

### PriorityBadge
```tsx
<PriorityBadge
  priority={'high' | 'medium' | 'low'}
  size?: 'sm' | 'md' | 'lg'
/>
```

### TagsList
```tsx
<TagsList
  tags={string[]}
  onRemove?: (tag: string) => void
  maxDisplay?: number
/>
```

### DateTimePicker
```tsx
<DateTimePicker
  value={string | null}
  onChange={(value: string | null) => void}
  label?: string
/>
```

---

## Helper Functions

### todoHelpers.ts

```typescript
// Filter todos
const filtered = filterTodos(todos, filters);

// Sort todos
const sorted = sortTodos(todos, sortBy);

// Get all unique tags
const allTags = getAllTags(todos);

// Check if overdue
const isOverdue = isOverdue(todo);

// Check if due soon
const isDueSoon = isDueSoon(todo);
```

### Notification Manager

```typescript
import { notificationManager } from '@/lib/utils/notifications';

// Request permission
await notificationManager.requestPermission();

// Show notification immediately
notificationManager.showNotification('Title', { body: 'Message' });

// Schedule notification
notificationManager.scheduleNotification(
  todoId,
  'Todo title',
  dueDate,
  15 // minutes before
);

// Cancel notification
notificationManager.cancelNotification(todoId);
```

---

## Styling Customization

All styles are in `EnhancedTodos.css`. Key CSS variables you can customize:

```css
/* Primary colors */
--color-primary: #a888ff;
--color-background: rgba(15, 23, 42, 0.85);
--color-border: rgba(168, 136, 255, 0.3);
--color-text: #f2ecff;

/* Priority colors */
--color-high: rgba(239, 68, 68, 0.15);
--color-medium: rgba(251, 191, 36, 0.15);
--color-low: rgba(34, 197, 94, 0.15);
```

---

## Browser Compatibility

- **Notifications**: Chrome, Firefox, Edge, Safari (with permission)
- **Date/Time Picker**: All modern browsers
- **CSS**: Tailwind CSS 4.x compatible

---

## Performance Considerations

1. **Filtering & Sorting**: Uses `useMemo` to prevent unnecessary recalculations
2. **Notifications**: Singleton pattern to manage notification state
3. **Search**: Debounced input (implement if needed for large lists)

---

## Troubleshooting

### Notifications Not Working
- Check browser permissions in Settings
- Ensure HTTPS (required for notifications)
- Check browser console for errors

### Styling Issues
- Ensure `EnhancedTodos.css` is imported
- Check Tailwind CSS configuration
- Clear browser cache

### TypeScript Errors
- Ensure all type files are updated
- Run `npm install` to update dependencies
- Check `tsconfig.json` includes all source directories

---

## Next Steps (Optional Enhancements)

1. **Persistence**: Store filters/sort preferences in localStorage
2. **Drag & Drop**: Reorder todos manually
3. **Bulk Actions**: Select multiple todos for batch operations
4. **Themes**: Light/dark mode toggle
5. **Export**: Export todos to CSV/JSON
6. **Statistics**: Dashboard with todo completion metrics
7. **Collaboration**: Share todos with other users
8. **Subtasks**: Break down todos into smaller tasks

---

## Support

For issues or questions:
1. Check browser console for errors
2. Verify backend API supports new fields
3. Ensure all dependencies are installed
4. Check file paths and imports

---

## License

This code is provided as-is for integration into your Todo app.

---

## Summary

All features have been implemented with:
- ✅ Modern React practices (hooks, functional components)
- ✅ TypeScript for type safety
- ✅ Modular component architecture
- ✅ Tailwind CSS + custom CSS
- ✅ Responsive design
- ✅ Browser notifications
- ✅ Comprehensive filtering and sorting
- ✅ Visual priority indicators
- ✅ Tags system
- ✅ Due dates with reminders
- ✅ Recurring tasks support

Simply follow the integration steps above to add these features to your existing Todo app!
