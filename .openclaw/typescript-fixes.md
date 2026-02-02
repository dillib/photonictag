# TypeScript Fixes Required

## Strategy: Comment Out OAuth, Fix Core Issues

### Files to Modify:

1. **server/auth/strategies/google.ts** - Comment out (no OAuth credentials yet)
2. **server/auth/strategies/microsoft.ts** - Comment out (no OAuth credentials yet)  
3. **server/auth/strategies/local.ts** - Keep (core auth)
4. **client/src/pages/sap-connector.tsx** - Fix null check
5. **server/services/sap-mock-service.ts** - Fix type annotations
6. **server/services/sap-sync-service.ts** - Fix null guards
7. **server/storage.ts** - Fix Drizzle type mismatches
8. **server/routes.ts** - Fix metadata type
9. **server/auth/email-service.ts** - Comment out (no SMTP yet)

### Approach:
- Keep core features working
- Disable OAuth until credentials are ready
- Fix all type safety issues
- Ensure build passes
