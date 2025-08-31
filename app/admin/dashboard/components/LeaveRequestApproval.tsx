'use client';

import React, { useState } from 'react';
import { 
  X, 
  Calendar, 
  User, 
  Clock, 
  AlertTriangle, 
  CheckCircle, 
  XCircle,
  FileText,
  MapPin,
  Info
} from 'lucide-react';
import { LeaveRequest, Employee } from '@/app/lib/localStorage';
import { format, parseISO, differenceInDays, addDays } from 'date-fns';
import { ja } from 'date-fns/locale';

interface LeaveRequestApprovalProps {
  request: LeaveRequest | null;
  employees: Employee[];
  isOpen: boolean;
  onClose: () => void;
  onApprove: (requestId: string, reason: string) => void;
  onReject: (requestId: string, reason: string) => void;
}

export default function LeaveRequestApproval({
  request,
  employees,
  isOpen,
  onClose,
  onApprove,
  onReject
}: LeaveRequestApprovalProps) {
  const [approvalReason, setApprovalReason] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [showApprovalForm, setShowApprovalForm] = useState(false);
  const [showRejectionForm, setShowRejectionForm] = useState(false);

  if (!isOpen || !request) {
    return null;
  }

  // 従業員情報を取得
  const employee = employees.find(emp => emp.id === request.employeeId);

  // 休暇種別のラベルと色を取得
  const getLeaveTypeDisplay = (type: string) => {
    switch (type) {
      case 'paid':
        return {
          label: '有給休暇',
          color: 'bg-green-100 text-green-800 border-green-200',
          icon: '🌞'
        };
      case 'unpaid':
        return {
          label: '無給休暇',
          color: 'bg-gray-100 text-gray-800 border-gray-200',
          icon: '📅'
        };
      case 'sick':
        return {
          label: '病気休暇',
          color: 'bg-red-100 text-red-800 border-red-200',
          icon: '🏥'
        };
      case 'special':
        return {
          label: '特別休暇',
          color: 'bg-blue-100 text-blue-800 border-blue-200',
          icon: '⭐'
        };
      default:
        return {
          label: type,
          color: 'bg-gray-100 text-gray-800 border-gray-200',
          icon: '📋'
        };
    }
  };

  // 日付の表示形式
  const formatDate = (dateStr: string): string => {
    const date = parseISO(dateStr);
    return format(date, 'yyyy年M月d日 (E)', { locale: ja });
  };

  // 日付範囲の表示
  const getDateRangeDisplay = () => {
    const startDate = parseISO(request.startDate);
    const endDate = parseISO(request.endDate);
    const days = differenceInDays(endDate, startDate) + 1;
    
    if (days === 1) {
      return formatDate(request.startDate);
    } else {
      return `${formatDate(request.startDate)} 〜 ${formatDate(request.endDate)} (${days}日間)`;
    }
  };

  // 営業日数の計算（簡易版）
  const getBusinessDays = () => {
    const startDate = parseISO(request.startDate);
    const endDate = parseISO(request.endDate);
    let businessDays = 0;
    let currentDate = startDate;
    
    while (currentDate <= endDate) {
      const dayOfWeek = currentDate.getDay();
      if (dayOfWeek !== 0 && dayOfWeek !== 6) { // 土日以外
        businessDays++;
      }
      currentDate = addDays(currentDate, 1);
    }
    
    return businessDays;
  };

  // 承認処理
  const handleApprove = () => {
    if (approvalReason.trim()) {
      onApprove(request.id, approvalReason);
      setApprovalReason('');
      setShowApprovalForm(false);
      onClose();
    }
  };

  // 却下処理
  const handleReject = () => {
    if (rejectionReason.trim()) {
      onReject(request.id, rejectionReason);
      setRejectionReason('');
      setShowRejectionForm(false);
      onClose();
    }
  };

  // フォームの表示切り替え
  const toggleApprovalForm = () => {
    setShowApprovalForm(!showApprovalForm);
    setShowRejectionForm(false);
  };

  const toggleRejectionForm = () => {
    setShowRejectionForm(!showRejectionForm);
    setShowApprovalForm(false);
  };

  const leaveTypeDisplay = getLeaveTypeDisplay(request.leaveType);
  const businessDays = getBusinessDays();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* ヘッダー */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Calendar className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">休暇申請詳細</h2>
              <p className="text-sm text-gray-500">申請ID: {request.id}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* コンテンツ */}
        <div className="p-6">
          <div className="space-y-6">
            {/* 申請者情報 */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-lg font-medium text-gray-900 mb-3 flex items-center">
                <User className="w-5 h-5 mr-2" />
                申請者情報
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-1">従業員名</p>
                  <p className="text-lg font-semibold text-gray-900">{request.employeeName}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-1">部署</p>
                  <p className="text-lg font-semibold text-gray-900">{request.department}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-1">申請日時</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {formatDate(request.submittedAt)}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-1">申請種別</p>
                  <span className={`inline-flex items-center px-3 py-1 text-sm font-semibold rounded-full border ${leaveTypeDisplay.color}`}>
                    <span className="mr-1">{leaveTypeDisplay.icon}</span>
                    {leaveTypeDisplay.label}
                  </span>
                </div>
              </div>
            </div>

            {/* 休暇詳細 */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                <Calendar className="w-5 h-5 mr-2 text-blue-600" />
                休暇詳細
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* 日付情報 */}
                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-2">休暇期間</p>
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <p className="text-lg font-semibold text-blue-900">
                        {getDateRangeDisplay()}
                      </p>
                      <div className="mt-2 flex items-center space-x-4 text-sm text-blue-700">
                        <span>申請日数: {request.days}日</span>
                        <span>営業日数: {businessDays}日</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-2">休暇種別</p>
                    <div className="flex items-center space-x-2">
                      <span className={`inline-flex items-center px-3 py-2 text-sm font-semibold rounded-lg border ${leaveTypeDisplay.color}`}>
                        <span className="mr-2">{leaveTypeDisplay.icon}</span>
                        {leaveTypeDisplay.label}
                      </span>
                    </div>
                  </div>
                </div>

                {/* 申請理由 */}
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-2">申請理由</p>
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <p className="text-yellow-900">{request.reason}</p>
                  </div>
                </div>
              </div>

              {/* 添付書類 */}
              {request.supportingDocuments && request.supportingDocuments.length > 0 && (
                <div className="mt-6">
                  <p className="text-sm font-medium text-gray-700 mb-2">添付書類</p>
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                    <div className="flex flex-wrap gap-2">
                      {request.supportingDocuments.map((doc, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-3 py-1 text-sm bg-white border border-gray-300 rounded-md text-gray-700"
                        >
                          <FileText className="w-4 h-4 mr-2" />
                          {doc}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* 注意事項 */}
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
              <h3 className="text-lg font-medium text-orange-800 mb-3 flex items-center">
                <Info className="w-5 h-5 mr-2" />
                注意事項
              </h3>
              <div className="space-y-2 text-sm text-orange-700">
                <p>• 有給休暇の場合は、残日数を確認してください</p>
                <p>• 長期休暇の場合は、業務への影響を考慮してください</p>
                <p>• 病気休暇の場合は、必要に応じて医師の診断書を確認してください</p>
                <p>• 承認後は、勤怠システムに反映されます</p>
              </div>
            </div>

            {/* 承認・却下フォーム */}
            {request.status === 'pending' && (
              <div className="space-y-4">
                {/* 承認フォーム */}
                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-lg font-medium text-gray-900 flex items-center">
                      <CheckCircle className="w-5 h-5 mr-2 text-green-600" />
                      承認
                    </h3>
                    <button
                      onClick={toggleApprovalForm}
                      className="text-sm text-green-600 hover:text-green-800 underline"
                    >
                      {showApprovalForm ? 'フォームを隠す' : '承認フォームを表示'}
                    </button>
                  </div>
                  
                  {showApprovalForm && (
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          承認理由 <span className="text-red-500">*</span>
                        </label>
                        <textarea
                          value={approvalReason}
                          onChange={(e) => setApprovalReason(e.target.value)}
                          rows={3}
                          placeholder="承認する理由を入力してください"
                          className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-green-500 focus:border-green-500"
                        />
                      </div>
                      <button
                        onClick={handleApprove}
                        disabled={!approvalReason.trim()}
                        className="w-full px-4 py-2 bg-green-600 text-white font-medium rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <CheckCircle className="w-4 h-4 inline mr-2" />
                        承認する
                      </button>
                    </div>
                  )}
                </div>

                {/* 却下フォーム */}
                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-lg font-medium text-gray-900 flex items-center">
                      <XCircle className="w-5 h-5 mr-2 text-red-600" />
                      却下
                    </h3>
                    <button
                      onClick={toggleRejectionForm}
                      className="text-sm text-red-600 hover:text-red-800 underline"
                    >
                      {showRejectionForm ? 'フォームを隠す' : '却下フォームを表示'}
                    </button>
                  </div>
                  
                  {showRejectionForm && (
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          却下理由 <span className="text-red-500">*</span>
                        </label>
                        <textarea
                          value={rejectionReason}
                          onChange={(e) => setRejectionReason(e.target.value)}
                          rows={3}
                          placeholder="却下する理由を入力してください"
                          className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-red-500 focus:border-red-500"
                        />
                      </div>
                      <button
                        onClick={handleReject}
                        disabled={!rejectionReason.trim()}
                        className="w-full px-4 py-2 bg-red-600 text-white font-medium rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <XCircle className="w-4 h-4 inline mr-2" />
                        却下する
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* 処理済みの場合 */}
            {request.status !== 'pending' && (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <h3 className="text-lg font-medium text-gray-900 mb-3 flex items-center">
                  {request.status === 'approved' ? (
                    <CheckCircle className="w-5 h-5 mr-2 text-green-600" />
                  ) : (
                    <XCircle className="w-5 h-5 mr-2 text-red-600" />
                  )}
                  {request.status === 'approved' ? '承認済み' : '却下済み'}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-1">
                      {request.status === 'approved' ? '承認' : '却下'}者
                    </p>
                    <p className="text-gray-900">{request.processedBy}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-1">処理日時</p>
                    <p className="text-gray-900">
                      {request.processedAt && formatDate(request.processedAt)}
                    </p>
                  </div>
                </div>
                {request.notes && (
                  <div className="mt-3">
                    <p className="text-sm font-medium text-gray-700 mb-1">
                      {request.status === 'approved' ? '承認' : '却下'}理由
                    </p>
                    <p className="text-gray-900">{request.notes}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* フッター */}
        <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
          >
            閉じる
          </button>
        </div>
      </div>
    </div>
  );
}
