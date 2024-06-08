export const zhipuModels = {
  "GLM-4-0520": {
    description:
      "我们当前的最先进最智能的模型，指令遵从能力大幅提升18.6%，发布于20240605",
    context_length: 128000,
    price_per_thousand_tokens: 0.1,
  },
  "GLM-4": {
    description: "发布于20240116的最智能版本模型，目前已被 GLM-4-0520 版本超越",
    context_length: 128000,
    price_per_thousand_tokens: 0.1,
  },
  "GLM-4-Air": {
    description: "性价比最高的版本，综合性能接近GLM-4，速度快，价格实惠",
    context_length: 128000,
    price_per_thousand_tokens: 0.001,
  },
  "GLM-4-Airx": {
    description: "GLM-4-Air 的高性能版本，效果不变，推理速度达到其2.6倍",
    context_length: 128000,
    price_per_thousand_tokens: 0.01,
  },
  "GLM-4-Flash": {
    description: "适用简单任务，速度最快，价格最实惠的版本",
    context_length: 128000,
    price_per_thousand_tokens: 0.0001,
  },
  "GLM-4V": {
    description:
      "实现了视觉语言特征的深度融合，支持视觉问答、图像字幕、视觉定位、复杂目标检测等各类图像理解任务",
    context_length: 2000,
    price_per_thousand_tokens: 0.05,
  },
  "GLM-3-Turbo": {
    description:
      "适用于对知识量、推理能力、创造力要求较高的场景，比如广告文案、小说写作、知识类写作、代码生成等",
    context_length: 128000,
    price_per_thousand_tokens: 0.001,
  },
};
