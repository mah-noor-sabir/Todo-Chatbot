"""CLI menu module for Todo Console Application with Rich UI.

Enhanced with search, filter, sort, categories, tags, and recurring tasks.
"""

import sys
import os
from datetime import datetime, timedelta
from typing import Optional, List

# Fix Windows console encoding for emoji support
if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding='utf-8')
        sys.stderr.reconfigure(encoding='utf-8')
    except Exception:
        pass
    os.system("")

from rich.console import Console
from rich.panel import Panel
from rich.table import Table
from rich.text import Text
from rich.prompt import Prompt, IntPrompt, Confirm
from rich.style import Style
from rich import box

from models.task import Task, Priority, Category, Recurrence
from services.task_manager import TaskManager, SortOrder


# Initialize Rich console
console = Console(force_terminal=True)

# Priority display (symbol, color)
PRIORITY_DISPLAY = {
    Priority.HIGH: ("[!]", "bright_red"),
    Priority.MEDIUM: ("[=]", "bright_yellow"),
    Priority.LOW: ("[-]", "dim"),
}

# Category display (symbol, color)
CATEGORY_DISPLAY = {
    Category.WORK: ("W", "bright_blue"),
    Category.HOME: ("H", "bright_green"),
    Category.PERSONAL: ("P", "bright_magenta"),
    Category.HEALTH: ("+", "bright_cyan"),
    Category.FINANCE: ("$", "bright_yellow"),
    Category.OTHER: ("O", "dim"),
}

# Status display
STATUS_COMPLETE = ("[X]", "bright_green")
STATUS_PENDING = ("[O]", "bright_yellow")
STATUS_OVERDUE = ("[!]", "bright_red")

# Recurrence display
RECURRENCE_DISPLAY = {
    Recurrence.NONE: ("", "dim"),
    Recurrence.DAILY: ("D", "bright_cyan"),
    Recurrence.WEEKLY: ("W", "bright_blue"),
    Recurrence.MONTHLY: ("M", "bright_magenta"),
}


def display_menu() -> None:
    """Display the main menu with rich formatting."""
    console.print()

    menu_content = Text()
    menu_items = [
        ("1", "Add Task", "Create a new task"),
        ("2", "View Tasks", "Display all tasks"),
        ("3", "Search/Filter", "Find specific tasks"),
        ("4", "Update Task", "Modify existing task"),
        ("5", "Delete Task", "Remove a task"),
        ("6", "Mark Complete", "Mark task as done"),
        ("7", "Mark Incomplete", "Reopen a task"),
        ("8", "Sort Tasks", "Change task order"),
        ("9", "Statistics", "View task stats"),
        ("0", "Exit", "Close application"),
    ]

    for num, label, desc in menu_items:
        menu_content.append(f"  [{num}] ", style="bright_white bold")
        menu_content.append(f"{label:<18}", style="bright_cyan bold")
        menu_content.append(f" - {desc}\n", style="dim")

    panel = Panel(
        menu_content,
        title="[bright_magenta bold]Evolution Todo - Enhanced Menu[/]",
        subtitle="[dim]Select an option (0-9)[/]",
        border_style="bright_blue",
        box=box.ROUNDED,
        padding=(1, 2),
    )
    console.print(panel)


def get_user_choice() -> int:
    """Get and validate user menu choice."""
    while True:
        try:
            choice = IntPrompt.ask(
                "[bright_cyan]Enter your choice[/]",
                choices=["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"],
                show_choices=False,
            )
            return choice
        except Exception:
            print_error("Invalid choice. Please enter a number between 0 and 9.")


def print_success(message: str) -> None:
    """Print a success message with styling."""
    console.print(f"[bright_green][OK] {message}[/]")


def print_error(message: str) -> None:
    """Print an error message with styling."""
    console.print(f"[bright_red][ERR] {message}[/]")


def print_info(message: str) -> None:
    """Print an info message with styling."""
    console.print(f"[bright_cyan][i] {message}[/]")


def print_warning(message: str) -> None:
    """Print a warning message with styling."""
    console.print(f"[bright_yellow][!] {message}[/]")


def get_priority_display(priority: Priority) -> tuple[str, str]:
    """Get symbol and color for priority level."""
    return PRIORITY_DISPLAY.get(priority, ("[=]", "bright_yellow"))


