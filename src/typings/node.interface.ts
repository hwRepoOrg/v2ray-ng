export interface INode {
  id: string;
  name: string;
  type: 'ss' | 'vmess';
  server: string;
  port: number;
  uuid?: string;
  alertId?: number;
}
