'use client';

import React, { useState } from 'react';
import { Employee } from '@/app/lib/localStorage';
import { Edit, Trash2, Eye, Plus, Download, Upload, Users } from 'lucide-react';

interface EmployeeListProps {
  employees: Employee[];
  onEdit: (employee: Employee) => void;
  onDelete: (employeeId: string) => void;
  onView: (employee: Employee) => void;
  onAdd: () => void;
  onExportCSV: () => void;
  onImportCSV: () => void;
}

interface SortConfig {
  key: keyof Employee;
  direction: 'asc' | 'desc';
}

export default function EmployeeList({
  employees,
  onEdit,
  onDelete,
  onView,
  onAdd,
  onExportCSV,
  onImportCSV
}: EmployeeListProps) {
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: 'name', direction: 'asc' });
  const [currentPage, setCurrentPage] = useState(0);
  const [itemsPerPage] = useState(10);

  // 並び替え機能
  const handleSort = (key: keyof Employee) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  // ソートされた従業員リスト
  const sortedEmployees = [...employees].sort((a, b) => {
    const aValue = a[sortConfig.key];
    const bValue = b[sortConfig.key];
    
    if (aValue === undefined && bValue === undefined) return 0;
    if (aValue === undefined) return 1;
    if (bValue === undefined) return -1;
    
    if (typeof aValue === 'string' && typeof bValue === 'string') {
      return sortConfig.direction === 'asc' 
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue);
    }
    
    if (typeof aValue === 'number' && typeof bValue === 'number') {
      return sortConfig.direction === 'asc' ? aValue - bValue : bValue - aValue;
    }
    
    return 0;
  });

  // ページネーション
  const pageCount = Math.ceil(sortedEmployees.length / itemsPerPage);
  const startIndex = currentPage * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentEmployees = sortedEmployees.slice(startIndex, endIndex);

  const handlePageChange = (selectedItem: { selected: number }) => {
    setCurrentPage(selectedItem.selected);
  };

  // 並び替えアイコン
  const getSortIcon = (key: keyof Employee) => {
    if (sortConfig.key !== key) {
      return <span className="text-gray-400">↕</span>;
    }
    return sortConfig.direction === 'asc' ? '↑' : '↓';
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      {/* ヘッダー */}
      <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
          <h2 className="text-lg font-semibold text-gray-900">社員一覧</h2>
          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
            <button
              onClick={onImportCSV}
              className="inline-flex items-center justify-center px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            >
              <Upload className="w-4 h-4 mr-2" />
              <span className="hidden xs:inline">CSV一括登録</span>
              <span className="xs:hidden">CSV登録</span>
            </button>
            <button
              onClick={onExportCSV}
              className="inline-flex items-center justify-center px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            >
              <Download className="w-4 h-4 mr-2" />
              <span className="hidden xs:inline">CSV出力</span>
              <span className="xs:hidden">CSV出力</span>
            </button>
            <button
              onClick={onAdd}
              className="inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            >
              <Plus className="w-4 h-4 mr-2" />
              社員追加
            </button>
          </div>
        </div>
      </div>

      {/* テーブル */}
      <div className="overflow-x-auto hidden md:block">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th
                onClick={() => handleSort('id')}
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
              >
                <div className="flex items-center space-x-1">
                  <span>社員番号</span>
                  <span className="text-sm">{getSortIcon('id')}</span>
                </div>
              </th>
              <th
                onClick={() => handleSort('name')}
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
              >
                <div className="flex items-center space-x-1">
                  <span>氏名</span>
                  <span className="text-sm">{getSortIcon('name')}</span>
                </div>
              </th>
              <th
                onClick={() => handleSort('department')}
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
              >
                <div className="flex items-center space-x-1">
                  <span>部署</span>
                  <span className="text-sm">{getSortIcon('department')}</span>
                </div>
              </th>
              <th
                onClick={() => handleSort('position')}
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
              >
                <div className="flex items-center space-x-1">
                  <span>役職</span>
                  <span className="text-sm">{getSortIcon('position')}</span>
                </div>
              </th>
              <th
                onClick={() => handleSort('hourlyWage')}
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
              >
                <div className="flex items-center space-x-1">
                  <span>時給</span>
                  <span className="text-sm">{getSortIcon('hourlyWage')}</span>
                </div>
              </th>
              <th
                onClick={() => handleSort('monthlySalary')}
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
              >
                <div className="flex items-center space-x-1">
                  <span>基本給</span>
                  <span className="text-sm">{getSortIcon('monthlySalary')}</span>
                </div>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                ステータス
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                操作
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {currentEmployees.map((employee) => (
              <tr key={employee.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {employee.id}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {employee.name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {employee.department}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {employee.position}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {employee.hourlyWage ? `${employee.hourlyWage.toLocaleString()}円` : '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {employee.monthlySalary ? `${employee.monthlySalary.toLocaleString()}円` : '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    employee.isActive 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {employee.isActive ? '在籍' : '退職'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex items-center justify-end space-x-2">
                    <button
                      onClick={() => onView(employee)}
                      className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50"
                      title="詳細表示"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onEdit(employee)}
                      className="text-green-600 hover:text-green-900 p-1 rounded hover:bg-green-50"
                      title="編集"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onDelete(employee.id)}
                      className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50"
                      title="削除"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* モバイルカード一覧 */}
      <div className="md:hidden divide-y divide-gray-200">
        {currentEmployees.map((employee) => (
          <div key={employee.id} className="p-4">
            <div className="flex items-start justify-between">
              <div>
                <div className="text-xs text-gray-500">社員番号</div>
                <div className="font-medium text-gray-900">{employee.id}</div>
                <div className="mt-1 text-gray-900">{employee.name}</div>
                <div className="text-xs text-gray-500">{employee.department} ・ {employee.position}</div>
              </div>
              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                employee.isActive 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'
              }`}>
                {employee.isActive ? '在籍' : '退職'}
              </span>
            </div>

            <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
              <div className="bg-gray-50 rounded p-2">
                <div className="text-gray-500 text-xs">時給</div>
                <div className="text-gray-900">{employee.hourlyWage ? `${employee.hourlyWage.toLocaleString()}円` : '-'}</div>
              </div>
              <div className="bg-gray-50 rounded p-2">
                <div className="text-gray-500 text-xs">基本給</div>
                <div className="text-gray-900">{employee.monthlySalary ? `${employee.monthlySalary.toLocaleString()}円` : '-'}</div>
              </div>
            </div>

            <div className="mt-3 flex items-center justify-end space-x-2">
              <button
                onClick={() => onView(employee)}
                className="text-blue-600 hover:text-blue-900 px-2 py-1 text-sm rounded hover:bg-blue-50"
                title="詳細表示"
              >
                <Eye className="w-4 h-4" />
              </button>
              <button
                onClick={() => onEdit(employee)}
                className="text-green-600 hover:text-green-900 px-2 py-1 text-sm rounded hover:bg-green-50"
                title="編集"
              >
                <Edit className="w-4 h-4" />
              </button>
              <button
                onClick={() => onDelete(employee.id)}
                className="text-red-600 hover:text-red-900 px-2 py-1 text-sm rounded hover:bg-red-50"
                title="削除"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* ページネーション */}
      {pageCount > 1 && (
        <div className="px-4 sm:px-6 py-3 sm:py-4 border-t border-gray-200">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
            <div className="text-sm text-gray-700 text-center sm:text-left">
              <span>
                {startIndex + 1} - {Math.min(endIndex, sortedEmployees.length)} / {sortedEmployees.length} 件
              </span>
            </div>
            <div className="flex justify-center sm:justify-end space-x-2">
              <button
                onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
                disabled={currentPage === 0}
                className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                前へ
              </button>
              {Array.from({ length: Math.min(5, pageCount) }, (_, i) => {
                const page = Math.max(0, Math.min(pageCount - 5, currentPage - 2)) + i;
                if (page >= pageCount) return null;
                
                return (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`px-3 py-2 text-sm font-medium rounded-md ${
                      currentPage === page
                        ? 'text-white bg-green-600 border border-green-600'
                        : 'text-gray-500 bg-white border border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {page + 1}
                  </button>
                );
              })}
              <button
                onClick={() => setCurrentPage(Math.min(pageCount - 1, currentPage + 1))}
                disabled={currentPage === pageCount - 1}
                className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                次へ
              </button>
            </div>
          </div>
        </div>
      )}

      {/* データが空の場合 */}
      {employees.length === 0 && (
        <div className="px-4 sm:px-6 py-8 sm:py-12 text-center">
          <div className="text-gray-500">
            <Users className="w-8 h-8 sm:w-12 sm:h-12 mx-auto mb-3 sm:mb-4 text-gray-300" />
            <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">従業員が登録されていません</h3>
            <p className="text-sm sm:text-base text-gray-500">従業員追加ボタンから最初の従業員を登録してください。</p>
          </div>
        </div>
      )}
    </div>
  );
}
