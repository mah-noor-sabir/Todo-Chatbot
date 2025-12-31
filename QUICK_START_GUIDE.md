# Quick Start Guide - Enhanced Todo Features

## 🚀 Quick Integration (5 Steps)

### 1. Add CSS Import to Layout

```tsx
// src/app/layout.tsx
import '../components/todos/EnhancedTodos.css';
```

### 2. Update Your Backend

Add these fields to your Todo model:

```python
class Todo:
    # ... existing fields ...
    priority: str = 'medium'  # 'high', 'medium', 'low'
    tags: list[str] = []
    due_date: Optional[datetime] = None
    recurrence: Optional[str] = None  # 'daily', 'weekly', 'monthly', 'yearly'
```

### 3. Backup Current Page

```bash
cd frontend/src/app/todos
cp page.tsx page_backup.tsx
```

### 4. Replace Page Content

Copy the contents of `page_new.tsx` into your `page.tsx` file.

### 5. Start Development Server

```bash
npm run dev
```

---

## 📦 All Components at a Glance

### New Components Created

| Component | Purpose | Location |
|-----------|---------|----------|
| SearchBar | Keyword search | `components/todos/SearchBar.tsx` |
| FilterPanel | Filter by status/priority/tags | `components/todos/FilterPanel.tsx` |
| SortControls | Sort options dropdown | `components/todos/SortControls.tsx` |
| PriorityBadge | Visual priority indicator | `components/todos/PriorityBadge.tsx` |
| TagsList | Display tags | `components/todos/TagsList.tsx` |
| DateTimePicker | Date/time selection | `components/todos/DateTimePicker.tsx` |

### Updated Components

| Component | What Changed |
|-----------|--------------|
| TodoItem | Added priority badge, tags, due date, recurrence display |
| AddTodoForm | Added priority, tags, due date, recurrence fields |
| EditTodoForm | Added all new fields |

---

## 🎨 Features Demo

### Priority System

```tsx
// High Priority (Red)
<PriorityBadge priority="high" />
// Output: 🔴 High

// Medium Priority (Yellow)
<PriorityBadge priority="medium" />
// Output: 🟡 Medium

// Low Priority (Green)
<PriorityBadge priority="low" />
// Output: 🟢 Low
```

### Tags System

```tsx
// Display tags
<TagsList tags={['work', 'urgent', 'meeting']} maxDisplay={3} />

// With remove functionality
<TagsList
  tags={['work', 'urgent']}
  onRemove={(tag) => console.log('Remove', tag)}
/>
```

### Search & Filter

```tsx
const [filters, setFilters] = useState<TodoFilters>({
  status: 'all',           // 'all' | 'completed' | 'incomplete'
  priority: 'all',         // 'all' | 'high' | 'medium' | 'low'
  tags: [],                // string[]
  searchQuery: '',         // search text
});

// Filter todos
const filtered = filterTodos(todos, filters);
```

### Sort Options

```tsx
const [sortBy, setSortBy] = useState<SortOption>('created_at');
// Options: 'due_date' | 'priority' | 'title' | 'created_at'

// Sort todos
const sorted = sortTodos(todos, sortBy);
```

---

## 💡 Usage Examples

### Example 1: Creating a Todo with All Fields

```tsx
await createTodo({
  title: 'Weekly Team Meeting',
  description: 'Discuss project progress and next steps',
  priority: 'high',
  tags: ['work', 'meeting', 'weekly'],
  due_date: '2025-01-05T10:00:00',
  recurrence: 'weekly',
});
```

### Example 2: Filtering High Priority Work Tasks

```tsx
setFilters({
  status: 'incomplete',
  priority: 'high',
  tags: ['work'],
  searchQuery: '',
});
```

### Example 3: Finding Overdue Tasks

```tsx
const overdueTodos = todos.filter(todo => isOverdue(todo));
```

### Example 4: Scheduling Notifications

```tsx
import { notificationManager } from '@/lib/utils/notifications';

// Request permission first
await notificationManager.requestPermission();

// Schedule for a todo
notificationManager.scheduleNotification(
  todo.id,
  todo.title,
  todo.due_date,
  15 // remind 15 minutes before
);
```

---

## 🎯 Common Patterns

### Pattern 1: Combined Filter and Sort

```tsx
const processedTodos = useMemo(() => {
  const filtered = filterTodos(todos, filters);
  return sortTodos(filtered, sortBy);
}, [todos, filters, sortBy]);
```

### Pattern 2: Get All Available Tags

```tsx
const availableTags = useMemo(() => getAllTags(todos), [todos]);
```

### Pattern 3: Check Todo Status

```tsx
// Check if overdue
if (isOverdue(todo)) {
  // Show red indicator
}

// Check if due soon (< 24 hours)
if (isDueSoon(todo)) {
  // Show yellow indicator
}
```

---

## 📱 Responsive Design

All components are mobile-responsive:

- Search bar and filters stack vertically on mobile
- Filter buttons become full-width
- Sort controls adjust layout
- Tags wrap to new lines
- Priority badges scale appropriately

---

## 🎨 Color Scheme

### Priority Colors

