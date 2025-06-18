export default {
  en: {
    translation: {
      // General Form Fields & Actions
      model: "Model",
      modelRequired: "Model selection is required",
      selectModel: "Select a model",
      cybotName: "Cybot Name",
      cybotNameRequired: "Cybot name is required",
      greetingMessage: "Greeting Message",
      greetingRequired: "Greeting message is required",
      selfIntroduction: "Self Introduction",
      introductionRequired: "Self introduction is required",
      prompt: "Prompt",
      tags: "Tags",
      tagsHelp: "Add tags to categorize this Cybot",
      addTagsPlaceholder: "Add tags and press Enter",
      enterCybotName: "Enter Cybot name",
      enterPrompt: "Enter prompt",
      enterGreetingMessage: "Enter greeting message",
      enterSelfIntroduction: "Enter self introduction",
      enterTags: "Enter tags separated by commas",
      cancel: "Cancel",
      update: "Update",
      updating: "Updating...",
      create: "Create",
      creating: "Creating...",
      resetToDefaults: "Reset to Defaults",

      // Cybot & Model Specifics
      createCybot: "Create a New Cybot",
      editCybot: "Edit Cybot",
      cybot: "Cybot",
      modelName: "Model Name",
      enterModelName: "Enter model name",
      introduction: "Introduction",
      dialog: "Dialog",
      dialogCount: "Dialogs",
      supportsVision: "Vision Support",
      noAvailableCybotMessage: "No available Cybot message",
      unnamed: "Unnamed",
      noDescription: "No description",

      // API & Provider Settings
      apiKeyField: "API Key",
      provider: "Provider",
      providerUrl: "Provider URL",
      enterProviderUrl: "Enter provider URL",
      selectProvider: "Select provider",
      enterApiKey: "Enter API key",
      apiSource: "API Source",
      platformApiHelp: "Use platform's built-in API key",
      customApiHelp: "Use your own API key and settings",
      useCustomApi: "Custom API",
      usePlatformApi: "Platform API",
      providerUrlHelp: "Enter API endpoint URL for custom provider",
      apiKeyHelp: "Enter API key for authentication",
      promptHelp: "Define AI's behavior and personality",
      useServerProxy: "Proxy Mode",
      proxyHelp: "Turn off for direct connection without our servers",
      proxyNotAvailableForProvider:
        "Direct connection unavailable for this provider",

      // Pricing & Balance
      inputPrice: "Input Price",
      outputPrice: "Output Price",
      inputPriceHelp: "Cost per 1M input tokens",
      outputPriceHelp: "Cost per 1M output tokens",
      inputPricePerThousand: "Input price per 1M tokens",
      outputPricePerThousand: "Output price per 1M tokens",
      pricing: "Pricing",
      insufficientBalanceDetailed:
        "Insufficient balance. Current model: {{modelName}}, max cost per message: {{pricePerMessage}} credits. Your balance: {{balance}} credits.",
      insufficientBalance: "Insufficient balance",
      cybotConfigMissing: "Cybot configuration missing",
      modelPricingMissing: "Model pricing info missing",

      // References Tab - UPDATED
      references: "References", // English key remains "References"
      selectReferences: "Select References", // English key remains "Select References"
      selectReferencesHelp: "Select pages to reference", // English key remains "Select pages to reference"
      noPagesAvailable: "No pages available",
      smartReadCurrentSpace: "Smart Read Current Space",
      smartReadHelp:
        "Enable to automatically reference current workspace content",
      markAsInstruction: "Mark as Instruction (AI follows this strictly)",
      markAsKnowledge: "Mark as Knowledge (AI can reference for answers)",

      // Tools Tab
      tools: "Tools",
      toolSelection: "Tools",
      selectTools: "Select Tools",
      selectToolsHelp: "Choose tools that this Cybot can use",

      // Publish Settings
      publishSettings: "Publish Settings",
      shareInCommunity: "Make Public",
      shareInCommunityHelp: "Show in community list for others to use",
      shareInCommunityCustomApiHelp: "Custom API Cybots can't be public",

      // Model Parameters & Advanced Settings
      advancedSettings: "Advanced Settings",
      modelParameters: "Model Parameters",
      temperature: "Temperature",
      temperatureHelp:
        "Controls randomness of output, between 0 and 2. Higher values (e.g., 0.8) make output more random, lower values (e.g., 0.2) make it more focused.",
      topP: "Top P",
      topPHelp:
        "Controls output diversity, between 0 and 1. Higher values (e.g., 0.9) include more diverse outputs.",
      frequencyPenalty: "Frequency Penalty",
      frequencyPenaltyHelp:
        "Reduces repetition of words, between -2 and 2. Higher values discourage repetition.",
      presencePenalty: "Presence Penalty",
      presencePenaltyHelp:
        "Reduces repetition of topics, between -2 and 2. Higher values encourage new topics.",
      maxTokens: "Max Tokens",
      maxTokensHelp:
        "Limits the length of output, minimum 1. Defines the maximum number of tokens in response.",

      // Other / Misc
      deleteSuccess: "Deleted successfully!",
      deleteError: "Failed to delete. Please try again.",
      starting: "Starting...",
      startChat: "Start Chat",
      edit: "Edit",
      delete: "Delete",
      createDialogError: "Failed to create dialog",
      input: "Input",
      output: "Output",
      basicInfo: "Basic Info", // This is a tab label
    },
  },
  "zh-CN": {
    translation: {
      // General Form Fields & Actions
      model: "模型",
      modelRequired: "模型选择为必填项",
      selectModel: "选择一个模型",
      cybotName: "AI名称",
      cybotNameRequired: "AI名称为必填项",
      greetingMessage: "问候消息",
      greetingRequired: "问候消息为必填项",
      selfIntroduction: "自我介绍",
      introductionRequired: "自我介绍为必填项",
      prompt: "提示词",
      tags: "标签",
      tagsHelp: "添加标签以分类Cybot",
      addTagsPlaceholder: "添加标签并按回车",
      enterCybotName: "输入Cybot名称",
      enterPrompt: "输入提示词",
      enterGreetingMessage: "输入问候消息",
      enterSelfIntroduction: "输入自我介绍",
      enterTags: "输入标签，用逗号分隔",
      cancel: "取消",
      update: "更新",
      updating: "更新中...",
      create: "创建",
      creating: "创建中...",
      resetToDefaults: "重置为默认值",

      // Cybot & Model Specifics
      createCybot: "创建新的Cybot",
      editCybot: "编辑Cybot",
      cybot: "Cybot",
      modelName: "模型名称",
      enterModelName: "输入模型名称",
      introduction: "介绍",
      dialog: "对话",
      dialogCount: "对话数",
      supportsVision: "视觉支持",
      noAvailableCybotMessage: "没有可用的Cybot消息",
      unnamed: "未命名",
      noDescription: "暂无描述",

      // API & Provider Settings
      apiKeyField: "API密钥",
      provider: "提供商",
      providerUrl: "提供商URL",
      enterProviderUrl: "输入提供商URL",
      selectProvider: "选择提供商",
      enterApiKey: "输入API密钥",
      apiSource: "API来源",
      platformApiHelp: "使用平台内置API密钥",
      customApiHelp: "使用自定义API密钥和设置",
      useCustomApi: "自定义API",
      usePlatformApi: "平台API",
      providerUrlHelp: "输入自定义提供商API端点URL",
      apiKeyHelp: "输入API密钥进行认证",
      promptHelp: "定义AI行为和个性",
      useServerProxy: "中转模式",
      proxyHelp: "关闭后使用您的API密钥直接连接，无需经过我们的服务器",
      proxyNotAvailableForProvider: "此提供商不支持直连模式",

      // Pricing & Balance
      inputPrice: "输入价格",
      outputPrice: "输出价格",
      inputPriceHelp: "每百万输入词元成本",
      outputPriceHelp: "每百万输出词元成本",
      inputPricePerThousand: "每百万输入词元价格",
      outputPricePerThousand: "每百万输出词元价格",
      pricing: "价格设置",
      insufficientBalanceDetailed:
        "余额不足。当前模型：{{modelName}}，单次对话最多消耗：{{pricePerMessage}}积分。您的余额：{{balance}}积分。",
      insufficientBalance: "余额不足",
      cybotConfigMissing: "Cybot配置缺失",
      modelPricingMissing: "模型定价信息缺失",

      // References Tab - UPDATED
      references: "知识与指令", // Tab Title
      selectReferences: "管理知识与指令", // Selector Label
      selectReferencesHelp: "选择此Cybot可作为知识或指令使用的页面。", // Selector Help Text
      noPagesAvailable: "暂无可用页面",
      smartReadCurrentSpace: "智能读取当前空间",
      smartReadHelp: "启用后自动引用当前工作空间的内容",
      markAsInstruction: "标记为指令（AI将严格遵循）",
      markAsKnowledge: "标记为知识（AI可参考此提供答案）",

      // Tools Tab
      tools: "工具",
      toolSelection: "工具设置",
      selectTools: "选择工具",
      selectToolsHelp: "选择此Cybot可以使用的工具",

      // Publish Settings
      publishSettings: "发布设置",
      shareInCommunity: "公开发布",
      shareInCommunityHelp: "显示在社区列表，供其他用户使用",
      shareInCommunityCustomApiHelp: "自定义API的Cybot无法公开发布",

      // Model Parameters & Advanced Settings
      advancedSettings: "高级设置",
      modelParameters: "模型参数",
      temperature: "温度",
      temperatureHelp:
        "控制输出随机性，范围0到2。较高值（如0.8）使输出更随机，较低值（如0.2）使输出更集中。",
      topP: "Top P",
      topPHelp: "控制输出多样性，范围0到1。较高值（如0.9）包含更多样化的输出。",
      frequencyPenalty: "频率惩罚",
      frequencyPenaltyHelp: "减少词汇重复，范围-2到2。较高值会抑制重复。",
      presencePenalty: "存在惩罚",
      presencePenaltyHelp: "减少主题重复，范围-2到2。较高值鼓励引入新主题。",
      maxTokens: "最大Token数",
      maxTokensHelp: "限制输出长度，最小值为1。定义响应的最大Token数量。",

      // Other / Misc
      deleteSuccess: "删除成功！",
      deleteError: "删除失败，请重试。",
      starting: "启动中...",
      startChat: "开始聊天",
      edit: "编辑",
      delete: "删除",
      createDialogError: "创建对话失败",
      input: "输入",
      output: "输出",
      basicInfo: "基本信息",
    },
  },
  "zh-Hant": {
    translation: {
      // General Form Fields & Actions
      model: "模型",
      modelRequired: "模型選擇為必填項",
      selectModel: "選擇一個模型",
      cybotName: "Cybot名稱",
      cybotNameRequired: "Cybot名稱為必填項",
      greetingMessage: "問候消息",
      greetingRequired: "問候消息為必填項",
      selfIntroduction: "自我介紹",
      introductionRequired: "自我介紹為必填項",
      prompt: "提示詞",
      tags: "標籤",
      tagsHelp: "添加標籤以分類Cybot",
      addTagsPlaceholder: "添加標籤並按回車",
      enterCybotName: "輸入Cybot名稱",
      enterPrompt: "輸入提示詞",
      enterGreetingMessage: "輸入問候消息",
      enterSelfIntroduction: "輸入自我介紹",
      enterTags: "輸入標籤，用逗號分隔",
      cancel: "取消",
      update: "更新",
      updating: "更新中...",
      create: "創建",
      creating: "創建中...",
      resetToDefaults: "重置為默認值",

      // Cybot & Model Specifics
      createCybot: "創建新的Cybot",
      editCybot: "編輯Cybot",
      cybot: "Cybot",
      modelName: "模型名稱",
      enterModelName: "輸入模型名稱",
      introduction: "介紹",
      dialog: "對話",
      dialogCount: "對話數",
      supportsVision: "視覺支持",
      noAvailableCybotMessage: "沒有可用的Cybot消息",
      unnamed: "未命名",
      noDescription: "暫無描述",

      // API & Provider Settings
      apiKeyField: "API密鑰",
      provider: "提供商",
      providerUrl: "提供商URL",
      enterProviderUrl: "輸入提供商URL",
      selectProvider: "選擇提供商",
      enterApiKey: "輸入API密鑰",
      apiSource: "API來源",
      platformApiHelp: "使用平台內置API密鑰",
      customApiHelp: "使用自定義API密鑰和設置",
      useCustomApi: "自定義API",
      usePlatformApi: "平台API",
      providerUrlHelp: "輸入自定義提供商API端點URL",
      apiKeyHelp: "輸入API密鑰進行認證",
      promptHelp: "定義AI行為和個性",
      useServerProxy: "中轉模式",
      proxyHelp: "關閉後使用您的API密鑰直接連接，無需經過我們的服務器",
      proxyNotAvailableForProvider: "此提供商不支持直連模式",

      // Pricing & Balance
      inputPrice: "輸入價格",
      outputPrice: "輸出價格",
      inputPriceHelp: "每百萬輸入詞元成本",
      outputPriceHelp: "每百萬輸出詞元成本",
      inputPricePerThousand: "每百萬輸入詞元價格",
      outputPricePerThousand: "每百萬輸出詞元價格",
      pricing: "價格設置",
      insufficientBalanceDetailed:
        "餘額不足。當前模型：{{modelName}}，單次對話最多消耗：{{pricePerMessage}}積分。您的餘額：{{balance}}積分。",
      insufficientBalance: "餘額不足",
      cybotConfigMissing: "Cybot配置缺失",
      modelPricingMissing: "模型定價信息缺失",

      // References Tab - UPDATED
      references: "知識與指令", // Tab Title
      selectReferences: "管理知識與指令", // Selector Label
      selectReferencesHelp: "選擇此Cybot可作為知識或指令使用的頁面。", // Selector Help Text
      noPagesAvailable: "暫無可用頁面",
      smartReadCurrentSpace: "智能讀取當前空間",
      smartReadHelp: "啟用後自動引用當前工作空間的內容",
      markAsInstruction: "標記為指令（AI將嚴格遵循）",
      markAsKnowledge: "標記為知識（AI可參考此提供答案）",

      // Tools Tab
      tools: "工具",
      toolSelection: "工具設置",
      selectTools: "選擇工具",
      selectToolsHelp: "選擇此Cybot可以使用的工具",

      // Publish Settings
      publishSettings: "發布設置",
      shareInCommunity: "公開發布",
      shareInCommunityHelp: "顯示在社區列表，供其他用戶使用",
      shareInCommunityCustomApiHelp: "自定義API的Cybot無法公開發布",

      // Model Parameters & Advanced Settings
      advancedSettings: "高級設置",
      modelParameters: "模型參數",
      temperature: "溫度",
      temperatureHelp:
        "控制輸出隨機性，範圍0到2。較高值（如0.8）使輸出更隨機，較低值（如0.2）使輸出更集中。",
      topP: "Top P",
      topPHelp: "控制輸出多樣性，範圍0到1。較高值（如0.9）包含更多樣化的輸出。",
      frequencyPenalty: "頻率懲罰",
      frequencyPenaltyHelp: "減少詞彙重複，範圍-2到2。較高值會抑制重複。",
      presencePenalty: "存在懲罰",
      presencePenaltyHelp: "減少主題重複，範圍-2到2。較高值鼓勵引入新主題。",
      maxTokens: "最大Token數",
      maxTokensHelp: "限制輸出長度，最小值為1。定義響應的最大Token數量。",

      // Other / Misc
      deleteSuccess: "刪除成功！",
      deleteError: "刪除失敗，請重試。",
      starting: "啟動中...",
      startChat: "開始聊天",
      edit: "編輯",
      delete: "刪除",
      createDialogError: "創建對話失敗",
      input: "輸入",
      output: "輸出",
      basicInfo: "基本信息",
    },
  },
  ja: {
    translation: {
      // General Form Fields & Actions
      model: "モデル",
      modelRequired: "モデルの選択は必須です",
      selectModel: "モデルを選択",
      createCybot: "新しいCybotを作成",
      cybotName: "Cybot名",
      cybotNameRequired: "Cybot名は必須です",
      greetingMessage: "挨拶メッセージ",
      greetingRequired: "挨拶メッセージは必須です",
      selfIntroduction: "自己紹介",
      introductionRequired: "自己紹介は必須です",
      prompt: "プロンプト",
      tags: "タグ",
      tagsHelp: "Cybotを分類するためにタグを追加",
      addTagsPlaceholder: "タグを追加してEnterを押す",
      enterCybotName: "Cybot名を入力",
      enterPrompt: "プロンプトを入力",
      enterGreetingMessage: "挨拶メッセージを入力",
      enterSelfIntroduction: "自己紹介を入力",
      enterTags: "タグをカンマ区切りで入力",
      cancel: "キャンセル",
      update: "更新",
      updating: "更新中...",
      create: "作成",
      creating: "作成中...",
      resetToDefaults: "デフォルトにリセット",

      // Cybot & Model Specifics
      createCybot: "新しいCybotを作成",
      editCybot: "Cybotを編集",
      cybot: "Cybot",
      modelName: "モデル名",
      enterModelName: "モデル名を入力",
      introduction: "紹介",
      dialog: "対話",
      dialogCount: "対話数",
      supportsVision: "視覚サポート",
      noAvailableCybotMessage: "利用可能なCybotメッセージがありません",
      unnamed: "名称未設定",
      noDescription: "説明なし",

      // API & Provider Settings
      apiKeyField: "APIキー",
      provider: "プロバイダー",
      providerUrl: "プロバイダーURL",
      enterProviderUrl: "プロバイダーURLを入力",
      selectProvider: "プロバイダーを選択",
      enterApiKey: "APIキーを入力",
      apiSource: "APIソース",
      platformApiHelp: "プラットフォームの内蔵APIキーを使用",
      customApiHelp: "カスタムAPIキーと設定を使用",
      useCustomApi: "カスタムAPI",
      usePlatformApi: "プラットフォームAPI",
      providerUrlHelp: "カスタムプロバイダーのAPIエンドポイントURLを入力",
      apiKeyHelp: "認証用のAPIキーを入力",
      promptHelp: "AIの行動と性格を定義",
      useServerProxy: "プロキシモード",
      proxyHelp: "オフにすると当社サーバーを経由せず直接接続",
      proxyNotAvailableForProvider:
        "このプロバイダーは直接接続をサポートしていません",

      // Pricing & Balance
      inputPrice: "入力価格",
      outputPrice: "出力価格",
      inputPriceHelp: "100万入力トークンあたりのコスト",
      outputPriceHelp: "100万出力トークンあたりのコスト",
      inputPricePerThousand: "100万入力トークンあたりの価格",
      outputPricePerThousand: "100万出力トークンあたりの価格",
      pricing: "価格設定",
      insufficientBalanceDetailed:
        "残高不足。現在のモデル：{{modelName}}、1回の応答の最大コスト：{{pricePerMessage}}ポイント。現在の残高：{{balance}}ポイント。",
      insufficientBalance: "残高不足",
      cybotConfigMissing: "Cybotの設定が見つかりません",
      modelPricingMissing: "モデルの価格情報が見つかりません",

      // References Tab - UPDATED
      references: "知識と指示", // Tab Title
      selectReferences: "知識と指示を管理", // Selector Label
      selectReferencesHelp:
        "このCybotが知識または指示として使用できるページを選択します。", // Selector Help Text
      noPagesAvailable: "利用可能なページなし",
      smartReadCurrentSpace: "現在のスペースをスマート読取",
      smartReadHelp: "有効にすると現在のワークスペースのコンテンツを自動参照",
      markAsInstruction: "指示としてマーク（AIはこれを厳密に遵守します）",
      markAsKnowledge:
        "知識としてマーク（AIはこれを参考にして回答を提供できます）",

      // Tools Tab
      tools: "ツール",
      toolSelection: "ツール設定",
      selectTools: "ツールを選択",
      selectToolsHelp: "このCybotが使用できるツールを選択",

      // Publish Settings
      publishSettings: "公開設定",
      shareInCommunity: "公開する",
      shareInCommunityHelp:
        "コミュニティリストに表示し、他のユーザーが使用可能に",
      shareInCommunityCustomApiHelp: "カスタムAPIのCybotは公開できません",

      // Model Parameters & Advanced Settings
      advancedSettings: "高度な設定",
      modelParameters: "モデルパラメータ",
      temperature: "温度",
      temperatureHelp:
        "出力のランダム性を制御、範囲は0から2。高い値（例：0.8）は出力をよりランダムに、低い値（例：0.2）は出力をより集中させます。",
      topP: "Top P",
      topPHelp:
        "出力の多様性を制御、範囲は0から1。高い値（例：0.9）はより多様な出力を含みます。",
      frequencyPenalty: "頻度ペナルティ",
      frequencyPenaltyHelp:
        "単語の繰り返しを減少、範囲は-2から2。高い値は繰り返しを抑制します。",
      presencePenalty: "存在ペナルティ",
      presencePenaltyHelp:
        "トピックの繰り返しを減少、範囲は-2から2。高い値は新しいトピックを奨励します。",
      maxTokens: "最大トークン数",
      maxTokensHelp:
        "出力の長さを制限、最小値は1。応答の最大トークン数を定義します。",

      // Other / Misc
      deleteSuccess: "削除成功！",
      deleteError: "削除に失敗しました。もう一度お試しください。",
      starting: "開始中...",
      startChat: "チャットを始める",
      edit: "編集",
      delete: "削除",
      createDialogError: "対話の作成に失敗",
      input: "入力",
      output: "出力",
      basicInfo: "基本情報",
    },
  },
};
