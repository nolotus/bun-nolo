import { asyncThunkCreator, buildCreateSlice } from "@reduxjs/toolkit";
import { DataType } from "create/types";
import { read } from "database/dbSlice";
import { selectCurrentServer } from "setting/settingSlice";
import { getApiEndpoint } from "ai/llm/providers";
import { performFetchRequest } from "../chat/fetchUtils";
import { generateRequestBody } from "./generateRequestBody";
import { fetchReferenceContents } from "ai/context/buildReferenceContext";
import { requestHandlers } from "ai/llm/providers";
import { selectCurrentDialogConfig } from "chat/dialog/dialogSlice";
import { selectAllMsgs } from "chat/messages/messageSlice";
import { contextCybotId } from "core/init";
import { formatDataForApi } from "./formatDataForApi";
import { selectCurrentSpace } from "create/space/spaceSlice";

// 创建带有 Thunk 的 Slice
const createSliceWithThunks = buildCreateSlice({
  creators: { asyncThunk: asyncThunkCreator },
});

// 初始化状态
const initialState = {
  // 初始化状态
};

// 创建 cybot Slice
export const cybotSlice = createSliceWithThunks({
  name: "cybot",
  initialState: initialState,
  reducers: (create) => ({
    /**
     * 运行 Cybot ID，执行非流式请求以获取内容结果
     */
    runCybotId: create.asyncThunk(async ({ cybotId, content }, thunkApi) => {
      const state = thunkApi.getState();
      const dispatch = thunkApi.dispatch;
      const cybotConfig = await dispatch(read(cybotId)).unwrap();
      if (cybotConfig.type === DataType.CYBOT) {
        const api = getApiEndpoint(cybotConfig);
        const currentServer = selectCurrentServer(state);
        const messages = [
          {
            role: "system",
            content: cybotConfig.prompt,
          },
          { role: "user", content }, // 使用 content 参数，供系统构造后传入
        ];
        const bodyData = { model: cybotConfig.model, messages, stream: false };
        const response = await performFetchRequest(cybotConfig, api, bodyData);

        const result = await response.json();
        const contentResult = result.choices[0].message.content;
        return contentResult;
      }
      return null;
    }, {}),

    /**
     * 流式运行 Cybot ID，处理用户输入并与 AI 进行交互
     */
    streamCybotId: create.asyncThunk(
      async ({ cybotId, userInput }, thunkApi) => {
        const state = thunkApi.getState();
        const msgs = selectAllMsgs(state); // 获取历史消息
        const dispatch = thunkApi.dispatch;
        const cybotConfig = await dispatch(read(cybotId)).unwrap();

        // 初始化参考资料列表，只提取 references 中的 dbKey
        let allReference: string[] = cybotConfig.references
          .map((ref: any) => ref.dbKey || (typeof ref === "string" ? ref : ""))
          .filter((key: string) => typeof key === "string" && key.length > 0);

        // 新增：从 userInput 中提取 pageKey（例如 DOCX 和 PDF 文件中的 pageKey）
        let msgReferences: string[] = [];
        if (Array.isArray(userInput)) {
          userInput.forEach((part: any) => {
            if ((part.type === "docx" || part.type === "pdf") && part.pageKey) {
              msgReferences.push(part.pageKey);
            }
          });
        } else if (
          typeof userInput === "object" &&
          (userInput.type === "docx" || userInput.type === "pdf") &&
          userInput.pageKey
        ) {
          msgReferences.push(userInput.pageKey);
        }

        // 新增：从历史消息中提取 pageKey
        let historyReferences: string[] = [];
        msgs.forEach((msg: any) => {
          const content = msg.content;
          if (Array.isArray(content)) {
            content.forEach((part: any) => {
              if (
                (part.type === "docx" || part.type === "pdf") &&
                part.pageKey
              ) {
                historyReferences.push(part.pageKey);
              }
            });
          } else if (
            typeof content === "object" &&
            (content.type === "docx" || content.type === "pdf") &&
            content.pageKey
          ) {
            historyReferences.push(content.pageKey);
          }
        });

        // 将 msgReferences 和 historyReferences 合并到 allReference
        allReference = [
          ...allReference,
          ...msgReferences,
          ...historyReferences,
        ];

        // 如果启用智能读取，获取当前空间数据并生成 outputReference
        if (cybotConfig.smartReadEnabled === true) {
          const spaceData = selectCurrentSpace(state); // 获取当前空间数据
          const formattedData = formatDataForApi(spaceData, msgs); // 直接使用原始消息，已在 formatDataForApi 中过滤 Type: page

          const outputReference = await dispatch(
            runCybotId({
              cybotId: contextCybotId,
              content: `User Input: 请提取相关内容的 contentKey ID\n\n${formattedData}`,
            })
          ).unwrap();

          // 尝试解析 outputReference 为 ID 数组，并组合到 allReference
          try {
            const cleanedOutput = outputReference
              .replace(/```json/g, "")
              .replace(/```/g, "")
              .replace(/\n/g, "")
              .trim();
            if (cleanedOutput && cleanedOutput !== "[]") {
              const parsedReference = JSON.parse(cleanedOutput);
              if (
                Array.isArray(parsedReference) &&
                parsedReference.length > 0
              ) {
                allReference = [...parsedReference, ...allReference];
              }
            }
          } catch (error) {
            console.error(
              "streamCybotId - Failed to parse outputReference as JSON:",
              outputReference,
              error
            );
          }
        }

        // 获取参考内容上下文
        const context = await fetchReferenceContents(allReference, dispatch);

        // 生成请求体数据，直接使用 userInput，不构造额外内容
        const bodyData = generateRequestBody(
          state,
          userInput, // 直接使用用户输入，供界面展示
          cybotConfig,
          context
        );

        const providerName = cybotConfig.provider.toLowerCase();
        const handler = requestHandlers[providerName];
        const dialogConfig = selectCurrentDialogConfig(state);
        const dialogKey = dialogConfig.dbKey;

        await handler({
          bodyData,
          cybotConfig,
          thunkApi,
          dialogKey,
        });
      },
      {}
    ),
  }),
});

// 导出 actions 和 reducer
export const { runCybotId, streamCybotId } = cybotSlice.actions;
export default cybotSlice.reducer;