def get_category_display(category: Category) -> tuple[str, str]:
    """Get symbol and color for category."""
    return CATEGORY_DISPLAY.get(category, ("O", "dim"))


def get_status_display(task: Task) -> tuple[str, str]:
    """Get symbol and color for task status."""
    if task.is_complete:
        return STATUS_COMPLETE
    if task.is_overdue():
        return STATUS_OVERDUE
    return STATUS_PENDING


def format_datetime(dt: Optional[datetime]) -> str:
    """Format datetime for display."""
    if dt is None:
        return "-"
    return dt.strftime("%Y-%m-%d %H:%M")


def format_date(dt: Optional[datetime]) -> str:
    """Format date only for display."""
    if dt is None:
        return "-"
    return dt.strftime("%Y-%m-%d")


def get_task_id_input(prompt_text: str = "Enter task ID") -> Optional[int]:
    """Get and validate task ID input."""
    try:
        task_id = IntPrompt.ask(f"[bright_cyan]{prompt_text}[/]")
        return task_id
    except Exception:
        print_error("Please enter a valid numeric ID.")
        return None


def get_priority_input() -> Priority:
    """Get priority selection from user."""
    console.print("\n[bright_cyan]Select Priority:[/]")
    console.print("  [1] [bright_red][!] High[/]   - Urgent tasks")
    console.print("  [2] [bright_yellow][=] Medium[/] - Normal priority")
    console.print("  [3] [dim][-] Low[/]    - Can wait")

    choice = Prompt.ask(
        "[bright_cyan]Priority[/]",
        choices=["1", "2", "3"],
        default="2",
        show_default=True,
    )

    priority_map = {"1": Priority.HIGH, "2": Priority.MEDIUM, "3": Priority.LOW}
    return priority_map[choice]


def get_category_input() -> Category:
    """Get category selection from user."""
    console.print("\n[bright_cyan]Select Category:[/]")
    console.print("  [1] [bright_blue]Work[/]     - Work tasks")
    console.print("  [2] [bright_green]Home[/]     - Home tasks")
    console.print("  [3] [bright_magenta]Personal[/] - Personal tasks")
    console.print("  [4] [bright_cyan]Health[/]   - Health tasks")
    console.print("  [5] [bright_yellow]Finance[/]  - Finance tasks")
    console.print("  [6] [dim]Other[/]    - Other tasks")

    choice = Prompt.ask(
        "[bright_cyan]Category[/]",
        choices=["1", "2", "3", "4", "5", "6"],
        default="6",
        show_default=True,
    )

    category_map = {
        "1": Category.WORK, "2": Category.HOME, "3": Category.PERSONAL,
        "4": Category.HEALTH, "5": Category.FINANCE, "6": Category.OTHER
    }
    return category_map[choice]


def get_recurrence_input() -> Recurrence:
    """Get recurrence selection from user."""
    console.print("\n[bright_cyan]Select Recurrence:[/]")
    console.print("  [1] [dim]None[/]    - One-time task")
    console.print("  [2] [bright_cyan]Daily[/]   - Repeats daily")
    console.print("  [3] [bright_blue]Weekly[/]  - Repeats weekly")
    console.print("  [4] [bright_magenta]Monthly[/] - Repeats monthly")

    choice = Prompt.ask(
        "[bright_cyan]Recurrence[/]",
        choices=["1", "2", "3", "4"],
        default="1",
        show_default=True,
    )

    recurrence_map = {
        "1": Recurrence.NONE, "2": Recurrence.DAILY,
        "3": Recurrence.WEEKLY, "4": Recurrence.MONTHLY
    }
    return recurrence_map[choice]


def get_tags_input() -> List[str]:
    """Get tags from user (comma-separated)."""
    tags_str = Prompt.ask(
        "[bright_cyan]Tags (comma-separated)[/]",
        default="",
        show_default=False,
    )
    if not tags_str.strip():
        return []
    return [tag.strip() for tag in tags_str.split(",") if tag.strip()]


