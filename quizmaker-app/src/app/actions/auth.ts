"use server";

/**
 * Authentication Server Actions
 * Handles user registration, login, and logout
 */

import { redirect } from "next/navigation";
import { createUser, verifyUserCredentials } from "@/lib/services/user-service";
import {
  generateAuthToken,
  setAuthCookie,
  clearAuthCookie,
  getCurrentUser,
  validateEmail,
  validatePassword,
} from "@/lib/auth";

export interface RegisterFormData {
  email: string;
  password: string;
  fullName: string;
  userType: "student" | "instructor";
}

export interface LoginFormData {
  email: string;
  password: string;
}

export interface ActionResult {
  success: boolean;
  error?: string;
  redirectTo?: string;
}

/**
 * Register a new user
 */
export async function registerAction(formData: RegisterFormData): Promise<ActionResult> {
  try {
    const { email, password, fullName, userType } = formData;
    
    // Validate email
    if (!validateEmail(email)) {
      return { success: false, error: "Invalid email format" };
    }
    
    // Validate password
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.valid) {
      return { success: false, error: passwordValidation.message };
    }
    
    // Validate full name
    if (!fullName || fullName.trim().length < 2) {
      return { success: false, error: "Full name must be at least 2 characters long" };
    }
    
    // Validate user type
    if (!["student", "instructor"].includes(userType)) {
      return { success: false, error: "Invalid user type" };
    }
    
    // Create user
    const user = await createUser({
      email: email.toLowerCase().trim(),
      password,
      fullName: fullName.trim(),
      userType,
    });
    
    // Generate auth token
    const token = await generateAuthToken(user.id, user.user_type);
    
    // Set auth cookie
    await setAuthCookie(token);
    
    return { success: true, redirectTo: "/dashboard" };
  } catch (error) {
    console.error("Registration error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to register. Please try again.",
    };
  }
}

/**
 * Login a user
 */
export async function loginAction(formData: LoginFormData): Promise<ActionResult> {
  try {
    const { email, password } = formData;
    
    // Validate email
    if (!validateEmail(email)) {
      return { success: false, error: "Invalid email format" };
    }
    
    // Validate password
    if (!password || password.length === 0) {
      return { success: false, error: "Password is required" };
    }
    
    // Verify credentials
    const user = await verifyUserCredentials(email.toLowerCase().trim(), password);
    
    if (!user) {
      return { success: false, error: "Invalid email or password" };
    }
    
    // Generate auth token
    const token = await generateAuthToken(user.id, user.user_type);
    
    // Set auth cookie
    await setAuthCookie(token);
    
    return { success: true, redirectTo: "/dashboard" };
  } catch (error) {
    console.error("Login error:", error);
    return {
      success: false,
      error: "Failed to login. Please try again.",
    };
  }
}

/**
 * Logout a user
 */
export async function logoutAction(): Promise<void> {
  await clearAuthCookie();
  redirect("/login");
}

/**
 * Get current authenticated user
 */
export async function getCurrentUserAction() {
  return await getCurrentUser();
}

