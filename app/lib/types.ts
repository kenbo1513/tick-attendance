// 申請承認関連の統一された型定義

// 基本の申請リクエスト型
export interface ApprovalRequest {
  id: string;
  employeeId: string;
  employeeName: string;
  department: string;
  requestType: 'timeCorrection' | 'leaveRequest';
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: string;
  processedAt?: string;
  processedBy?: string;
  reason?: string;
  notes?: string;
}

// 時刻修正申請の型定義
export interface TimeCorrectionRequest extends ApprovalRequest {
  requestType: 'timeCorrection';
  originalRecord: {
    id: string;
    date: string;
    time: string;
    type: string;
  };
  requestedChanges: {
    date: string;
    time: string;
    type: string;
    notes: string;
  };
}

// 休暇申請の型定義
export interface LeaveRequest extends ApprovalRequest {
  requestType: 'leaveRequest';
  leaveType: 'paid' | 'unpaid' | 'sick' | 'special';
  startDate: string;
  endDate: string;
  days: number;
  reason: string;
  supportingDocuments?: string[];
}

// 表示用の拡張された申請型
export interface DisplayApprovalRequest extends ApprovalRequest {
  displayType: string;
  displayDetails: string;
  icon: React.ComponentType<{ className?: string }>;
}

// 従業員型
export interface Employee {
  id: string;
  name: string;
  department: string;
  position: string;
  hourlyWage?: number;
  monthlySalary?: number;
  transportationAllowance?: number;
  mealAllowance?: number;
  overtimeRate?: number;
  nightShiftRate?: number;
  holidayRate?: number;
  isAdmin?: boolean;
  isActive?: boolean;
  hireDate?: string;
}

// 優先度表示用の型
export interface PriorityDisplay {
  priority: 'urgent' | 'normal' | 'low';
  label: string;
  color: string;
  value: number;
}

// ステータス表示用の型
export interface StatusDisplay {
  color: string;
  icon: React.ReactElement;
  label: string;
  borderColor: string;
}

// 一括処理結果の型
export interface BulkProcessResult {
  success: string[];
  failed: string[];
  total: number;
}

// タブ型
export type TabType = 'timeCorrection' | 'leaveRequest';

// ソートフィールド型
export type SortField = 'submittedAt' | 'priority' | 'employeeName' | 'requestType';

// ソート方向型
export type SortDirection = 'asc' | 'desc';

// 一括アクション型
export type BulkActionType = 'approve' | 'reject';
