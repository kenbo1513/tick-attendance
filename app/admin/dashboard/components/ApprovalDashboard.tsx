'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { 
  Clock, 
  Calendar, 
  User, 
  Building, 
  CheckCircle, 
  XCircle, 
  Clock as ClockIcon,
  FileText,
  AlertCircle,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Search,
  Filter,
  ChevronDown,
  ChevronUp,
  ChevronRight,
  Loader2,
  Info,
  X
} from 'lucide-react';
import { 
  TimeCorrectionRequest, 
  LeaveRequest,
  Employee,
  DisplayApprovalRequest,
  TabType,
  SortField,
  SortDirection,
  BulkActionType,
  BulkProcessResult,
  PriorityDisplay,
  StatusDisplay
} from '@/app/lib/types';
import { format, parseISO, differenceInDays } from 'date-fns';
import { ja } from 'date-fns/locale';

interface ApprovalDashboardProps {
  timeCorrectionRequests: TimeCorrectionRequest[];
  leaveRequests: LeaveRequest[];
  employees: Employee[];
  onApprove: (requestId: string, reason: string) => void;
  onReject: (requestId: string, reason: string) => void;
  onBulkApprove: (requestIds: string[], reason: string) => void;
  onBulkReject: (requestIds: string[], reason: string) => void;
  onStartBulkApproval: (requests: DisplayApprovalRequest[]) => void;
}