def get_due_date_input() -> Optional[datetime]:
    """Get optional due date with time from user."""
    due_str = Prompt.ask(
        "[bright_cyan]Due date (YYYY-MM-DD HH:MM or YYYY-MM-DD)[/]",
        default="",
        show_default=False,
    )

    if not due_str.strip():
        return None

    # Try with time first
    for fmt in ["%Y-%m-%d %H:%M", "%Y-%m-%d"]:
        try:
            dt = datetime.strptime(due_str.strip(), fmt)
            # If no time specified, set to end of day
            if fmt == "%Y-%m-%d":
                dt = dt.replace(hour=23, minute=59)
            return dt
        except ValueError:
            continue

    print_warning("Invalid date format. Skipping due date.")
    return None


def get_reminder_input() -> int:
    """Get reminder setting from user."""
    console.print("\n[bright_cyan]Reminder before due:[/]")
    console.print("  [0] No reminder")
    console.print("  [1] 15 minutes")
    console.print("  [2] 30 minutes")
    console.print("  [3] 1 hour")
    console.print("  [4] 1 day")

    choice = Prompt.ask(
        "[bright_cyan]Reminder[/]",
        choices=["0", "1", "2", "3", "4"],
        default="0",
        show_default=True,
    )

    reminder_map = {"0": 0, "1": 15, "2": 30, "3": 60, "4": 1440}
    return reminder_map[choice]


def display_task_table(tasks: List[Task], title: str = "Your Tasks") -> None:
    """Display tasks in a rich table format."""
    if not tasks:
        console.print()
        panel = Panel(
            "[bright_yellow]No tasks found.[/]",
            title=f"[bright_magenta bold]{title}[/]",
            border_style="bright_blue",
            box=box.ROUNDED,
            padding=(1, 2),
        )
        console.print(panel)
        return

    table = Table(
        title=f"[bright_magenta bold]{title}[/]",
        box=box.ROUNDED,
        border_style="bright_blue",
        header_style="bright_cyan bold",
        show_lines=True,
        padding=(0, 1),
        expand=True,
    )

    table.add_column("ID", style="bright_white bold", justify="center", width=4)
    table.add_column("Pri", justify="center", width=5)
    table.add_column("Cat", justify="center", width=5)
    table.add_column("Title", style="bright_white", width=22, overflow="ellipsis")
    table.add_column("Tags", style="dim", width=12, overflow="ellipsis")
    table.add_column("Status", justify="center", width=10)
    table.add_column("Due", width=18)
    table.add_column("Rec", justify="center", width=4)

    for task in tasks:
        # Priority
        pri_sym, pri_col = get_priority_display(task.priority)

        # Category
        cat_sym, cat_col = get_category_display(task.category)

        # Status
        stat_sym, stat_col = get_status_display(task)
        if task.is_complete:
            status_text = f"[{stat_col}]{stat_sym} Done[/]"
        elif task.is_overdue():
            status_text = f"[{stat_col}]{stat_sym} Late[/]"
        else:
            status_text = f"[{stat_col}]{stat_sym}[/]"

        # Due date
        if task.due_date:
            due_text = format_datetime(task.due_date)
            if task.is_overdue():
                due_text = f"[bright_red]{due_text}[/]"
            elif task.is_due_soon(24):
                due_text = f"[bright_yellow]{due_text}[/]"
        else:
            due_text = "-"

        # Tags
        tags_text = ", ".join(task.tags[:2]) if task.tags else "-"
        if len(task.tags) > 2:
            tags_text += "..."

        # Recurrence
        rec_sym, rec_col = RECURRENCE_DISPLAY.get(task.recurrence, ("", "dim"))

        table.add_row(
            str(task.id),
            f"[{pri_col}]{pri_sym}[/]",
            f"[{cat_col}]{cat_sym}[/]",
            task.title,
            tags_text,
            status_text,
            due_text,
            f"[{rec_col}]{rec_sym}[/]" if rec_sym else "-",
        )

    console.print()
    console.print(table)


