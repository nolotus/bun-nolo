// i18n/translations/space.locale.ts
import { Language } from "../types";

export default {
  [Language.EN]: {
    translation: {
      create: "Create Space",
      name: "Space Name",
      description: "Description",
      visibility: "Visibility",
      private: "Private",
      public: "Public",
      name_required: "Space name is required",
      name_min_length: "Space name must be at least 2 characters",
      name_placeholder: "Enter space name",
      description_placeholder: "Enter space description (optional)",
      create_success: "Space created successfully",
      create_error: "Failed to create space",
    },
  },
  [Language.ZH_CN]: {
    translation: {
      create: "创建空间",
      name: "空间名称",
      description: "描述",
      visibility: "可见性",
      private: "私有",
      public: "公开",
      name_required: "空间名称必填",
      name_min_length: "空间名称至少2个字符",
      name_placeholder: "输入空间名称",
      description_placeholder: "输入空间描述（可选）",
      create_success: "空间创建成功",
      create_error: "创建空间失败",
    },
  },
  [Language.ZH_HANT]: {
    translation: {
      create: "創建空間",
      name: "空間名稱",
      description: "描述",
      visibility: "可見性",
      private: "私有",
      public: "公開",
      name_required: "空間名稱必填",
      name_min_length: "空間名稱至少2個字符",
      name_placeholder: "輸入空間名稱",
      description_placeholder: "輸入空間描述（可選）",
      create_success: "空間創建成功",
      create_error: "創建空間失敗",
    },
  },
  [Language.JA]: {
    translation: {
      create: "スペースを作成する",
      name: "スペース名",
      description: "説明",
      visibility: "公開設定",
      private: "非公開",
      public: "公開",
      name_required: "スペース名は必須です",
      name_min_length: "スペース名は2文字以上である必要があります",
      name_placeholder: "スペース名を入力",
      description_placeholder: "スペースの説明を入力（任意）",
      create_success: "スペースが正常に作成されました",
      create_error: "スペースの作成に失敗しました",
    },
  },
};
