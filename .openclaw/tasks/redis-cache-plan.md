# Redis Caching Implementation Plan

## Goal
Add Redis caching to ensure <3 second scan response times and reduce database load.

## Implementation Steps

### 1. Install Dependencies
- [ ] Add `ioredis` package
- [ ] Add `@types/ioredis` (if needed)

### 2. Create Cache Service
- [ ] Create `server/services/cache-service.ts`
- [ ] Implement get/set/delete with TTL
- [ ] Add cache key generation helpers
- [ ] Add cache invalidation logic

### 3. Update Product Service
- [ ] Cache product lookups
- [ ] Cache QR code lookups
- [ ] Invalidate on updates

### 4. Update QR Service
- [ ] Cache scan lookups
- [ ] Pre-warm cache for popular products

### 5. Environment Configuration
- [ ] Add REDIS_URL to .env
- [ ] Update .env.example
- [ ] Configure Railway Redis add-on

### 6. Testing
- [ ] Verify cache hits/misses
- [ ] Measure response time improvement

## Cache Strategy
- **Product Data:** Cache for 5 minutes (TTL: 300s)
- **QR Lookups:** Cache for 10 minutes (TTL: 600s)
- **Scan Analytics:** Cache for 1 minute (TTL: 60s)

## Expected Performance
- **Before:** 50-200ms DB query
- **After:** 5-20ms cache hit
