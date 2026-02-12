"""
Test script to verify that messages are properly stored and can be retrieved via the new history endpoint.
"""
import asyncio
import httpx
import sys
import os

# Add the backend directory to the path so imports work correctly
sys.path.insert(0, os.path.join(os.path.dirname(__file__)))

from src.main import app


async def test_message_storage_and_retrieval():
    """Test that messages are stored and can be retrieved properly."""
    
    # Create a test client
    async with httpx.AsyncClient(app=app, base_url="http://testserver") as client:
        # Create a test user
        signup_data = {
            "first_name": "History",
            "last_name": "Test", 
            "email": "historytest@example.com",
            "password": "HistoryPassword123!"
        }
        
        try:
            signup_response = await client.post("/auth/signup", json=signup_data)
            print(f"Signup status: {signup_response.status_code}")
        except Exception as e:
            print(f"Signup error: {e}")
        
        # Login
        login_data = {
            "email": "historytest@example.com",
            "password": "HistoryPassword123!"
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
            
            # Send a few messages to create conversation history
            print("\n--- Creating conversation history ---")
            
            # First message
            chat_data1 = {
                "message": "First message in the conversation",
                "conversation_id": None
            }
            headers = {"Cookie": session_cookie} if session_cookie else {}
            
            chat_response1 = await client.post("/api/chat", json=chat_data1, headers=headers)
            response_data1 = chat_response1.json()
            conversation_id = response_data1.get('conversation_id')
            print(f"Conversation ID: {conversation_id}")
            
            # Second message
            chat_data2 = {
                "message": "Second message in the conversation",
                "conversation_id": conversation_id
            }
            chat_response2 = await client.post("/api/chat", json=chat_data2, headers=headers)
            
            # Third message
            chat_data3 = {
                "message": "Third message in the conversation",
                "conversation_id": conversation_id
            }
            chat_response3 = await client.post("/api/chat", json=chat_data3, headers=headers)
            
            print("Messages sent successfully")
            
            # Now retrieve the conversation history
            print("\n--- Retrieving conversation history ---")
            history_response = await client.get(f"/api/chat/history/{conversation_id}", headers=headers)
            print(f"History status: {history_response.status_code}")
            
            if history_response.status_code == 200:
                history_data = history_response.json()
                print(f"Number of messages retrieved: {len(history_data)}")
                
                print("\nMessages in conversation:")
                for i, msg in enumerate(history_data):
                    print(f"  {i+1}. [{msg['role']}] {msg['content']} (at {msg['created_at']})")
                
                # Verify that we have the expected messages
                user_messages = [msg for msg in history_data if msg['role'] == 'user']
                assistant_messages = [msg for msg in history_data if msg['role'] == 'assistant']
                
                print(f"\nSummary: {len(user_messages)} user messages, {len(assistant_messages)} assistant messages")
                
                # Check if our original messages are present
                original_messages = ["First message in the conversation", 
                                   "Second message in the conversation", 
                                   "Third message in the conversation"]
                
                found_originals = 0
                for orig_msg in original_messages:
                    for msg in user_messages:
                        if orig_msg in msg['content']:
                            found_originals += 1
                            break
                
                print(f"Found {found_originals}/{len(original_messages)} original user messages")
                
                if found_originals == len(original_messages):
                    print("\nSUCCESS: All user messages are properly stored and retrievable!")
                    return True
                else:
                    print("\nFAILURE: Some user messages are missing from history")
                    return False
            else:
                print(f"Failed to retrieve history: {history_response.text}")
                return False
            
        except Exception as e:
            print(f"Error during test: {e}")
            import traceback
            traceback.print_exc()
            return False


if __name__ == "__main__":
    print("Testing message storage and retrieval...")
    success = asyncio.run(test_message_storage_and_retrieval())
    
    if success:
        print("\nTest passed! Messages are properly stored and retrievable.")
    else:
        print("\nTest failed! There are issues with message storage/retrieval.")