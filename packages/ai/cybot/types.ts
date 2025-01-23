interface Cybot {
  id: string;
  userId: string;
  name: string;
  provider: string;
  customProviderUrl?: string;
  model: string;
  apiKey?: string;
  useServerProxy: boolean;
  prompt?: string;
  tools?: string[];
  isPublicInCommunity: boolean;
  greeting?: string;
  introduction?: string;
  pricing?: {
    input: number;
    output: number;
  };
  metrics?: {
    useCount: number;
    messageCount: number;
    rating: number;
    ratingCount: number;
  };
  spaceId?: string;
  categoryId?: string;
  createTime: number;
  updateTime: number;
}