def display_task_summary(tasks: List[Task]) -> None:
    """Display task summary statistics."""
    total = len(tasks)
    complete = sum(1 for t in tasks if t.is_complete)
    incomplete = total - complete
    overdue = sum(1 for t in tasks if t.is_overdue())
    due_soon = sum(1 for t in tasks if t.is_due_soon(24))

    summary = Text()
    summary.append(f"Total: ", style="bright_white")
    summary.append(f"{total}", style="bright_cyan bold")
    summary.append(f"  |  ", style="dim")
    summary.append(f"{complete}", style="bright_green bold")
    summary.append(f" done  |  ", style="dim")
    summary.append(f"{incomplete}", style="bright_yellow bold")
    summary.append(f" pending", style="dim")

    if overdue > 0:
        summary.append(f"  |  ", style="dim")
        summary.append(f"{overdue}", style="bright_red bold")
        summary.append(f" overdue", style="dim")

    if due_soon > 0:
        summary.append(f"  |  ", style="dim")
        summary.append(f"{due_soon}", style="bright_yellow bold")
        summary.append(f" due soon", style="dim")

    panel = Panel(summary, border_style="bright_blue", box=box.ROUNDED, padding=(0, 1))
    console.print(panel)


def check_and_display_reminders(manager: TaskManager) -> None:
    """Check for tasks with reminders and display them."""
    reminders = manager.get_tasks_with_reminders()
    if reminders:
        console.print()
        console.print(Panel(
            "[bright_yellow]REMINDER: The following tasks are due soon![/]",
            border_style="bright_yellow",
            box=box.ROUNDED,
        ))
        for task in reminders:
            time_left = task.due_date - datetime.now()
            minutes = int(time_left.total_seconds() / 60)
            console.print(f"  [bright_yellow]>[/] {task.title} - due in {minutes} minutes")
        console.print()


def add_task_flow(manager: TaskManager) -> None:
    """Handle add task interaction."""
    console.print()
    console.print(Panel(
        "[bright_cyan]Add New Task[/]",
        border_style="bright_blue",
        box=box.ROUNDED,
    ))

    title = Prompt.ask("[bright_cyan]Task title[/]")
    if not title.strip():
        print_error("Task title cannot be empty.")
        return

    description = Prompt.ask(
        "[bright_cyan]Description[/]",
        default="",
        show_default=False,
    )

    priority = get_priority_input()
    category = get_category_input()
    tags = get_tags_input()
    due_date = get_due_date_input()
    recurrence = get_recurrence_input()

    reminder = 0
    if due_date:
        reminder = get_reminder_input()

    try:
        task = manager.add_task(
            title=title,
            description=description,
            priority=priority,
            category=category,
            tags=tags,
            due_date=due_date,
            recurrence=recurrence,
            reminder_minutes=reminder,
        )
        console.print()
        print_success(f"Task created successfully! (ID: {task.id})")

        pri_sym, _ = get_priority_display(task.priority)
        cat_sym, cat_col = get_category_display(task.category)
        console.print(f"   [dim]+-[/] {pri_sym} [{cat_col}]{cat_sym}[/] [bright_white]{task.title}[/]")

        if task.recurrence != Recurrence.NONE:
            print_info(f"This is a {task.recurrence.value} recurring task.")
    except ValueError as e:
        print_error(str(e))


def view_tasks_flow(manager: TaskManager) -> None:
    """Handle view tasks interaction."""
    tasks = manager.get_all_tasks()
    display_task_table(tasks)
    if tasks:
        console.print()
        display_task_summary(tasks)


