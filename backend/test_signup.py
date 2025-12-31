"""Test signup endpoint directly"""
import asyncio
import sys
sys.path.insert(0, 'src')

from sqlalchemy.ext.asyncio import AsyncSession
from src.core.database import AsyncSessionLocal
from src.models.user import UserCreate
from src.services.auth_service import AuthService

async def test_signup():
    """Test user registration"""
    try:
        async with AsyncSessionLocal() as session:
            auth_service = AuthService(session)
            import random
            random_email = f"test{random.randint(1000,9999)}@example.com"
            user_data = UserCreate(email=random_email, password="Password123")

            print("Testing user registration...")
            print(f"Email: {user_data.email}")
            print(f"Password: {user_data.password}")

            user = await auth_service.register_user(user_data)
            print("\nSuccess! User created:")
            print(f"ID: {user.id}")
            print(f"Email: {user.email}")
            print(f"Created at: {user.created_at}")

    except Exception as e:
        print(f"\nError: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(test_signup())
