export type ModelPrice = {
    [key: string]: { input: number, output: number },
  };
  
  export const modelPrice: ModelPrice = {
    'gpt-3.5-turbo': { input: 0.0015, output: 0.002 },
    'gpt-3.5-turbo-16k': { input: 0.003, output: 0.004 },
    'gpt-3.5-turbo-0613': { input: 0.0015, output: 0.002 },
    'gpt-3.5-turbo-16k-0613': { input: 0.003, output: 0.004 },
    'gpt-4': { input: 0.03, output: 0.06 },
    'gpt-4-0613': { input: 0.03, output: 0.06 },
    'gpt-4-0314': { input: 0.03, output: 0.06 },
    'gpt-4-1106-preview': { input: 0.01, output: 0.03 },
    'gpt-4-1106-vision-preview': { input: 0.01, output: 0.03 },
    'gpt-4-32k': { input: 0.06, output: 0.12 },
    'gpt-3.5-turbo-1106': { input: 0.0010, output: 0.002 },
    'gpt-3.5-turbo-instruct': { input: 0.0015, output: 0.002 },
  };
  

export const ModelPriceEnum = Object.keys(modelPrice).reduce((acc, key) => {
    acc[key] = key;
    return acc;
  }, {} as { [key: string]: string });

  
  export type DallePrice = {
    version: string;
    quality: string;
    resolution: string;
    price: number;
  };
  
  export const dallePrice: DallePrice[] = [
    { version: 'DALL·E 3', quality: 'Standard', resolution: '1024×1024', price: 0.040 },
    { version: 'DALL·E 3', quality: 'Standard', resolution: '1024×1792, 1792×1024', price: 0.080 },
    { version: 'DALL·E 3', quality: 'HD', resolution: '1024×1024', price: 0.080 },
    { version: 'DALL·E 3', quality: 'HD', resolution: '1024×1792, 1792×1024', price: 0.120 },
    { version: 'DALL·E 2', quality: '', resolution: '1024×1024', price: 0.020 },
    { version: 'DALL·E 2', quality: '', resolution: '512×512', price: 0.018 },
    { version: 'DALL·E 2', quality: '', resolution: '256×256', price: 0.016 },
  ];
  
  export const DalleEnum = dallePrice.map(item => `${item.version} - ${item.quality} - ${item.resolution}`);
  