def search_filter_flow(manager: TaskManager) -> None:
    """Handle search and filter interaction."""
    console.print()
    console.print(Panel(
        "[bright_cyan]Search & Filter Tasks[/]",
        border_style="bright_blue",
        box=box.ROUNDED,
    ))

    console.print("\n[bright_cyan]Filter Options:[/]")
    console.print("  [1] Search by keyword")
    console.print("  [2] Filter by status (complete/incomplete)")
    console.print("  [3] Filter by priority")
    console.print("  [4] Filter by category")
    console.print("  [5] Filter by tag")
    console.print("  [6] Show overdue tasks")
    console.print("  [7] Show tasks due soon (24h)")
    console.print("  [8] Advanced filter (combine filters)")
    console.print("  [0] Cancel")

    choice = Prompt.ask(
        "[bright_cyan]Select filter[/]",
        choices=["0", "1", "2", "3", "4", "5", "6", "7", "8"],
        default="0",
    )

    if choice == "0":
        return

    tasks = []
    title = "Filtered Tasks"

    if choice == "1":
        keyword = Prompt.ask("[bright_cyan]Enter search keyword[/]")
        tasks = manager.search_tasks(keyword)
        title = f"Search Results: '{keyword}'"

    elif choice == "2":
        status = Prompt.ask(
            "[bright_cyan]Status[/]",
            choices=["complete", "incomplete"],
        )
        tasks = manager.filter_by_status(status == "complete")
        title = f"Tasks: {status.capitalize()}"

    elif choice == "3":
        priority = get_priority_input()
        tasks = manager.filter_by_priority(priority)
        title = f"Tasks: {priority.value.capitalize()} Priority"

    elif choice == "4":
        category = get_category_input()
        tasks = manager.filter_by_category(category)
        title = f"Tasks: {category.value.capitalize()}"

    elif choice == "5":
        all_tags = manager.get_all_tags()
        if all_tags:
            console.print(f"[dim]Available tags: {', '.join(all_tags)}[/]")
        tag = Prompt.ask("[bright_cyan]Enter tag[/]")
        tasks = manager.filter_by_tag(tag)
        title = f"Tasks with tag: '{tag}'"

    elif choice == "6":
        tasks = manager.filter_overdue()
        title = "Overdue Tasks"

    elif choice == "7":
        tasks = manager.filter_due_soon(24)
        title = "Tasks Due Soon (24h)"

    elif choice == "8":
        # Advanced filter
        console.print("\n[dim]Leave empty to skip filter[/]")

        keyword = Prompt.ask("[bright_cyan]Search keyword[/]", default="", show_default=False)

        status_str = Prompt.ask(
            "[bright_cyan]Status (complete/incomplete/all)[/]",
            choices=["complete", "incomplete", "all"],
            default="all",
        )
        status = None if status_str == "all" else (status_str == "complete")

        use_priority = Confirm.ask("[bright_cyan]Filter by priority?[/]", default=False)
        priority = get_priority_input() if use_priority else None

        use_category = Confirm.ask("[bright_cyan]Filter by category?[/]", default=False)
        category = get_category_input() if use_category else None

        tag = Prompt.ask("[bright_cyan]Tag[/]", default="", show_default=False)

        tasks = manager.advanced_filter(
            keyword=keyword if keyword else None,
            status=status,
            priority=priority,
            category=category,
            tag=tag if tag else None,
        )
        title = "Advanced Filter Results"

    display_task_table(tasks, title)
    if tasks:
        console.print()
        display_task_summary(tasks)


def sort_tasks_flow(manager: TaskManager) -> None:
    """Handle sort tasks interaction."""
    console.print()
    console.print(Panel(
        "[bright_cyan]Sort Tasks[/]",
        border_style="bright_blue",
        box=box.ROUNDED,
    ))

    console.print("\n[bright_cyan]Sort Options:[/]")
    console.print("  [1] By due date (earliest first)")
    console.print("  [2] By priority (highest first)")
    console.print("  [3] Alphabetically (A-Z)")
    console.print("  [4] By creation date (newest first)")
    console.print("  [0] Cancel")

    choice = Prompt.ask(
        "[bright_cyan]Select sort order[/]",
        choices=["0", "1", "2", "3", "4"],
        default="0",
    )

    if choice == "0":
        return

    sort_map = {
        "1": (SortOrder.DUE_DATE, False, "Due Date"),
        "2": (SortOrder.PRIORITY, False, "Priority"),
        "3": (SortOrder.ALPHABETICAL, False, "Alphabetical"),
        "4": (SortOrder.CREATED, True, "Creation Date"),
    }

    sort_by, reverse, title = sort_map[choice]
    tasks = manager.sort_tasks(sort_by=sort_by, reverse=reverse)

    display_task_table(tasks, f"Tasks Sorted by {title}")
    if tasks:
        console.print()
        display_task_summary(tasks)


