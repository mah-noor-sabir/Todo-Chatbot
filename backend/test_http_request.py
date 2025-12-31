"""Test HTTP request directly"""
import asyncio
import httpx

async def test_signup():
    async with httpx.AsyncClient() as client:
        try:
            response = await client.post(
                "http://localhost:8000/auth/signup",
                json={"email": "httptest@example.com", "password": "Password123"},
                timeout=10.0
            )
            print(f"Status: {response.status_code}")
            print(f"Response: {response.text}")
        except Exception as e:
            print(f"Error: {e}")
            import traceback
            traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(test_signup())
