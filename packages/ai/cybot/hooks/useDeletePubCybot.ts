import { useCallback, useState } from "react";
import { pino } from "pino";
import { deletePubCybot as deleteLocal } from "ai/cybot/web/deletePubCybot"; // 导入本地删除函数
import { useAppSelector } from "app/hooks";
import { selectCurrentServer } from "setting/settingSlice";

const logger = pino({ name: "useDeletePubCybot" });

interface DeletePubCybotOptions {
  id: string;
}

interface DeletePubCybotsState {
  loading: boolean;
  error: Error | null;
  success: boolean;
}

export function useDeletePubCybot() {
  const currentServer = useAppSelector(selectCurrentServer);
  const [state, setState] = useState<DeletePubCybotsState>({
    loading: false,
    error: null,
    success: false,
  });

  const deleteCybot = useCallback(
    async (options: DeletePubCybotOptions) => {
      const { id } = options;
      setState((prev) => ({
        ...prev,
        loading: true,
        error: null,
        success: false,
      }));

      try {
        // 删除本地 Cybot
        await deleteLocal({ id });

        if (currentServer) {
          // 删除远程 Cybot
          const response = await fetch(`${currentServer}/rpc/deletePubCybot`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ id }),
          });

          if (!response.ok) {
            throw new Error(
              `Remote delete failed with status ${response.status}`
            );
          }
        }

        setState({
          loading: false,
          error: null,
          success: true,
        });
      } catch (err) {
        logger.error({ error: err }, `Failed to delete Cybot with ID ${id}`);
        setState({
          loading: false,
          error:
            err instanceof Error ? err : new Error("Failed to delete Cybot"),
          success: false,
        });
      }
    },
    [currentServer]
  );

  return { ...state, delete: deleteCybot };
}
