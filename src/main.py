"""Main entry point for Phase I Todo Console Application - Enhanced Edition.

Reference: specs/002-enhanced-task-features/spec.md
Features: CRUD, search, filter, sort, categories, tags, recurring tasks, reminders
"""

from services.task_manager import TaskManager
from cli.menu import (
    display_menu,
    display_welcome,
    display_goodbye,
    get_user_choice,
    add_task_flow,
    view_tasks_flow,
    search_filter_flow,
    update_task_flow,
    delete_task_flow,
    mark_complete_flow,
    mark_incomplete_flow,
    sort_tasks_flow,
    statistics_flow,
    check_and_display_reminders,
)


def main() -> None:
    """Main application loop.

    Initializes TaskManager and routes user choices to appropriate flows.
    Menu options:
        1: Add Task
        2: View Tasks
        3: Search/Filter
        4: Update Task
        5: Delete Task
        6: Mark Complete
        7: Mark Incomplete
        8: Sort Tasks
        9: Statistics
        0: Exit
    """
    manager = TaskManager()

    # Display welcome banner
    display_welcome()

    # Check for reminders on startup
    check_and_display_reminders(manager)

    while True:
        display_menu()
        choice = get_user_choice()

        if choice == 1:
            add_task_flow(manager)
        elif choice == 2:
            view_tasks_flow(manager)
        elif choice == 3:
            search_filter_flow(manager)
        elif choice == 4:
            update_task_flow(manager)
        elif choice == 5:
            delete_task_flow(manager)
        elif choice == 6:
            mark_complete_flow(manager)
        elif choice == 7:
            mark_incomplete_flow(manager)
        elif choice == 8:
            sort_tasks_flow(manager)
        elif choice == 9:
            statistics_flow(manager)
        elif choice == 0:
            display_goodbye()
            break


if __name__ == "__main__":
    main()
