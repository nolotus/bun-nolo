export default {
  en: {
    translation: {
      // General Actions & Status
      cancel: "Cancel",
      update: "Update",
      updating: "Updating...",
      create: "Create",
      creating: "Creating...",
      edit: "Edit",
      delete: "Delete",
      resetToDefaults: "Reset to Defaults",
      loading: "Loading...",
      startChat: "Start Chat",
      starting: "Starting...",
      viewDetails: "View Details",
      deleteSuccess: "Deleted successfully!",

      // Component Specific
      agent: "Agent",
      unnamed: "Unnamed",
      noDescription: "No description",
      noIntroduction: "No introduction available.",
      notSpecified: "Not specified",
      vision: "Vision",
      textOnly: "Text-only",
      details: "Details",
      price: "Price",
      perMillionTokens: "per 1M tokens",
      supported: "Supported",
      notSupported: "Not Supported",
      createdAt: "Created at",

      // Errors
      loadError: "Failed to load details",
      createDialogError: "Failed to create dialog",
      deleteError: "Failed to delete. Please try again.",

      // Main AI Form
      createAgent: "Create a New AI",
      editAgent: "Edit AI",

      // Tabs
      tabs: {
        basicInfo: "Basic Info",
        references: "References",
        toolSelection: "Tool Selection",
        publishSettings: "Publish Settings",
        advancedSettings: "Advanced Settings",
      },

      // Form Fields & Placeholders
      form: {
        name: "AI Name",
        namePlaceholder: "Enter AI name",
        provider: "Provider",
        selectProvider: "Select provider",
        model: "Model",
        selectModel: "Select a model",
        customProviderUrl: "Provider URL",
        customProviderUrlPlaceholder: "Enter provider URL",
        apiKey: "API Key",
        apiKeyPlaceholder: "Enter API key",
        prompt: "Prompt",
        promptPlaceholder: "Define AI's behavior and personality",
        greeting: "Greeting Message",
        introduction: "Self Introduction",
        introductionPlaceholder: "Enter self introduction",
        tags: "Tags",
        tagsPlaceholder: "Add tags and press Enter",
        useServerProxy: "Proxy Mode",
        isPublic: "Make Public",
        inputPrice: "Input Price",
        inputPricePlaceholder: "Cost per 1M input tokens",
        outputPrice: "Output Price",
        outputPricePlaceholder: "Cost per 1M output tokens",
        apiSource: "API Source",
        usePlatformApi: "Platform API",
        useCustomApi: "Custom API",
        smartReadEnabled: "Smart Read Current Space",
        tools: "Tools",
        selectTools: "Select Tools",
        modelParameters: "Model Parameters",
        temperature: "Temperature",
        topP: "Top P",
        frequencyPenalty: "Frequency Penalty",
        presencePenalty: "Presence Penalty",
        maxTokens: "Max Tokens",
        reasoningEffort: "Reasoning Effort",
        defaults: {
          greeting:
            "I am an intelligent assistant customized for you by nolo.chat. How can I help you today?",
        },
      },

      // Help Texts
      help: {
        tags: "Add tags to categorize this AI",
        proxy: "Turn off for direct connection without our servers",
        isPublic: "Show in community list for others to use",
        isPublicCustomApi: "AIs with custom API keys cannot be made public",
        apiSourcePlatform: "Use platform's built-in API key",
        apiSourceCustom: "Use your own API key and settings",
        smartRead:
          "Enable to automatically reference current workspace content",
        tools: "Choose tools that this AI can use",
        temperature:
          "Controls randomness, from 0 to 2. Higher is more random, lower is more focused.",
        topP: "Controls diversity, from 0 to 1. Higher includes more diverse outputs.",
        frequencyPenalty:
          "Reduces word repetition, from -2 to 2. Higher discourages repetition.",
        presencePenalty:
          "Reduces topic repetition, from -2 to 2. Higher encourages new topics.",
        maxTokens: "Limits response length, minimum 1.",
      },

      // Validation Messages
      validation: {
        nameRequired: "Name is required",
        nameTooLong: "Name must not exceed 50 characters",
        providerRequired: "Provider is required",
        modelRequired: "Model is required",
        invalidUrl: "Must be a valid URL when provided",
        priceMin: "Price must be at least 0",
        duplicateReferences: "Duplicate references are not allowed",
        temperatureRange: "Temperature must be between 0 and 2",
        topPRange: "Top P must be between 0 and 1",
        frequencyPenaltyRange: "Frequency Penalty must be between -2 and 2",
        presencePenaltyRange: "Presence Penalty must be between -2 and 2",
        maxTokensMin: "Max Tokens must be at least 1",
        maxTokensMax: "Max Tokens must be at most 500,000",
        reasoningEffortInvalid: "Reasoning effort must be low, medium, or high",
        apiKeyRequired:
          "API Key is required when not using Server Proxy, Ollama or Custom provider",
        customUrlRequired:
          "Custom Provider URL is required for the 'custom' provider",
      },

      // Legacy Errors (kept for compatibility)
      errors: {
        noUserId: "No user ID available. Please log in again.",
        createDialog: "Failed to create dialog",
        delete: "Failed to delete. Please try again.",
      },

      // References Tab Specific
      references: {
        title: "References",
        selectTitle: "Select References",
        selectHelp: "Select pages to use as knowledge or instructions.",
        searchCurrentSpace: "Search in current space...",
        searchAllSpaces: "Searching in all spaces...",
        clearSearch: "Clear search",
        noResults: "No search results found.",
        noContent: "No content available in this space.",
        found_one: "Found {{count}} result",
        found_other: "Found {{count}} results",
        fromSpace: "From: {{spaceName}}",
        toInstruction: "Switch to Instruction",
        toKnowledge: "Switch to Knowledge",
        selected_one: "{{count}} reference selected",
        selected_other: "{{count}} references selected",
        knowledge: "Knowledge",
        instruction: "Instruction",
      },
    },
  },
  "zh-CN": {
    translation: {
      // 通用操作和状态
      cancel: "取消",
      update: "更新",
      updating: "更新中...",
      create: "创建",
      creating: "创建中...",
      edit: "编辑",
      delete: "删除",
      resetToDefaults: "重置为默认值",
      loading: "加载中...",
      startChat: "开始聊天",
      starting: "启动中...",
      viewDetails: "查看详情",
      deleteSuccess: "删除成功！",

      // 组件特定
      agent: "AI",
      unnamed: "未命名",
      noDescription: "暂无描述",
      noIntroduction: "暂无简介。",
      notSpecified: "未指定",
      vision: "视觉",
      textOnly: "纯文本",
      details: "详细信息",
      price: "价格",
      perMillionTokens: "每百万Token",
      supported: "支持",
      notSupported: "不支持",
      createdAt: "创建于",

      // 错误提示
      loadError: "加载详情失败",
      createDialogError: "创建对话失败",
      deleteError: "删除失败，请重试。",

      // AI 表单主标题
      createAgent: "创建新的AI",
      editAgent: "编辑AI",

      // 标签页
      tabs: {
        basicInfo: "基本信息",
        references: "知识与指令",
        toolSelection: "工具选择",
        publishSettings: "发布设置",
        advancedSettings: "高级设置",
      },

      // 表单字段和占位符
      form: {
        name: "AI名称",
        namePlaceholder: "输入AI名称",
        provider: "服务商",
        selectProvider: "选择一个服务商",
        model: "模型",
        selectModel: "选择一个模型",
        customProviderUrl: "服务商URL",
        customProviderUrlPlaceholder: "为自定义服务商输入URL",
        apiKey: "API密钥",
        apiKeyPlaceholder: "输入您的API密钥",
        prompt: "系统提示词",
        promptPlaceholder: "定义AI的行为、角色和个性...",
        greeting: "问候语",
        introduction: "自我介绍",
        introductionPlaceholder: "向用户介绍你自己...",
        tags: "标签",
        tagsPlaceholder: "添加标签后按回车",
        useServerProxy: "代理模式",
        isPublic: "公开发布",
        inputPrice: "输入价格",
        inputPricePlaceholder: "每百万输入Token的成本",
        outputPrice: "输出价格",
        outputPricePlaceholder: "每百万输出Token的成本",
        apiSource: "API来源",
        usePlatformApi: "平台API",
        useCustomApi: "自定义API",
        smartReadEnabled: "智能读取当前空间",
        tools: "工具",
        selectTools: "选择工具",
        modelParameters: "模型参数",
        temperature: "温度 (Temperature)",
        topP: "Top P",
        frequencyPenalty: "频率惩罚",
        presencePenalty: "存在惩罚",
        maxTokens: "最大Token数",
        reasoningEffort: "推理强度",
        defaults: {
          greeting:
            "我是由 nolo.chat 为你定制的智能助手，今天有什么可以帮到你的？",
        },
      },

      // 帮助提示文本
      help: {
        tags: "添加标签，用于分类和发现",
        proxy:
          "关闭后，将使用您的API密钥直接连接服务商，数据不经过我们的服务器",
        isPublic: "发布到社区，让其他用户也能使用",
        isPublicCustomApi: "使用自定义API的AI无法公开发布",
        apiSourcePlatform: "使用平台提供的API密钥",
        apiSourceCustom: "使用您自己的API密钥和设置",
        smartRead: "启用后，AI将自动引用当前工作空间的内容作为上下文",
        tools: "选择此AI可以使用的工具",
        temperature: "控制输出的随机性，范围0-2。越高越随机，越低越确定。",
        topP: "控制输出的多样性，范围0-1。越高输出越多样化。",
        frequencyPenalty: "降低词汇重复度，范围-2到2。越高越能避免重复用词。",
        presencePenalty: "降低主题重复度，范围-2到2。越高越鼓励谈论新主题。",
        maxTokens: "限制单次回复的长度，最小为1。",
      },

      // 验证信息
      validation: {
        nameRequired: "AI名称为必填项",
        nameTooLong: "名称不能超过50个字符",
        providerRequired: "服务商为必填项",
        modelRequired: "模型为必填项",
        invalidUrl: "若提供，必须是有效的URL",
        priceMin: "价格必须大于等于0",
        duplicateReferences: "不允许添加重复的引用",
        temperatureRange: "温度值必须在0和2之间",
        topPRange: "Top P值必须在0和1之间",
        frequencyPenaltyRange: "频率惩罚值必须在-2和2之间",
        presencePenaltyRange: "存在惩罚值必须在-2和2之间",
        maxTokensMin: "最大Token数必须至少为1",
        maxTokensMax: "最大Token数不能超过500,000",
        reasoningEffortInvalid: "推理强度必须是 low, medium, 或 high",
        apiKeyRequired:
          "未使用代理模式、Ollama或自定义服务商时，API密钥为必填项",
        customUrlRequired: "使用自定义服务商时，URL为必填项",
      },

      // 旧版错误（保留以兼容）
      errors: {
        noUserId: "无法获取用户ID，请重新登录。",
        createDialog: "创建对话失败",
        delete: "删除失败，请重试。",
      },

      // 知识与指令Tab
      references: {
        title: "知识与指令",
        selectTitle: "管理知识与指令",
        selectHelp: "选择此AI可作为知识或指令使用的页面。",
        searchCurrentSpace: "在当前空间中搜索...",
        searchAllSpaces: "在所有空间中搜索...",
        clearSearch: "清除搜索",
        noResults: "未找到搜索结果。",
        noContent: "此空间内暂无内容。",
        found_one: "找到 {{count}} 个结果",
        found_other: "找到 {{count}} 个结果",
        fromSpace: "来自: {{spaceName}}",
        toInstruction: "切换为指令",
        toKnowledge: "切换为知识",
        selected_one: "已选择 {{count}} 项引用",
        selected_other: "已选择 {{count}} 项引用",
        knowledge: "知识",
        instruction: "指令",
      },
    },
  },
  "zh-Hant": {
    translation: {
      // 通用操作與狀態
      cancel: "取消",
      update: "更新",
      updating: "更新中...",
      create: "建立",
      creating: "建立中...",
      edit: "編輯",
      delete: "刪除",
      resetToDefaults: "重設為預設值",
      loading: "載入中...",
      startChat: "開始對話",
      starting: "啟動中...",
      viewDetails: "檢視詳情",
      deleteSuccess: "刪除成功！",

      // 組件特定
      agent: "AI",
      unnamed: "未命名",
      noDescription: "暫無描述",
      noIntroduction: "暫無簡介。",
      notSpecified: "未指定",
      vision: "視覺",
      textOnly: "純文字",
      details: "詳細資訊",
      price: "價格",
      perMillionTokens: "每百萬Token",
      supported: "支援",
      notSupported: "不支援",
      createdAt: "建立於",

      // 錯誤提示
      loadError: "載入詳情失敗",
      createDialogError: "建立對話失敗",
      deleteError: "刪除失敗，請重試。",

      // AI 表單主標題
      createAgent: "建立新的AI",
      editAgent: "編輯AI",

      // 標籤頁
      tabs: {
        basicInfo: "基本資訊",
        references: "知識與指令",
        toolSelection: "工具選擇",
        publishSettings: "發布設定",
        advancedSettings: "進階設定",
      },

      // 表單欄位和預留位置
      form: {
        name: "AI名稱",
        namePlaceholder: "輸入AI名稱",
        provider: "服務提供者",
        selectProvider: "選擇一個服務提供者",
        model: "模型",
        selectModel: "選擇一個模型",
        customProviderUrl: "提供者URL",
        customProviderUrlPlaceholder: "為自訂提供者輸入URL",
        apiKey: "API金鑰",
        apiKeyPlaceholder: "輸入您的API金鑰",
        prompt: "系統提示詞",
        promptPlaceholder: "定義AI的行為、角色和個性...",
        greeting: "問候語",
        introduction: "自我介紹",
        introductionPlaceholder: "向使用者介紹你自己...",
        tags: "標籤",
        tagsPlaceholder: "新增標籤後按 Enter",
        useServerProxy: "代理模式",
        isPublic: "公開發布",
        inputPrice: "輸入價格",
        inputPricePlaceholder: "每百萬輸入Token的成本",
        outputPrice: "輸出價格",
        outputPricePlaceholder: "每百萬輸出Token的成本",
        apiSource: "API來源",
        usePlatformApi: "平台API",
        useCustomApi: "自訂API",
        smartReadEnabled: "智慧讀取目前空間",
        tools: "工具",
        selectTools: "選擇工具",
        modelParameters: "模型參數",
        temperature: "溫度 (Temperature)",
        topP: "Top P",
        frequencyPenalty: "頻率懲罰",
        presencePenalty: "存在懲罰",
        maxTokens: "最大Token數",
        reasoningEffort: "推理強度",
        defaults: {
          greeting:
            "我是由 nolo.chat 為您客製化的智慧助理，今天有什麼可以幫到您的？",
        },
      },

      // 幫助提示文字
      help: {
        tags: "新增標籤，用於分類和發現",
        proxy:
          "關閉後，將使用您的API金鑰直接連接服務提供者，資料不會經過我們的伺服器",
        isPublic: "發布到社群，讓其他使用者也能使用",
        isPublicCustomApi: "使用自訂API的AI無法公開發布",
        apiSourcePlatform: "使用平台提供的API金鑰",
        apiSourceCustom: "使用您自己的API金鑰和設定",
        smartRead: "啟用後，AI將自動引用目前工作空間的內容作為上下文",
        tools: "選擇此AI可以使用的工具",
        temperature: "控制輸出的隨機性，範圍0-2。越高越隨機，越低越確定。",
        topP: "控制輸出的多樣性，範圍0-1。越高輸出越多樣化。",
        frequencyPenalty: "降低詞彙重複度，範圍-2到2。越高越能避免重複用詞。",
        presencePenalty: "降低主題重複度，範圍-2到2。越高越鼓勵談論新主題。",
        maxTokens: "限制單次回答的長度，最小為1。",
      },

      // 驗證資訊
      validation: {
        nameRequired: "AI名稱為必填項",
        nameTooLong: "名稱不得超過50個字元",
        providerRequired: "服務提供者為必填項",
        modelRequired: "模型為必填項",
        invalidUrl: "若提供，必須是有效的URL",
        priceMin: "價格必須大於等於0",
        duplicateReferences: "不允許新增重複的參考資料",
        temperatureRange: "溫度值必須在0和2之間",
        topPRange: "Top P值必須在0和1之間",
        frequencyPenaltyRange: "頻率懲罰值必須在-2和2之間",
        presencePenaltyRange: "存在懲罰值必須在-2和2之間",
        maxTokensMin: "最大Token數必須至少為1",
        maxTokensMax: "最大Token數不得超過500,000",
        reasoningEffortInvalid: "推理強度必須是 low, medium, 或 high",
        apiKeyRequired:
          "未使用代理模式、Ollama或自訂服務提供者時，API金鑰為必填項",
        customUrlRequired: "使用自訂服務提供者時，URL為必填項",
      },

      // 舊版錯誤（保留以相容）
      errors: {
        noUserId: "無法獲取使用者ID，請重新登入。",
        createDialog: "建立對話失敗",
        delete: "刪除失敗，請重試。",
      },

      // 知識與指令Tab
      references: {
        title: "知識與指令",
        selectTitle: "管理知識與指令",
        selectHelp: "選擇此AI可作為知識或指令使用的頁面。",
        searchCurrentSpace: "在目前空間中搜尋...",
        searchAllSpaces: "在所有空間中搜尋...",
        clearSearch: "清除搜尋",
        noResults: "找不到搜尋結果。",
        noContent: "此空間內暫無內容。",
        found_one: "找到 {{count}} 個結果",
        found_other: "找到 {{count}} 個結果",
        fromSpace: "來自: {{spaceName}}",
        toInstruction: "切換為指令",
        toKnowledge: "切換為知識",
        selected_one: "已選擇 {{count}} 項參考資料",
        selected_other: "已選擇 {{count}} 項參考資料",
        knowledge: "知識",
        instruction: "指令",
      },
    },
  },
  ja: {
    translation: {
      // 一般的なアクションとステータス
      cancel: "キャンセル",
      update: "更新",
      updating: "更新中...",
      create: "作成",
      creating: "作成中...",
      edit: "編集",
      delete: "削除",
      resetToDefaults: "デフォルトにリセット",
      loading: "読み込み中...",
      startChat: "チャットを開始",
      starting: "開始中...",
      viewDetails: "詳細を表示",
      deleteSuccess: "正常に削除されました！",

      // コンポーネント固有
      agent: "AI",
      unnamed: "無名",
      noDescription: "説明なし",
      noIntroduction: "紹介文がありません。",
      notSpecified: "指定なし",
      vision: "ビジョン",
      textOnly: "テキストのみ",
      details: "詳細",
      price: "価格",
      perMillionTokens: "100万トークンあたり",
      supported: "対応",
      notSupported: "非対応",
      createdAt: "作成日",

      // エラー
      loadError: "詳細の読み込みに失敗しました",
      createDialogError: "対話の作成に失敗しました",
      deleteError: "削除に失敗しました。もう一度お試しください。",

      // AIフォームのメインタイトル
      createAgent: "新しいAIを作成",
      editAgent: "AIを編集",

      // タブ
      tabs: {
        basicInfo: "基本情報",
        references: "知識と指示",
        toolSelection: "ツール選択",
        publishSettings: "公開設定",
        advancedSettings: "詳細設定",
      },

      // フォームフィールドとプレースホルダー
      form: {
        name: "AI名",
        namePlaceholder: "AI名を入力",
        provider: "プロバイダー",
        selectProvider: "プロバイダーを選択",
        model: "モデル",
        selectModel: "モデルを選択",
        customProviderUrl: "プロバイダーURL",
        customProviderUrlPlaceholder: "カスタムプロバイダーのURLを入力",
        apiKey: "APIキー",
        apiKeyPlaceholder: "APIキーを入力",
        prompt: "プロンプト",
        promptPlaceholder: "AIの行動、役割、性格を定義します...",
        greeting: "挨拶メッセージ",
        introduction: "自己紹介",
        introductionPlaceholder: "ユーザーに自己紹介を入力",
        tags: "タグ",
        tagsPlaceholder: "タグを追加してEnterキーを押す",
        useServerProxy: "プロキシモード",
        isPublic: "公開",
        inputPrice: "入力価格",
        inputPricePlaceholder: "100万入力トークンあたりのコスト",
        outputPrice: "出力価格",
        outputPricePlaceholder: "100万出力トークンあたりのコスト",
        apiSource: "APIソース",
        usePlatformApi: "プラットフォームAPI",
        useCustomApi: "カスタムAPI",
        smartReadEnabled: "現在のスペースをスマート読み取り",
        tools: "ツール",
        selectTools: "ツールを選択",
        modelParameters: "モデルパラメータ",
        temperature: "温度 (Temperature)",
        topP: "Top P",
        frequencyPenalty: "頻度ペナルティ",
        presencePenalty: "存在ペナルティ",
        maxTokens: "最大トークン数",
        reasoningEffort: "推論強度",
        defaults: {
          greeting:
            "私はnolo.chatによってカスタマイズされたインテリジェントアシスタントです。今日は何をお手伝いしましょうか？",
        },
      },

      // ヘルプテキスト
      help: {
        tags: "このAIを分類するためのタグを追加します",
        proxy:
          "オフにすると、当社のサーバーを経由せず、ご自身のAPIキーで直接接続します",
        isPublic:
          "コミュニティリストに表示し、他のユーザーが使用できるようにします",
        isPublicCustomApi: "カスタムAPIを持つAIは公開できません",
        apiSourcePlatform: "プラットフォーム内蔵のAPIキーを使用します",
        apiSourceCustom: "ご自身のAPIキーと設定を使用します",
        smartRead:
          "有効にすると、AIは自動的に現在のワークスペースのコンテンツをコンテキストとして参照します",
        tools: "このAIが使用できるツールを選択します",
        temperature:
          "出力のランダム性を制御します（範囲0〜2）。値が高いほどランダムになり、低いほど確定的になります。",
        topP: "出力の多様性を制御します（範囲0〜1）。値が高いほど多様な出力が含まれます。",
        frequencyPenalty:
          "単語の繰り返しを減らします（範囲-2〜2）。値が高いほど繰り返されにくくなります。",
        presencePenalty:
          "トピックの繰り返しを減らします（範囲-2〜2）。値が高いほど新しいトピックが促されます。",
        maxTokens: "1回の応答の長さを制限します（最小1）。",
      },

      // バリデーションメッセージ
      validation: {
        nameRequired: "AI名は必須です",
        nameTooLong: "名前は50文字以内で入力してください",
        providerRequired: "プロバイダーは必須です",
        modelRequired: "モデルは必須です",
        invalidUrl: "有効なURL形式で入力してください",
        priceMin: "価格は0以上である必要があります",
        duplicateReferences: "重複した参照は許可されていません",
        temperatureRange: "温度は0から2の間でなければなりません",
        topPRange: "Top Pは0から1の間でなければなりません",
        frequencyPenaltyRange:
          "頻度ペナルティは-2から2の間でなければなりません",
        presencePenaltyRange: "存在ペナルティは-2から2の間でなければなりません",
        maxTokensMin: "最大トークン数は1以上である必要があります",
        maxTokensMax: "最大トークン数は500,000以下である必要があります",
        reasoningEffortInvalid:
          "推論強度は low, medium, high のいずれかである必要があります",
        apiKeyRequired:
          "プロキシモード、Ollama、またはカスタムプロバイダーを使用しない場合、APIキーは必須です",
        customUrlRequired: "カスタムプロバイダーを使用する場合、URLは必須です",
      },

      // レガシーエラー（互換性のため保持）
      errors: {
        noUserId:
          "ユーザーIDが取得できませんでした。再度ログインしてください。",
        createDialog: "対話の作成に失敗しました",
        delete: "削除に失敗しました。もう一度お試しください。",
      },

      // 知識と指示タブ
      references: {
        title: "知識と指示",
        selectTitle: "知識と指示を管理",
        selectHelp:
          "このAIが知識または指示として使用できるページを選択します。",
        searchCurrentSpace: "現在のスペースで検索...",
        searchAllSpaces: "すべてのスペースで検索中...",
        clearSearch: "検索をクリア",
        noResults: "検索結果が見つかりませんでした。",
        noContent: "このスペースにはコンテンツがありません。",
        found_one: "{{count}}件の結果が見つかりました",
        found_other: "{{count}}件の結果が見つかりました",
        fromSpace: "元: {{spaceName}}",
        toInstruction: "指示に切り替え",
        toKnowledge: "知識に切り替え",
        selected_one: "{{count}}件の参照を選択済み",
        selected_other: "{{count}}件の参照を選択済み",
        knowledge: "知識",
        instruction: "指示",
      },
    },
  },
};
