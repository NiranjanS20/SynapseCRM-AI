from __future__ import annotations

from collections.abc import Awaitable, Callable

from tenacity import AsyncRetrying, retry_if_exception_type, stop_after_attempt, wait_exponential


async def with_retry(
    fn: Callable[[], Awaitable],
    attempts: int = 3,
    retry_exceptions: tuple[type[Exception], ...] = (Exception,),
):
    async for attempt in AsyncRetrying(
        stop=stop_after_attempt(attempts),
        wait=wait_exponential(multiplier=0.5, min=0.5, max=4),
        retry=retry_if_exception_type(retry_exceptions),
        reraise=True,
    ):
        with attempt:
            return await fn()