def statistics_flow(manager: TaskManager) -> None:
    """Display task statistics."""
    stats = manager.get_statistics()

    console.print()
    stats_text = Text()
    stats_text.append("Task Statistics\n\n", style="bright_magenta bold")

    stats_text.append("Overview:\n", style="bright_cyan bold")
    stats_text.append(f"  Total tasks:     {stats['total']}\n", style="bright_white")
    stats_text.append(f"  Completed:       ", style="bright_white")
    stats_text.append(f"{stats['complete']}\n", style="bright_green bold")
    stats_text.append(f"  Incomplete:      ", style="bright_white")
    stats_text.append(f"{stats['incomplete']}\n", style="bright_yellow bold")
    stats_text.append(f"  Overdue:         ", style="bright_white")
    stats_text.append(f"{stats['overdue']}\n", style="bright_red bold")
    stats_text.append(f"  Recurring:       {stats['recurring']}\n", style="bright_white")

    stats_text.append("\nBy Priority (pending):\n", style="bright_cyan bold")
    for pri, count in stats['by_priority'].items():
        sym, col = get_priority_display(pri)
        stats_text.append(f"  {sym} {pri.value.capitalize():<10} ", style=col)
        stats_text.append(f"{count}\n", style="bright_white")

    if stats['by_category']:
        stats_text.append("\nBy Category (pending):\n", style="bright_cyan bold")
        for cat, count in stats['by_category'].items():
            sym, col = get_category_display(cat)
            stats_text.append(f"  [{sym}] {cat.value.capitalize():<10} ", style=col)
            stats_text.append(f"{count}\n", style="bright_white")

    all_tags = manager.get_all_tags()
    if all_tags:
        stats_text.append("\nAll Tags:\n", style="bright_cyan bold")
        stats_text.append(f"  {', '.join(all_tags)}\n", style="dim")

    panel = Panel(
        stats_text,
        border_style="bright_magenta",
        box=box.ROUNDED,
        padding=(1, 2),
    )
    console.print(panel)


def mark_complete_flow(manager: TaskManager) -> None:
    """Handle mark complete interaction."""
    console.print()
    console.print(Panel(
        "[bright_green]Mark Task Complete[/]",
        border_style="bright_green",
        box=box.ROUNDED,
    ))

    task_id = get_task_id_input()
    if task_id is None:
        return

    task = manager.get_task(task_id)
    if task is None:
        print_error(f"Task with ID {task_id} not found.")
        return

    # Check if recurring before marking complete
    is_recurring = task.recurrence != Recurrence.NONE

    completed_task = manager.mark_complete(task_id)
    if completed_task is None:
        print_error(f"Task with ID {task_id} not found.")
    else:
        console.print()
        print_success(f'Task "{completed_task.title}" marked as complete!')
        console.print(f"   [dim]+-[/] [X] [strikethrough dim]{completed_task.title}[/]")

        if is_recurring:
            print_info(f"Next occurrence created ({completed_task.recurrence.value})")


def mark_incomplete_flow(manager: TaskManager) -> None:
    """Handle mark incomplete interaction."""
    console.print()
    console.print(Panel(
        "[bright_yellow]Mark Task Incomplete[/]",
        border_style="bright_yellow",
        box=box.ROUNDED,
    ))

    task_id = get_task_id_input()
    if task_id is None:
        return

    task = manager.mark_incomplete(task_id)
    if task is None:
        print_error(f"Task with ID {task_id} not found.")
    else:
        console.print()
        print_success(f'Task "{task.title}" marked as incomplete!')
        pri_sym, _ = get_priority_display(task.priority)
        console.print(f"   [dim]+-[/] {pri_sym} [bright_white]{task.title}[/]")


