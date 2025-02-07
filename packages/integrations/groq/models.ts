export const groqModels = [
  {
    name: "distil-whisper-large-v3-en",
    displayName: "Distil Whisper Large V3 EN",
    hasVision: false,
    description: "A distilled version of Whisper Large V3 for English",
    strengths: "Efficient speech recognition for English language",
    contextWindow: 0,
    maxOutputTokens: 0,
    price: {
      input: 0, // 原始价格: 0
      output: 0, // 原始价格: 0
      cachingWrite: 0, // 原始价格: 0
      cachingRead: 0, // 原始价格: 0
    },
  },
  {
    name: "gemma2-9b-it",
    displayName: "Gemini 2-9B IT",
    hasVision: false,
    description: "A 9 billion parameter Italian-focused model",
    strengths: "Optimized for Italian language tasks",
    contextWindow: 8192,
    maxOutputTokens: 0,
    price: {
      input: 1.6, // 原始价格: 0.2
      output: 1.6, // 原始价格: 0.2
      cachingWrite: 0, // 原始价格: 0
      cachingRead: 0, // 原始价格: 0
    },
  },
  {
    name: "llama-3.3-70b-versatile",
    displayName: "LLAMA 3.3 70B Versatile",
    hasVision: false,
    description: "A versatile 70 billion parameter model",
    strengths: "General-purpose capabilities with high performance",
    contextWindow: 131072,
    maxOutputTokens: 32768,
    price: {
      input: 4.72, // 原始价格: 0.59
      output: 6.32, // 原始价格: 0.79
      cachingWrite: 0, // 原始价格: 0
      cachingRead: 0, // 原始价格: 0
    },
  },
  {
    name: "llama-3.1-8b-instant",
    displayName: "LLAMA 3.1 8B Instant",
    hasVision: false,
    description: "An 8 billion parameter model optimized for speed",
    strengths: "Fast inference for real-time applications",
    contextWindow: 131072,
    maxOutputTokens: 8192,
    price: {
      input: 0.4, // 原始价格: 0.05
      output: 0.64, // 原始价格: 0.08
      cachingWrite: 0, // 原始价格: 0
      cachingRead: 0, // 原始价格: 0
    },
  },
  {
    name: "llama-guard-3-8b",
    displayName: "LLAMA Guard 3 8B",
    hasVision: false,
    description: "An 8 billion parameter model with safety features",
    strengths: "Safety-focused for controlled responses",
    contextWindow: 8192,
    maxOutputTokens: 0,
    price: {
      input: 1.6, // 原始价格: 0.2
      output: 1.6, // 原始价格: 0.2
      cachingWrite: 0, // 原始价格: 0
      cachingRead: 0, // 原始价格: 0
    },
  },
  {
    name: "llama3-70b-8192",
    displayName: "LLAMA3 70B 8192",
    hasVision: false,
    description: "A 70 billion parameter model with 8192 context window",
    strengths: "High-capacity model for complex tasks",
    contextWindow: 8192,
    maxOutputTokens: 0,
    price: {
      input: 4.72, // 原始价格: 0.59
      output: 6.32, // 原始价格: 0.79
      cachingWrite: 0, // 原始价格: 0
      cachingRead: 0, // 原始价格: 0
    },
  },
  {
    name: "llama3-8b-8192",
    displayName: "LLAMA3 8B 8192",
    hasVision: false,
    description: "An 8 billion parameter model with 8192 context window",
    strengths: "Balanced performance for general use",
    contextWindow: 8192,
    maxOutputTokens: 0,
    price: {
      input: 0.4, // 原始价格: 0.05
      output: 0.64, // 原始价格: 0.08
      cachingWrite: 0, // 原始价格: 0
      cachingRead: 0, // 原始价格: 0
    },
  },
  {
    name: "mixtral-8x7b-32768",
    displayName: "Mixtral-8x7B-32768",
    hasVision: false,
    description: "A high-capacity model with 32768 context window",
    strengths: "Optimized for long-context applications",
    contextWindow: 32768,
    maxOutputTokens: 0,
    price: {
      input: 1.92, // 原始价格: 0.24
      output: 1.92, // 原始价格: 0.24
      cachingWrite: 0, // 原始价格: 0
      cachingRead: 0, // 原始价格: 0
    },
  },
  {
    name: "whisper-large-v3",
    displayName: "Whisper Large V3",
    hasVision: false,
    description: "A large-scale speech recognition model",
    strengths: "High-accuracy speech-to-text capabilities",
    contextWindow: 0,
    maxOutputTokens: 0,
    price: {
      input: 0, // 原始价格: 0
      output: 0, // 原始价格: 0
      cachingWrite: 0, // 原始价格: 0
      cachingRead: 0, // 原始价格: 0
    },
  },
  {
    name: "whisper-large-v3-turbo",
    displayName: "Whisper Large V3 Turbo",
    hasVision: false,
    description:
      "An optimized version of Whisper Large V3 for faster inference",
    strengths: "Fast and accurate speech recognition",
    contextWindow: 0,
    maxOutputTokens: 0,
    price: {
      input: 0, // 原始价格: 0
      output: 0, // 原始价格: 0
      cachingWrite: 0, // 原始价格: 0
      cachingRead: 0, // 原始价格: 0
    },
  },
  // Preview Models
  {
    name: "deepseek-r1-distill-llama-70b",
    displayName: "DeepSeek R1 Distill LLAMA 70B",
    hasVision: false,
    description: "A distilled version of LLAMA 70B for efficiency",
    strengths: "Efficient and accurate for general tasks",
    contextWindow: 131072,
    maxOutputTokens: 0,
    price: {
      input: 6, // 原始价格: 0.75
      output: 7.92, // 原始价格: 0.99
      cachingWrite: 0, // 原始价格: 0
      cachingRead: 0, // 原始价格: 0
    },
  },
  {
    name: "llama-3.3-70b-specdec",
    displayName: "LLAMA 3.3 70B SpecDec",
    hasVision: false,
    description: "A specialized model for specific decoding tasks",
    strengths: "Optimized for particular decoding requirements",
    contextWindow: 8192,
    maxOutputTokens: 0,
    price: {
      input: 24, // 原始价格: 3
      output: 24, // 原始价格: 3
      cachingWrite: 0, // 原始价格: 0
      cachingRead: 0, // 原始价格: 0
    },
  },
  {
    name: "llama-3.2-1b-preview",
    displayName: "LLAMA 3.2 1B Preview",
    hasVision: false,
    description: "A 1 billion parameter model for preview",
    strengths: "General capabilities with moderate capacity",
    contextWindow: 131072,
    maxOutputTokens: 8192,
    price: {
      input: 0.32, // 原始价格: 0.04
      output: 0.32, // 原始价格: 0.04
      cachingWrite: 0, // 原始价格: 0
      cachingRead: 0, // 原始价格: 0
    },
  },
  {
    name: "llama-3.2-3b-preview",
    displayName: "LLAMA 3.2 3B Preview",
    hasVision: false,
    description: "A 3 billion parameter model for preview",
    strengths: "Balanced performance for general use",
    contextWindow: 131072,
    maxOutputTokens: 8192,
    price: {
      input: 0.48, // 原始价格: 0.06
      output: 0.48, // 原始价格: 0.06
      cachingWrite: 0, // 原始价格: 0
      cachingRead: 0, // 原始价格: 0
    },
  },
  {
    name: "llama-3.2-11b-vision-preview",
    displayName: "LLAMA 3.2 11B Vision Preview",
    hasVision: true,
    description: "An 11 billion parameter model with vision capabilities",
    strengths: "Handles both text and vision tasks",
    contextWindow: 131072,
    maxOutputTokens: 8192,
    price: {
      input: 0.32, // 原始价格: 0.04
      output: 0.32, // 原始价格: 0.04
      cachingWrite: 0, // 原始价格: 0
      cachingRead: 0, // 原始价格: 0
    },
  },
  {
    name: "llama-3.2-90b-vision-preview",
    displayName: "LLAMA 3.2 90B Vision Preview",
    hasVision: true,
    description: "A 90 billion parameter model with vision capabilities",
    strengths:
      "High-capacity model for complex tasks involving text and vision",
    contextWindow: 131072,
    maxOutputTokens: 8192,
    price: {
      input: 0.32, // 原始价格: 0.04
      output: 0.32, // 原始价格: 0.04
      cachingWrite: 0, // 原始价格: 0
      cachingRead: 0, // 原始价格: 0
    },
  },
];
