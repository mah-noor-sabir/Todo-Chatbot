import os
import sys
from pathlib import Path

# Add the parent directory to the path so imports work correctly
sys.path.insert(0, str(Path(__file__).parent.parent))

from src.main import app

# This file is used for Hugging Face Spaces deployment
# It imports the main FastAPI app from src.main

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=int(os.environ.get("PORT", 8000)))