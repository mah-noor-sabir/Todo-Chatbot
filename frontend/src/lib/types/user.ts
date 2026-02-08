/**
 * User type definitions matching backend User model
 */

/** Represents an authenticated user */
export interface User {
  id: number;
  email: string;
  first_name?: string;
  last_name?: string;
  created_at: string; // ISO 8601 timestamp
}

/** Payload to register a new user */
export interface SignupRequest {
  first_name: string;
  last_name?: string;
  email: string;
  password: string;
}

/** Payload to sign in an existing user */
export interface SigninRequest {
  email: string;
  password: string;
}

/** Response returned from the backend for user-related endpoints */
export interface UserResponse extends User {}
