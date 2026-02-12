"""
Test script to verify that the chatbot endpoint works without throwing 500 errors.
This tests the fixes applied to the database session management and API key handling.
"""
import asyncio
import httpx
import sys
import os

# Add the backend directory to the path so imports work correctly
sys.path.insert(0, os.path.join(os.path.dirname(__file__)))

from src.main import app
from src.core.config import settings


async def test_chat_endpoint():
    """Test the chat endpoint to ensure it doesn't throw 500 errors."""
    
    # Create a test client
    async with httpx.AsyncClient(app=app, base_url="http://testserver") as client:
        # First, we need to authenticate to get a session cookie
        # Since we don't have a user yet, let's try to sign up first
        
        # Try to create a test user
        signup_data = {
            "first_name": "Test",
            "last_name": "User", 
            "email": "testuser@example.com",
            "password": "TestPassword123!"
        }
        
        try:
            signup_response = await client.post("/auth/signup", json=signup_data)
            print(f"Signup status: {signup_response.status_code}")
            print(f"Signup response: {signup_response.text}")
        except Exception as e:
            print(f"Signup error: {e}")
        
        # Now try to log in
        login_data = {
            "email": "testuser@example.com",
            "password": "TestPassword123!"
        }
        
        try:
            login_response = await client.post("/auth/login", json=login_data)
            print(f"Login status: {login_response.status_code}")
            
            # Extract session cookie if login was successful
            session_cookie = None
            if "set-cookie" in login_response.headers:
                cookies = login_response.headers.get_list("set-cookie")
                for cookie in cookies:
                    if "session=" in cookie:
                        session_cookie = cookie.split(";")[0]
                        break
            
            print(f"Session cookie: {session_cookie}")
            
            # Now test the chat endpoint
            chat_data = {
                "message": "Hello, can you help me create a task?",
                "conversation_id": None
            }
            
            # Set the session cookie in the headers
            headers = {}
            if session_cookie:
                headers["Cookie"] = session_cookie
            
            chat_response = await client.post("/api/chat", json=chat_data, headers=headers)
            print(f"Chat status: {chat_response.status_code}")
            print(f"Chat response: {chat_response.text}")
            
            return chat_response.status_code != 500
            
        except Exception as e:
            print(f"Error during test: {e}")
            import traceback
            traceback.print_exc()
            return False


if __name__ == "__main__":
    print("Testing chatbot endpoint...")
    success = asyncio.run(test_chat_endpoint())
    
    if success:
        print("\nTest passed! Chatbot endpoint is working without 500 errors.")
    else:
        print("\nTest failed! Chatbot endpoint still has issues.")