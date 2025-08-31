'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { 
  TimeCorrectionRequest, 
  LeaveRequest, 
  Employee,
  ApprovalRequest 
} from '@/app/lib/localStorage';
import ApprovalDashboard from './ApprovalDashboard';
import TimeCorrectionApproval from './TimeCorrectionApproval';
import LeaveRequestApproval from './LeaveRequestApproval';
import ApprovalActions from './ApprovalActions';
import BulkApproval from './BulkApproval';
import { format, subDays, startOfDay, endOfDay } from 'date-fns';

export default function ApprovalManagement() {
  // 申請データの状態
  const [timeCorrectionRequests, setTimeCorrectionRequests] = useState<TimeCorrectionRequest[]>([]);
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  
  // モーダル状態
  const [showTimeCorrectionDetail, setShowTimeCorrectionDetail] = useState(false);
  const [showLeaveRequestDetail, setShowLeaveRequestDetail] = useState(false);
  const [showBulkApproval, setShowBulkApproval] = useState(false);
  const [selectedTimeCorrection, setSelectedTimeCorrection] = useState<TimeCorrectionRequest | null>(null);
  const [selectedLeaveRequest, setSelectedLeaveRequest] = useState<LeaveRequest | null>(null);
  const [selectedRequests, setSelectedRequests] = useState<ApprovalRequest[]>([]);

  // 初期化完了フラグ
  const [isInitialized, setIsInitialized] = useState(false);

  // 初期データ読み込み
  useEffect(() => {
    const loadData = () => {
      // 実際の実装では、APIからデータを取得
      // ここでは仮のデータを使用
      const mockTimeCorrectionRequests: TimeCorrectionRequest[] = [
        {
          id: 'tc-001',
          employeeId: '12345',
          employeeName: '田中太郎',
          department: '営業部',
          requestType: 'timeCorrection',
          status: 'pending',
          submittedAt: '2024-01-15T09:00:00Z',
          reason: '電車の遅延により出勤時刻が遅れました',
          notes: '',
          originalRecord: {
            id: 'record-001',
            date: '2024-01-15',
            time: '09:30',
            type: 'clockIn'
          },
          requestedChanges: {
            date: '2024-01-15',
            time: '09:00',
            type: 'clockIn',
            notes: '実際の出勤時刻'
          }
        },
        {
          id: 'tc-002',
          employeeId: '12346',
          employeeName: '佐藤花子',
          department: '総務部',
          requestType: 'timeCorrection',
          status: 'approved',
          submittedAt: '2024-01-14T18:00:00Z',
          processedAt: '2024-01-15T10:00:00Z',
          processedBy: '管理者A',
          reason: '退勤時刻の記録漏れ',
          notes: '承認しました',
          originalRecord: {
            id: 'record-002',
            date: '2024-01-14',
            time: '17:00',
            type: 'clockOut'
          },
          requestedChanges: {
            date: '2024-01-14',
            time: '18:00',
            type: 'clockOut',
            notes: '実際の退勤時刻'
          }
        }
      ];

      const mockLeaveRequests: LeaveRequest[] = [
        {
          id: 'lr-001',
          employeeId: '12345',
          employeeName: '田中太郎',
          department: '営業部',
          requestType: 'leaveRequest',
          status: 'pending',
          submittedAt: '2024-01-15T10:00:00Z',
          reason: '家族の体調不良のため看病が必要',
          notes: '',
          leaveType: 'paid',
          startDate: '2024-01-20',
          endDate: '2024-01-22',
          days: 3,
          supportingDocuments: ['診断書.pdf']
        },
        {
          id: 'lr-002',
          employeeId: '12347',
          employeeName: '山田次郎',
          department: '開発部',
          requestType: 'leaveRequest',
          status: 'rejected',
          submittedAt: '2024-01-14T14:00:00Z',
          processedAt: '2024-01-15T09:00:00Z',
          processedBy: '管理者B',
          reason: '夏季休暇の申請',
          notes: '繁忙期のため却下',
          leaveType: 'paid',
          startDate: '2024-08-10',
          endDate: '2024-08-15',
          days: 6,
          supportingDocuments: []
        }
      ];

      const mockEmployees: Employee[] = [
        {
          id: '12345',
          name: '田中太郎',
          department: '営業部',
          position: '主任',
          hourlyWage: 1200,
          monthlySalary: 250000,
          isActive: true
        },
        {
          id: '12346',
          name: '佐藤花子',
          department: '総務部',
          position: '課長',
          hourlyWage: 1500,
          monthlySalary: 300000,
          isActive: true
        },
        {
          id: '12347',
          name: '山田次郎',
          department: '開発部',
          position: 'エンジニア',
          hourlyWage: 1300,
          monthlySalary: 280000,
          isActive: true
        }
      ];

      setTimeCorrectionRequests(mockTimeCorrectionRequests);
      setLeaveRequests(mockLeaveRequests);
      setEmployees(mockEmployees);
      
      // 初期化完了
      setIsInitialized(true);
    };

    loadData();
  }, []);

  // 個別承認処理
  const handleApprove = (requestId: string, reason: string) => {
    const currentUser = '管理者A'; // 実際の実装では認証情報から取得
    
    // 時刻修正申請の承認
    setTimeCorrectionRequests(prev => 
      prev.map(request => 
        request.id === requestId 
          ? { 
              ...request, 
              status: 'approved', 
              processedAt: new Date().toISOString(),
              processedBy: currentUser,
              notes: reason
            }
          : request
      )
    );

    // 休暇申請の承認
    setLeaveRequests(prev => 
      prev.map(request => 
        request.id === requestId 
          ? { 
              ...request, 
              status: 'approved', 
              processedAt: new Date().toISOString(),
              processedBy: currentUser,
              notes: reason
            }
          : request
      )
    );

    // 通知送信（実際の実装ではAPIを呼び出し）
    console.log(`申請 ${requestId} を承認しました。理由: ${reason}`);
  };

  // 個別却下処理
  const handleReject = (requestId: string, reason: string) => {
    const currentUser = '管理者A'; // 実際の実装では認証情報から取得
    
    // 時刻修正申請の却下
    setTimeCorrectionRequests(prev => 
      prev.map(request => 
        request.id === requestId 
          ? { 
              ...request, 
              status: 'rejected', 
              processedAt: new Date().toISOString(),
              processedBy: currentUser,
              notes: reason
            }
          : request
      )
    );

    // 休暇申請の却下
    setLeaveRequests(prev => 
      prev.map(request => 
        request.id === requestId 
          ? { 
              ...request, 
              status: 'rejected', 
              processedAt: new Date().toISOString(),
              processedBy: currentUser,
              notes: reason
            }
          : request
      )
    );

    // 通知送信（実際の実装ではAPIを呼び出し）
    console.log(`申請 ${requestId} を却下しました。理由: ${reason}`);
  };

  // 一括承認処理
  const handleBulkApprove = async (requestIds: string[], reason: string) => {
    const currentUser = '管理者A';
    
    // 非同期処理をシミュレート
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // 時刻修正申請の一括承認
    setTimeCorrectionRequests(prev => 
      prev.map(request => 
        requestIds.includes(request.id)
          ? { 
              ...request, 
              status: 'approved', 
              processedAt: new Date().toISOString(),
              processedBy: currentUser,
              notes: reason
            }
          : request
      )
    );

    // 休暇申請の一括承認
    setLeaveRequests(prev => 
      prev.map(request => 
        requestIds.includes(request.id)
          ? { 
              ...request, 
              status: 'approved', 
              processedAt: new Date().toISOString(),
              processedBy: currentUser,
              notes: reason
            }
          : request
      )
    );

    console.log(`${requestIds.length}件の申請を一括承認しました。理由: ${reason}`);
  };

  // 一括却下処理
  const handleBulkReject = async (requestIds: string[], reason: string) => {
    const currentUser = '管理者A';
    
    // 非同期処理をシミュレート
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // 時刻修正申請の一括却下
    setTimeCorrectionRequests(prev => 
      prev.map(request => 
        requestIds.includes(request.id)
          ? { 
              ...request, 
              status: 'rejected', 
              processedAt: new Date().toISOString(),
              processedBy: currentUser,
              notes: reason
            }
          : request
      )
    );

    // 休暇申請の一括却下
    setLeaveRequests(prev => 
      prev.map(request => 
        requestIds.includes(request.id)
          ? { 
              ...request, 
              status: 'rejected', 
              processedAt: new Date().toISOString(),
              processedBy: currentUser,
              notes: reason
            }
          : request
      )
    );

    console.log(`${requestIds.length}件の申請を一括却下しました。理由: ${reason}`);
  };

  // 通知送信
  const handleNotify = (requestId: string, message: string) => {
    // 実際の実装では通知APIを呼び出し
    console.log(`申請 ${requestId} に通知を送信: ${message}`);
  };

  // 時刻修正申請詳細表示
  const handleViewTimeCorrection = (request: TimeCorrectionRequest) => {
    setSelectedTimeCorrection(request);
    setShowTimeCorrectionDetail(true);
  };

  // 休暇申請詳細表示
  const handleViewLeaveRequest = (request: LeaveRequest) => {
    setSelectedLeaveRequest(request);
    setShowLeaveRequestDetail(true);
  };

  // 一括処理の開始
  const handleStartBulkApproval = (requests: ApprovalRequest[]) => {
    if (requests.length > 0) {
      setSelectedRequests(requests);
      setShowBulkApproval(true);
    }
  };

  // 統計情報の計算
  const stats = useMemo(() => {
    const allRequests = [...timeCorrectionRequests, ...leaveRequests];
    
    return {
      total: allRequests.length,
      pending: allRequests.filter(r => r.status === 'pending').length,
      approved: allRequests.filter(r => r.status === 'approved').length,
      rejected: allRequests.filter(r => r.status === 'rejected').length,
      timeCorrection: timeCorrectionRequests.length,
      leaveRequest: leaveRequests.length
    };
  }, [timeCorrectionRequests, leaveRequests]);

  // 初期化完了前はローディング表示
  if (!isInitialized) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
          <p className="text-slate-600">申請データを読み込み中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 統計サマリー */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">総申請数</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
            <div className="p-2 bg-blue-100 rounded-lg">
              <span className="text-2xl">📋</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">承認待ち</p>
              <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
            </div>
            <div className="p-2 bg-yellow-100 rounded-lg">
              <span className="text-2xl">⏳</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">承認済み</p>
              <p className="text-2xl font-bold text-green-600">{stats.approved}</p>
            </div>
            <div className="p-2 bg-green-100 rounded-lg">
              <span className="text-2xl">✅</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">却下</p>
              <p className="text-2xl font-bold text-red-600">{stats.rejected}</p>
            </div>
            <div className="p-2 bg-red-100 rounded-lg">
              <span className="text-2xl">❌</span>
            </div>
          </div>
        </div>
      </div>

      {/* 申請承認ダッシュボード */}
      <ApprovalDashboard
        timeCorrectionRequests={timeCorrectionRequests}
        leaveRequests={leaveRequests}
        employees={employees}
        onApprove={handleApprove}
        onReject={handleReject}
        onBulkApprove={handleBulkApprove}
        onBulkReject={handleBulkReject}
        onStartBulkApproval={handleStartBulkApproval}
      />

      {/* 時刻修正申請詳細モーダル */}
      <TimeCorrectionApproval
        request={selectedTimeCorrection}
        employees={employees}
        isOpen={showTimeCorrectionDetail}
        onClose={() => {
          setShowTimeCorrectionDetail(false);
          setSelectedTimeCorrection(null);
        }}
        onApprove={handleApprove}
        onReject={handleReject}
      />

      {/* 休暇申請詳細モーダル */}
      <LeaveRequestApproval
        request={selectedLeaveRequest}
        employees={employees}
        isOpen={showLeaveRequestDetail}
        onClose={() => {
          setShowLeaveRequestDetail(false);
          setSelectedLeaveRequest(null);
        }}
        onApprove={handleApprove}
        onReject={handleReject}
      />

      {/* 一括処理モーダル */}
      {showBulkApproval && selectedRequests.length > 0 && (
        <BulkApproval
          selectedRequests={selectedRequests}
          onBulkApprove={handleBulkApprove}
          onBulkReject={handleBulkReject}
          onClose={() => {
            setShowBulkApproval(false);
            setSelectedRequests([]);
          }}
        />
      )}
    </div>
  );
}
