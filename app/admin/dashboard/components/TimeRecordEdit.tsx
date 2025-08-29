'use client';

import React, { useState, useEffect } from 'react';
import { TimeRecord, Employee } from '@/app/lib/localStorage';
import { X, Save, Clock, MapPin, User, Calendar, AlertTriangle } from 'lucide-react';
import { format, parseISO } from 'date-fns';

interface TimeRecordEditProps {
  record: TimeRecord | null;
  employees: Employee[];
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedRecord: TimeRecord) => void;
}

export default function TimeRecordEdit({
  record,
  employees,
  isOpen,
  onClose,
  onSave
}: TimeRecordEditProps) {
  const [formData, setFormData] = useState<Partial<TimeRecord>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  // フォームデータの初期化
  useEffect(() => {
    if (record) {
      setFormData({
        id: record.id,
        employeeId: record.employeeId,
        employeeName: record.employeeName,
        type: record.type,
        time: record.time,
        date: record.date,
        location: record.location,
        ipAddress: record.ipAddress,
        deviceInfo: record.deviceInfo,
        notes: record.notes
      });
      setErrors({});
    }
  }, [record]);

  if (!isOpen || !record) {
    return null;
  }

  // バリデーション
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.employeeId) {
      newErrors.employeeId = '従業員は必須です';
    }

    if (!formData.type) {
      newErrors.type = '打刻種別は必須です';
    }

    if (!formData.time) {
      newErrors.time = '時刻は必須です';
    } else {
      // 時刻の形式チェック (HH:mm)
      const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
      if (!timeRegex.test(formData.time)) {
        newErrors.time = '時刻はHH:mm形式で入力してください';
      }
    }

    if (!formData.date) {
      newErrors.date = '日付は必須です';
    } else {
      // 日付の妥当性チェック
      const date = new Date(formData.date);
      if (isNaN(date.getTime())) {
        newErrors.date = '有効な日付を入力してください';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // 保存処理
  const handleSave = () => {
    if (validateForm()) {
      const updatedRecord: TimeRecord = {
        ...record,
        ...formData
      } as TimeRecord;
      
      onSave(updatedRecord);
      onClose();
    }
  };

  // キャンセル処理
  const handleCancel = () => {
    setFormData({
      id: record.id,
      employeeId: record.employeeId,
      employeeName: record.employeeName,
      type: record.type,
      time: record.time,
      date: record.date,
      location: record.location,
      ipAddress: record.ipAddress,
      deviceInfo: record.deviceInfo,
      notes: record.notes
    });
    setErrors({});
    onClose();
  };

  // フィールド更新
  const updateField = (field: keyof TimeRecord, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // 従業員IDが変更された場合、従業員名も更新
    if (field === 'employeeId') {
      const employee = employees.find(emp => emp.id === value);
      if (employee) {
        setFormData(prev => ({ ...prev, employeeName: employee.name }));
      }
    }
    
    // エラーをクリア
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  // 打刻種別のオプション
  const typeOptions = [
    { value: 'clockIn', label: '出勤' },
    { value: 'clockOut', label: '退勤' },
    { value: 'breakStart', label: '休憩開始' },
    { value: 'breakEnd', label: '休憩終了' }
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* ヘッダー */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">勤務記録編集</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* フォーム */}
        <div className="p-6">
          <div className="space-y-4">
            {/* 従業員選択 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                従業員 <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.employeeId || ''}
                onChange={(e) => updateField('employeeId', e.target.value)}
                className={`block w-full px-3 py-2 border rounded-md shadow-sm sm:text-sm ${
                  errors.employeeId 
                    ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                    : 'border-gray-300 focus:ring-green-500 focus:border-green-500'
                }`}
              >
                <option value="">従業員を選択</option>
                {employees.map((employee) => (
                  <option key={employee.id} value={employee.id}>
                    {employee.name} ({employee.department})
                  </option>
                ))}
              </select>
              {errors.employeeId && (
                <p className="mt-1 text-sm text-red-600">{errors.employeeId}</p>
              )}
            </div>

            {/* 日付 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                日付 <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={formData.date || ''}
                onChange={(e) => updateField('date', e.target.value)}
                className={`block w-full px-3 py-2 border rounded-md shadow-sm sm:text-sm ${
                  errors.date 
                    ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                    : 'border-gray-300 focus:ring-green-500 focus:border-green-500'
                }`}
              />
              {errors.date && (
                <p className="mt-1 text-sm text-red-600">{errors.date}</p>
              )}
            </div>

            {/* 時刻 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                時刻 <span className="text-red-500">*</span>
              </label>
              <input
                type="time"
                value={formData.time || ''}
                onChange={(e) => updateField('time', e.target.value)}
                className={`block w-full px-3 py-2 border rounded-md shadow-sm sm:text-sm ${
                  errors.time 
                    ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                    : 'border-gray-300 focus:ring-green-500 focus:border-green-500'
                }`}
              />
              {errors.time && (
                <p className="mt-1 text-sm text-red-600">{errors.time}</p>
              )}
            </div>

            {/* 打刻種別 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                打刻種別 <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.type || ''}
                onChange={(e) => updateField('type', e.target.value)}
                className={`block w-full px-3 py-2 border rounded-md shadow-sm sm:text-sm ${
                  errors.type 
                    ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                    : 'border-gray-300 focus:ring-green-500 focus:border-green-500'
                }`}
              >
                <option value="">打刻種別を選択</option>
                {typeOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              {errors.type && (
                <p className="mt-1 text-sm text-red-600">{errors.type}</p>
              )}
            </div>

            {/* 位置情報 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                位置情報
              </label>
              <input
                type="text"
                value={formData.location || ''}
                onChange={(e) => updateField('location', e.target.value)}
                placeholder="例: 東京都渋谷区..."
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 sm:text-sm"
              />
            </div>

            {/* IPアドレス */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                IPアドレス
              </label>
              <input
                type="text"
                value={formData.ipAddress || ''}
                onChange={(e) => updateField('ipAddress', e.target.value)}
                placeholder="例: 192.168.1.100"
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 sm:text-sm"
              />
            </div>

            {/* デバイス情報 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                デバイス情報
              </label>
              <input
                type="text"
                value={formData.deviceInfo || ''}
                onChange={(e) => updateField('deviceInfo', e.target.value)}
                placeholder="例: iPhone 14, Chrome 120.0..."
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 sm:text-sm"
              />
            </div>

            {/* メモ */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                メモ
              </label>
              <textarea
                value={formData.notes || ''}
                onChange={(e) => updateField('notes', e.target.value)}
                rows={3}
                placeholder="修正理由や特記事項があれば入力してください"
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 sm:text-sm"
              />
            </div>

            {/* 注意事項 */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-start space-x-2">
                <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-yellow-800">
                  <p className="font-medium mb-1">注意事項</p>
                  <ul className="list-disc list-inside space-y-1">
                    <li>勤務記録の修正は慎重に行ってください</li>
                    <li>修正履歴は記録されます</li>
                    <li>不正な修正は発覚する可能性があります</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* フッター */}
        <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200">
          <button
            onClick={handleCancel}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
          >
            キャンセル
          </button>
          <button
            onClick={handleSave}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
          >
            <Save className="w-4 h-4 mr-2" />
            保存
          </button>
        </div>
      </div>
    </div>
  );
}
