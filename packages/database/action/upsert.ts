// src/database/actions/upsertAction.ts
import { browserDb } from "../browser/db";
import { selectCurrentServer } from "app/settings/settingSlice";
import { selectUserId } from "auth/authSlice"; // Removed selectIsLoggedIn as it wasn't used
import { getAllServers, normalizeTimeFields, logger } from "./common";
import {
  noloPatchRequest, // Import new patch request function
  noloWriteRequest, // Import new write request function
  syncWithServers, // Import the generic sync utility
} from "../requests";
import { toast } from "react-hot-toast";

// 深度合并工具函数，支持删除（null 值） - Copied from patchAction.ts logic
// Consider moving to a shared utility file if used in multiple actions
const deepMerge = (target: any, source: any): any => {
  const output = { ...target };
  for (const key in source) {
    // eslint-disable-next-line no-prototype-builtins
    if (!source.hasOwnProperty(key)) continue; // Skip prototype properties

    if (source[key] === null && key in output) {
      delete output[key]; // Handle explicit null for deletion
    } else if (
      source[key] &&
      typeof source[key] === "object" &&
      !Array.isArray(source[key])
    ) {
      // Recursively merge objects, ensuring target key exists and is an object
      output[key] = deepMerge(output[key] || {}, source[key]);
    } else {
      // Assign primitive values or arrays directly
      output[key] = source[key];
    }
  }
  return output;
};

// --- Main Upsert Action ---

/**
 * Upserts data: Updates if exists locally, otherwise inserts.
 * Syncs changes (patch) or full data (write) with servers asynchronously.
 * @param upsertConfig Contains dbKey (required) and data (required). userId is optional override.
 * @param thunkApi Redux Thunk API
 * @param clientDb Database client (defaults to browserDb)
 * @returns Promise<any> The upserted data object.
 * @throws Error if arguments are invalid, db is undefined, or local operation fails.
 */
export const upsertAction = async (
  upsertConfig: { dbKey: string; data: any; userId?: string },
  thunkApi: any,
  clientDb: any = browserDb // Allow injecting db for testing
): Promise<any> => {
  const { dbKey, data } = upsertConfig;

  // --- Input Validation ---
  if (!dbKey || !data || typeof data !== "object") {
    const errorMsg =
      "Invalid arguments for upsertAction: dbKey and data object are required.";
    logger.error({ upsertConfig }, errorMsg);
    toast.error(errorMsg); // Notify user of invalid input immediately
    throw new Error(errorMsg);
  }
  if (!clientDb) {
    const errorMsg = "Client database is undefined in upsertAction";
    logger.error({ dbKey }, errorMsg);
    toast.error("Local database error during upsert."); // User-friendly message
    throw new Error(errorMsg);
  }

  const state = thunkApi.getState();
  const currentServer = selectCurrentServer(state);
  const currentUserId = selectUserId(state);
  const providedUserId = upsertConfig.userId; // Optional userId override from config
  const userId = providedUserId || currentUserId; // Use provided or fallback to current user from auth state

  // Prepare server list - getAllServers should handle uniqueness
  const servers = getAllServers(currentServer);

  try {
    // 1. Check if data exists locally using the provided dbKey
    const localData = await clientDb.get(dbKey);

    if (localData) {
      // --- UPDATE PATH (Data exists locally) ---
      logger.info({ dbKey }, "Upserting (Update Path - data exists locally)");

      // Prepare the changes to be applied, always include/update 'updatedAt'
      const updatedChanges = {
        ...data, // Apply incoming data changes first
        updatedAt: new Date().toISOString(), // Ensure 'updatedAt' is fresh
        // Ensure userId is present if it wasn't before or needs updating
        ...(userId && { userId }),
      };

      // Merge existing local data with the new changes
      // deepMerge handles nested objects and null for deletion
      const newData = deepMerge(localData, updatedChanges);

      // 2. Update local database first (atomic operation locally)
      await clientDb.put(dbKey, newData);
      logger.debug({ dbKey, newData }, "Local database updated successfully.");

      // 3. Asynchronously sync *only the changes* (patch) to servers in the background
      // Use Promise.resolve().then() to ensure it runs after the current microtask queue
      Promise.resolve().then(() => {
        logger.debug(
          { dbKey, servers: servers.length },
          "Initiating background patch sync"
        );
        syncWithServers(
          servers,
          noloPatchRequest, // Use the imported patch request function
          `Upsert (patch sync) failed with`, // Error message prefix for sync utility
          dbKey,
          updatedChanges, // Pass only the changes object
          state // Pass state for auth token, etc.
        );
      });

      // 4. Return the fully merged data immediately for Redux state update
      return newData;
    } else {
      // --- INSERT PATH (Data does not exist locally) ---
      logger.info(
        { dbKey },
        "Upserting (Insert Path - data does not exist locally)"
      );

      // Prepare the full data object for saving (new entry)
      const willSaveData = normalizeTimeFields({
        // Adds createdAt and updatedAt
        ...data, // Include all data provided in the config
        dbKey: dbKey, // Ensure dbKey is part of the object saved
        userId: userId, // Ensure userId is included
      });

      // Optional: Data type validation (if applicable to your data structure)
      const VALID_TYPES = [
        "MSG",
        "CYBOT",
        "PAGE",
        "DIALOG",
        "TOKEN",
        "TRANSACTION",
        "SPACE",
        "SETTING",
      ];
      if (willSaveData.type && !VALID_TYPES.includes(willSaveData.type)) {
        // Consider if this should be a warning or an error depending on strictness
        logger.warn(
          { dbKey, type: willSaveData.type },
          `Invalid data type encountered during insert: ${willSaveData.type}`
        );
        // throw new Error(`Invalid data type for upsert: ${willSaveData.type}`); // Uncomment to make it a hard error
      }

      // 2. Save the new data to the local database first
      await clientDb.put(dbKey, willSaveData);
      logger.debug(
        { dbKey, willSaveData },
        "New data saved to local database successfully."
      );

      // 3. Asynchronously sync the *full data object* (write) to servers in the background
      Promise.resolve().then(() => {
        logger.debug(
          { dbKey, servers: servers.length },
          "Initiating background write sync"
        );
        const serverWriteConfig = {
          // Prepare config for noloWriteRequest
          data: willSaveData,
          customKey: dbKey,
          userId,
        };
        syncWithServers(
          servers,
          noloWriteRequest, // Use the imported write request function
          `Upsert (write sync) failed with`, // Error message prefix
          serverWriteConfig, // Pass the write configuration object
          state // Pass state
        );
      });

      // 4. Return the prepared data immediately for Redux state update
      return willSaveData;
    }
  } catch (error: any) {
    const errorMessage = `Upsert action failed for ${dbKey}: ${error.message || "Unknown error"}`;
    logger.error({ err: error, dbKey }, errorMessage);
    // Provide a user-friendly error message via toast
    toast.error(`Failed to save data for ${dbKey}. Changes might not persist.`);
    // Re-throw the error so the calling async thunk (if any) knows the operation failed
    throw error;
  }
};
