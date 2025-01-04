import * as nacl from "tweetnacl";
import { Level } from "level";

interface Coin {
  coinId: string;
  value: number;
}

interface CoinData {
  value: number;
  signature: string;
}

export async function createCoin(
  value: number,
  privateKey: Uint8Array,
  db: Level
): Promise<Coin> {
  // 签名
  const message = new Uint8Array(Buffer.from(value.toString()));
  const signature = nacl.sign.detached(message, privateKey);

  // 组合数据
  const data: CoinData = {
    value: value,
    signature: Buffer.from(signature).toString("hex"),
  };

  // 生成coinId
  const coinHash = nacl.hash(
    Uint8Array.from(Buffer.from(JSON.stringify(data)))
  );
  const coinId = "coin" + Buffer.from(coinHash).toString("hex");

  // 存储
  await db.put(coinId, JSON.stringify(data));

  return {
    coinId,
    value,
  };
}
