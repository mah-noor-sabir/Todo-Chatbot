# Research: Enhanced Task Features

**Feature**: 002-enhanced-task-features
**Date**: 2025-12-28
**Status**: Complete (No NEEDS CLARIFICATION items)

## Overview

This document consolidates research findings for the Enhanced Task Features implementation. All technical decisions have been resolved based on constitution requirements and specification defaults.

## Research Topics

### 1. Priority System Design

**Decision**: Three-level priority enum (HIGH, MEDIUM, LOW)

**Rationale**:
- Spec FR-001 explicitly defines three levels
- Simple cognitive model for users
- Default to MEDIUM (FR-002) provides safe neutral option

**Alternatives Considered**:
| Alternative | Rejected Because |
|-------------|------------------|
| Numeric 1-10 scale | Too granular, harder to filter |
| Two levels (High/Normal) | Insufficient differentiation |
| Priority with deadlines | Adds complexity beyond spec |

### 2. Category System Design

**Decision**: Six predefined categories enum (WORK, HOME, PERSONAL, HEALTH, FINANCE, OTHER)

**Rationale**:
- Spec FR-003 defines these six categories
- Covers common life organization domains
- OTHER as default (FR-004) catches unclassified items

**Alternatives Considered**:
| Alternative | Rejected Because |
|-------------|------------------|
| Free-form categories | Inconsistent filtering, typo-prone |
| User-defined category creation | Beyond Phase I scope |
| Hierarchical categories | Over-engineering for console app |

### 3. Tag Implementation

**Decision**: List of strings with comma-separated input

**Rationale**:
- Flexible cross-category organization
- Case-insensitive matching for search
- Empty list as default maintains backward compatibility

**Alternatives Considered**:
| Alternative | Rejected Because |
|-------------|------------------|
| Predefined tag set | Limits flexibility |
| Tag objects with metadata | Over-engineering |
| Hashtag syntax (#tag) | Unnecessary complexity for console |

### 4. Recurrence Pattern Design

**Decision**: Four-option enum (NONE, DAILY, WEEKLY, MONTHLY)

**Rationale**:
- Covers 95%+ of recurring task use cases
- Spec FR-027 defines exactly these options
- Simple date arithmetic for next occurrence

**Alternatives Considered**:
| Alternative | Rejected Because |
|-------------|------------------|
| Cron expressions | Too complex for console users |
| Custom intervals (every N days) | Beyond spec scope |
| Yearly recurrence | Rare use case, deferred |

### 5. Monthly Recurrence Edge Case

**Decision**: Use last valid day of month for overflow (e.g., Jan 31 → Feb 28)

**Rationale**:
- Spec edge case explicitly addresses this
- Prevents invalid date exceptions
- Safe fallback to day 28 covers all months

**Implementation**:
```python
# Handle day overflow (e.g., Jan 31 -> Feb 28)
day = min(self.due_date.day, 28)  # Safe for all months
```

### 6. Due Date Time Handling

**Decision**: Optional time component, default to 23:59 if not specified

**Rationale**:
- Spec FR-022 requires end-of-day default
- Allows users to specify precise times when needed
- Consistent "overdue" calculation at day end

**Input Formats Accepted**:
- `YYYY-MM-DD HH:MM` (with time)
- `YYYY-MM-DD` (end of day assumed)

### 7. Reminder Implementation

**Decision**: Console-based alert on application startup

**Rationale**:
- Phase I constraint: console-only, no background processes
- Spec FR-026 specifies "when application starts"
- Check against reminder window on each startup

**Reminder Options** (per spec):
- No reminder (0 minutes)
- 15 minutes before
- 30 minutes before
- 1 hour before
- 1 day before (1440 minutes)

### 8. Search Algorithm

**Decision**: Case-insensitive substring matching across title, description, tags

**Rationale**:
- Spec FR-007 requires search in title, description, tags
- Spec FR-008 requires case-insensitive matching
- Simple, fast for in-memory data

**Implementation**:
```python
def matches_search(self, keyword: str) -> bool:
    keyword_lower = keyword.lower()
    return (
        keyword_lower in self.title.lower() or
        keyword_lower in self.description.lower() or
        any(keyword_lower in tag.lower() for tag in self.tags)
    )
```

### 9. Sort Order for Tasks Without Due Dates

**Decision**: Place at end of sorted list

**Rationale**:
- Spec edge case explicitly requires this
- Tasks with dates are more time-sensitive
- Provides consistent, predictable ordering

### 10. Rich Library Usage

**Decision**: Use Rich for all console output

**Rationale**:
- Constitution v1.1.0 mandates Rich CLI library
- Professional appearance with panels, tables, colors
- Cross-platform terminal support

**Key Rich Components Used**:
- `Console` - Main output interface
- `Panel` - Bordered content sections
- `Table` - Task list display
- `Text` - Styled text composition
- `Prompt` - User input with validation

### 11. Windows Encoding Fix

**Decision**: Reconfigure stdout/stderr to UTF-8 on Windows startup

**Rationale**:
- Rich uses Unicode characters for borders/styling
- Windows console defaults may not support UTF-8
- Silent fallback if reconfiguration fails

**Implementation**:
```python
if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding='utf-8')
        sys.stderr.reconfigure(encoding='utf-8')
    except Exception:
        pass
    os.system("")  # Enable ANSI escape sequences
```

### 12. ID Generation Strategy

**Decision**: Auto-increment starting at 1, never reuse deleted IDs

**Rationale**:
- Existing Phase I implementation uses this approach
- Prevents confusion when referencing task IDs
- Simple counter tracks highest ID ever assigned

## Technology Stack Confirmation

| Component | Technology | Version | Source |
|-----------|------------|---------|--------|
| Language | Python | 3.11+ | Constitution |
| CLI Library | Rich | 13.0.0+ | Constitution |
| Testing | pytest | Latest | Constitution |
| Data Classes | dataclasses | stdlib | Python standard |
| Date/Time | datetime | stdlib | Python standard |

## Outstanding Items

**None** - All clarifications resolved in specification phase.

## References

- Constitution v1.1.0: `.specify/memory/constitution.md`
- Feature Spec: `specs/002-enhanced-task-features/spec.md`
- Quality Checklist: `specs/002-enhanced-task-features/checklists/requirements.md`
