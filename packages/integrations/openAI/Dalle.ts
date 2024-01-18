export type DallePrice = {
  version: string,
  quality: string,
  resolution: string,
  price: number,
};

export const dallePrice: DallePrice[] = [
  {
    version: 'DALL·E 3',
    quality: 'Standard',
    resolution: '1024×1024',
    price: 0.04,
  },
  {
    version: 'DALL·E 3',
    quality: 'Standard',
    resolution: '1024×1792, 1792×1024',
    price: 0.08,
  },
  { version: 'DALL·E 3', quality: 'HD', resolution: '1024×1024', price: 0.08 },
  {
    version: 'DALL·E 3',
    quality: 'HD',
    resolution: '1024×1792, 1792×1024',
    price: 0.12,
  },
  { version: 'DALL·E 2', quality: '', resolution: '1024×1024', price: 0.02 },
  { version: 'DALL·E 2', quality: '', resolution: '512×512', price: 0.018 },
  { version: 'DALL·E 2', quality: '', resolution: '256×256', price: 0.016 },
];

export const DalleEnum = dallePrice.map(
  (item) => `${item.version} - ${item.quality} - ${item.resolution}`,
);
