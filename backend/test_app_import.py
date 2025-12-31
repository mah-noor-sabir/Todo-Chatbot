"""Test app imports"""
import sys
sys.path.insert(0, 'src')

try:
    print("Importing main...")
    from src.main import app
    print("Success! App imported correctly")
    print(f"Routes: {[route.path for route in app.routes]}")
except Exception as e:
    print(f"Error importing: {e}")
    import traceback
    traceback.print_exc()
