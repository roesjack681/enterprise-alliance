// 审核记录模型
export type AuditRecord = {
  id?: number;
  audit_type: number;          // 审核类型：1-企业认证，2-服务产品，3-需求发布
  related_id: number;          // 关联业务ID
  entity_id: number;           // 被审核企业ID
  entity_name?: string;        // 被审核企业名称
  title: string;               // 审核标题
  content?: string;            // 审核内容描述
  auditor_id?: number;         // 审核人ID
  auditor_name?: string;       // 审核人名称
  auditor_role?: number;       // 审核人角色
  status: number;              // 审核状态：1-待审核，2-通过，3-拒绝
  remark?: string;             // 审核意见
  audit_time?: number;         // 审核时间
  create_time?: number;        // 创建时间
};

// 审核操作模型
export type AuditAction = {
  id: number;                  // 审核记录ID
  status: number;              // 审核结果：2-通过，3-拒绝
  remark?: string;             // 审核意见
  auditor_id: number;          // 审核人ID
  auditor_name?: string;       // 审核人名称
  auditor_role?: number;       // 审核人角色
};

// 审核查询参数
export type AuditQuery = {
  audit_type?: number;         // 审核类型
  status?: number;             // 审核状态
  entity_id?: number;          // 企业ID
  auditor_id?: number;         // 审核人ID
};

