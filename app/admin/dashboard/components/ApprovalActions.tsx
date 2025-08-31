'use client';

import React, { useState } from 'react';
import { 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Bell,
  User,
  Clock,
  FileText
} from 'lucide-react';
import { ApprovalRequest } from '@/app/lib/localStorage';

interface ApprovalActionsProps {
  request: ApprovalRequest;
  onApprove: (requestId: string, reason: string) => void;
  onReject: (requestId: string, reason: string) => void;
  onNotify: (requestId: string, message: string) => void;
}

export default function ApprovalActions({
  request,
  onApprove,
  onReject,
  onNotify
}: ApprovalActionsProps) {
  const [approvalReason, setApprovalReason] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [notificationMessage, setNotificationMessage] = useState('');
  const [showApprovalForm, setShowApprovalForm] = useState(false);
  const [showRejectionForm, setShowRejectionForm] = useState(false);
  const [showNotificationForm, setShowNotificationForm] = useState(false);

  // 承認処理
  const handleApprove = () => {
    if (approvalReason.trim()) {
      onApprove(request.id, approvalReason);
      setApprovalReason('');
      setShowApprovalForm(false);
    }
  };

  // 却下処理
  const handleReject = () => {
    if (rejectionReason.trim()) {
      onReject(request.id, rejectionReason);
      setRejectionReason('');
      setShowRejectionForm(false);
    }
  };

  // 通知送信
  const handleNotify = () => {
    if (notificationMessage.trim()) {
      onNotify(request.id, notificationMessage);
      setNotificationMessage('');
      setShowNotificationForm(false);
    }
  };

  // フォームの表示切り替え
  const toggleApprovalForm = () => {
    setShowApprovalForm(!showApprovalForm);
    setShowRejectionForm(false);
    setShowNotificationForm(false);
  };

  const toggleRejectionForm = () => {
    setShowRejectionForm(!showRejectionForm);
    setShowApprovalForm(false);
    setShowNotificationForm(false);
  };

  const toggleNotificationForm = () => {
    setShowNotificationForm(!showNotificationForm);
    setShowApprovalForm(false);
    setShowRejectionForm(false);
  };

  // 申請種別の表示
  const getRequestTypeLabel = () => {
    switch (request.requestType) {
      case 'timeCorrection': return '時刻修正申請';
      case 'leaveRequest': return '休暇申請';
      default: return '申請';
    }
  };

  // 申請種別のアイコン
  const getRequestTypeIcon = () => {
    switch (request.requestType) {
      case 'timeCorrection': return <Clock className="w-4 h-4" />;
      case 'leaveRequest': return <FileText className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  if (request.status !== 'pending') {
    return null;
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4">
      <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
        <AlertTriangle className="w-5 h-5 mr-2 text-yellow-600" />
        承認・却下アクション
      </h3>

      <div className="space-y-4">
        {/* 申請概要 */}
        <div className="bg-gray-50 rounded-lg p-3">
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            {getRequestTypeIcon()}
            <span>{getRequestTypeLabel()}</span>
            <span>•</span>
            <User className="w-4 h-4" />
            <span>{request.employeeName}</span>
            <span>•</span>
            <span>{request.department}</span>
          </div>
        </div>

        {/* 承認フォーム */}
        <div className="border border-green-200 rounded-lg p-4 bg-green-50">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-md font-medium text-green-800 flex items-center">
              <CheckCircle className="w-4 h-4 mr-2" />
              承認
            </h4>
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
                <label className="block text-sm font-medium text-green-700 mb-1">
                  承認理由 <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={approvalReason}
                  onChange={(e) => setApprovalReason(e.target.value)}
                  rows={3}
                  placeholder="承認する理由を入力してください"
                  className="block w-full px-3 py-2 border border-green-300 rounded-md shadow-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 text-sm"
                />
              </div>
              <div className="flex items-center space-x-3">
                <button
                  onClick={handleApprove}
                  disabled={!approvalReason.trim()}
                  className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <CheckCircle className="w-4 h-4 inline mr-2" />
                  承認する
                </button>
                <button
                  onClick={() => setShowApprovalForm(false)}
                  className="px-4 py-2 border border-green-300 text-green-700 text-sm font-medium rounded-md hover:bg-green-50"
                >
                  キャンセル
                </button>
              </div>
            </div>
          )}
        </div>

        {/* 却下フォーム */}
        <div className="border border-red-200 rounded-lg p-4 bg-red-50">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-md font-medium text-red-800 flex items-center">
              <XCircle className="w-4 h-4 mr-2" />
              却下
            </h4>
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
                <label className="block text-sm font-medium text-red-700 mb-1">
                  却下理由 <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  rows={3}
                  placeholder="却下する理由を入力してください"
                  className="block w-full px-3 py-2 border border-red-300 rounded-md shadow-sm focus:ring-2 focus:ring-red-500 focus:border-red-500 text-sm"
                />
              </div>
              <div className="flex items-center space-x-3">
                <button
                  onClick={handleReject}
                  disabled={!rejectionReason.trim()}
                  className="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <XCircle className="w-4 h-4 inline mr-2" />
                  却下する
                </button>
                <button
                  onClick={() => setShowRejectionForm(false)}
                  className="px-4 py-2 border border-red-300 text-red-700 text-sm font-medium rounded-md hover:bg-red-50"
                >
                  キャンセル
                </button>
              </div>
            </div>
          )}
        </div>

        {/* 通知フォーム */}
        <div className="border border-blue-200 rounded-lg p-4 bg-blue-50">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-md font-medium text-blue-800 flex items-center">
              <Bell className="w-4 h-4 mr-2" />
              通知送信
            </h4>
            <button
              onClick={toggleNotificationForm}
              className="text-sm text-blue-600 hover:text-blue-800 underline"
            >
              {showNotificationForm ? 'フォームを隠す' : '通知フォームを表示'}
            </button>
          </div>
          
          {showNotificationForm && (
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-blue-700 mb-1">
                  通知メッセージ <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={notificationMessage}
                  onChange={(e) => setNotificationMessage(e.target.value)}
                  rows={3}
                  placeholder="申請者に送信する通知メッセージを入力してください"
                  className="block w-full px-3 py-2 border border-blue-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                />
              </div>
              <div className="flex items-center space-x-3">
                <button
                  onClick={handleNotify}
                  disabled={!notificationMessage.trim()}
                  className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Bell className="w-4 h-4 inline mr-2" />
                  通知を送信
                </button>
                <button
                  onClick={() => setShowNotificationForm(false)}
                  className="px-4 py-2 border border-blue-300 text-blue-700 text-sm font-medium rounded-md hover:bg-blue-50"
                >
                  キャンセル
                </button>
              </div>
            </div>
          )}
        </div>

        {/* 注意事項 */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
          <div className="flex items-start space-x-2">
            <AlertTriangle className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-yellow-800">
              <p className="font-medium mb-1">注意事項</p>
              <ul className="list-disc list-inside space-y-1">
                <li>承認・却下の処理は取り消しできません</li>
                <li>処理後は申請者に自動通知されます</li>
                <li>却下する場合は、明確な理由を記載してください</li>
                <li>必要に応じて申請者に追加情報を求めることができます</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
