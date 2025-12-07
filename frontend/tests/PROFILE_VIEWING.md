# Profile Viewing Functionality

## Overview
This document describes the implemented profile viewing functionality that allows users to view other users' profiles while maintaining proper access controls.

## Features

### 1. User Profile Access
- Users can view their own profiles
- Users can view other users' profiles
- Admin users are redirected to the admin panel when clicking their avatar
- Guest users can view public profiles

### 2. Navigation Components

#### UserAvatar Component (Navigation.tsx)
- Regular users are directed to their own profile: `/profile?id={user.id}`
- Admin users are directed to the admin panel: `/admin`

#### CommentItem Component
- Authenticated comment authors link to their profile: `/profile?id={user.id}`
- Anonymous comments link to the general profile page: `/profile`

### 3. Profile Header Controls
- Edit button is only visible on the user's own profile
- Action buttons (Write, Friend) are visible on other users' profiles
- Admin badge is displayed for admin users

## Implementation Details

### URL Structure
Profiles are accessed via the URL pattern: `/profile?id={user_id}`

### Backend API
The backend exposes a public endpoint for viewing user profiles:
```
GET /api/users/{id}
```

### Frontend Logic

#### Profile Page Logic (profile/page.tsx)
The profile page determines whether the current user is viewing their own profile or another user's profile:

1. Extracts user ID from URL query parameters (`id`)
2. Compares with authenticated user's ID to determine `isOwnProfile`
3. Allows guest users to view other users' profiles
4. Redirects unauthenticated users trying to view their own profile to login

Key logic:
```typescript
// Get user ID from query parameters
const userIdParam = searchParams.get('id');
const userId = userIdParam ? parseInt(userIdParam, 10) : null;

// Determine if this is the current user's profile
const isOwnProfile = (!userId || (currentUser && userId === currentUser.id)) || false;
```

#### Navigation.tsx
Fixed the UserAvatar component to properly link to user profiles:
```typescript
// FIXED: Redirect admins to admin panel, regular users to their own profile
// For viewing other users' profiles, the link should include the user ID as a query parameter
// This ensures that when a user clicks on their avatar, they go to their own profile
// Other users' profiles are viewed by navigating to /profile?id={user_id}
const profileHref = user.role === 'admin' ? '/admin' : `/profile?id=${user.id}`;
```

#### CommentItem.tsx
Fixed comment author links to properly link to user profiles:
```typescript
{/* FIXED: Link to user profile with ID parameter for authenticated users
     This allows users to view other users' profiles by clicking on their names in comments
     Anonymous users will be directed to the general profile page */}
<Link 
  href={isAuthoredByUser() && comment.user?.id ? `/profile?id=${comment.user.id}` : `/profile`} 
  className={styles.commentAuthor}
>
```

## Test Coverage Plan
Unit tests should cover:
1. UserAvatar component behavior for different user roles
2. CommentItem component linking for various user types
3. ProfileHeader component rendering and button visibility
4. Profile page logic for determining own vs. other profiles

Example test cases:
- Admin users should be redirected to admin panel
- Regular users should be directed to their own profile
- Comment authors should link to their profiles
- Anonymous comments should link to general profile page
- Profile header should show appropriate buttons based on ownership
- Profile page should correctly identify when viewing own vs. other profiles
- Unauthenticated users should be able to view other users' profiles
- Unauthenticated users trying to view their own profile should be redirected to login

## Security Considerations
- Profile viewing is public (no authentication required)
- Edit functionality is restricted to profile owners
- Admin functions are protected by role-based access control

## Future Improvements
- Add integration tests to verify end-to-end profile viewing functionality
- Implement caching for profile data to improve performance
- Add analytics tracking for profile views