def update_task_flow(manager: TaskManager) -> None:
    """Handle update task interaction."""
    console.print()
    console.print(Panel(
        "[bright_cyan]Update Task[/]",
        border_style="bright_cyan",
        box=box.ROUNDED,
    ))

    task_id = get_task_id_input("Enter task ID to update")
    if task_id is None:
        return

    task = manager.get_task(task_id)
    if task is None:
        print_error(f"Task with ID {task_id} not found.")
        return

    # Show current task details
    console.print()
    console.print("[dim]Current task details:[/]")
    pri_sym, pri_col = get_priority_display(task.priority)
    cat_sym, cat_col = get_category_display(task.category)
    console.print(f"  [dim]Title:[/]       [bright_white]{task.title}[/]")
    console.print(f"  [dim]Description:[/] [bright_white]{task.description or '-'}[/]")
    console.print(f"  [dim]Priority:[/]    [{pri_col}]{pri_sym} {task.priority.value.capitalize()}[/]")
    console.print(f"  [dim]Category:[/]    [{cat_col}]{cat_sym} {task.category.value.capitalize()}[/]")
    console.print(f"  [dim]Tags:[/]        [bright_white]{', '.join(task.tags) if task.tags else '-'}[/]")
    console.print(f"  [dim]Due:[/]         [bright_white]{format_datetime(task.due_date)}[/]")
    console.print(f"  [dim]Recurrence:[/]  [bright_white]{task.recurrence.value.capitalize()}[/]")
    console.print()

    print_info("Press Enter to keep current value")
    console.print()

    new_title = Prompt.ask("[bright_cyan]New title[/]", default="", show_default=False)
    new_description = Prompt.ask("[bright_cyan]New description[/]", default="", show_default=False)

    update_priority = Confirm.ask("[bright_cyan]Update priority?[/]", default=False)
    new_priority = get_priority_input() if update_priority else None

    update_category = Confirm.ask("[bright_cyan]Update category?[/]", default=False)
    new_category = get_category_input() if update_category else None

    update_tags = Confirm.ask("[bright_cyan]Update tags?[/]", default=False)
    new_tags = get_tags_input() if update_tags else None

    update_due = Confirm.ask("[bright_cyan]Update due date?[/]", default=False)
    new_due_date = get_due_date_input() if update_due else None

    update_recurrence = Confirm.ask("[bright_cyan]Update recurrence?[/]", default=False)
    new_recurrence = get_recurrence_input() if update_recurrence else None

    try:
        result = manager.update_task(
            task_id,
            title=new_title.strip() if new_title.strip() else None,
            description=new_description if new_description else None,
            priority=new_priority,
            category=new_category,
            tags=new_tags,
            due_date=new_due_date,
            recurrence=new_recurrence,
        )
        if result:
            console.print()
            print_success("Task updated successfully!")
            pri_sym, _ = get_priority_display(result.priority)
            console.print(f"   [dim]+-[/] {pri_sym} [bright_white]{result.title}[/]")
    except ValueError as e:
        print_error(str(e))


def delete_task_flow(manager: TaskManager) -> None:
    """Handle delete task interaction."""
    console.print()
    console.print(Panel(
        "[bright_red]Delete Task[/]",
        border_style="bright_red",
        box=box.ROUNDED,
    ))

    task_id = get_task_id_input("Enter task ID to delete")
    if task_id is None:
        return

    task = manager.get_task(task_id)
    if task is None:
        print_error(f"Task with ID {task_id} not found.")
        return

    console.print()
    console.print("[bright_yellow]Task to delete:[/]")
    pri_sym, _ = get_priority_display(task.priority)
    console.print(f"   {pri_sym} [bright_white]{task.title}[/]")
    console.print()

    confirm = Confirm.ask(
        "[bright_red]Are you sure you want to delete this task?[/]",
        default=False,
    )

    if not confirm:
        print_info("Deletion cancelled.")
        return

    deleted = manager.delete_task(task_id)
    if deleted:
        console.print()
        print_success(f'Task "{deleted.title}" deleted successfully!')
    else:
        print_error(f"Task with ID {task_id} not found.")


def display_welcome() -> None:
    """Display welcome banner on application start."""
    welcome_text = Text()
    welcome_text.append("Welcome to ", style="bright_white")
    welcome_text.append("Evolution Todo", style="bright_magenta bold")
    welcome_text.append("!\n\n", style="bright_white")
    welcome_text.append("Your professional task management companion.\n", style="dim")
    welcome_text.append("Now with search, filters, categories, tags & recurring tasks!", style="dim")

    panel = Panel(
        welcome_text,
        title="[bright_cyan]Evolution Todo v2.0[/]",
        subtitle="[dim]Enhanced Console Edition[/]",
        border_style="bright_magenta",
        box=box.DOUBLE,
        padding=(1, 2),
    )
    console.print()
    console.print(panel)


def display_goodbye() -> None:
    """Display goodbye message on exit."""
    console.print()
    goodbye_text = Text()
    goodbye_text.append("Thank you for using ", style="bright_white")
    goodbye_text.append("Evolution Todo", style="bright_magenta bold")
    goodbye_text.append("!\n", style="bright_white")
    goodbye_text.append("See you next time!", style="bright_cyan")

    panel = Panel(
        goodbye_text,
        border_style="bright_magenta",
        box=box.ROUNDED,
        padding=(0, 2),
    )
    console.print(panel)
    console.print()