export default function ApprovalDashboard({
  timeCorrectionRequests,
  leaveRequests,
  employees,
  onApprove,
  onReject,
  onBulkApprove,
  onBulkReject,
  onStartBulkApproval
}: ApprovalDashboardProps) {
  const [activeTab, setActiveTab] = useState<TabType>('timeCorrection');
  const [selectedRequests, setSelectedRequests] = useState<string[]>([]);
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [bulkReason, setBulkReason] = useState('');
  
  // 検索・フィルタ・ソート用の状態
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortField, setSortField] = useState<SortField>('submittedAt');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  // 一括処理用の状態
  const [showBulkConfirmDialog, setShowBulkConfirmDialog] = useState(false);
  const [bulkActionType, setBulkActionType] = useState<BulkActionType>('approve');
  const [isProcessing, setIsProcessing] = useState(false);
  const [bulkProcessResult, setBulkProcessResult] = useState<BulkProcessResult | null>(null);
  const [showResultNotification, setShowResultNotification] = useState(false);

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

  // 申請の表示用データ
  const getDisplayData = (): DisplayApprovalRequest[] => {
    if (activeTab === 'timeCorrection') {
      return timeCorrectionRequests.map(request => ({
        ...request,
        displayType: '時刻修正',
        displayDetails: `${request.originalRecord.date} ${request.originalRecord.time} → ${request.requestedChanges.date} ${request.requestedChanges.time}`,
        icon: ClockIcon
      }));
    } else {
      return leaveRequests.map(request => ({
        ...request,
        displayType: `${getLeaveTypeLabel(request.leaveType)}休暇`,
        displayDetails: `${request.startDate} 〜 ${request.endDate} (${request.days}日間)`,
        icon: Calendar
      }));
    }
  };

  // 休暇種別のラベル
  const getLeaveTypeLabel = (type: string): string => {
    switch (type) {
      case 'paid': return '有給';
      case 'unpaid': return '無給';
      case 'sick': return '病気';
      case 'special': return '特別';
      default: return type;
    }
  };

  // 優先度の判定と表示
  const getPriorityDisplay = (submittedAt: string, status: string): PriorityDisplay => {
    if (status !== 'pending') {
      return { priority: 'low', label: '⚪ 低', color: 'text-gray-500', value: 0 };
    }

    const daysSinceSubmission = differenceInDays(new Date(), parseISO(submittedAt));
    
    if (daysSinceSubmission >= 3) {
      return { priority: 'urgent', label: '🔴 緊急', color: 'text-red-600', value: 3 };
    } else if (daysSinceSubmission >= 1) {
      return { priority: 'normal', label: '🟡 通常', color: 'text-yellow-600', value: 2 };
    } else {
      return { priority: 'low', label: '⚪ 低', color: 'text-gray-500', value: 1 };
    }
  };

  // ステータスの色とアイコン（強化版）
  const getStatusDisplay = (status: string): StatusDisplay => {
    switch (status) {
      case 'pending':
        return {
          color: 'border-orange-300 bg-orange-50 text-orange-800',
          icon: <AlertCircle className="w-4 h-4" />,
          label: '承認待ち',
          borderColor: 'border-orange-300'
        };
      case 'approved':
        return {
          color: 'border-green-300 bg-green-50 text-green-800',
          icon: <CheckCircle className="w-4 h-4" />,
          label: '承認済み',
          borderColor: 'border-green-300'
        };
      case 'rejected':
        return {
          color: 'border-red-300 bg-red-50 text-red-800',
          icon: <XCircle className="w-4 h-4" />,
          label: '却下',
          borderColor: 'border-red-300'
        };
      default:
        return {
          color: 'border-gray-300 bg-gray-50 text-gray-800',
          icon: <AlertCircle className="w-4 h-4" />,
          label: status,
          borderColor: 'border-gray-300'
        };
    }
  };

  // フィルタリング・ソート・検索を適用したデータ
  const filteredAndSortedData = useMemo(() => {
    let data = getDisplayData();

    // 検索フィルタ
    if (searchTerm) {
      data = data.filter(request => 
        request.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        request.department.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // ステータスフィルタ
    if (statusFilter !== 'all') {
      data = data.filter(request => request.status === statusFilter);
    }

    // ソート
    data.sort((a, b) => {
      let aValue: any;
      let bValue: any;

      switch (sortField) {
        case 'submittedAt':
          aValue = new Date(a.submittedAt).getTime();
          bValue = new Date(b.submittedAt).getTime();
          break;
        case 'priority':
          aValue = getPriorityDisplay(a.submittedAt, a.status).value;
          bValue = getPriorityDisplay(b.submittedAt, b.status).value;
          break;
        case 'employeeName':
          aValue = a.employeeName;
          bValue = b.employeeName;
          break;
        case 'requestType':
          aValue = a.displayType;
          bValue = b.displayType;
          break;
        default:
          aValue = 0;
          bValue = 0;
      }

      if (sortDirection === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return data;
  }, [activeTab, timeCorrectionRequests, leaveRequests, searchTerm, statusFilter, sortField, sortDirection]);

  // 選択された申請の管理
  const handleRequestSelection = (requestId: string, checked: boolean) => {
    if (checked) {
      setSelectedRequests(prev => [...prev, requestId]);
    } else {
      setSelectedRequests(prev => prev.filter(id => id !== requestId));
    }
  };

  const handleSelectAll = (checked: boolean) => {
    const pendingRequests = filteredAndSortedData.filter(r => r.status === 'pending');
    
    if (checked) {
      setSelectedRequests(pendingRequests.map(r => r.id));
    } else {
      setSelectedRequests([]);
    }
  };

  // 一括処理の開始
  const handleStartBulkApproval = () => {
    if (selectedRequests.length > 0) {
      const selectedRequestObjects = filteredAndSortedData.filter(r => selectedRequests.includes(r.id));
      onStartBulkApproval(selectedRequestObjects);
    }
  };

  // 一括処理の確認ダイアログを表示
  const openBulkConfirmDialog = (actionType: BulkActionType) => {
    setBulkActionType(actionType);
    setShowBulkConfirmDialog(true);
  };

  // 一括処理の実行
  const executeBulkAction = async () => {
    if (selectedRequests.length === 0 || !bulkReason.trim()) {
      return;
    }

    setIsProcessing(true);
    setShowBulkConfirmDialog(false);

    try {
      const result: BulkProcessResult = {
        success: [],
        failed: [],
        total: selectedRequests.length
      };

      // 一括処理の実行
      if (bulkActionType === 'approve') {
        await onBulkApprove(selectedRequests, bulkReason);
        result.success = selectedRequests;
      } else {
        await onBulkReject(selectedRequests, bulkReason);
        result.success = selectedRequests;
      }

      setBulkProcessResult(result);
      setShowResultNotification(true);
      
      // 選択をクリア
      setSelectedRequests([]);
      setBulkReason('');
      setShowBulkActions(false);

      // 3秒後に結果通知を非表示
      setTimeout(() => {
        setShowResultNotification(false);
        setBulkProcessResult(null);
      }, 5000);

    } catch (error) {
      console.error('一括処理でエラーが発生しました:', error);
      setBulkProcessResult({
        success: [],
        failed: selectedRequests,
        total: selectedRequests.length
      });
      setShowResultNotification(true);
    } finally {
      setIsProcessing(false);
    }
  };

  // 行の展開・折りたたみ
  const toggleRowExpansion = (requestId: string) => {
    const newExpandedRows = new Set(expandedRows);
    if (newExpandedRows.has(requestId)) {
      newExpandedRows.delete(requestId);
    } else {
      newExpandedRows.add(requestId);
    }
    setExpandedRows(newExpandedRows);
  };

  // ソート処理
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  // ソートアイコンの表示
  const getSortIcon = (field: SortField) => {
    if (sortField !== field) {
      return <ChevronDown className="w-4 h-4 text-gray-400" />;
    }
    return sortDirection === 'asc' ? 
      <ChevronUp className="w-4 h-4 text-blue-600" /> : 
      <ChevronDown className="w-4 h-4 text-blue-600" />;
  };

  // 日付の表示形式
  const formatDate = (dateStr: string): string => {
    const date = parseISO(dateStr);
    return format(date, 'M/d (E)', { locale: ja });
  };

  // 申請日からの経過日数
  const getDaysSinceSubmission = (submittedAt: string): number => {
    return differenceInDays(new Date(), parseISO(submittedAt));
  };

  // 選択された申請の詳細情報
  const selectedRequestDetails = useMemo(() => {
    return filteredAndSortedData.filter(r => selectedRequests.includes(r.id));
  }, [filteredAndSortedData, selectedRequests]);

  return (
    <div className="space-y-6">
      {/* 統計ダッシュボード */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">総申請数</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
            <div className="p-2 bg-blue-100 rounded-lg">
              <FileText className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">承認待ち</p>
              <p className="text-2xl font-bold text-orange-600">{stats.pending}</p>
            </div>
            <div className="p-2 bg-orange-100 rounded-lg">
              <AlertCircle className="w-6 h-6 text-orange-600" />
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
              <CheckCircle className="w-6 h-6 text-green-600" />
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
              <XCircle className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </div>
      </div>

      {/* タブ切り替え */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            <button
              onClick={() => {
                setActiveTab('timeCorrection');
                setSelectedRequests([]);
                setExpandedRows(new Set());
              }}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'timeCorrection'
                  ? 'border-green-500 text-green-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center space-x-2">
                <ClockIcon className="w-4 h-4" />
                <span>時刻修正申請</span>
                <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full">
                  {timeCorrectionRequests.length}
                </span>
              </div>
            </button>

            <button
              onClick={() => {
                setActiveTab('leaveRequest');
                setSelectedRequests([]);
                setExpandedRows(new Set());
              }}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'leaveRequest'
                  ? 'border-green-500 text-green-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center space-x-2">
                <Calendar className="w-4 h-4" />
                <span>休暇申請</span>
                <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full">
                  {leaveRequests.length}
                </span>
              </div>
            </button>
          </nav>
        </div>

        {/* 検索・フィルタ・ソートバー */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* 検索 */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="申請者名または部署で検索..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
              </div>
            </div>

            {/* ステータスフィルタ */}
            <div className="lg:w-48">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              >
                <option value="all">全てのステータス</option>
                <option value="pending">承認待ち</option>
                <option value="approved">承認済み</option>
                <option value="rejected">却下</option>
              </select>
            </div>

            {/* 結果件数 */}
            <div className="lg:w-32 text-sm text-gray-600 flex items-center">
              {filteredAndSortedData.length}件
            </div>
          </div>
        </div>

        {/* 一括処理バー */}
        {selectedRequests.length > 0 && (
          <div className="bg-blue-50 border-b border-blue-200 px-6 py-4">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <Info className="w-5 h-5 text-blue-600" />
                  <span className="text-sm font-medium text-blue-800">
                    {selectedRequests.length}件の申請を選択中
                  </span>
                </div>
                
                {/* 選択された申請の詳細表示 */}
                <div className="text-sm text-blue-700">
                  {selectedRequestDetails.slice(0, 3).map((req, index) => (
                    <span key={req.id} className="inline-block bg-blue-100 px-2 py-1 rounded mr-2 mb-1">
                      {req.employeeName}
                    </span>
                  ))}
                  {selectedRequestDetails.length > 3 && (
                    <span className="text-blue-600">
                      +{selectedRequestDetails.length - 3}件
                    </span>
                  )}
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                {/* 一括承認・否認ボタン */}
                <div className="flex space-x-2">
                  <button
                    onClick={() => openBulkConfirmDialog('approve')}
                    disabled={isProcessing}
                    className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
                  >
                    {isProcessing ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <CheckCircle className="w-4 h-4" />
                    )}
                    <span>一括承認 ({selectedRequests.length}件)</span>
                  </button>
                  
                  <button
                    onClick={() => openBulkConfirmDialog('reject')}
                    disabled={isProcessing}
                    className="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
                  >
                    {isProcessing ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <XCircle className="w-4 h-4" />
                    )}
                    <span>一括否認 ({selectedRequests.length}件)</span>
                  </button>
                </div>

                <button
                  onClick={() => setSelectedRequests([])}
                  className="px-3 py-2 text-sm text-blue-600 hover:text-blue-800 hover:bg-blue-100 rounded-lg transition-colors"
                >
                  選択解除
                </button>
              </div>
            </div>

            {/* 一括処理の理由入力 */}
            <div className="mt-4">
              <div className="flex items-center space-x-3">
                <label className="text-sm font-medium text-blue-800">
                  処理理由:
                </label>
                <input
                  type="text"
                  value={bulkReason}
                  onChange={(e) => setBulkReason(e.target.value)}
                  placeholder="一括処理の理由を入力してください（必須）"
                  className="flex-1 px-3 py-2 border border-blue-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <span className="text-xs text-blue-600">
                  {bulkReason.length}/100
                </span>
              </div>
            </div>
          </div>
        )}

        {/* 申請一覧テーブル */}
        <div className="overflow-x-auto">
          {filteredAndSortedData.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-500">
                {activeTab === 'timeCorrection' ? (
                  <ClockIcon className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                ) : (
                  <Calendar className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                )}
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {activeTab === 'timeCorrection' ? '時刻修正申請' : '休暇申請'}がありません
                </h3>
                <p className="text-gray-500">
                  {activeTab === 'timeCorrection' ? '時刻修正の申請' : '休暇の申請'}が提出されると、ここに表示されます。
                </p>
              </div>
            </div>
          ) : (
            <div className="p-6">
              {/* 全選択チェックボックス */}
              <div className="flex items-center space-x-3 pb-3 border-b border-gray-200 mb-4">
                <input
                  type="checkbox"
                  checked={selectedRequests.length === filteredAndSortedData.filter(r => r.status === 'pending').length}
                  onChange={(e) => handleSelectAll(e.target.checked)}
                  className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                />
                <span className="text-sm font-medium text-gray-700">
                  承認待ちの申請を全て選択
                </span>
                <span className="text-sm text-gray-500">
                  ({filteredAndSortedData.filter(r => r.status === 'pending').length}件)
                </span>
              </div>

              {/* テーブル */}
              <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        <input
                          type="checkbox"
                          checked={selectedRequests.length === filteredAndSortedData.filter(r => r.status === 'pending').length}
                          onChange={(e) => handleSelectAll(e.target.checked)}
                          className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                        />
                      </th>
                      <th 
                        className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                        onClick={() => handleSort('employeeName')}
                      >
                        <div className="flex items-center space-x-1">
                          <span>申請者</span>
                          {getSortIcon('employeeName')}
                        </div>
                      </th>
                      <th 
                        className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                        onClick={() => handleSort('requestType')}
                      >
                        <div className="flex items-center space-x-1">
                          <span>種別</span>
                          {getSortIcon('requestType')}
                        </div>
                      </th>
                      <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        内容
                      </th>
                      <th 
                        className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                        onClick={() => handleSort('submittedAt')}
                      >
                        <div className="flex items-center space-x-1">
                          <span>申請日</span>
                          {getSortIcon('submittedAt')}
                        </div>
                      </th>
                      <th 
                        className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                        onClick={() => handleSort('priority')}
                      >
                        <div className="flex items-center space-x-1">
                          <span>緊急度</span>
                          {getSortIcon('priority')}
                        </div>
                      </th>
                      <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        ステータス
                      </th>
                      <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        アクション
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredAndSortedData.map((request) => {
                      const statusDisplay = getStatusDisplay(request.status);
                      const priorityDisplay = getPriorityDisplay(request.submittedAt, request.status);
                      const daysSinceSubmission = getDaysSinceSubmission(request.submittedAt);
                      const isExpanded = expandedRows.has(request.id);
                      const isSelected = selectedRequests.includes(request.id);

                      return (
                        <React.Fragment key={request.id}>
                          {/* メイン行 */}
                          <tr 
                            className={`hover:bg-gray-50 cursor-pointer transition-colors ${
                              isExpanded ? 'bg-blue-50' : ''
                            } ${isSelected ? 'bg-blue-100' : ''}`}
                            onClick={() => toggleRowExpansion(request.id)}
                          >
                            <td className="px-3 py-4 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                              {request.status === 'pending' && (
                                <input
                                  type="checkbox"
                                  checked={isSelected}
                                  onChange={(e) => handleRequestSelection(request.id, e.target.checked)}
                                  className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                                />
                              )}
                            </td>
                            <td className="px-3 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="flex-shrink-0 h-8 w-8">
                                  <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                                    <User className="h-4 w-4 text-blue-600" />
                                  </div>
                                </div>
                                <div className="ml-3">
                                  <div className="text-sm font-medium text-gray-900">{request.employeeName}</div>
                                  <div className="text-sm text-gray-500">{request.department}</div>
                                </div>
                              </div>
                            </td>
                            <td className="px-3 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <request.icon className="h-4 w-4 text-blue-600 mr-2" />
                                <span className="text-sm text-gray-900">{request.displayType}</span>
                              </div>
                            </td>
                            <td className="px-3 py-4">
                              <div className="text-sm text-gray-900 max-w-xs truncate" title={request.displayDetails}>
                                {request.displayDetails}
                              </div>
                            </td>
                            <td className="px-3 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">
                                {formatDate(request.submittedAt)}
                                <div className="text-xs text-gray-500">
                                  ({daysSinceSubmission}日前)
                                </div>
                              </div>
                            </td>
                            <td className="px-3 py-4 whitespace-nowrap">
                              <span className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full bg-white border ${priorityDisplay.color}`}>
                                {priorityDisplay.label}
                              </span>
                            </td>
                            <td className="px-3 py-4 whitespace-nowrap">
                              <span className={`inline-flex items-center px-3 py-1 text-sm font-semibold rounded-full border-2 ${statusDisplay.color}`}>
                                {statusDisplay.icon}
                                <span className="ml-1">{statusDisplay.label}</span>
                              </span>
                            </td>
                            <td className="px-3 py-4 whitespace-nowrap">
                              <div className="flex items-center space-x-2">
                                {request.status === 'pending' && (
                                  <>
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        onApprove(request.id, '承認しました');
                                      }}
                                      className="px-3 py-1 bg-green-600 text-white text-xs font-semibold rounded hover:bg-green-700 transition-colors"
                                    >
                                      承認
                                    </button>
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        onReject(request.id, '却下しました');
                                      }}
                                      className="px-3 py-1 bg-red-600 text-white text-xs font-semibold rounded hover:bg-red-700 transition-colors"
                                    >
                                      否認
                                    </button>
                                  </>
                                )}
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    toggleRowExpansion(request.id);
                                  }}
                                  className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                                >
                                  {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                                </button>
                              </div>
                            </td>
                          </tr>

                          {/* 詳細展開行 */}
                          {isExpanded && (
                            <tr>
                              <td colSpan={8} className="px-6 py-4 bg-gray-50">
                                <div className="space-y-4">
                                  {/* 申請理由 */}
                                  {request.reason && (
                                    <div>
                                      <h4 className="text-sm font-medium text-gray-700 mb-2">申請理由</h4>
                                      <p className="text-sm text-gray-900 bg-white p-3 rounded border">{request.reason}</p>
                                    </div>
                                  )}

                                  {/* 処理状況 */}
                                  {request.status !== 'pending' && (
                                    <div>
                                      <h4 className="text-sm font-medium text-gray-700 mb-2">処理状況</h4>
                                      <div className="bg-white p-3 rounded border">
                                        <div className="flex items-center justify-between text-sm">
                                          <span className="text-gray-600">
                                            {request.status === 'approved' ? '承認' : '却下'}者: {request.processedBy}
                                          </span>
                                          <span className="text-gray-500">
                                            {request.processedAt && formatDate(request.processedAt)}
                                          </span>
                                        </div>
                                        {request.notes && (
                                          <p className="text-gray-700 mt-2">{request.notes}</p>
                                        )}
                                      </div>
                                    </div>
                                  )}

                                  {/* アクションボタン（承認待ちの場合のみ） */}
                                  {request.status === 'pending' && (
                                    <div>
                                      <h4 className="text-sm font-medium text-gray-700 mb-2">アクション</h4>
                                      <div className="flex space-x-3">
                                        <button
                                          onClick={() => onApprove(request.id, '承認しました')}
                                          className="px-4 py-2 bg-green-600 text-white text-sm font-semibold rounded-lg hover:bg-green-700 transition-colors"
                                        >
                                          <CheckCircle className="w-4 h-4 inline mr-2" />
                                          承認
                                        </button>
                                        <button
                                          onClick={() => onReject(request.id, '却下しました')}
                                          className="px-4 py-2 bg-red-600 text-white text-sm font-semibold rounded-lg hover:bg-red-700 transition-colors"
                                        >
                                          <XCircle className="w-4 h-4 inline mr-2" />
                                          否認
                                        </button>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 一括処理確認ダイアログ */}
      {showBulkConfirmDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  {bulkActionType === 'approve' ? '一括承認' : '一括否認'}の確認
                </h3>
                <button
                  onClick={() => setShowBulkConfirmDialog(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="mb-6">
                <div className="flex items-center space-x-3 mb-4">
                  {bulkActionType === 'approve' ? (
                    <CheckCircle className="w-8 h-8 text-green-600" />
                  ) : (
                    <XCircle className="w-8 h-8 text-red-600" />
                  )}
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {selectedRequests.length}件の申請を{bulkActionType === 'approve' ? '承認' : '否認'}しますか？
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      この操作は取り消しできません
                    </p>
                  </div>
                </div>

                {bulkReason.trim() ? (
                  <div className="bg-gray-50 p-3 rounded border">
                    <p className="text-sm font-medium text-gray-700 mb-1">処理理由:</p>
                    <p className="text-sm text-gray-900">{bulkReason}</p>
                  </div>
                ) : (
                  <div className="bg-red-50 p-3 rounded border">
                    <p className="text-sm text-red-700">
                      処理理由を入力してください
                    </p>
                  </div>
                )}
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={() => setShowBulkConfirmDialog(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors"
                >
                  キャンセル
                </button>
                <button
                  onClick={executeBulkAction}
                  disabled={!bulkReason.trim() || isProcessing}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
                >
                  {isProcessing ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <CheckCircle className="w-4 h-4" />
                  )}
                  <span>確認して実行</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 一括処理結果通知 */}
      {showResultNotification && bulkProcessResult && (
        <div className="fixed bottom-4 right-4 bg-white rounded-lg shadow-xl border border-gray-200 max-w-md w-full mx-4 z-50">
          <div className="p-4">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center space-x-3">
                {bulkProcessResult.failed.length === 0 ? (
                  <CheckCircle className="w-6 h-6 text-green-600" />
                ) : (
                  <AlertTriangle className="w-6 h-6 text-yellow-600" />
                )}
                <h4 className="text-sm font-semibold text-gray-900">
                  一括処理完了
                </h4>
              </div>
              <button
                onClick={() => setShowResultNotification(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">処理件数:</span>
                <span className="font-medium text-gray-900">{bulkProcessResult.total}件</span>
              </div>
              
              {bulkProcessResult.success.length > 0 && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-green-600">成功:</span>
                  <span className="font-medium text-green-700">{bulkProcessResult.success.length}件</span>
                </div>
              )}
              
              {bulkProcessResult.failed.length > 0 && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-red-600">失敗:</span>
                  <span className="font-medium text-red-700">{bulkProcessResult.failed.length}件</span>
                </div>
              )}
            </div>

            {bulkProcessResult.failed.length > 0 && (
              <div className="mt-3 p-2 bg-red-50 rounded border border-red-200">
                <p className="text-xs text-red-700">
                  一部の処理でエラーが発生しました。個別に処理してください。
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
