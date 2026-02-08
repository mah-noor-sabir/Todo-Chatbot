"""
Bulk Operation Guard module.
Provides protection against excessive bulk operations that could impact performance.
"""

import time
from typing import Optional


class BulkOperationGuard:
    """
    A guard class to prevent excessive bulk operations that could impact system performance.
    Tracks operation counts and enforces limits to protect the system.
    """
    
    def __init__(self, max_operations_per_minute: int = 100):
        """
        Initialize the guard with operation limits.
        
        Args:
            max_operations_per_minute: Maximum allowed operations per minute
        """
        self.max_operations_per_minute = max_operations_per_minute
        self.operation_timestamps = []
        
    def can_perform_operation(self) -> bool:
        """
        Check if another operation can be performed within limits.
        
        Returns:
            True if operation is allowed, False otherwise
        """
        current_time = time.time()
        # Remove timestamps older than 1 minute
        self.operation_timestamps = [
            ts for ts in self.operation_timestamps 
            if current_time - ts < 60
        ]
        
        # Check if we're under the limit
        return len(self.operation_timestamps) < self.max_operations_per_minute
    
    def record_operation(self):
        """
        Record that an operation has been performed.
        Should be called after a successful operation.
        """
        self.operation_timestamps.append(time.time())
    
    def get_remaining_operations(self) -> int:
        """
        Get the number of remaining operations allowed in the current minute.
        
        Returns:
            Number of remaining operations allowed
        """
        current_time = time.time()
        # Remove timestamps older than 1 minute
        self.operation_timestamps = [
            ts for ts in self.operation_timestamps 
            if current_time - ts < 60
        ]
        
        return max(0, self.max_operations_per_minute - len(self.operation_timestamps))