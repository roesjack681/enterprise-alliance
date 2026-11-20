import { AuditRecord, AuditAction, AuditQuery } from './proto';
import { rpcPost } from "../../common/common";
import { rpcResult } from "../app/proto";
import { ResponseData } from "../app/proto";

export class AuditService {
  protected token: string;
  
  constructor(token: string = '') {
    this.token = token;
  }
  
  /**
   * 创建审核记录
   */
  async createAuditRecord(data: AuditRecord): Promise<ResponseData> {
    try {
      const now = Math.floor(Date.now() / 1000);
      const auditTime = data.status === 1 ? null : now;
      
      const sql = "INSERT INTO audit_records (audit_type, related_id, entity_id, entity_name, title, content, auditor_id, auditor_name, status, remark, audit_time, create_time) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
      const params = [
        data.audit_type,
        data.related_id,
        data.entity_id,
        data.entity_name || '',
        data.title,
        data.content || '',
        data.auditor_id || null,
        data.auditor_name || '',
        data.status || 1,
        data.remark || '',
        auditTime,
        now
      ];
      
      const res = <rpcResult>(
        await rpcPost("/insert", { params, sql }, this.token)
      );
      
      if (res && res.code === 0) {
        return {
          msg: "ok",
          data: { id: res.data.lastId }
        };
      } else {
        return {
          msg: "error",
          data: null
        };
      }
    } catch (error) {
      console.error('创建审核记录失败:', error);
      return {
        msg: "error",
        data: null
      };
    }
  }
  
  /**
   * 获取审核记录列表（根据用户角色）
   */
  async getAuditListByRole(userId: number, userRole: number): Promise<ResponseData> {
    try {
      let sql = "SELECT id, audit_type, related_id, entity_id, entity_name, title, content, auditor_id, auditor_name, status, remark, audit_time, create_time FROM audit_records";
      const params: any[] = [];
      
      // 如果是协会管理员(role=9)，只显示自己下属企业的审核
      if (userRole === 9) {
        sql += " WHERE entity_id IN (SELECT id FROM entities WHERE pid = ?)";
        params.push(userId);
      }
      
      sql += " ORDER BY id DESC";
      
      const res = <rpcResult>(
        await rpcPost("/select", { params, sql }, this.token)
      );
      if (res && res.code === 0 && res.data) {
        return {
          msg: "ok",
          data: JSON.parse(res.data.result)
        };
      } else {
        return {
          msg: "error",
          data: null
        };
      }
    } catch (error) {
      console.error('获取审核列表失败:', error);
      return {
        msg: "error",
        data: null
      };
    }
  }
}

