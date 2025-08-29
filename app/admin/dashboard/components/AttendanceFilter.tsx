'use client';

import React, { useState, useEffect } from 'react';
import { Search, Filter, X, Calendar, User, Building, Clock, MapPin, AlertTriangle } from 'lucide-react';
import { format, subDays, startOfDay, endOfDay } from 'date-fns';
import { ja } from 'date-fns/locale';
import { Employee } from '@/app/lib/localStorage';

interface AttendanceFilterProps {
  onSearch: (query: string) => void;
  onFilter: (filters: FilterOptions) => void;
  onDateRangeChange: (dateRange: { start: Date; end: Date }) => void;
  employees: Employee[];
  selectedDateRange: { start: Date; end: Date };
}

interface FilterOptions {
  employeeId: string;
  department: string;
  type: string;
  hasLocation: boolean;
  isAbnormal: boolean;
}

export default function AttendanceFilter({
  onSearch,
  onFilter,
  onDateRangeChange,
  employees,
  selectedDateRange
}: AttendanceFilterProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<FilterOptions>({
    employeeId: '',
    department: '',
    type: '',
    hasLocation: false,
    isAbnormal: false
  });

  // 検索クエリの変更を親コンポーネントに通知
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      onSearch(searchQuery);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery, onSearch]);

  // フィルタの変更を親コンポーネントに通知
  useEffect(() => {
    onFilter(filters);
  }, [filters, onFilter]);

  // フィルタのリセット
  const resetFilters = () => {
    setFilters({
      employeeId: '',
      department: '',
      type: '',
      hasLocation: false,
      isAbnormal: false
    });
  };

  // フィルタの更新
  const updateFilter = (key: keyof FilterOptions, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  // 日付範囲の変更
  const handleDateRangeChange = (type: 'start' | 'end', value: string) => {
    const newDateRange = { ...selectedDateRange };
    if (type === 'start') {
      newDateRange.start = startOfDay(new Date(value));
    } else {
      newDateRange.end = endOfDay(new Date(value));
    }
    onDateRangeChange(newDateRange);
  };

  // クイック日付選択
  const handleQuickDateSelect = (days: number) => {
    const end = endOfDay(new Date());
    const start = startOfDay(subDays(new Date(), days - 1));
    onDateRangeChange({ start, end });
  };

  // アクティブなフィルタの数を計算
  const activeFiltersCount = Object.values(filters).filter(value => 
    value !== '' && value !== false
  ).length;

  // 部署の一覧を取得
  const departments = Array.from(new Set(employees.map(emp => emp.department))).sort();

  // 打刻種別のオプション
  const typeOptions = [
    { value: 'clockIn', label: '出勤' },
    { value: 'clockOut', label: '退勤' },
    { value: 'breakStart', label: '休憩開始' },
    { value: 'breakEnd', label: '休憩終了' }
  ];

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
      <div className="flex flex-col space-y-4">
        {/* 検索バー */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="従業員名、部署、打刻種別で検索..."
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-green-500 focus:border-green-500 sm:text-sm"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
            >
              <X className="h-5 w-5 text-gray-400 hover:text-gray-600" />
            </button>
          )}
        </div>

        {/* 日付範囲選択 */}
        <div className="border-t border-gray-200 pt-4">
          <h3 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
            <Calendar className="w-4 h-4 mr-2" />
            日付範囲
          </h3>
          
          {/* クイック選択 */}
          <div className="flex flex-wrap gap-2 mb-3">
            <button
              onClick={() => handleQuickDateSelect(1)}
              className={`px-3 py-1 text-xs font-medium rounded-md border ${
                selectedDateRange.start.getTime() === startOfDay(new Date()).getTime() &&
                selectedDateRange.end.getTime() === endOfDay(new Date()).getTime()
                  ? 'bg-green-100 text-green-800 border-green-300'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
              }`}
            >
              今日
            </button>
            <button
              onClick={() => handleQuickDateSelect(7)}
              className={`px-3 py-1 text-xs font-medium rounded-md border ${
                selectedDateRange.start.getTime() === startOfDay(subDays(new Date(), 6)).getTime() &&
                selectedDateRange.end.getTime() === endOfDay(new Date()).getTime()
                  ? 'bg-green-100 text-green-800 border-green-300'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
              }`}
            >
              過去7日
            </button>
            <button
              onClick={() => handleQuickDateSelect(30)}
              className={`px-3 py-1 text-xs font-medium rounded-md border ${
                selectedDateRange.start.getTime() === startOfDay(subDays(new Date(), 29)).getTime() &&
                selectedDateRange.end.getTime() === endOfDay(new Date()).getTime()
                  ? 'bg-green-100 text-green-800 border-green-300'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
              }`}
            >
              過去30日
            </button>
            <button
              onClick={() => handleQuickDateSelect(90)}
              className={`px-3 py-1 text-xs font-medium rounded-md border ${
                selectedDateRange.start.getTime() === startOfDay(subDays(new Date(), 89)).getTime() &&
                selectedDateRange.end.getTime() === endOfDay(new Date()).getTime()
                  ? 'bg-green-100 text-green-800 border-green-300'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
              }`}
            >
              過去90日
            </button>
          </div>

          {/* カスタム日付範囲 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">開始日</label>
              <input
                type="date"
                value={format(selectedDateRange.start, 'yyyy-MM-dd')}
                onChange={(e) => handleDateRangeChange('start', e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">終了日</label>
              <input
                type="date"
                value={format(selectedDateRange.end, 'yyyy-MM-dd')}
                onChange={(e) => handleDateRangeChange('end', e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 text-sm"
              />
            </div>
          </div>
        </div>

        {/* フィルタボタン */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
          >
            <Filter className="w-4 h-4 mr-2" />
            フィルタ
            {activeFiltersCount > 0 && (
              <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                {activeFiltersCount}
              </span>
            )}
          </button>
          
          {activeFiltersCount > 0 && (
            <button
              onClick={resetFilters}
              className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            >
              <X className="w-4 h-4 mr-2" />
              フィルタリセット
            </button>
          )}
        </div>

        {/* フィルタパネル */}
        {showFilters && (
          <div className="border-t border-gray-200 pt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* 従業員フィルタ */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <User className="w-4 h-4 inline mr-1" />
                  従業員
                </label>
                <select
                  value={filters.employeeId}
                  onChange={(e) => updateFilter('employeeId', e.target.value)}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                >
                  <option value="">全ての従業員</option>
                  {employees.map((employee) => (
                    <option key={employee.id} value={employee.id}>
                      {employee.name} ({employee.department})
                    </option>
                  ))}
                </select>
              </div>

              {/* 部署フィルタ */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <Building className="w-4 h-4 inline mr-1" />
                  部署
                </label>
                <select
                  value={filters.department}
                  onChange={(e) => updateFilter('department', e.target.value)}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                >
                  <option value="">全ての部署</option>
                  {departments.map((dept) => (
                    <option key={dept} value={dept}>
                      {dept}
                    </option>
                  ))}
                </select>
              </div>

              {/* 打刻種別フィルタ */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <Clock className="w-4 h-4 inline mr-1" />
                  打刻種別
                </label>
                <select
                  value={filters.type}
                  onChange={(e) => updateFilter('type', e.target.value)}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                >
                  <option value="">全ての種別</option>
                  {typeOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* 位置情報フィルタ */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <MapPin className="w-4 h-4 inline mr-1" />
                  位置情報
                </label>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={filters.hasLocation}
                      onChange={(e) => updateFilter('hasLocation', e.target.checked)}
                      className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm text-gray-700">位置情報ありのみ</span>
                  </label>
                </div>
              </div>

              {/* 異常検知フィルタ */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <AlertTriangle className="w-4 h-4 inline mr-1" />
                  異常検知
                </label>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={filters.isAbnormal}
                      onChange={(e) => updateFilter('isAbnormal', e.target.checked)}
                      className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm text-gray-700">異常のみ</span>
                  </label>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
