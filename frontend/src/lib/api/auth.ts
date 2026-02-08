/**
 * Authentication API client
 * Handles signup, signin, signout, and session verification
 */

import { apiClient, ApiClientError } from './client';
import type { UserResponse, SignupRequest, SigninRequest } from '../types/user';

export const authApi = {
  /**
   * Register a new user
   * POST /auth/signup
   * @param data - Signup payload (email & password)
   * @returns The created user
   */
  signup: async (data: SignupRequest): Promise<UserResponse> => {
    try {
      return await apiClient.post<UserResponse>('/auth/signup', data);
    } catch (err) {
      if (err instanceof ApiClientError) throw err;
      throw new ApiClientError('Failed to signup', 0, 'SIGNUP_ERROR');
    }
  },

  /**
   * Sign in an existing user
   * POST /auth/signin
   * @param data - Signin payload (email & password)
   * @returns The authenticated user
   */
  signin: async (data: SigninRequest): Promise<UserResponse> => {
    try {
      return await apiClient.post<UserResponse>('/auth/signin', data);
    } catch (err) {
      if (err instanceof ApiClientError) throw err;
      throw new ApiClientError('Failed to signin', 0, 'SIGNIN_ERROR');
    }
  },

  /**
   * Sign out the current user
   * POST /auth/signout
   */
  signout: async (): Promise<void> => {
    try {
      await apiClient.post<void>('/auth/signout');
    } catch (err) {
      if (err instanceof ApiClientError) throw err;
      throw new ApiClientError('Failed to signout', 0, 'SIGNOUT_ERROR');
    }
  },

  /**
   * Get the current session user
   * GET /auth/session
   * @returns The currently logged-in user
   */
  getSession: async (): Promise<UserResponse> => {
    try {
      return await apiClient.get<UserResponse>('/auth/session');
    } catch (err) {
      if (err instanceof ApiClientError) throw err;
      throw new ApiClientError('Failed to get session', 0, 'SESSION_ERROR');
    }
  },
};
