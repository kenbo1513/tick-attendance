'use client';

import React, { useState, useEffect } from 'react';
import { Search, Filter, X } from 'lucide-react';

interface EmployeeSearchProps {
  onSearch: (query: string) => void;
  onFilter: (filters: FilterOptions) => void;
  departments: string[];
  positions: string[];
}

interface FilterOptions {
  department: string;
  position: string;
  status: string;
  salaryRange: string;
}

export default function EmployeeSearch({
  onSearch,
  onFilter,
  departments,
  positions
}: EmployeeSearchProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<FilterOptions>({
    department: '',
    position: '',
    status: '',
    salaryRange: ''
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
      department: '',
      position: '',
      status: '',
      salaryRange: ''
    });
  };

  // フィルタの更新
  const updateFilter = (key: keyof FilterOptions, value: string) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  // アクティブなフィルタの数を計算
  const activeFiltersCount = Object.values(filters).filter(value => value !== '').length;

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 sm:p-4 mb-4 sm:mb-6">
      <div className="flex flex-col space-y-3 sm:space-y-4">
        {/* 検索バー */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="社員名、部署、役職で検索..."
            className="block w-full pl-9 sm:pl-10 pr-3 py-2 sm:py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-green-500 focus:border-green-500 text-sm"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
            >
              <X className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400 hover:text-gray-600" />
            </button>
          )}
        </div>

        {/* フィルタボタン */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="inline-flex items-center justify-center px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
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
              className="inline-flex items-center justify-center px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            >
              <X className="w-4 h-4 mr-2" />
              フィルタリセット
            </button>
          )}
        </div>

        {/* フィルタパネル */}
        {showFilters && (
          <div className="border-t border-gray-200 pt-3 sm:pt-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              {/* 部署フィルタ */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
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

              {/* 役職フィルタ */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  役職
                </label>
                <select
                  value={filters.position}
                  onChange={(e) => updateFilter('position', e.target.value)}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                >
                  <option value="">全ての役職</option>
                  {positions.map((pos) => (
                    <option key={pos} value={pos}>
                      {pos}
                    </option>
                  ))}
                </select>
              </div>

              {/* ステータスフィルタ */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  ステータス
                </label>
                <select
                  value={filters.status}
                  onChange={(e) => updateFilter('status', e.target.value)}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                >
                  <option value="">全てのステータス</option>
                  <option value="active">在籍</option>
                  <option value="inactive">退職</option>
                </select>
              </div>

              {/* 給与範囲フィルタ */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  給与範囲
                </label>
                <select
                  value={filters.salaryRange}
                  onChange={(e) => updateFilter('salaryRange', e.target.value)}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                >
                  <option value="">全ての給与</option>
                  <option value="low">20万円未満</option>
                  <option value="medium">20万円〜40万円</option>
                  <option value="high">40万円以上</option>
                </select>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
