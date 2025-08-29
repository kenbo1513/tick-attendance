'use client';

import React, { useState, useEffect } from 'react';
import { Employee } from '@/app/lib/localStorage';
import { X, Edit, Save, User, Building, Briefcase, DollarSign, Calendar, MapPin, Utensils } from 'lucide-react';

interface EmployeeDetailProps {
  employee: Employee | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (employee: Employee) => void;
  onDelete: (employeeId: string) => void;
}

export default function EmployeeDetail({
  employee,
  isOpen,
  onClose,
  onSave,
  onDelete
}: EmployeeDetailProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedEmployee, setEditedEmployee] = useState<Employee | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // 従業員データが変更されたときに編集用データを初期化
  useEffect(() => {
    if (employee) {
      setEditedEmployee({ ...employee });
      setIsEditing(false);
      setErrors({});
    }
  }, [employee]);

  if (!isOpen || !employee || !editedEmployee) {
    return null;
  }

  // バリデーション
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!editedEmployee.name.trim()) {
      newErrors.name = '氏名は必須です';
    }

    if (!editedEmployee.department.trim()) {
      newErrors.department = '部署は必須です';
    }

    if (!editedEmployee.position.trim()) {
      newErrors.position = '役職は必須です';
    }

    if (editedEmployee.hourlyWage && editedEmployee.hourlyWage < 0) {
      newErrors.hourlyWage = '時給は0以上である必要があります';
    }

    if (editedEmployee.monthlySalary && editedEmployee.monthlySalary < 0) {
      newErrors.monthlySalary = '基本給は0以上である必要があります';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // 保存処理
  const handleSave = () => {
    if (validateForm()) {
      onSave(editedEmployee);
      setIsEditing(false);
      setErrors({});
    }
  };

  // キャンセル処理
  const handleCancel = () => {
    setEditedEmployee({ ...employee });
    setIsEditing(false);
    setErrors({});
  };

  // 削除確認
  const handleDelete = () => {
    if (window.confirm(`${employee.name}を削除してもよろしいですか？\nこの操作は取り消せません。`)) {
      onDelete(employee.id);
      onClose();
    }
  };

  // フィールド更新
  const updateField = (field: keyof Employee, value: any) => {
    setEditedEmployee(prev => prev ? { ...prev, [field]: value } : null);
    // エラーをクリア
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* ヘッダー */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            {isEditing ? '従業員情報編集' : '従業員詳細'}
          </h2>
          <div className="flex items-center space-x-2">
            {!isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              >
                <Edit className="w-4 h-4 mr-2" />
                編集
              </button>
            )}
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* コンテンツ */}
        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* 基本情報 */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900 border-b border-gray-200 pb-2">
                基本情報
              </h3>
              
              {/* 社員ID */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  社員ID
                </label>
                <input
                  type="text"
                  value={editedEmployee.id}
                  disabled
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-50 text-gray-500 sm:text-sm"
                />
              </div>

              {/* 氏名 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  氏名 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={editedEmployee.name}
                  onChange={(e) => updateField('name', e.target.value)}
                  disabled={!isEditing}
                  className={`block w-full px-3 py-2 border rounded-md shadow-sm sm:text-sm ${
                    errors.name 
                      ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                      : 'border-gray-300 focus:ring-green-500 focus:border-green-500'
                  } ${!isEditing ? 'bg-gray-50' : 'bg-white'}`}
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                )}
              </div>

              {/* 部署 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  部署 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={editedEmployee.department}
                  onChange={(e) => updateField('department', e.target.value)}
                  disabled={!isEditing}
                  className={`block w-full px-3 py-2 border rounded-md shadow-sm sm:text-sm ${
                    errors.department 
                      ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                      : 'border-gray-300 focus:ring-green-500 focus:border-green-500'
                  } ${!isEditing ? 'bg-gray-50' : 'bg-white'}`}
                />
                {errors.department && (
                  <p className="mt-1 text-sm text-red-600">{errors.department}</p>
                )}
              </div>

              {/* 役職 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  役職 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={editedEmployee.position}
                  onChange={(e) => updateField('position', e.target.value)}
                  disabled={!isEditing}
                  className={`block w-full px-3 py-2 border rounded-md shadow-sm sm:text-sm ${
                    errors.position 
                      ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                      : 'border-gray-300 focus:ring-green-500 focus:border-green-500'
                  } ${!isEditing ? 'bg-gray-50' : 'bg-white'}`}
                />
                {errors.position && (
                  <p className="mt-1 text-sm text-red-600">{errors.position}</p>
                )}
              </div>

              {/* 入社日 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  入社日
                </label>
                <input
                  type="date"
                  value={editedEmployee.hireDate || ''}
                  onChange={(e) => updateField('hireDate', e.target.value)}
                  disabled={!isEditing}
                  className={`block w-full px-3 py-2 border rounded-md shadow-sm sm:text-sm ${
                    'border-gray-300 focus:ring-green-500 focus:border-green-500'
                  } ${!isEditing ? 'bg-gray-50' : 'bg-white'}`}
                />
              </div>

              {/* ステータス */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  ステータス
                </label>
                <select
                  value={editedEmployee.isActive ? 'active' : 'inactive'}
                  onChange={(e) => updateField('isActive', e.target.value === 'active')}
                  disabled={!isEditing}
                  className={`block w-full px-3 py-2 border rounded-md shadow-sm sm:text-sm ${
                    'border-gray-300 focus:ring-green-500 focus:border-green-500'
                  } ${!isEditing ? 'bg-gray-50' : 'bg-white'}`}
                >
                  <option value="active">在籍</option>
                  <option value="inactive">退職</option>
                </select>
              </div>
            </div>

            {/* 給与情報 */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900 border-b border-gray-200 pb-2">
                給与情報
              </h3>
              
              {/* 時給 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  時給（円）
                </label>
                <input
                  type="number"
                  value={editedEmployee.hourlyWage || ''}
                  onChange={(e) => updateField('hourlyWage', e.target.value ? parseInt(e.target.value) : undefined)}
                  disabled={!isEditing}
                  min="0"
                  step="100"
                  className={`block w-full px-3 py-2 border rounded-md shadow-sm sm:text-sm ${
                    errors.hourlyWage 
                      ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                      : 'border-gray-300 focus:ring-green-500 focus:border-green-500'
                  } ${!isEditing ? 'bg-gray-50' : 'bg-white'}`}
                />
                {errors.hourlyWage && (
                  <p className="mt-1 text-sm text-red-600">{errors.hourlyWage}</p>
                )}
              </div>

              {/* 基本給 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  基本給（円）
                </label>
                <input
                  type="number"
                  value={editedEmployee.monthlySalary || ''}
                  onChange={(e) => updateField('monthlySalary', e.target.value ? parseInt(e.target.value) : undefined)}
                  disabled={!isEditing}
                  min="0"
                  step="1000"
                  className={`block w-full px-3 py-2 border rounded-md shadow-sm sm:text-sm ${
                    errors.monthlySalary 
                      ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                      : 'border-gray-300 focus:ring-green-500 focus:border-green-500'
                  } ${!isEditing ? 'bg-gray-50' : 'bg-white'}`}
                />
                {errors.monthlySalary && (
                  <p className="mt-1 text-sm text-red-600">{errors.monthlySalary}</p>
                )}
              </div>

              {/* 交通費 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  交通費（円）
                </label>
                <input
                  type="number"
                  value={editedEmployee.transportationAllowance || ''}
                  onChange={(e) => updateField('transportationAllowance', e.target.value ? parseInt(e.target.value) : undefined)}
                  disabled={!isEditing}
                  min="0"
                  step="1000"
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 sm:text-sm"
                />
              </div>

              {/* 食事手当 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  食事手当（円）
                </label>
                <input
                  type="number"
                  value={editedEmployee.mealAllowance || ''}
                  onChange={(e) => updateField('mealAllowance', e.target.value ? parseInt(e.target.value) : undefined)}
                  disabled={!isEditing}
                  min="0"
                  step="1000"
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 sm:text-sm"
                />
              </div>

              {/* 残業倍率 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  残業倍率
                </label>
                <input
                  type="number"
                  value={editedEmployee.overtimeRate || ''}
                  onChange={(e) => updateField('overtimeRate', e.target.value ? parseFloat(e.target.value) : undefined)}
                  disabled={!isEditing}
                  min="1"
                  step="0.1"
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 sm:text-sm"
                />
              </div>
            </div>
          </div>
        </div>

        {/* フッター */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200">
          <div className="flex space-x-2">
            {isEditing && (
              <>
                <button
                  onClick={handleSave}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                >
                  <Save className="w-4 h-4 mr-2" />
                  保存
                </button>
                <button
                  onClick={handleCancel}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                >
                  キャンセル
                </button>
              </>
            )}
          </div>
          
          <div className="flex space-x-2">
            <button
              onClick={handleDelete}
              className="inline-flex items-center px-4 py-2 border border-red-300 rounded-md shadow-sm text-sm font-medium text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              削除
            </button>
            <button
              onClick={onClose}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            >
              閉じる
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
