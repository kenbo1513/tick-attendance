'use client';

import React, { useState } from 'react';
import { 
  X, 
  Clock, 
  User, 
  Calendar, 
  AlertTriangle, 
  CheckCircle, 
  XCircle,
  ArrowRight,
  FileText
} from 'lucide-react';
import { TimeCorrectionRequest, Employee } from '@/app/lib/localStorage';
import { format, parseISO } from 'date-fns';
import { ja } from 'date-fns/locale';

interface TimeCorrectionApprovalProps {
  request: TimeCorrectionRequest | null;
  employees: Employee[];
  isOpen: boolean;
  onClose: () => void;
  onApprove: (requestId: string, reason: string) => void;
  onReject: (requestId: string, reason: string) => void;
}

export default function TimeCorrectionApproval({
  request,
  employees,
  isOpen,
  onClose,
  onApprove,
  onReject
}: TimeCorrectionApprovalProps) {
  const [approvalReason, setApprovalReason] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [showApprovalForm, setShowApprovalForm] = useState(false);
  const [showRejectionForm, setShowRejectionForm] = useState(false);

  if (!isOpen || !request) {
    return null;
  }

  // 従業員情報を取得
  const employee = employees.find(emp => emp.id === request.employeeId);

  // 打刻種別のラベルを取得
  const getTypeLabel = (type: string): string => {
    switch (type) {
      case 'clockIn': return '出勤';
      case 'clockOut': return '退勤';
      case 'breakStart': return '休憩開始';
      case 'breakEnd': return '休憩終了';
      default: return type;
    }
  };

  // 打刻種別の色を取得
  const getTypeColor = (type: string): string => {
    switch (type) {
      case 'clockIn': return 'bg-green-100 text-green-800 border-green-200';
      case 'clockOut': return 'bg-red-100 text-red-800 border-red-200';
      case 'breakStart': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'breakEnd': return 'bg-purple-100 text-purple-800 border-purple-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // 日付の表示形式
  const formatDate = (dateStr: string): string => {
    const date = parseISO(dateStr);
    return format(date, 'yyyy年M月d日 (E)', { locale: ja });
  };

  // 時間の表示形式
  const formatTime = (timeStr: string): string => {
    return format(parseISO(`2000-01-01T${timeStr}`), 'HH:mm');
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

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* ヘッダー */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Clock className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">時刻修正申請詳細</h2>
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
                  <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full border ${getTypeColor(request.requestedChanges.type)}`}>
                    {getTypeLabel(request.requestedChanges.type)}
                  </span>
                </div>
              </div>
            </div>

            {/* 修正前後の比較 */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                <AlertTriangle className="w-5 h-5 mr-2 text-yellow-600" />
                修正内容の比較
              </h3>
              
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-center">
                {/* 修正前 */}
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-red-800 mb-3 flex items-center">
                    <FileText className="w-4 h-4 mr-2" />
                    修正前（現在の記録）
                  </h4>
                  <div className="space-y-3">
                    <div>
                      <p className="text-xs font-medium text-red-600">日付</p>
                      <p className="text-lg font-semibold text-red-900">
                        {formatDate(request.originalRecord.date)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-red-600">時刻</p>
                      <p className="text-2xl font-bold text-red-900 font-mono">
                        {formatTime(request.originalRecord.time)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-red-600">打刻種別</p>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full border ${getTypeColor(request.originalRecord.type)}`}>
                        {getTypeLabel(request.originalRecord.type)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* 矢印 */}
                <div className="flex justify-center">
                  <div className="bg-gray-100 rounded-full p-3">
                    <ArrowRight className="w-8 h-8 text-gray-600" />
                  </div>
                </div>

                {/* 修正後 */}
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-green-800 mb-3 flex items-center">
                    <FileText className="w-4 h-4 mr-2" />
                    修正後（申請内容）
                  </h4>
                  <div className="space-y-3">
                    <div>
                      <p className="text-xs font-medium text-green-600">日付</p>
                      <p className="text-lg font-semibold text-green-900">
                        {formatDate(request.requestedChanges.date)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-green-600">時刻</p>
                      <p className="text-2xl font-bold text-green-900 font-mono">
                        {formatTime(request.requestedChanges.time)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-green-600">打刻種別</p>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full border ${getTypeColor(request.requestedChanges.type)}`}>
                        {getTypeLabel(request.requestedChanges.type)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* 修正理由 */}
              {request.requestedChanges.notes && (
                <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <h4 className="text-sm font-medium text-blue-800 mb-2">修正理由</h4>
                  <p className="text-blue-900">{request.requestedChanges.notes}</p>
                </div>
              )}
            </div>

            {/* 申請理由 */}
            {request.reason && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h3 className="text-lg font-medium text-yellow-800 mb-3 flex items-center">
                  <FileText className="w-5 h-5 mr-2" />
                  申請理由
                </h3>
                <p className="text-yellow-900">{request.reason}</p>
              </div>
            )}

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
