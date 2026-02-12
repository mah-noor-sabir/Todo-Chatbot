"""
Debug script to test message storage and retrieval in the chatbot.
This will help identify why user messages might appear to disappear.
"""
import asyncio
import httpx
import sys
import os

# Add the backend directory to the path so imports work correctly
sys.path.insert(0, os.path.join(os.path.dirname(__file__)))

from src.main import app
from src.core.config import settings


async def debug_chat_flow():
    """Debug the full chat flow to identify where messages might be disappearing."""
    
    # Create a test client
    async with httpx.AsyncClient(app=app, base_url="http://testserver") as client:
        # Create a test user
        signup_data = {
            "first_name": "Debug",
            "last_name": "User", 
            "email": "debug@example.com",
            "password": "DebugPassword123!"
        }
        
        try:
            signup_response = await client.post("/auth/signup", json=signup_data)
            print(f"Signup status: {signup_response.status_code}")
        except Exception as e:
            print(f"Signup error: {e}")
        
        # Login
        login_data = {
            "email": "debug@example.com",
            "password": "DebugPassword123!"
        }
        
        try:
            login_response = await client.post("/auth/login", json=login_data)
            print(f"Login status: {login_response.status_code}")
            
            # Extract session cookie
            session_cookie = None
            if "set-cookie" in login_response.headers:
                cookies = login_response.headers.get_list("set-cookie")
                for cookie in cookies:
                    if "session=" in cookie:
                        session_cookie = cookie.split(";")[0]
                        break
            
            print(f"Session cookie obtained: {bool(session_cookie)}")
            
            # Test 1: Send first message
            print("\n--- Test 1: Sending first message ---")
            chat_data = {
                "message": "Hello, this is my first message!",
                "conversation_id": None
            }
            
            headers = {}
            if session_cookie:
                headers["Cookie"] = session_cookie
            
            chat_response = await client.post("/api/chat", json=chat_data, headers=headers)
            print(f"First chat status: {chat_response.status_code}")
            response_data = chat_response.json()
            print(f"First chat response: {response_data}")
            
            conversation_id = response_data.get('conversation_id')
            print(f"Conversation ID: {conversation_id}")
            
            # Test 2: Send second message to same conversation
            print("\n--- Test 2: Sending second message ---")
            chat_data2 = {
                "message": "This is my second message in the same conversation.",
                "conversation_id": conversation_id
            }
            
            chat_response2 = await client.post("/api/chat", json=chat_data2, headers=headers)
            print(f"Second chat status: {chat_response2.status_code}")
            response_data2 = chat_response2.json()
            print(f"Second chat response: {response_data2}")
            
            # Test 3: Check if we can retrieve conversation history
            print("\n--- Test 3: Checking message persistence ---")
            # We don't have a direct API endpoint to get conversation history
            # But we can check if the bot's responses make sense based on context
            
            # Test 4: Send a message that references previous context
            print("\n--- Test 4: Sending contextual message ---")
            chat_data3 = {
                "message": "Can you repeat what I said in my first message?",
                "conversation_id": conversation_id
            }
            
            chat_response3 = await client.post("/api/chat", json=chat_data3, headers=headers)
            print(f"Contextual chat status: {chat_response3.status_code}")
            response_data3 = chat_response3.json()
            print(f"Contextual chat response: {response_data3}")
            
            print("\n--- Debug Summary ---")
            print("If the bot can reference previous messages, then messages are being stored correctly.")
            print("If not, there may be an issue with message storage or retrieval.")
            
            return chat_response.status_code != 500 and chat_response2.status_code != 500
            
        except Exception as e:
            print(f"Error during debug: {e}")
            import traceback
            traceback.print_exc()
            return False


if __name__ == "__main__":
    print("Debugging chat message flow...")
    success = asyncio.run(debug_chat_flow())
    
    if success:
        print("\nDebug completed successfully!")
    else:
        print("\nDebug encountered issues.")