# Authentication Pages & Components

This document outlines the authentication pages and components created for the Better Auth migration.

## Pages Created

### 1. **Sign In Page** (`/login`)

- **File**: `src/app/(auth)/login/page.tsx`
- **Features**:
  - Email/password authentication
  - Discord OAuth integration
  - Form validation
  - Error handling
  - Link to sign-up page

### 2. **Sign Up Page** (`/register`)

- **File**: `src/app/(auth)/register/page.tsx`
- **Features**:
  - Email/password registration
  - Password confirmation
  - Minimum password length validation (6 characters)
  - Discord OAuth signup
  - Form validation
  - Link to sign-in page

### 3. **Profile Page** (`/profile`)

- **File**: `src/app/profile/page.tsx`
- **Features**:
  - Displays session information
  - User details (name, email, ID)
  - Session details (ID, expiration)
  - Full session JSON preview
  - Sign out button
  - Responsive design

### 4. **Dashboard** (`/dashboard`)

- **File**: `src/app/dashboard/page.tsx`
- **Features**:
  - Main entry point for logged-in users
  - Navigation with session-aware links
  - Welcome message with user information
  - Quick access to key features
  - Unauthenticated user guidance

## Components

### SessionCard Component

- **File**: `src/components/SessionCard.tsx`
- **Purpose**: Displays comprehensive session information
- **Features**:
  - User avatar display
  - User information (name, email, ID)
  - Session details (ID, expiration)
  - Full session data preview (JSON)
  - Sign out button
  - Loading and unauthenticated states
  - Responsive design

## Usage Examples

### Using the Session Hook

```typescript
"use client";

import { useSession } from "~/lib/auth-client";

export default function MyComponent() {
  const { data: session, isPending } = useSession();

  if (isPending) return <div>Loading...</div>;
  if (!session) return <div>Not authenticated</div>;

  return <div>Hello, {session.user?.name}!</div>;
}
```

### Sign In Function

```typescript
import { signIn } from "~/lib/auth-client";

// Email/password login
const result = await signIn.email({
  email: "user@example.com",
  password: "password",
  callbackURL: "/dashboard",
});

// Discord OAuth
const result = await signIn.social({
  provider: "discord",
  callbackURL: "/dashboard",
});
```

### Sign Out Function

```typescript
import { signOut } from "~/lib/auth-client";

const handleSignOut = async () => {
  await signOut({
    fetchOptions: {
      onSuccess: () => {
        router.push("/");
      },
    },
  });
};
```

## Authentication Flow

1. **User Visits App**

   - If authenticated → Redirect to dashboard
   - If not authenticated → Show login/register option

2. **Sign Up Process**

   - User enters: name, email, password, confirm password
   - Validation: Password length, password match
   - On success → Auto login → Redirect to dashboard

3. **Sign In Process**

   - User enters: email, password
   - Validation: Required fields
   - On success → Redirect to dashboard

4. **Profile Management**
   - User visits `/profile`
   - View session information
   - View full user details
   - Option to sign out

## Styling

All components use Tailwind CSS with a blue color scheme:

- Primary: `bg-blue-600`
- Hover: `bg-blue-700`
- Light: `bg-blue-50`
- Borders: `border-blue-300`

## Security Features

✅ Password validation (minimum 6 characters)  
✅ Password confirmation on signup  
✅ Secure session management with Better Auth  
✅ Environment-based API URLs  
✅ Discord OAuth provider integration  
✅ Error handling and user feedback

## Next Steps

1. Update environment variables in `.env.local`:

   ```
   AUTH_DISCORD_ID=your_discord_client_id
   AUTH_DISCORD_SECRET=your_discord_client_secret
   ```

2. Run database migrations:

   ```bash
   pnpm db:push
   ```

3. Test authentication flows:

   - Email/password signup
   - Email/password login
   - Discord OAuth
   - Profile viewing
   - Sign out

4. Customize styling as needed to match your branding
