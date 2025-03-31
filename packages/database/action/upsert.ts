// src/database/actions/upsertAction.ts
import { browserDb } from "../browser/db";
import { selectCurrentServer } from "setting/settingSlice";
import { selectCurrentUserId, selectIsLoggedIn } from "auth/authSlice";
import pino from "pino";
import { API_ENDPOINTS } from "../config";
import { getAllServers, normalizeTimeFields, logger } from "./common"; // Assuming logger is exported from common
import { noloRequest } from "../requests"; // Import noloRequest for patch
import { toast } from "react-hot-toast";

const TIMEOUT = 5000; // Timeout for server requests

// --- Helper Functions (Consider moving to common if used elsewhere) ---

// 深度合并工具函数，支持删除（null 值） - Copied from patchAction.ts logic
const deepMerge = (target: any, source: any): any => {
  const output = { ...target };
  for (const key in source) {
    if (source[key] === null && key in output) {
      delete output[key]; // Handle explicit null for deletion
    } else if (
      source[key] &&
      typeof source[key] === "object" &&
      !Array.isArray(source[key])
    ) {
      // Recursively merge objects, ensuring target key exists and is an object
      output[key] = deepMerge(output[key] || {}, source[key]);
    } else if (source.hasOwnProperty(key)) {
      // Assign primitive values or arrays directly
      output[key] = source[key];
    }
  }
  return output;
};

// --- Server Sync Functions ---

// Sync function adapted from patchAction for sending *changes*
const syncPatchWithServers = (
  servers: string[],
  dbKey: string,
  updates: any, // Only the changes
  state: any
) => {
  servers.forEach((server) => {
    const abortController = new AbortController();
    const timeoutId = setTimeout(() => {
      abortController.abort();
    }, TIMEOUT);

    // Use noloRequest similar to patchAction
    noloRequest(
      server,
      {
        url: `${API_ENDPOINTS.DATABASE}/patch/${dbKey}`,
        method: "PATCH",
        body: JSON.stringify(updates), // Send only the changes
      },
      state,
      abortController.signal
    )
      .then((response) => {
        clearTimeout(timeoutId);
        if (!response.ok) {
          // Log or minor notification, avoid blocking toast for background sync
          console.error(
            `Upsert (patch sync) failed with ${server}: HTTP ${response.status}`
          );
        }
      })
      .catch((error) => {
        clearTimeout(timeoutId);
        if (error.name !== "AbortError") {
          console.error(
            `Upsert (patch sync) failed with ${server}: ${
              error.message || "Unknown error"
            }`
          );
          // Optional: Minor notification instead of toast for background sync
          // toast.error(`Sync patch failed with ${server}`);
        }
      });
  });
};

// Sync function adapted from writeAction for sending *full data*
const syncWriteWithServers = (
  servers: string[],
  writeConfig: { data: any; customKey: string; userId?: string }, // Contains full data
  state: any
): void => {
  const { data, customKey, userId } = writeConfig;

  servers.forEach((server) => {
    const abortController = new AbortController();
    const timeoutId = setTimeout(() => abortController.abort(), TIMEOUT);

    const headers = {
      "Content-Type": "application/json",
      ...(state.auth?.currentToken && {
        Authorization: `Bearer ${state.auth.currentToken}`,
      }),
    };

    fetch(`${server}${API_ENDPOINTS.DATABASE}/write/`, {
      method: "POST",
      headers,
      body: JSON.stringify({ data, customKey, userId }),
      signal: abortController.signal,
    })
      .then((response) => {
        clearTimeout(timeoutId);
        if (!response.ok) {
          console.error(
            `Upsert (write sync) failed with ${server}: HTTP ${response.status}`
          );
          // Optional: Minor notification instead of toast for background sync
          // toast.error(`Sync write failed with ${server}`);
        }
      })
      .catch((error) => {
        clearTimeout(timeoutId);
        if (error.name !== "AbortError") {
          console.error(
            `Upsert (write sync) failed with ${server}: ${
              error.message || "Unknown error"
            }`
          );
        }
      });
  });
};

// --- Main Upsert Action ---

export const upsertAction = async (
  upsertConfig: { dbKey: string; data: any; userId?: string }, // Expect dbKey and data
  thunkApi: any,
  clientDb: any = browserDb
): Promise<any> => {
  const { dbKey, data } = upsertConfig;
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
  const currentUserId = selectCurrentUserId(state);
  const providedUserId = upsertConfig.userId; // Optional userId override
  const userId = providedUserId || currentUserId; // Use provided or fallback to current

  // Prepare server list - Use a Set to avoid duplicates like in patchAction
  const servers = getAllServers(currentServer); // Assuming getAllServers handles unique servers

  try {
    // 1. Check if data exists locally
    const localData = await clientDb.get(dbKey);

    if (localData) {
      // --- UPDATE PATH ---
      logger.info({ dbKey }, "Upserting (Update Path)");

      // Prepare changes, always update 'updatedAt'
      const updatedChanges = {
        ...data, // Apply incoming data changes
        updatedAt: new Date().toISOString(), // Ensure updatedAt is fresh
        // Ensure userId is present if it wasn't before or needs updating
        ...(userId && { userId }),
      };

      // Merge existing data with new changes
      const newData = deepMerge(localData, updatedChanges);

      // Update local database first
      await clientDb.put(dbKey, newData);

      // Asynchronously sync *changes* to servers in the background
      Promise.resolve().then(() => {
        // Pass only the changes (updatedChanges) for patching
        syncPatchWithServers(servers, dbKey, updatedChanges, state);
      });

      // Return the merged data for Redux state update
      return newData;
    } else {
      // --- INSERT PATH ---
      logger.info({ dbKey }, "Upserting (Insert Path)");

      // Prepare the full data object for saving
      const willSaveData = normalizeTimeFields({
        // Adds createdAt and updatedAt
        ...data, // Include all data provided
        dbKey: dbKey, // Ensure dbKey is part of the object
        userId: userId, // Ensure userId is included
      });

      // Check data type validity (similar to writeAction)
      if (
        willSaveData.type &&
        ![
          "MSG",
          "CYBOT",
          "PAGE",
          "DIALOG",
          "TOKEN",
          "TRANSACTION",
          "SPACE",
          "SETTING",
        ].includes(willSaveData.type)
      ) {
        throw new Error(`Invalid data type for upsert: ${willSaveData.type}`);
      }

      // Save the new data to the local database first
      await clientDb.put(dbKey, willSaveData);

      // Asynchronously sync *full data* to servers in the background
      Promise.resolve().then(() => {
        const serverWriteConfig = {
          data: willSaveData,
          customKey: dbKey,
          userId,
        };
        syncWriteWithServers(servers, serverWriteConfig, state);
      });

      // Return the prepared data for Redux state update
      return willSaveData;
    }
  } catch (error: any) {
    const errorMessage = `Upsert action failed for ${dbKey}: ${error.message || "Unknown error"}`;
    logger.error({ err: error, dbKey }, errorMessage);
    toast.error(`Failed to save data for ${dbKey}.`); // User-friendly error
    // Re-throw the error so the async thunk promise is rejected
    throw error;
  }
};
