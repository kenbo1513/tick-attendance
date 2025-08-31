'use client';

import React, { useState } from 'react';
import { Employee } from '@/app/lib/localStorage';
import { X, Save, User, Building, Briefcase, DollarSign, MapPin, Utensils } from 'lucide-react';

interface EmployeeFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (employee: Omit<Employee, 'id'>) => void;
}

export default function EmployeeForm({
  isOpen,
  onClose,
  onSave
}: EmployeeFormProps) {
  const [formData, setFormData] = useState({
    employeeNumber: '',
    name: '',
    department: '',
    position: '',
    hourlyWage: '',
    monthlySalary: '',
    transportationAllowance: '',
    mealAllowance: '',
    overtimeRate: '1.25',
    nightShiftRate: '1.35',
    holidayRate: '1.5',
    hireDate: '',
    isActive: true
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  if (!isOpen) {
    return null;
  }

  // バリデーション
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = '氏名は必須です';
    }

    if (!formData.department.trim()) {
      newErrors.department = '部署は必須です';
    }

    if (!formData.position.trim()) {
      newErrors.position = '役職は必須です';
    }

    if (formData.hourlyWage && parseFloat(formData.hourlyWage) < 0) {
      newErrors.hourlyWage = '時給は0以上である必要があります';
    }

    if (formData.monthlySalary && parseFloat(formData.monthlySalary) < 0) {
      newErrors.monthlySalary = '基本給は0以上である必要があります';
    }

    if (formData.transportationAllowance && parseFloat(formData.transportationAllowance) < 0) {
      newErrors.transportationAllowance = '交通費は0以上である必要があります';
    }

    if (formData.mealAllowance && parseFloat(formData.mealAllowance) < 0) {
      newErrors.mealAllowance = '食事手当は0以上である必要があります';
    }

    if (formData.overtimeRate && parseFloat(formData.overtimeRate) < 1) {
      newErrors.overtimeRate = '残業倍率は1以上である必要があります';
    }

    if (formData.nightShiftRate && parseFloat(formData.nightShiftRate) < 1) {
      newErrors.nightShiftRate = '夜勤手当倍率は1以上である必要があります';
    }

    if (formData.holidayRate && parseFloat(formData.holidayRate) < 1) {
      newErrors.holidayRate = '休日出勤倍率は1以上である必要があります';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // 保存処理
  const handleSave = () => {
    if (validateForm()) {
      const employeeData: Omit<Employee, 'id'> & { employeeNumber?: string } = {
        employeeNumber: formData.employeeNumber.trim() || undefined,
        name: formData.name.trim(),
        department: formData.department.trim(),
        position: formData.position.trim(),
        hourlyWage: formData.hourlyWage ? parseInt(formData.hourlyWage) : undefined,
        monthlySalary: formData.monthlySalary ? parseInt(formData.monthlySalary) : undefined,
        transportationAllowance: formData.transportationAllowance ? parseInt(formData.transportationAllowance) : undefined,
        mealAllowance: formData.mealAllowance ? parseInt(formData.mealAllowance) : undefined,
        overtimeRate: formData.overtimeRate ? parseFloat(formData.overtimeRate) : undefined,
        nightShiftRate: formData.nightShiftRate ? parseFloat(formData.nightShiftRate) : undefined,
        holidayRate: formData.holidayRate ? parseFloat(formData.holidayRate) : undefined,
        hireDate: formData.hireDate || undefined,
        isActive: formData.isActive
      };

      onSave(employeeData);
      handleClose();
    }
  };

  // フォームを閉じる
  const handleClose = () => {
    setFormData({
      employeeNumber: '',
      name: '',
      department: '',
      position: '',
      hourlyWage: '',
      monthlySalary: '',
      transportationAllowance: '',
      mealAllowance: '',
      overtimeRate: '1.25',
      nightShiftRate: '1.35',
      holidayRate: '1.5',
      hireDate: '',
      isActive: true
    });
    setErrors({});
    onClose();
  };

  // フィールド更新
  const updateField = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
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
          <h2 className="text-xl font-semibold text-gray-900">新規社員登録</h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* フォーム */}
        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* 基本情報 */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900 border-b border-gray-200 pb-2 flex items-center">
                <User className="w-5 h-5 mr-2" />
                基本情報
              </h3>
              
              {/* 社員番号 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  社員番号
                </label>
                <input
                  type="text"
                  value={formData.employeeNumber}
                  onChange={(e) => {
                    // 数字のみ入力可能
                    const value = e.target.value.replace(/[^0-9]/g, '');
                    // 4桁以内に制限
                    if (value.length <= 4) {
                      updateField('employeeNumber', value);
                    }
                  }}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 sm:text-sm"
                  placeholder="空欄の場合は自動で4桁の番号を設定"
                  maxLength={4}
                />
                <p className="mt-1 text-xs text-gray-500">
                  4桁の数字で入力してください。空欄の場合は自動で設定されます。
                </p>
              </div>
              
              {/* 氏名 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  氏名 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => updateField('name', e.target.value)}
                  className={`block w-full px-3 py-2 border rounded-md shadow-sm sm:text-sm ${
                    errors.name 
                      ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                      : 'border-gray-300 focus:ring-green-500 focus:border-green-500'
                  }`}
                  placeholder="山田太郎"
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
                  value={formData.department}
                  onChange={(e) => updateField('department', e.target.value)}
                  className={`block w-full px-3 py-2 border rounded-md shadow-sm sm:text-sm ${
                    errors.department 
                      ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                      : 'border-gray-300 focus:ring-green-500 focus:border-green-500'
                  }`}
                  placeholder="営業部"
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
                  value={formData.position}
                  onChange={(e) => updateField('position', e.target.value)}
                  className={`block w-full px-3 py-2 border rounded-md shadow-sm sm:text-sm ${
                    errors.position 
                      ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                      : 'border-gray-300 focus:ring-green-500 focus:border-green-500'
                  }`}
                  placeholder="主任"
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
                  value={formData.hireDate}
                  onChange={(e) => updateField('hireDate', e.target.value)}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 sm:text-sm"
                />
              </div>

              {/* ステータス */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  ステータス
                </label>
                <select
                  value={formData.isActive ? 'active' : 'inactive'}
                  onChange={(e) => updateField('isActive', e.target.value === 'active')}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 sm:text-sm"
                >
                  <option value="active">在籍</option>
                  <option value="inactive">退職</option>
                </select>
              </div>
            </div>

            {/* 給与情報 */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900 border-b border-gray-200 pb-2 flex items-center">
                <DollarSign className="w-5 h-5 mr-2" />
                給与情報
              </h3>
              
              {/* 時給 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  時給（円）
                </label>
                <input
                  type="number"
                  value={formData.hourlyWage}
                  onChange={(e) => updateField('hourlyWage', e.target.value)}
                  min="0"
                  step="100"
                  className={`block w-full px-3 py-2 border rounded-md shadow-sm sm:text-sm ${
                    errors.hourlyWage 
                      ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                      : 'border-gray-300 focus:ring-green-500 focus:border-green-500'
                  }`}
                  placeholder="1000"
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
                  value={formData.monthlySalary}
                  onChange={(e) => updateField('monthlySalary', e.target.value)}
                  min="0"
                  step="1000"
                  className={`block w-full px-3 py-2 border rounded-md shadow-sm sm:text-sm ${
                    errors.monthlySalary 
                      ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                      : 'border-gray-300 focus:ring-green-500 focus:border-green-500'
                  }`}
                  placeholder="250000"
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
                  value={formData.transportationAllowance}
                  onChange={(e) => updateField('transportationAllowance', e.target.value)}
                  min="0"
                  step="1000"
                  className={`block w-full px-3 py-2 border rounded-md shadow-sm sm:text-sm ${
                    errors.transportationAllowance 
                      ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                      : 'border-gray-300 focus:ring-green-500 focus:border-green-500'
                  }`}
                  placeholder="15000"
                />
                {errors.transportationAllowance && (
                  <p className="mt-1 text-sm text-red-600">{errors.transportationAllowance}</p>
                )}
              </div>

              {/* 食事手当 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  食事手当（円）
                </label>
                <input
                  type="number"
                  value={formData.mealAllowance}
                  onChange={(e) => updateField('mealAllowance', e.target.value)}
                  min="0"
                  step="1000"
                  className={`block w-full px-3 py-2 border rounded-md shadow-sm sm:text-sm ${
                    errors.mealAllowance 
                      ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                      : 'border-gray-300 focus:ring-green-500 focus:border-green-500'
                  }`}
                  placeholder="8000"
                />
                {errors.mealAllowance && (
                  <p className="mt-1 text-sm text-red-600">{errors.mealAllowance}</p>
                )}
              </div>

              {/* 残業倍率 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  残業倍率
                </label>
                <input
                  type="number"
                  value={formData.overtimeRate}
                  onChange={(e) => updateField('overtimeRate', e.target.value)}
                  min="1"
                  step="0.1"
                  className={`block w-full px-3 py-2 border rounded-md shadow-sm sm:text-sm ${
                    errors.overtimeRate 
                      ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                      : 'border-gray-300 focus:ring-green-500 focus:border-green-500'
                  }`}
                  placeholder="1.25"
                />
                {errors.overtimeRate && (
                  <p className="mt-1 text-sm text-red-600">{errors.overtimeRate}</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* フッター */}
        <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200">
          <button
            onClick={handleClose}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
          >
            キャンセル
          </button>
          <button
            onClick={handleSave}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
          >
            <Save className="w-4 h-4 mr-2" />
            登録
          </button>
        </div>
      </div>
    </div>
  );
}
