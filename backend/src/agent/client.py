from openai import AsyncOpenAI

from src.core.config import settings


def get_openrouter_client() -> AsyncOpenAI:
    """
    Get OpenRouter client configured with OpenRouter API key and base URL.
    OpenRouter is compatible with OpenAI SDK via base_url override.
    """
    return AsyncOpenAI(
        api_key=settings.OPENROUTER_API_KEY,
        base_url=settings.OPENROUTER_BASE_URL
    )
