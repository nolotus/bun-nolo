import { Flags } from "core/prefix";

export interface WriteConfig {
  id: string;
  flags: Flags;
  data: Record<string, any>;
  userId: string;
}
export interface WriteConfigServer {
  customId: string;
  flags: Flags;
  data: Record<string, any>;
  userId: string;
}
