# Research: Phase I Todo Console Application

**Feature Branch**: `001-phase1-todo-console`
**Date**: 2025-12-27
**Status**: Complete

## Research Summary

Phase I is intentionally minimal - an in-memory Python console application with no external dependencies. Research confirms standard library approaches are sufficient for all requirements.

## Decision Log

### 1. In-Memory Data Structure for Task Storage

**Decision**: Use a Python dictionary with integer keys (task IDs) and dataclass values.

**Rationale**:
- Dictionary provides O(1) lookup by ID (required for update/delete/mark operations)
- Iteration order is preserved in Python 3.7+ (needed for display order)
- Dataclass provides clean, typed task representation
- No external dependencies required

**Alternatives Considered**:
| Alternative | Rejected Because |
|-------------|------------------|
| List of tasks | O(n) lookup by ID; index != ID after deletions |
| Named tuple | Immutable; would require replacement on update |
| Plain dict for task | No type hints; harder to maintain |
| SQLite in-memory | Overkill for single-session; adds complexity |

### 2. Task ID Generation Strategy

**Decision**: Use a module-level counter that increments monotonically. IDs are never reused.

**Rationale**:
- Spec requirement: IDs never reused, always increment
- Simple integer counter meets all requirements
- No concurrency concerns (single-user, single-session)

**Alternatives Considered**:
| Alternative | Rejected Because |
|-------------|------------------|
| UUID | Overkill; user must type IDs manually |
| Max(existing IDs) + 1 | Breaks if all tasks deleted; more complex |
| Reuse deleted IDs | Explicitly prohibited by spec |

### 3. CLI Input/Output Strategy

**Decision**: Use Python's built-in `input()` for user input and `print()` for output.

**Rationale**:
- Standard library only (spec constraint)
- Sufficient for menu-driven interaction
- Cross-platform compatibility

**Alternatives Considered**:
| Alternative | Rejected Because |
|-------------|------------------|
| Click library | External dependency prohibited |
| Argparse | Better for command-line args, not interactive menus |
| Rich/Textual | External dependency; overkill for Phase I |

### 4. Timestamp Handling

**Decision**: Use `datetime.datetime.now()` from standard library for `created_at` field.

**Rationale**:
- Standard library (no external deps)
- Sufficient precision for display purposes
- Simple and universally understood

**Alternatives Considered**:
| Alternative | Rejected Because |
|-------------|------------------|
| time.time() | Returns float; less readable |
| External libs (arrow, pendulum) | Dependencies prohibited |
| No timestamp | Spec includes created_at field |

### 5. Error Handling Approach

**Decision**: Use try/except for input validation; return explicit error messages; never crash.

**Rationale**:
- Spec requires graceful error handling
- User-friendly error messages defined in spec
- Re-prompt on invalid input (spec requirement)

**Implementation Pattern**:
```
try:
    task_id = int(user_input)
except ValueError:
    print("Error: Please enter a valid numeric ID.")
    return  # Back to menu
```

### 6. Code Organization (Separation of Concerns)

**Decision**: Three-layer structure within single Python file:
1. **Model Layer**: Task dataclass
2. **Service Layer**: TaskManager class (CRUD operations)
3. **CLI Layer**: Menu display and input handling

**Rationale**:
- Constitution requires separation of concerns
- Single file appropriate for Phase I simplicity
- Clean boundaries enable future refactoring (Phase II+)
- Service layer is independently testable

**Alternatives Considered**:
| Alternative | Rejected Because |
|-------------|------------------|
| Everything in one class | Violates separation of concerns |
| Multiple files/packages | Overkill for Phase I scope |
| No classes (pure functions) | Less organized; harder to track state |

## Technology Verification

| Requirement | Python Standard Library Solution | Verified |
|-------------|----------------------------------|----------|
| Data storage | dict + dataclass | Yes |
| Timestamp | datetime.datetime | Yes |
| User input | input() | Yes |
| Output | print() | Yes |
| Type hints | typing module | Yes |

## Risks and Mitigations

| Risk | Probability | Impact | Mitigation |
|------|------------|--------|------------|
| User enters very long text | Low | Low | No limit in Phase I; document as known behavior |
| Memory exhaustion | Very Low | Medium | No artificial limit; rely on system memory |
| Ctrl+C during input | Medium | Low | Allow clean exit; Python handles KeyboardInterrupt |

## Conclusion

All Phase I requirements can be implemented using Python standard library only. No external research needed. Architecture follows clean separation of concerns while maintaining simplicity appropriate for Phase I.
