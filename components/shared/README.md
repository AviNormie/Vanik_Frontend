# LogoutButton Component

A reusable logout button component that handles user logout functionality with JWT token cleanup and navigation.

## Features

- Clears JWT tokens from AsyncStorage
- Navigates to login page after logout
- Customizable confirmation dialog
- Loading state during logout process
- Configurable button appearance

## Usage

```tsx
import LogoutButton from '../../components/shared/LogoutButton';

// Basic usage
<LogoutButton />

// Custom title and variant
<LogoutButton 
  title="Sign Out" 
  variant="secondary" 
/>

// Without confirmation dialog
<LogoutButton 
  title="Quick Logout" 
  showConfirmation={false} 
/>

// Danger variant with confirmation (default)
<LogoutButton 
  title="लॉगआउट (Logout)" 
  variant="danger" 
/>
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `title` | `string` | `"Logout"` | Button text |
| `variant` | `'primary' \| 'secondary' \| 'danger'` | `'danger'` | Button style variant |
| `showConfirmation` | `boolean` | `true` | Whether to show confirmation dialog |

## Implementation Details

- Uses `useAuth()` hook from AuthContext
- Calls `logout()` function which clears AsyncStorage
- Navigates to `/(auth)/login` using expo-router
- Shows error alert if logout fails
- Displays loading state during logout process