# Passwordless.dev Integration Plan

## Credentials
- API URL: https://v4.passwordless.dev
- Public Key: photonictag:public:31a020c4640e4566ad5a3d1b3ea97498
- Secret Key: photonictag:secret:0d9e988f940d40a6ae8631dcc177b9d6

## Implementation Steps

### 1. Environment Variables
- [ ] Add PASSWORDLESS_API_URL
- [ ] Add PASSWORDLESS_PUBLIC_KEY
- [ ] Add PASSWORDLESS_SECRET_KEY

### 2. Backend (Server)
- [ ] Install @passwordlessdev/passwordless-nodejs
- [ ] Create passwordless service
- [ ] Add /auth/passwordless/register endpoint
- [ ] Add /auth/passwordless/login endpoint
- [ ] Add /auth/passwordless/verify endpoint
- [ ] Update session handling

### 3. Frontend (Client)
- [ ] Install @passwordlessdev/passwordless-client
- [ ] Create PasswordlessLogin component
- [ ] Update auth context
- [ ] Add WebAuthn registration flow

### 4. Database
- [ ] Add credential_id field to users table
- [ ] Migration for existing users

### 5. Testing
- [ ] Test registration flow
- [ ] Test login flow
- [ ] Test error handling
