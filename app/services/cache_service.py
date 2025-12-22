"""
Redis caching service for high-traffic read endpoints.

Provides:
- TTL-based caching
- Automatic key namespacing
- Cache invalidation helpers
- Async Redis operations
"""

import json
import hashlib
from typing import Optional, Any
from datetime import date, timedelta
from decimal import Decimal

try:
    import redis.asyncio as redis
    REDIS_AVAILABLE = True
except ImportError:
    REDIS_AVAILABLE = False


class CacheService:
    """
    Async Redis cache service with fallback to no-cache mode.
    
    Features:
    - Automatic serialization/deserialization
    - TTL support
    - Graceful degradation if Redis unavailable
    - Cache key namespacing
    """
    
    def __init__(self):
        self.client: Optional[redis.Redis] = None
        self.enabled = False
        
    async def connect(self, redis_url: str = "redis://localhost:6379/0"):
        """
        Connect to Redis server.
        
        Args:
            redis_url: Redis connection URL
        """
        if not REDIS_AVAILABLE:
            print("⚠️  Redis not installed. Caching disabled.")
            return
        
        try:
            self.client = redis.from_url(redis_url, decode_responses=True)
            await self.client.ping()
            self.enabled = True
            print("✅ Redis cache connected")
        except Exception as e:
            print(f"⚠️  Redis connection failed: {e}. Running without cache.")
            self.enabled = False
    
    async def close(self):
        """Close Redis connection."""
        if self.client:
            await self.client.close()
    
    def _make_key(self, prefix: str, **kwargs) -> str:
        """
        Generate cache key from prefix and parameters.
        
        Args:
            prefix: Key prefix (e.g., 'calendar:availability')
            **kwargs: Key parameters
        
        Returns:
            Cache key string
        
        Example:
            _make_key('calendar', start='2025-01-01', end='2025-01-31')
            => 'calendar:2025-01-01:2025-01-31'
        """
        parts = [prefix]
        for key, value in sorted(kwargs.items()):
            parts.append(str(value))
        return ":".join(parts)
    
    def _serialize(self, data: Any) -> str:
        """
        Serialize Python objects to JSON string.
        Handles Decimal, date, and other non-JSON types.
        """
        def default(obj):
            if isinstance(obj, Decimal):
                return str(obj)
            if isinstance(obj, (date,)):
                return obj.isoformat()
            raise TypeError(f"Type {type(obj)} not JSON serializable")
        
        return json.dumps(data, default=default)
    
    def _deserialize(self, data: str) -> Any:
        """Deserialize JSON string to Python objects."""
        return json.loads(data)
    
    async def get(self, key_prefix: str, **kwargs) -> Optional[Any]:
        """
        Get cached value.
        
        Args:
            key_prefix: Cache key prefix
            **kwargs: Key parameters
        
        Returns:
            Cached value or None if not found/expired
        """
        if not self.enabled:
            return None
        
        try:
            key = self._make_key(key_prefix, **kwargs)
            data = await self.client.get(key)
            if data:
                return self._deserialize(data)
            return None
        except Exception as e:
            print(f"Cache GET error: {e}")
            return None
    
    async def set(
        self,
        key_prefix: str,
        value: Any,
        ttl: int = 300,  # 5 minutes default
        **kwargs
    ) -> bool:
        """
        Set cache value with TTL.
        
        Args:
            key_prefix: Cache key prefix
            value: Value to cache
            ttl: Time to live in seconds
            **kwargs: Key parameters
        
        Returns:
            True if successful, False otherwise
        """
        if not self.enabled:
            return False
        
        try:
            key = self._make_key(key_prefix, **kwargs)
            serialized = self._serialize(value)
            await self.client.setex(key, ttl, serialized)
            return True
        except Exception as e:
            print(f"Cache SET error: {e}")
            return False
    
    async def delete(self, key_prefix: str, **kwargs) -> bool:
        """
        Delete cached value.
        
        Args:
            key_prefix: Cache key prefix
            **kwargs: Key parameters
        
        Returns:
            True if deleted, False otherwise
        """
        if not self.enabled:
            return False
        
        try:
            key = self._make_key(key_prefix, **kwargs)
            await self.client.delete(key)
            return True
        except Exception as e:
            print(f"Cache DELETE error: {e}")
            return False
    
    async def delete_pattern(self, pattern: str) -> int:
        """
        Delete all keys matching pattern.
        
        Args:
            pattern: Redis key pattern (e.g., 'calendar:*')
        
        Returns:
            Number of keys deleted
        """
        if not self.enabled:
            return 0
        
        try:
            keys = await self.client.keys(pattern)
            if keys:
                return await self.client.delete(*keys)
            return 0
        except Exception as e:
            print(f"Cache DELETE PATTERN error: {e}")
            return 0


# Global cache instance
cache = CacheService()


# Cache invalidation helpers
async def invalidate_calendar_cache():
    """Invalidate all calendar caches."""
    await cache.delete_pattern("calendar:*")


async def invalidate_analytics_cache():
    """Invalidate all analytics caches."""
    await cache.delete_pattern("analytics:*")


async def invalidate_room_types_cache():
    """Invalidate room types cache."""
    await cache.delete("room_types:all")
