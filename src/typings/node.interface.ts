export interface INode {
  id: string;
  name: string; // 备注名
  type: 'ss' | 'vmess'; // 节点类型
  server: string; // 服务器地址
  port: number; // 端口
  uuid?: string; // vemss协议的uuid
  alertId?: number; // vmess协议的alertId
  method?: string; // 加密方式
}
