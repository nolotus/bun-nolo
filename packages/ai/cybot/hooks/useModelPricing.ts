import { useState, useEffect } from "react";
import { getModelsByProvider } from "ai/llm/providers";
import type { Model } from "ai/llm/types";

const useModelPricing = (provider: string, modelName: string) => {
  const [models, setModels] = useState<Model[]>([]);
  const [inputPrice, setInputPrice] = useState<number>(0);
  const [outputPrice, setOutputPrice] = useState<number>(0);

  useEffect(() => {
    const fetchModels = () => {
      const models = getModelsByProvider(provider);
      setModels(models);
    };

    fetchModels();
  }, [provider]);

  useEffect(() => {
    const selectedModel = models.find((model) => model.name === modelName);
    if (selectedModel) {
      setInputPrice(selectedModel.price.input || 0);
      setOutputPrice(selectedModel.price.output || 0);
    }
  }, [models, modelName]);

  return {
    inputPrice,
    outputPrice,
    setInputPrice,
    setOutputPrice,
  };
};

export default useModelPricing;
