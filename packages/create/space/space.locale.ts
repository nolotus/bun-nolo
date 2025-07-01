import { Language } from "app/i18n/types";

export default {
  [Language.EN]: {
    translation: {
      // === 基础操作 ===
      create: "Create Space",
      name: "Space Name",
      description: "Description",
      visibility: "Visibility",
      private: "Private",
      public: "Public",
      loading: "Loading...",
      cancel: "Cancel",
      delete: "Delete",
      save: "Save",
      edit: "Edit",

      // === 表单相关 ===
      name_required: "Space name is required",
      name_min_length: "Space name must be at least 2 characters",
      name_max_length: "Space name cannot exceed 50 characters",
      name_placeholder: "Enter space name",
      description_placeholder: "Enter space description (optional)",
      description_max_length: "Description cannot exceed 200 characters",

      // === 创建空间 ===
      create_new_space: "Create New Space",
      create_space: "Create Space",
      create_success: "Space created successfully",
      create_error: "Failed to create space",
      creating: "Creating space...",

      // === 空间选择 ===
      default_space: "Default Space",
      select_space: "Select Space",
      no_spaces: "No spaces available",
      no_spaces_yet: "No spaces created yet",
      space_list: "Space List",
      space_dropdown: "Open space menu",
      current_space: "Current Space",
      switch_space: "Switch Space",

      // === 导航相关 ===
      home: "Home",
      back_to_home: "Back to Home",
      space_settings: "Space Settings",

      // === 空间设置 ===
      unsaved_changes: "You have unsaved changes",
      unsaved_warning:
        "You have unsaved changes. Do you want to save them before leaving?",
      save_before_leave: "Save Changes",
      discard_changes: "Discard Changes",
      load_error_title: "Failed to Load Space Information",
      no_space_data: "Space data not found",
      try_repair: "Try to Repair",
      repair_success: "Repair operation completed successfully",
      repair_error: "Repair operation failed",
      try_later: "Please try again later",

      // === 基本信息 ===
      basic_info: "Basic Information",
      manage_basic_info:
        "Manage space name, description and other basic information",
      space_details: "Space Details",
      view_space_details: "View basic information and metadata of this space",
      space_id: "Space ID",
      created_at: "Created",
      updated_at: "Last Updated",
      member_count: "Members",
      people: "people",
      person: "person",

      // === 权限管理 ===
      access_permission: "Access Permission",
      manage_access:
        "Control who can access and view the content of this space",
      select_visibility: "Select Space Visibility",
      private_description: "Only invited members can access this space",
      public_description: "Anyone can view, but only members can edit content",
      permission_updated: "Permission settings updated successfully",

      // === 默认空间 ===
      save_changes: "Save Changes",
      set_as_default: "Set as Default Space",
      current_default: "Current Default Space",
      cancel_changes: "Cancel Changes",
      set_default_success: "Set as default space successfully",
      set_default_error: "Failed to set as default space",
      this_space: "this space",

      // === 删除空间 ===
      delete_space: "Delete Space",
      delete_confirm_message:
        "Are you sure you want to delete this space? This action cannot be undone, and all files and data in the space will be permanently deleted.",
      delete_description:
        "This action will permanently delete all files, pages, and data in the space, and cannot be recovered.",
      delete_warning:
        "Warning: This space has {{count}} members. Please ensure all members are notified before deletion.",
      delete_input_placeholder: "Type the space name to confirm",
      delete_confirmation_required:
        "Please type the space name to confirm deletion",
      delete_success: "Space deleted successfully",
      delete_error: "Failed to delete space",
      deleting: "Deleting space...",

      // === 更新操作 ===
      update_success: "Settings updated successfully",
      update_error: "Failed to update settings",
      updating: "Updating...",

      // === 状态提示 ===
      empty_state_title: "No spaces yet",
      empty_state_description: "Create your first space to get started",
      get_started: "Get Started",

      // === 侧边栏/内容管理相关 ===
      uncategorized: "Uncategorized",
      dragToCategorize:
        "Drag items here to categorize them, or to create a new category.",
      itemsDeleted: "Deleted {{count}} item(s)",
      createPageFailed: "Failed to create new page",
      categoryCreated: "Category '{{name}}' created successfully",
      emptyTitle: "No content yet",
      emptyHint: "Create your first page or drag files here to get started.",
      createFirstPage: "Create First Page",
      selectedItemsCount: "{{count}} item(s) selected",
      deselectAll: "Deselect All",
      selectAll: "Select All",
      deleteSelected: "Delete Selected",
      cancelSelectionMode: "Cancel Selection Mode",
      content: "Content",
      newPage: "New Page",
      newCategory: "New Category",
      batchSelect: "Batch Select",
      expandAll: "Expand All",
      collapseAll: "Collapse All",
      contentMoved: "Content moved successfully",
      noOtherSpaces: "No other spaces available",
      titlePlaceholder: "Untitled",
      moreActions: "More Actions",
      editTitle: "Edit Title",
      moveToSpace: "Move to Space",
      // 新增翻译键
      joinConversation: "Join Conversation",
      addedToConversation: "Added to conversation",

      // CategoryHeader 新增的翻译键
      categoryNamePlaceholder: "Enter category name",
      expand: "Expand",
      collapse: "Collapse",
      selectCategory: "Select category {{name}}",
      dragToReorder: "Drag to reorder category",
      editName: "Edit Name",
      deleteCategoryConfirm:
        "Are you sure you want to delete category '{{name}}'? This action cannot be undone.",
      deleteCategory: "Delete Category",
    },
  },

  [Language.ZH_CN]: {
    translation: {
      // === 基础操作 ===
      create: "创建空间",
      name: "空间名称",
      description: "描述",
      visibility: "可见性",
      private: "私有",
      public: "公开",
      loading: "加载中...",
      cancel: "取消",
      delete: "删除",
      save: "保存",
      edit: "编辑",

      // === 表单相关 ===
      name_required: "空间名称必填",
      name_min_length: "空间名称至少需要2个字符",
      name_max_length: "空间名称不能超过50个字符",
      name_placeholder: "输入空间名称",
      description_placeholder: "输入空间描述（可选）",
      description_max_length: "描述不能超过200个字符",

      // === 创建空间 ===
      create_new_space: "创建新空间",
      create_space: "创建空间",
      create_success: "空间创建成功",
      create_error: "创建空间失败",
      creating: "正在创建空间...",

      // === 空间选择 ===
      default_space: "默认空间",
      select_space: "选择空间",
      no_spaces: "暂无空间",
      no_spaces_yet: "尚未创建任何空间",
      space_list: "空间列表",
      space_dropdown: "打开空间菜单",
      current_space: "当前空间",
      switch_space: "切换空间",

      // === 导航相关 ===
      home: "首页",
      back_to_home: "回到首页",
      space_settings: "空间设置",

      // === 空间设置 ===
      unsaved_changes: "有未保存的更改",
      unsaved_warning: "您有未保存的更改。是否要在离开前保存？",
      save_before_leave: "保存更改",
      discard_changes: "放弃更改",
      load_error_title: "加载空间信息失败",
      no_space_data: "未找到空间数据",
      try_repair: "尝试修复",
      repair_success: "修复操作成功完成",
      repair_error: "修复操作失败",
      try_later: "请稍后重试",

      // === 基本信息 ===
      basic_info: "基本信息",
      manage_basic_info: "管理空间的名称、描述等基本信息",
      space_details: "空间详情",
      view_space_details: "查看此空间的基本信息和元数据",
      space_id: "空间ID",
      created_at: "创建时间",
      updated_at: "最后更新",
      member_count: "成员",
      people: "人",
      person: "人",

      // === 权限管理 ===
      access_permission: "访问权限",
      manage_access: "控制谁可以访问和查看此空间的内容",
      select_visibility: "选择空间可见性",
      private_description: "只有被邀请的成员可以访问此空间",
      public_description: "所有人都可以查看，但只有成员可以编辑内容",
      permission_updated: "权限设置更新成功",

      // === 默认空间 ===
      save_changes: "保存更改",
      set_as_default: "设为默认空间",
      current_default: "当前默认空间",
      cancel_changes: "取消更改",
      set_default_success: "已成功设为默认空间",
      set_default_error: "设置默认空间失败",
      this_space: "此空间",

      // === 删除空间 ===
      delete_space: "删除空间",
      delete_confirm_message:
        "确定要删除此空间吗？此操作无法撤销，空间内的所有文件和数据将被永久删除。",
      delete_description:
        "此操作将永久删除空间内的所有文件、页面和数据，无法恢复。",
      delete_warning:
        "警告：此空间有 {{count}} 名成员。删除前请确保通知所有成员。",
      delete_input_placeholder: "输入空间名称以确认",
      delete_confirmation_required: "请输入空间名称以确认删除",
      delete_success: "空间已删除",
      delete_error: "删除空间失败",
      deleting: "正在删除空间...",

      // === 更新操作 ===
      update_success: "设置更新成功",
      update_error: "更新设置失败",
      updating: "正在更新...",

      // === 状态提示 ===
      empty_state_title: "尚无空间",
      empty_state_description: "创建您的第一个空间来开始使用",
      get_started: "开始使用",

      // === 侧边栏/内容管理相关 ===
      uncategorized: "未分类",
      dragToCategorize: "拖拽项目到此处进行分类，或创建新分类。",
      itemsDeleted: "已删除 {{count}} 项",
      createPageFailed: "创建新页面失败",
      categoryCreated: "分类 '{{name}}' 创建成功",
      emptyTitle: "暂无内容",
      emptyHint: "创建您的第一个页面或将文件拖拽到此处开始。",
      createFirstPage: "创建第一个页面",
      selectedItemsCount: "已选择 {{count}} 项",
      deselectAll: "取消全选",
      selectAll: "全部选择",
      deleteSelected: "删除所选",
      cancelSelectionMode: "取消选择模式",
      content: "内容",
      newPage: "新建页面",
      newCategory: "新建分类",
      batchSelect: "批量选择",
      expandAll: "全部展开",
      collapseAll: "全部折叠",
      contentMoved: "内容已成功移动",
      noOtherSpaces: "没有其他可用空间",
      titlePlaceholder: "无标题",
      moreActions: "更多操作",
      editTitle: "编辑标题",
      moveToSpace: "移动到空间",
      // 新增翻译键
      joinConversation: "加入对话",
      addedToConversation: "已加入对话",

      // CategoryHeader 新增的翻译键
      categoryNamePlaceholder: "输入分类名称",
      expand: "展开",
      collapse: "折叠",
      selectCategory: "选择分类 {{name}}",
      dragToReorder: "拖拽以重新排序分类",
      editName: "编辑名称",
      deleteCategoryConfirm: "确定要删除分类“{{name}}”吗？此操作无法撤销。",
      deleteCategory: "删除分类",
    },
  },

  [Language.ZH_HANT]: {
    translation: {
      // === 基础操作 ===
      create: "創建空間",
      name: "空間名稱",
      description: "描述",
      visibility: "可見性",
      private: "私有",
      public: "公開",
      loading: "載入中...",
      cancel: "取消",
      delete: "刪除",
      save: "儲存",
      edit: "編輯",

      // === 表单相关 ===
      name_required: "空間名稱必填",
      name_min_length: "空間名稱至少需要2個字符",
      name_max_length: "空間名稱不能超過50個字符",
      name_placeholder: "輸入空間名稱",
      description_placeholder: "輸入空間描述（可選）",
      description_max_length: "描述不能超過200個字符",

      // === 创建空间 ===
      create_new_space: "創建新空間",
      create_space: "創建空間",
      create_success: "空間創建成功",
      create_error: "創建空間失敗",
      creating: "正在創建空間...",

      // === 空间选择 ===
      default_space: "預設空間",
      select_space: "選擇空間",
      no_spaces: "暫無空間",
      no_spaces_yet: "尚未創建任何空間",
      space_list: "空間清單",
      space_dropdown: "開啟空間選單",
      current_space: "目前空間",
      switch_space: "切換空間",

      // === 导航相关 ===
      home: "首頁",
      back_to_home: "返回首頁",
      space_settings: "空間設定",

      // === 空间设置 ===
      unsaved_changes: "有未儲存的變更",
      unsaved_warning: "您有未儲存的變更。是否要在離開前儲存？",
      save_before_leave: "儲存變更",
      discard_changes: "放棄變更",
      load_error_title: "載入空間資訊失敗",
      no_space_data: "未找到空間資料",
      try_repair: "嘗試修復",
      repair_success: "修復操作成功完成",
      repair_error: "修復操作失敗",
      try_later: "請稍後重試",

      // === 基本信息 ===
      basic_info: "基本資訊",
      manage_basic_info: "管理空間的名稱、描述等基本資訊",
      space_details: "空間詳情",
      view_space_details: "查看此空間的基本資訊和後設資料",
      space_id: "空間ID",
      created_at: "創建時間",
      updated_at: "最後更新",
      member_count: "成員",
      people: "人",
      person: "人",

      // === 权限管理 ===
      access_permission: "存取權限",
      manage_access: "控制誰可以存取和查看此空間的內容",
      select_visibility: "選擇空間可見性",
      private_description: "只有受邀請的成員可以存取此空間",
      public_description: "所有人都可以查看，但只有成員可以編輯內容",
      permission_updated: "權限設定更新成功",

      // === 默认空间 ===
      save_changes: "儲存變更",
      set_as_default: "設為預設空間",
      current_default: "目前預設空間",
      cancel_changes: "取消變更",
      set_default_success: "已成功設為預設空間",
      set_default_error: "設定預設空間失敗",
      this_space: "此空間",

      // === 删除空间 ===
      delete_space: "刪除空間",
      delete_confirm_message:
        "確定要刪除此空間嗎？此操作無法撤銷，空間內的所有檔案和資料將被永久刪除。",
      delete_description:
        "此操作將永久刪除空間內的所有檔案、頁面和資料，無法復原。",
      delete_warning:
        "警告：此空間有 {{count}} 名成員。刪除前請確保通知所有成員。",
      delete_input_placeholder: "輸入空間名稱以確認",
      delete_confirmation_required: "請輸入空間名稱以確認刪除",
      delete_success: "空間已刪除",
      delete_error: "刪除空間失敗",
      deleting: "正在刪除空間...",

      // === 更新操作 ===
      update_success: "設定更新成功",
      update_error: "更新設定失敗",
      updating: "正在更新...",

      // === 状态提示 ===
      empty_state_title: "尚無空間",
      empty_state_description: "創建您的第一個空間來開始使用",
      get_started: "開始使用",

      // === 侧边栏/内容管理相关 ===
      uncategorized: "未分類",
      dragToCategorize: "拖曳項目到此處進行分類，或建立新分類。",
      itemsDeleted: "已刪除 {{count}} 項",
      createPageFailed: "建立新頁面失敗",
      categoryCreated: "分類 '{{name}}' 建立成功",
      emptyTitle: "暫無內容",
      emptyHint: "建立您的第一個頁面或將檔案拖曳到此處開始。",
      createFirstPage: "建立第一個頁面",
      selectedItemsCount: "已選擇 {{count}} 項",
      deselectAll: "取消全選",
      selectAll: "全部選擇",
      deleteSelected: "刪除所選",
      cancelSelectionMode: "取消選擇模式",
      content: "內容",
      newPage: "新建頁面",
      newCategory: "新建分類",
      batchSelect: "批次選擇",
      expandAll: "全部展開",
      collapseAll: "全部摺疊",
      contentMoved: "內容已成功移動",
      noOtherSpaces: "沒有其他可用空間",
      titlePlaceholder: "無標題",
      moreActions: "更多操作",
      editTitle: "編輯標題",
      moveToSpace: "移動到空間",
      // 新增翻译键
      joinConversation: "加入對話",
      addedToConversation: "已加入對話",

      // CategoryHeader 新增的翻譯鍵
      categoryNamePlaceholder: "輸入分類名稱",
      expand: "展開",
      collapse: "摺疊",
      selectCategory: "選擇分類 {{name}}",
      dragToReorder: "拖曳以重新排序分類",
      editName: "編輯名稱",
      deleteCategoryConfirm: "確定要刪除分類“{{name}}”嗎？此操作無法撤銷。",
      deleteCategory: "刪除分類",
    },
  },

  [Language.JA]: {
    translation: {
      // === 基本操作 ===
      create: "スペースを作成",
      name: "スペース名",
      description: "説明",
      visibility: "公開設定",
      private: "非公開",
      public: "公開",
      loading: "読み込み中...",
      cancel: "キャンセル",
      delete: "削除",
      save: "保存",
      edit: "編集",

      // === フォーム関連 ===
      name_required: "スペース名は必須です",
      name_min_length: "スペース名は2文字以上である必要があります",
      name_max_length: "スペース名は50文字以下にしてください",
      name_placeholder: "スペース名を入力",
      description_placeholder: "スペースの説明を入力（任意）",
      description_max_length: "説明は200文字以下にしてください",

      // === スペース作成 ===
      create_new_space: "新しいスペースを作成",
      create_space: "スペースを作成",
      create_success: "スペースが正常に作成されました",
      create_error: "スペースの作成に失敗しました",
      creating: "スペースを作成中...",

      // === スペース選択 ===
      default_space: "デフォルトスペース",
      select_space: "スペースを選択",
      no_spaces: "スペースがありません",
      no_spaces_yet: "まだスペースが作成されていません",
      space_list: "スペース一覧",
      space_dropdown: "スペースメニューを開く",
      current_space: "現在のスペース",
      switch_space: "スペースを切り替える",

      // === ナビゲーション関連 ===
      home: "ホーム",
      back_to_home: "ホームに戻る",
      space_settings: "スペース設定",

      // === スペース設定 ===
      unsaved_changes: "保存されていない変更があります",
      unsaved_warning:
        "保存されていない変更があります。離れる前に保存しますか？",
      save_before_leave: "変更を保存",
      discard_changes: "変更を破棄",
      load_error_title: "スペース情報の読み込みに失敗しました",
      no_space_data: "スペースデータが見つかりません",
      try_repair: "修復を試行",
      repair_success: "修復操作が正常に完了しました",
      repair_error: "修復操作に失敗しました",
      try_later: "しばらくしてから再度お試しください",

      // === 基本情報 ===
      basic_info: "基本情報",
      manage_basic_info: "スペース名や説明などの基本情報を管理する",
      space_details: "スペース詳細",
      view_space_details: "このスペースの基本情報とメタデータを表示する",
      space_id: "スペースID",
      created_at: "作成日時",
      updated_at: "最終更新",
      member_count: "メンバー",
      people: "人",
      person: "人",

      // === 権限管理 ===
      access_permission: "アクセス権限",
      manage_access:
        "このスペースのコンテンツにアクセスおよび表示できるユーザーを制御する",
      select_visibility: "スペースの公開設定を選択",
      private_description:
        "招待されたメンバーのみがこのスペースにアクセスできます",
      public_description:
        "誰でも閲覧できますが、メンバーのみがコンテンツを編集できます",
      permission_updated: "権限設定が正常に更新されました",

      // === デフォルトスペース ===
      save_changes: "変更を保存",
      set_as_default: "デフォルトスペースに設定",
      current_default: "現在のデフォルトスペース",
      cancel_changes: "変更をキャンセル",
      set_default_success: "デフォルトスペースに正常に設定されました",
      set_default_error: "デフォルトスペースの設定に失敗しました",
      this_space: "このスペース",

      // === スペース削除 ===
      delete_space: "スペースを削除",
      delete_confirm_message:
        "このスペースを削除してもよろしいですか？この操作は元に戻せません。スペース内のすべてのファイルとデータが永久に削除されます。",
      delete_description:
        "この操作はスペース内のすべてのファイル、ページ、データを永久に削除し、復元することはできません。",
      delete_warning:
        "警告：このスペースには {{count}} 人のメンバーがいます。削除する前にすべてのメンバーに通知してください。",
      delete_input_placeholder: "確認のためスペース名を入力",
      delete_confirmation_required:
        "削除を確認するためにスペース名を入力してください",
      delete_success: "スペースが削除されました",
      delete_error: "スペースの削除に失敗しました",
      deleting: "スペースを削除中...",

      // === 更新操作 ===
      update_success: "設定が更新されました",
      update_error: "設定の更新に失敗しました",
      updating: "更新中...",

      // === 状態メッセージ ===
      empty_state_title: "スペースがまだありません",
      empty_state_description: "最初のスペースを作成して始めましょう",
      get_started: "始める",

      // === 侧边栏/内容管理相关 ===
      uncategorized: "未分類",
      dragToCategorize:
        "ここに項目をドラッグして分類するか、新しいカテゴリを作成します。",
      itemsDeleted: "{{count}} 件の項目を削除しました",
      createPageFailed: "新しいページの作成に失敗しました",
      categoryCreated: "カテゴリ「{{name}}」が正常に作成されました",
      emptyTitle: "まだコンテンツがありません",
      emptyHint:
        "最初のページを作成するか、ここにファイルをドラッグして開始してください。",
      createFirstPage: "最初のページを作成",
      selectedItemsCount: "{{count}} 件の項目を選択済み",
      deselectAll: "すべて選択解除",
      selectAll: "すべて選択",
      deleteSelected: "選択した項目を削除",
      cancelSelectionMode: "選択モードをキャンセル",
      content: "コンテンツ",
      newPage: "新規ページ",
      newCategory: "新規カテゴリ",
      batchSelect: "一括選択",
      expandAll: "すべて展開",
      collapseAll: "すべて折りたたむ",
      contentMoved: "コンテンツが正常に移動されました",
      noOtherSpaces: "他のスペースはありません",
      titlePlaceholder: "無題",
      moreActions: "その他のアクション",
      editTitle: "タイトルを編集",
      moveToSpace: "スペースに移動",
      // 新增翻译键
      joinConversation: "会話に参加",
      addedToConversation: "会話に追加しました",

      // CategoryHeader 新增的翻译键
      categoryNamePlaceholder: "カテゴリ名を入力",
      expand: "展開",
      collapse: "折りたたむ",
      selectCategory: "カテゴリ {{name}} を選択",
      dragToReorder: "カテゴリを並べ替えるためにドラッグ",
      editName: "名前を編集",
      deleteCategoryConfirm:
        "カテゴリ「{{name}}」を削除してもよろしいですか？この操作は元に戻せません。",
      deleteCategory: "カテゴリを削除",
    },
  },
};
