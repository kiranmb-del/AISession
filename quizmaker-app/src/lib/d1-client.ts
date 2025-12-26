/**
 * D1 Database Client
 * Provides utilities for interacting with Cloudflare D1 database
 */

import { getCloudflareContext } from "@opennextjs/cloudflare";

/**
 * Get the D1 database instance from Cloudflare bindings
 */
export function getDatabase(): D1Database {
  try {
    const cloudflare = getCloudflareContext();
    if (!cloudflare?.env?.quizmakerDatabase) {
      throw new Error("Database binding not found. Make sure quizmakerDatabase is configured in wrangler.jsonc");
    }
    return cloudflare.env.quizmakerDatabase as D1Database;
  } catch (error) {
    console.error("Failed to get Cloudflare context:", error);
    throw new Error("Database binding not found. Make sure quizmakerDatabase is configured in wrangler.jsonc");
  }
}

/**
 * Normalize SQL query by converting anonymous placeholders (?) to positional ones (?1, ?2, etc.)
 * This helps avoid binding issues in local D1 development
 */
export function normalizeSql(sql: string): string {
  let index = 1;
  return sql.replace(/\?(?!\d)/g, () => `?${index++}`);
}

/**
 * Execute a SELECT query and return all results
 */
export async function executeQuery<T = unknown>(
  sql: string,
  params: unknown[] = []
): Promise<T[]> {
  const db = getDatabase();
  const normalizedSql = normalizeSql(sql);
  
  try {
    const stmt = db.prepare(normalizedSql);
    
    // Bind parameters if any
    const boundStmt = params.length > 0 ? stmt.bind(...params) : stmt;
    
    const { results } = await boundStmt.all<T>();
    return results || [];
  } catch (error) {
    console.error("Database query error:", error);
    throw new Error(`Failed to execute query: ${error instanceof Error ? error.message : "Unknown error"}`);
  }
}

/**
 * Execute a SELECT query and return the first result
 */
export async function executeQueryFirst<T = unknown>(
  sql: string,
  params: unknown[] = []
): Promise<T | null> {
  const results = await executeQuery<T>(sql, params);
  return results.length > 0 ? results[0] : null;
}

/**
 * Execute an INSERT, UPDATE, or DELETE query
 */
export async function executeMutation(
  sql: string,
  params: unknown[] = []
): Promise<{ success: boolean; meta: D1Meta }> {
  const db = getDatabase();
  const normalizedSql = normalizeSql(sql);
  
  try {
    const stmt = db.prepare(normalizedSql);
    
    // Bind parameters if any
    const boundStmt = params.length > 0 ? stmt.bind(...params) : stmt;
    
    const result = await boundStmt.run();
    
    return {
      success: result.success,
      meta: result.meta,
    };
  } catch (error) {
    console.error("Database mutation error:", error);
    throw new Error(`Failed to execute mutation: ${error instanceof Error ? error.message : "Unknown error"}`);
  }
}

/**
 * Execute multiple queries in a batch
 */
export async function executeBatch(
  queries: Array<{ sql: string; params?: unknown[] }>
): Promise<D1Result[]> {
  const db = getDatabase();
  
  try {
    const statements = queries.map(({ sql, params = [] }) => {
      const normalizedSql = normalizeSql(sql);
      const stmt = db.prepare(normalizedSql);
      return params.length > 0 ? stmt.bind(...params) : stmt;
    });
    
    const results = await db.batch(statements);
    return results;
  } catch (error) {
    console.error("Database batch error:", error);
    throw new Error(`Failed to execute batch: ${error instanceof Error ? error.message : "Unknown error"}`);
  }
}

/**
 * Generate a unique ID for database records
 * Using timestamp + random string for uniqueness
 */
export function generateId(prefix = ""): string {
  const timestamp = Date.now().toString(36);
  const randomStr = Math.random().toString(36).substring(2, 15);
  return prefix ? `${prefix}_${timestamp}_${randomStr}` : `${timestamp}_${randomStr}`;
}

/**
 * Type definitions for D1
 */
interface D1Meta {
  duration: number;
  rows_read: number;
  rows_written: number;
  size_after?: number;
  last_row_id?: number;
  changed_db?: boolean;
  changes?: number;
}

interface D1Result<T = unknown> {
  success: boolean;
  meta: D1Meta;
  results?: T[];
  error?: string;
}

