/**
 * User Service
 * Handles user-related database operations
 */

import "server-only";
import { executeQuery, executeQueryFirst, executeMutation, generateId } from "../d1-client";
import { hashPassword, verifyPassword } from "../auth";

export interface User {
  id: string;
  email: string;
  password_hash: string;
  full_name: string;
  user_type: "student" | "instructor";
  created_at: string;
  updated_at: string;
}

export interface CreateUserInput {
  email: string;
  password: string;
  fullName: string;
  userType: "student" | "instructor";
}

/**
 * Create a new user
 */
export async function createUser(input: CreateUserInput): Promise<User> {
  const { email, password, fullName, userType } = input;
  
  // Check if user already exists
  const existingUser = await getUserByEmail(email);
  if (existingUser) {
    throw new Error("User with this email already exists");
  }
  
  // Hash password
  const passwordHash = await hashPassword(password);
  
  // Generate user ID
  const userId = generateId("user");
  
  // Insert user
  const sql = `
    INSERT INTO users (id, email, password_hash, full_name, user_type)
    VALUES (?, ?, ?, ?, ?)
  `;
  
  await executeMutation(sql, [userId, email, passwordHash, fullName, userType]);
  
  // Return the created user
  const user = await getUserById(userId);
  if (!user) {
    throw new Error("Failed to create user");
  }
  
  return user;
}

/**
 * Get user by ID
 */
export async function getUserById(id: string): Promise<User | null> {
  const sql = "SELECT * FROM users WHERE id = ?";
  return await executeQueryFirst<User>(sql, [id]);
}

/**
 * Get user by email
 */
export async function getUserByEmail(email: string): Promise<User | null> {
  const sql = "SELECT * FROM users WHERE email = ?";
  return await executeQueryFirst<User>(sql, [email]);
}

/**
 * Verify user credentials
 */
export async function verifyUserCredentials(
  email: string,
  password: string
): Promise<User | null> {
  const user = await getUserByEmail(email);
  if (!user) {
    return null;
  }
  
  const isValid = await verifyPassword(password, user.password_hash);
  if (!isValid) {
    return null;
  }
  
  return user;
}

/**
 * Get all users (admin function)
 */
export async function getAllUsers(): Promise<User[]> {
  const sql = "SELECT * FROM users ORDER BY created_at DESC";
  return await executeQuery<User>(sql);
}

/**
 * Get users by type
 */
export async function getUsersByType(userType: "student" | "instructor"): Promise<User[]> {
  const sql = "SELECT * FROM users WHERE user_type = ? ORDER BY created_at DESC";
  return await executeQuery<User>(sql, [userType]);
}

/**
 * Update user
 */
export async function updateUser(
  id: string,
  updates: Partial<Pick<User, "full_name" | "email">>
): Promise<User> {
  const user = await getUserById(id);
  if (!user) {
    throw new Error("User not found");
  }
  
  const updateFields: string[] = [];
  const updateValues: unknown[] = [];
  
  if (updates.full_name !== undefined) {
    updateFields.push("full_name = ?");
    updateValues.push(updates.full_name);
  }
  
  if (updates.email !== undefined) {
    updateFields.push("email = ?");
    updateValues.push(updates.email);
  }
  
  if (updateFields.length === 0) {
    return user;
  }
  
  updateFields.push("updated_at = CURRENT_TIMESTAMP");
  updateValues.push(id);
  
  const sql = `
    UPDATE users
    SET ${updateFields.join(", ")}
    WHERE id = ?
  `;
  
  await executeMutation(sql, updateValues);
  
  const updatedUser = await getUserById(id);
  if (!updatedUser) {
    throw new Error("Failed to update user");
  }
  
  return updatedUser;
}

/**
 * Delete user
 */
export async function deleteUser(id: string): Promise<void> {
  const sql = "DELETE FROM users WHERE id = ?";
  await executeMutation(sql, [id]);
}

