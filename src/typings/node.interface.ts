export interface INode {
  name: string;
  type: 'ss' | 'vmess';
  server: string;
  port: number;
  uuid?: string;
  alertId?: number;
}
