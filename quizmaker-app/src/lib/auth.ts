/**
 * Authentication Utilities
 * Provides functions for password hashing, token generation, and user authentication
 */

import { cookies } from "next/headers";

/**
 * Hash a password using Web Crypto API (available in Cloudflare Workers)
 * Since bcrypt is not available in Cloudflare Workers, we use a combination of
 * PBKDF2 for password hashing
 */
export async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  
  // Generate a random salt
  const salt = crypto.getRandomValues(new Uint8Array(16));
  
  // Import the password as a key
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    data,
    { name: "PBKDF2" },
    false,
    ["deriveBits"]
  );
  
  // Derive bits using PBKDF2
  const derivedBits = await crypto.subtle.deriveBits(
    {
      name: "PBKDF2",
      salt: salt,
      iterations: 100000,
      hash: "SHA-256",
    },
    keyMaterial,
    256
  );
  
  // Combine salt and hash
  const hashArray = new Uint8Array(derivedBits);
  const combined = new Uint8Array(salt.length + hashArray.length);
  combined.set(salt);
  combined.set(hashArray, salt.length);
  
  // Convert to base64 for storage
  return btoa(String.fromCharCode(...combined));
}

/**
 * Verify a password against a hash
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  try {
    // Decode the stored hash
    const combined = Uint8Array.from(atob(hash), c => c.charCodeAt(0));
    
    // Extract salt (first 16 bytes)
    const salt = combined.slice(0, 16);
    const storedHash = combined.slice(16);
    
    // Hash the provided password with the same salt
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    
    const keyMaterial = await crypto.subtle.importKey(
      "raw",
      data,
      { name: "PBKDF2" },
      false,
      ["deriveBits"]
    );
    
    const derivedBits = await crypto.subtle.deriveBits(
      {
        name: "PBKDF2",
        salt: salt,
        iterations: 100000,
        hash: "SHA-256",
      },
      keyMaterial,
      256
    );
    
    const hashArray = new Uint8Array(derivedBits);
    
    // Compare hashes
    if (hashArray.length !== storedHash.length) {
      return false;
    }
    
    for (let i = 0; i < hashArray.length; i++) {
      if (hashArray[i] !== storedHash[i]) {
        return false;
      }
    }
    
    return true;
  } catch (error) {
    console.error("Password verification error:", error);
    return false;
  }
}

/**
 * Generate an authentication token
 * Using a simple JWT-like structure with HMAC-SHA256 signature
 */
export async function generateAuthToken(userId: string, userType: string): Promise<string> {
  const header = { alg: "HS256", typ: "JWT" };
  const payload = {
    userId,
    userType,
    exp: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 days
  };
  
  const encoder = new TextEncoder();
  
  // Use base64url encoding (URL-safe)
  const headerB64 = Buffer.from(JSON.stringify(header)).toString("base64url");
  const payloadB64 = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const data = `${headerB64}.${payloadB64}`;
  
  // Use a secret key for signing (in production, use environment variable)
  const secret = process.env.JWT_SECRET || "default-secret-key-change-in-production";
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(data));
  const signatureB64 = Buffer.from(signature).toString("base64url");
  
  return `${data}.${signatureB64}`;
}

/**
 * Verify an authentication token
 */
export async function verifyAuthToken(token: string): Promise<{ userId: string; userType: string } | null> {
  try {
    const [headerB64, payloadB64, signatureB64] = token.split(".");
    if (!headerB64 || !payloadB64 || !signatureB64) {
      return null;
    }
    
    // Verify signature
    const encoder = new TextEncoder();
    const data = `${headerB64}.${payloadB64}`;
    const secret = process.env.JWT_SECRET || "default-secret-key-change-in-production";
    const key = await crypto.subtle.importKey(
      "raw",
      encoder.encode(secret),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["verify"]
    );
    
    const signature = Buffer.from(signatureB64, "base64url");
    const isValid = await crypto.subtle.verify("HMAC", key, signature, encoder.encode(data));
    
    if (!isValid) {
      return null;
    }
    
    // Decode payload
    const payload = JSON.parse(Buffer.from(payloadB64, "base64url").toString("utf-8"));
    
    // Check expiration
    if (payload.exp < Date.now()) {
      return null;
    }
    
    return {
      userId: payload.userId,
      userType: payload.userType,
    };
  } catch (error) {
    console.error("Token verification error:", error);
    return null;
  }
}

/**
 * Set authentication cookie
 */
export async function setAuthCookie(token: string): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set("auth-token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 7 * 24 * 60 * 60, // 7 days
    path: "/",
  });
}

/**
 * Get authentication cookie
 */
export async function getAuthCookie(): Promise<string | null> {
  const cookieStore = await cookies();
  const cookie = cookieStore.get("auth-token");
  return cookie?.value || null;
}

/**
 * Clear authentication cookie
 */
export async function clearAuthCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete("auth-token");
}

/**
 * Get current authenticated user
 */
export async function getCurrentUser(): Promise<{ userId: string; userType: string } | null> {
  const token = await getAuthCookie();
  if (!token) {
    return null;
  }
  
  return await verifyAuthToken(token);
}

/**
 * Validate email format
 */
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate password strength
 */
export function validatePassword(password: string): { valid: boolean; message?: string } {
  if (password.length < 8) {
    return { valid: false, message: "Password must be at least 8 characters long" };
  }
  
  return { valid: true };
}

/**
 * Get user from request token
 */
export async function getUserFromToken(request: Request): Promise<{ id: string; user_type: string; email?: string } | null> {
  try {
    // Try to get token from Authorization header first
    const authHeader = request.headers.get("Authorization");
    let token: string | null = null;
    
    if (authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.substring(7);
    } else {
      // Fall back to cookie using Next.js cookies function
      const cookieStore = await cookies();
      const authCookie = cookieStore.get("auth-token");
      if (authCookie) {
        token = authCookie.value;
      }
    }
    
    if (!token) {
      console.log("No auth token found");
      return null;
    }
    
    const verified = await verifyAuthToken(token);
    if (!verified) {
      console.log("Token verification failed");
      return null;
    }
    
    console.log("User authenticated:", verified.userId, verified.userType);
    
    return {
      id: verified.userId,
      user_type: verified.userType,
    };
  } catch (error) {
    console.error("Error getting user from token:", error);
    return null;
  }
}