```css
/* High Priority - Red */
background: rgba(239, 68, 68, 0.15);
border: rgba(239, 68, 68, 0.4);
color: #fca5a5;

/* Medium Priority - Yellow/Amber */
background: rgba(251, 191, 36, 0.15);
border: rgba(251, 191, 36, 0.4);
color: #fcd34d;

/* Low Priority - Green */
background: rgba(34, 197, 94, 0.15);
border: rgba(34, 197, 94, 0.4);
color: #86efac;
```

### Theme Colors

```css
/* Primary Purple Theme */
--primary: rgba(168, 136, 255, 0.x);
--background: rgba(15, 23, 42, 0.85);
--text: #f2ecff;
--border: rgba(168, 136, 255, 0.3);
```

---

## 🔧 Customization Tips

### Change Search Placeholder

```tsx
<SearchBar
  value={searchQuery}
  onChange={setSearchQuery}
  placeholder="Type to search your tasks..."
/>
```

### Modify Priority Order

```tsx
// In todoHelpers.ts
const priorityOrder = {
  high: 0,    // Change these numbers
  medium: 1,  // to reorder priority
  low: 2,     // sorting
};
```

### Adjust Notification Timing

```tsx
// Change from 15 minutes to 30 minutes
notificationManager.scheduleNotification(
  todo.id,
  todo.title,
  todo.due_date,
  30  // minutes before due
);
```

### Limit Displayed Tags

```tsx
// Show only first 3 tags with "+N" indicator
<TagsList tags={todo.tags} maxDisplay={3} />
```

---

## ✅ Checklist

Before going live, verify:

- [ ] Backend supports new Todo fields
- [ ] CSS is imported in layout or components
- [ ] Browser notification permission requested
- [ ] Search functionality works
- [ ] Filters apply correctly
- [ ] Sort options work
- [ ] Priority badges display
- [ ] Tags can be added/removed
- [ ] Due dates can be set
- [ ] Recurring tasks save correctly
- [ ] Overdue todos show red
- [ ] Mobile layout looks good

---

## 🐛 Common Issues & Fixes

### Issue: Notifications Don't Work

**Fix:**
1. Check HTTPS (required for notifications)
2. Grant permission in browser settings
3. Verify `notificationManager.requestPermission()` is called

### Issue: TypeScript Errors

**Fix:**
```bash
# Restart TypeScript server in VS Code
Ctrl+Shift+P → "TypeScript: Restart TS Server"
```

### Issue: Styles Not Applied

**Fix:**
```tsx
// Import CSS in your layout.tsx
import '../components/todos/EnhancedTodos.css';
```

### Issue: Backend Errors

**Fix:**
- Ensure backend accepts new fields
- Make all new fields optional in API
- Update API documentation

---

## 🎓 Learning Resources

### Filter Algorithm

```typescript
// Status filter
if (filters.status === 'completed' && !todo.is_completed) return false;

// Priority filter
if (filters.priority !== 'all' && todo.priority !== filters.priority) return false;

// Tags filter (ANY match)
if (filters.tags.length > 0) {
  const hasMatch = filters.tags.some(tag => todo.tags.includes(tag));
  if (!hasMatch) return false;
}

// Search filter (title OR description OR tags)
if (filters.searchQuery) {
  const query = filters.searchQuery.toLowerCase();
  const matches =
    todo.title.toLowerCase().includes(query) ||
    todo.description?.toLowerCase().includes(query) ||
    todo.tags?.some(tag => tag.toLowerCase().includes(query));
  if (!matches) return false;
}
```

### Sort Algorithm

```typescript
// Due date sort (earliest first, null last)
sort((a, b) => {
  if (!a.due_date && !b.due_date) return 0;
  if (!a.due_date) return 1;
  if (!b.due_date) return -1;
  return new Date(a.due_date) - new Date(b.due_date);
});

// Priority sort (high → medium → low)
sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);

// Alphabetical sort
sort((a, b) => a.title.localeCompare(b.title));
```

---

## 📊 Performance Tips

1. **Use `useMemo`** for filtering and sorting
2. **Debounce search** for large lists (optional)
3. **Virtual scrolling** for 100+ todos (optional)
4. **Lazy load** images/icons if needed

Example debounced search:

```tsx
import { useEffect, useState } from 'react';

const [searchInput, setSearchInput] = useState('');
const [debouncedSearch, setDebouncedSearch] = useState('');

useEffect(() => {
  const timer = setTimeout(() => {
    setDebouncedSearch(searchInput);
  }, 300);
  return () => clearTimeout(timer);
}, [searchInput]);

// Use debouncedSearch in filters
```

---

## 🎉 You're All Set!

Your Todo app now has:
- ✅ Priority levels with visual indicators
- ✅ Tags/categories
- ✅ Search functionality
- ✅ Filtering by status, priority, and tags
- ✅ Sorting by multiple criteria
- ✅ Due dates with date/time picker
- ✅ Recurring tasks
- ✅ Browser notifications
- ✅ Overdue/due soon indicators
- ✅ Responsive design
- ✅ Modern UI with Tailwind CSS

**Need help?** Check `ENHANCED_FEATURES_README.md` for detailed documentation.

**Happy coding! 🚀**
