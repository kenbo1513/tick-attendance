'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { TimeRecord, Employee } from '@/app/lib/localStorage';
import { Clock, MapPin, AlertTriangle, Download, Edit, Eye, Calendar, User, Building } from 'lucide-react';
import { format, parseISO, differenceInMinutes, isToday, isYesterday } from 'date-fns';
import { ja } from 'date-fns/locale';

interface TimeRecordListProps {
  timeRecords: TimeRecord[];
  employees: Employee[];
  onView: (record: TimeRecord) => void;
  onEdit: (record: TimeRecord) => void;
  onExportCSV: () => void;
  selectedDateRange: { start: Date; end: Date };
}

interface WorkTimeSummary {
  totalWorkMinutes: number;
  totalBreakMinutes: number;
  overtimeMinutes: number;
  isAbnormal: boolean;
  abnormalReasons: string[];
}

export default function TimeRecordList({
  timeRecords,
  employees,
  onView,
  onEdit,
  onExportCSV,
  selectedDateRange
}: TimeRecordListProps) {
  const [sortConfig, setSortConfig] = useState<{ key: keyof TimeRecord; direction: 'asc' | 'desc' }>({
    key: 'date',
    direction: 'desc'
  });
  const [currentPage, setCurrentPage] = useState(0);
  const [itemsPerPage] = useState(20);

  // 並び替え機能
  const handleSort = (key: keyof TimeRecord) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  // ソートされた記録リスト
  const sortedRecords = useMemo(() => {
    return [...timeRecords].sort((a, b) => {
      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];
      
      if (sortConfig.key === 'date' || sortConfig.key === 'time') {
        const aDate = new Date(`${a.date} ${a.time}`);
        const bDate = new Date(`${b.date} ${b.time}`);
        return sortConfig.direction === 'asc' ? aDate.getTime() - bDate.getTime() : bDate.getTime() - aDate.getTime();
      }
      
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortConfig.direction === 'asc' 
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }
      
      return 0;
    });
  }, [timeRecords, sortConfig]);

  // ページネーション
  const pageCount = Math.ceil(sortedRecords.length / itemsPerPage);
  const startIndex = currentPage * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentRecords = sortedRecords.slice(startIndex, endIndex);

  // 労働時間の計算
  const calculateWorkTime = (employeeId: string, date: string): WorkTimeSummary => {
    const dayRecords = timeRecords.filter(record => 
      record.employeeId === employeeId && record.date === date
    );
    
    let totalWorkMinutes = 0;
    let totalBreakMinutes = 0;
    let overtimeMinutes = 0;
    const abnormalReasons: string[] = [];
    
    // 出勤・退勤のペアを見つける
    const clockInRecords = dayRecords.filter(r => r.type === 'clockIn');
    const clockOutRecords = dayRecords.filter(r => r.type === 'clockOut');
    
    clockInRecords.forEach(clockIn => {
      const clockOut = clockOutRecords.find(co => 
        new Date(co.time) > new Date(clockIn.time)
      );
      
      if (clockOut) {
        const workMinutes = differenceInMinutes(new Date(clockOut.time), new Date(clockIn.time));
        totalWorkMinutes += workMinutes;
        
        // 8時間（480分）を超える場合は残業
        if (workMinutes > 480) {
          overtimeMinutes += workMinutes - 480;
        }
        
        // 12時間（720分）を超える場合は異常
        if (workMinutes > 720) {
          abnormalReasons.push('12時間超勤務');
        }
      } else {
        abnormalReasons.push('退勤記録なし');
      }
    });
    
    // 休憩時間の計算
    const breakStartRecords = dayRecords.filter(r => r.type === 'breakStart');
    const breakEndRecords = dayRecords.filter(r => r.type === 'breakEnd');
    
    breakStartRecords.forEach(breakStart => {
      const breakEnd = breakEndRecords.find(be => 
        new Date(be.time) > new Date(breakStart.time)
      );
      
      if (breakEnd) {
        const breakMinutes = differenceInMinutes(new Date(breakEnd.time), new Date(breakStart.time));
        totalBreakMinutes += breakMinutes;
      }
    });
    
    // 異常判定
    const isAbnormal = abnormalReasons.length > 0 || totalWorkMinutes > 720;
    
    return {
      totalWorkMinutes,
      totalBreakMinutes,
      overtimeMinutes,
      isAbnormal,
      abnormalReasons
    };
  };

  // 従業員名を取得
  const getEmployeeName = (employeeId: string): string => {
    const employee = employees.find(emp => emp.id === employeeId);
    return employee ? employee.name : '不明';
  };

  // 従業員の部署を取得
  const getEmployeeDepartment = (employeeId: string): string => {
    const employee = employees.find(emp => emp.id === employeeId);
    return employee ? employee.department : '不明';
  };

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
    if (isToday(date)) return '今日';
    if (isYesterday(date)) return '昨日';
    return format(date, 'M/d (E)', { locale: ja });
  };

  // 時間の表示形式
  const formatTime = (timeStr: string): string => {
    return format(parseISO(`2000-01-01T${timeStr}`), 'HH:mm');
  };

  // 労働時間の表示形式
  const formatWorkTime = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}:${mins.toString().padStart(2, '0')}`;
  };

  // 並び替えアイコン
  const getSortIcon = (key: keyof TimeRecord) => {
    if (sortConfig.key !== key) {
      return <span className="text-gray-400">↕</span>;
    }
    return sortConfig.direction === 'asc' ? '↑' : '↓';
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      {/* ヘッダー */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">勤務記録一覧</h2>
          <div className="flex items-center space-x-3">
            <div className="text-sm text-gray-600">
              {timeRecords.length}件の記録
            </div>
            <button
              onClick={onExportCSV}
              className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            >
              <Download className="w-4 h-4 mr-2" />
              CSV出力
            </button>
          </div>
        </div>
      </div>

      {/* テーブル */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th
                onClick={() => handleSort('date')}
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
              >
                <div className="flex items-center space-x-1">
                  <Calendar className="w-4 h-4" />
                  <span>日付</span>
                  <span className="text-sm">{getSortIcon('date')}</span>
                </div>
              </th>
              <th
                onClick={() => handleSort('time')}
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
              >
                <div className="flex items-center space-x-1">
                  <Clock className="w-4 h-4" />
                  <span>時刻</span>
                  <span className="text-sm">{getSortIcon('time')}</span>
                </div>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <div className="flex items-center space-x-1">
                  <User className="w-4 h-4" />
                  <span>社員</span>
                </div>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <div className="flex items-center space-x-1">
                  <Building className="w-4 h-4" />
                  <span>部署</span>
                </div>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <div className="flex items-center space-x-1">
                  <Clock className="w-4 h-4" />
                  <span>打刻種別</span>
                </div>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <div className="flex items-center space-x-1">
                  <Clock className="w-4 h-4" />
                  <span>労働時間</span>
                </div>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <div className="flex items-center space-x-1">
                  <MapPin className="w-4 h-4" />
                  <span>位置情報</span>
                </div>
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                操作
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {currentRecords.map((record) => {
              const workTime = calculateWorkTime(record.employeeId, record.date);
              const employeeName = getEmployeeName(record.employeeId);
              const department = getEmployeeDepartment(record.employeeId);
              
              return (
                <tr 
                  key={record.id} 
                  className={`hover:bg-gray-50 ${
                    workTime.isAbnormal ? 'bg-red-50 border-l-4 border-l-red-400' : ''
                  }`}
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div className="flex flex-col">
                      <span className="font-medium">{formatDate(record.date)}</span>
                      <span className="text-xs text-gray-500">{record.date}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-mono">
                    {formatTime(record.time)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div className="flex flex-col">
                      <span className="font-medium">{employeeName}</span>
                      <span className="text-xs text-gray-500">ID: {record.employeeId}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {department}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full border ${getTypeColor(record.type)}`}>
                      {getTypeLabel(record.type)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div className="flex flex-col">
                      <span className="font-medium">
                        {workTime.totalWorkMinutes > 0 ? formatWorkTime(workTime.totalWorkMinutes) : '-'}
                      </span>
                      {workTime.overtimeMinutes > 0 && (
                        <span className="text-xs text-red-600">
                          残業: {formatWorkTime(workTime.overtimeMinutes)}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {record.location ? (
                      <div className="flex items-center space-x-1">
                        <MapPin className="w-3 h-3" />
                        <span>{record.location}</span>
                      </div>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end space-x-2">
                      {workTime.isAbnormal && (
                        <div className="flex items-center space-x-1 text-red-600" title={workTime.abnormalReasons.join(', ')}>
                          <AlertTriangle className="w-4 h-4" />
                        </div>
                      )}
                      <button
                        onClick={() => onView(record)}
                        className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50"
                        title="詳細表示"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onEdit(record)}
                        className="text-green-600 hover:text-green-900 p-1 rounded hover:bg-green-50"
                        title="編集"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* ページネーション */}
      {pageCount > 1 && (
        <div className="px-6 py-4 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-700">
              <span>
                {startIndex + 1} - {Math.min(endIndex, sortedRecords.length)} / {sortedRecords.length} 件
              </span>
            </div>
            <div className="flex space-x-2">
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
      {timeRecords.length === 0 && (
        <div className="px-6 py-12 text-center">
          <div className="text-gray-500">
            <Clock className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">勤務記録がありません</h3>
            <p className="text-gray-500">選択された期間に勤務記録が存在しません。</p>
          </div>
        </div>
      )}
    </div>
  );
}
