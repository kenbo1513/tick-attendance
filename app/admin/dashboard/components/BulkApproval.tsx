'use client';

import React, { useState, useEffect } from 'react';
import { 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Users,
  Clock,
  Calendar,
  FileText,
  Loader2,
  Check,
  X
} from 'lucide-react';
import { ApprovalRequest, TimeCorrectionRequest, LeaveRequest } from '@/app/lib/localStorage';

interface BulkApprovalProps {
  selectedRequests: ApprovalRequest[];
  onBulkApprove: (requestIds: string[], reason: string) => void;
  onBulkReject: (requestIds: string[], reason: string) => void;
  onClose: () => void;
}

interface ProcessingStatus {
  requestId: string;
  status: 'pending' | 'processing' | 'completed' | 'error';
  message?: string;
}

export default function BulkApproval({
  selectedRequests,
  onBulkApprove,
  onBulkReject,
  onClose
}: BulkApprovalProps) {
  const [action, setAction] = useState<'approve' | 'reject' | null>(null);
  const [reason, setReason] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStatus, setProcessingStatus] = useState<ProcessingStatus[]>([]);
  const [showConfirmation, setShowConfirmation] = useState(false);

  // 処理状況の初期化
  useEffect(() => {
    if (selectedRequests.length > 0) {
      setProcessingStatus(
        selectedRequests.map(request => ({
          requestId: request.id,
          status: 'pending' as const
        }))
      );
    }
  }, [selectedRequests]);

  // 一括処理の実行
  const handleBulkAction = async () => {
    if (!action || !reason.trim()) return;

    setIsProcessing(true);
    setShowConfirmation(false);

    // 処理状況を更新
    setProcessingStatus(prev => 
      prev.map(status => ({ ...status, status: 'processing' }))
    );

    try {
      if (action === 'approve') {
        await onBulkApprove(selectedRequests.map(r => r.id), reason);
      } else {
        await onBulkReject(selectedRequests.map(r => r.id), reason);
      }

      // 処理完了の更新
      setProcessingStatus(prev => 
        prev.map(status => ({ ...status, status: 'completed' }))
      );

      // 3秒後にモーダルを閉じる
      setTimeout(() => {
        onClose();
      }, 3000);

    } catch (error) {
      // エラー処理
      setProcessingStatus(prev => 
        prev.map(status => ({ 
          ...status, 
          status: 'error',
          message: error instanceof Error ? error.message : '処理中にエラーが発生しました'
        }))
      );
    } finally {
      setIsProcessing(false);
    }
  };

  // 処理状況の表示
  const getStatusDisplay = (status: ProcessingStatus) => {
    const request = selectedRequests.find(r => r.id === status.requestId);
    if (!request) return null;

    switch (status.status) {
      case 'pending':
        return (
          <div className="flex items-center space-x-2 text-gray-500">
            <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
            <span>待機中</span>
          </div>
        );
      case 'processing':
        return (
          <div className="flex items-center space-x-2 text-blue-600">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>処理中</span>
          </div>
        );
      case 'completed':
        return (
          <div className="flex items-center space-x-2 text-green-600">
            <Check className="w-4 h-4" />
            <span>完了</span>
          </div>
        );
      case 'error':
        return (
          <div className="flex items-center space-x-2 text-red-600">
            <X className="w-4 h-4" />
            <span>エラー</span>
          </div>
        );
      default:
        return null;
    }
  };

  // 申請種別の表示
  const getRequestTypeLabel = (request: ApprovalRequest) => {
    switch (request.requestType) {
      case 'timeCorrection': return '時刻修正申請';
      case 'leaveRequest': return '休暇申請';
      default: return '申請';
    }
  };

  // 申請種別のアイコン
  const getRequestTypeIcon = (request: ApprovalRequest) => {
    switch (request.requestType) {
      case 'timeCorrection': return <Clock className="w-4 h-4" />;
      case 'leaveRequest': return <Calendar className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  // 統計情報
  const stats = {
    total: selectedRequests.length,
    timeCorrection: selectedRequests.filter(r => r.requestType === 'timeCorrection').length,
    leaveRequest: selectedRequests.filter(r => r.requestType === 'leaveRequest').length,
    departments: Array.from(new Set(selectedRequests.map(r => r.department))).length
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* ヘッダー */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">一括処理</h2>
              <p className="text-sm text-gray-500">{selectedRequests.length}件の申請を選択中</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
            disabled={isProcessing}
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* コンテンツ */}
        <div className="p-6">
          {!isProcessing ? (
            <div className="space-y-6">
              {/* 統計情報 */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-blue-600">総申請数</p>
                      <p className="text-2xl font-bold text-blue-900">{stats.total}</p>
                    </div>
                    <Users className="w-6 h-6 text-blue-600" />
                  </div>
                </div>

                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-green-600">時刻修正</p>
                      <p className="text-2xl font-bold text-green-900">{stats.timeCorrection}</p>
                    </div>
                    <Clock className="w-6 h-6 text-green-600" />
                  </div>
                </div>

                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-purple-600">休暇申請</p>
                      <p className="text-2xl font-bold text-purple-900">{stats.leaveRequest}</p>
                    </div>
                    <Calendar className="w-6 h-6 text-purple-600" />
                  </div>
                </div>

                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-orange-600">対象部署</p>
                      <p className="text-2xl font-bold text-orange-900">{stats.departments}</p>
                    </div>
                    <FileText className="w-6 h-6 text-orange-600" />
                  </div>
                </div>
              </div>

              {/* 選択された申請一覧 */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-lg font-medium text-gray-900 mb-3">選択された申請</h3>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {selectedRequests.map((request) => (
                    <div key={request.id} className="flex items-center justify-between bg-white rounded-lg p-3 border border-gray-200">
                      <div className="flex items-center space-x-3">
                        {getRequestTypeIcon(request)}
                        <div>
                          <p className="font-medium text-gray-900">{request.employeeName}</p>
                          <p className="text-sm text-gray-500">{request.department}</p>
                        </div>
                      </div>
                      <span className="text-sm text-gray-600">
                        {getRequestTypeLabel(request)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* 処理アクション選択 */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900">処理アクション</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* 一括承認 */}
                  <button
                    onClick={() => setAction('approve')}
                    className={`p-4 border-2 rounded-lg text-left transition-all ${
                      action === 'approve'
                        ? 'border-green-500 bg-green-50'
                        : 'border-gray-200 hover:border-green-300 hover:bg-green-25'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-green-100 rounded-lg">
                        <CheckCircle className="w-6 h-6 text-green-600" />
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">一括承認</h4>
                        <p className="text-sm text-gray-500">選択された申請を全て承認します</p>
                      </div>
                    </div>
                  </button>

                  {/* 一括却下 */}
                  <button
                    onClick={() => setAction('reject')}
                    className={`p-4 border-2 rounded-lg text-left transition-all ${
                      action === 'reject'
                        ? 'border-red-500 bg-red-50'
                        : 'border-gray-200 hover:border-red-300 hover:bg-red-25'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-red-100 rounded-lg">
                        <XCircle className="w-6 h-6 text-red-600" />
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">一括却下</h4>
                        <p className="text-sm text-gray-500">選択された申請を全て却下します</p>
                      </div>
                    </div>
                  </button>
                </div>
              </div>

              {/* 理由入力 */}
              {action && (
                <div className="space-y-3">
                  <label className="block text-sm font-medium text-gray-700">
                    {action === 'approve' ? '承認' : '却下'}理由 <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    rows={4}
                    placeholder={`${action === 'approve' ? '承認' : '却下'}する理由を入力してください`}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  />
                </div>
              )}

              {/* 確認ボタン */}
              {action && reason.trim() && (
                <div className="flex items-center justify-center">
                  <button
                    onClick={() => setShowConfirmation(true)}
                    className={`px-6 py-3 text-white font-medium rounded-lg ${
                      action === 'approve'
                        ? 'bg-green-600 hover:bg-green-700'
                        : 'bg-red-600 hover:bg-red-700'
                    }`}
                  >
                    {action === 'approve' ? '一括承認を実行' : '一括却下を実行'}
                  </button>
                </div>
              )}
            </div>
          ) : (
            /* 処理中の表示 */
            <div className="space-y-6">
              <div className="text-center">
                <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {action === 'approve' ? '一括承認' : '一括却下'}を実行中
                </h3>
                <p className="text-gray-500">
                  {selectedRequests.length}件の申請を処理しています...
                </p>
              </div>

              {/* 処理状況 */}
              <div className="space-y-3">
                <h4 className="font-medium text-gray-900">処理状況</h4>
                {processingStatus.map((status) => {
                  const request = selectedRequests.find(r => r.id === status.requestId);
                  if (!request) return null;

                  return (
                    <div key={status.requestId} className="flex items-center justify-between bg-gray-50 rounded-lg p-3">
                      <div className="flex items-center space-x-3">
                        {getRequestTypeIcon(request)}
                        <div>
                          <p className="font-medium text-gray-900">{request.employeeName}</p>
                          <p className="text-sm text-gray-500">{request.department}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {getStatusDisplay(status)}
                        {status.message && (
                          <span className="text-xs text-red-600">{status.message}</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* 確認モーダル */}
        {showConfirmation && (
          <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-60 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
              <div className="text-center">
                <AlertTriangle className="w-12 h-12 text-yellow-600 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {action === 'approve' ? '一括承認' : '一括却下'}の確認
                </h3>
                <p className="text-gray-500 mb-6">
                  {selectedRequests.length}件の申請を{action === 'approve' ? '承認' : '却下'}します。
                  この操作は取り消しできません。
                </p>
                <div className="flex items-center justify-center space-x-3">
                  <button
                    onClick={() => setShowConfirmation(false)}
                    className="px-4 py-2 border border-gray-300 text-gray-700 font-medium rounded-md hover:bg-gray-50"
                  >
                    キャンセル
                  </button>
                  <button
                    onClick={handleBulkAction}
                    className={`px-4 py-2 text-white font-medium rounded-md ${
                      action === 'approve'
                        ? 'bg-green-600 hover:bg-green-700'
                        : 'bg-red-600 hover:bg-red-700'
                    }`}
                  >
                    実行する
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
