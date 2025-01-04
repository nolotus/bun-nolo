import { useState, useEffect } from "react";
import { getModelsByProvider } from "ai/llm/providers";
import type { Model } from "ai/llm/types";

const useModelPricing = (
  provider: string,
  modelName: string,
  setValue?: (name: string, value: number) => void
) => {
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

      // 同步更新表单值
      if (setValue) {
        setValue("inputPrice", selectedModel.price.input || 0);
        setValue("outputPrice", selectedModel.price.output || 0);
      }
    }
  }, [models, modelName, setValue]);

  const updateInputPrice = (value: number) => {
    setInputPrice(value);
    if (setValue) {
      setValue("inputPrice", value);
    }
  };

  const updateOutputPrice = (value: number) => {
    setOutputPrice(value);
    if (setValue) {
      setValue("outputPrice", value);
    }
  };

  return {
    inputPrice,
    outputPrice,
    setInputPrice: updateInputPrice,
    setOutputPrice: updateOutputPrice,
  };
};

export default useModelPricing;
