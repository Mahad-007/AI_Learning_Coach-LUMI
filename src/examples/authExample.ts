/**
 * Authentication Service Examples
 * 
 * This file demonstrates how to use the AuthService in your React components
 */

import { AuthService } from '../services/authService';

// ============================================================================
// EXAMPLE 1: User Signup
// ============================================================================
export async function signupExample() {
  try {
    const response = await AuthService.signup({
      email: 'student@example.com',
      password: 'securePassword123',
      name: 'John Doe',
    });

    console.log('User created:', response.user);
    console.log('Session token:', response.session.access_token);

    // Store session token in your auth context or state management
    return response;
  } catch (error) {
    console.error('Signup failed:', error);
    throw error;
  }
}

// ============================================================================
// EXAMPLE 2: User Login
// ============================================================================
export async function loginExample() {
  try {
    const response = await AuthService.login({
      email: 'student@example.com',
      password: 'securePassword123',
    });

    console.log('Login successful:', response.user);
    console.log('Current level:', response.user.level);
    console.log('Current XP:', response.user.xp);
    console.log('Streak:', response.user.streak);

    return response;
  } catch (error) {
    console.error('Login failed:', error);
    throw error;
  }
}

// ============================================================================
// EXAMPLE 3: Get Current User
// ============================================================================
export async function getCurrentUserExample() {
  try {
    const user = await AuthService.getCurrentUser();

    if (user) {
      console.log('Current user:', user.name);
      console.log('Persona:', user.persona);
    } else {
      console.log('No user logged in');
    }

    return user;
  } catch (error) {
    console.error('Get current user failed:', error);
    throw error;
  }
}

// ============================================================================
// EXAMPLE 4: Update User Persona
// ============================================================================
export async function updatePersonaExample(userId: string) {
  try {
    const updatedUser = await AuthService.updatePersona(userId, 'fun');

    console.log('Persona updated:', updatedUser.persona);

    return updatedUser;
  } catch (error) {
    console.error('Update persona failed:', error);
    throw error;
  }
}

// ============================================================================
// EXAMPLE 5: Update Profile
// ============================================================================
export async function updateProfileExample(userId: string) {
  try {
    const updatedUser = await AuthService.updateProfile(userId, {
      name: 'Jane Doe',
      avatar_url: 'https://example.com/avatar.jpg',
    });

    console.log('Profile updated:', updatedUser);

    return updatedUser;
  } catch (error) {
    console.error('Update profile failed:', error);
    throw error;
  }
}

// ============================================================================
// EXAMPLE 6: Logout
// ============================================================================
export async function logoutExample() {
  try {
    await AuthService.logout();
    console.log('Logged out successfully');
  } catch (error) {
    console.error('Logout failed:', error);
    throw error;
  }
}

// ============================================================================
// EXAMPLE 7: React Component Usage
// ============================================================================

/*
import React, { useState } from 'react';
import { AuthService } from '@/services/authService';

function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await AuthService.login({ email, password });
      // Store user in context/state
      console.log('Logged in as:', response.user.name);
      // Redirect to dashboard
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleLogin}>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
      />
      {error && <p className="error">{error}</p>}
      <button type="submit" disabled={loading}>
        {loading ? 'Logging in...' : 'Login'}
      </button>
    </form>
  );
}
*/

