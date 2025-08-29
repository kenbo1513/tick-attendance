'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { TimeRecord, Employee } from '@/app/lib/localStorage';
import TimeRecordList from './TimeRecordList';
import TimeRecordDetail from './TimeRecordDetail';
import TimeRecordEdit from './TimeRecordEdit';
import AttendanceFilter from './AttendanceFilter';
import AlertPanel from './AlertPanel';
import { format, subDays, startOfDay, endOfDay } from 'date-fns';

export default function AttendanceManagement() {
  const [timeRecords, setTimeRecords] = useState<TimeRecord[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [filteredRecords, setFilteredRecords] = useState<TimeRecord[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    employeeId: '',
    department: '',
    type: '',
    hasLocation: false,
    isAbnormal: false
  });
  const [selectedDateRange, setSelectedDateRange] = useState({
    start: startOfDay(subDays(new Date(), 30)), // 過去30日
    end: endOfDay(new Date())
  });
  
  // モーダル状態
  const [showTimeRecordDetail, setShowTimeRecordDetail] = useState(false);
  const [showTimeRecordEdit, setShowTimeRecordEdit] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<TimeRecord | null>(null);
  
  // アラートパネルの状態
  const [isAlertPanelVisible, setIsAlertPanelVisible] = useState(false);

  // 初期データ読み込み
  useEffect(() => {
    const loadData = () => {
      // 実際の実装では、APIからデータを取得
      // ここでは仮のデータを使用
      const mockRecords: TimeRecord[] = [
        {
          id: '1',
          employeeId: '12345',
          employeeName: '田中太郎',
          type: 'clockIn',
          time: '09:00',
          date: '2024-01-15',
          location: '東京都渋谷区',
          ipAddress: '192.168.1.100',
          deviceInfo: 'iPhone 14, Chrome 120.0',
          notes: ''
        },
        {
          id: '2',
          employeeId: '12345',
          employeeName: '田中太郎',
          type: 'clockOut',
          time: '18:00',
          date: '2024-01-15',
          location: '東京都渋谷区',
          ipAddress: '192.168.1.100',
          deviceInfo: 'iPhone 14, Chrome 120.0',
          notes: ''
        }
      ];
      
      setTimeRecords(mockRecords);
      setFilteredRecords(mockRecords);
    };

    loadData();
  }, []);

  // 検索とフィルタリングの適用
  useEffect(() => {
    let result = [...timeRecords];

    // 日付範囲フィルタ
    result = result.filter(record => {
      const recordDate = new Date(record.date);
      return recordDate >= selectedDateRange.start && recordDate <= selectedDateRange.end;
    });

    // 検索クエリの適用
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(record =>
        record.employeeName.toLowerCase().includes(query) ||
        record.employeeId.toLowerCase().includes(query) ||
        record.type.toLowerCase().includes(query)
      );
    }

    // フィルタの適用
    if (filters.employeeId) {
      result = result.filter(record => record.employeeId === filters.employeeId);
    }

    if (filters.department) {
      const employeeIds = employees
        .filter(emp => emp.department === filters.department)
        .map(emp => emp.id);
      result = result.filter(record => employeeIds.includes(record.employeeId));
    }

    if (filters.type) {
      result = result.filter(record => record.type === filters.type);
    }

    if (filters.hasLocation) {
      result = result.filter(record => record.location && record.location.trim() !== '');
    }

    if (filters.isAbnormal) {
      // 異常検知ロジックを適用
      result = result.filter(record => {
        // 簡易的な異常判定（実際の実装ではより詳細なロジックが必要）
        return false; // 仮の実装
      });
    }

    setFilteredRecords(result);
  }, [timeRecords, searchQuery, filters, selectedDateRange, employees]);

  // 従業員データの読み込み（実際の実装ではAPIから取得）
  useEffect(() => {
    const mockEmployees: Employee[] = [
      {
        id: '12345',
        name: '田中太郎',
        department: '営業部',
        position: '主任',
        hourlyWage: 1200,
        monthlySalary: 250000,
        isActive: true
      }
    ];
    setEmployees(mockEmployees);
  }, []);

  // 勤務記録詳細表示
  const handleViewRecord = (record: TimeRecord) => {
    setSelectedRecord(record);
    setShowTimeRecordDetail(true);
  };

  // 勤務記録編集
  const handleEditRecord = (record: TimeRecord) => {
    setSelectedRecord(record);
    setShowTimeRecordEdit(true);
  };

  // 勤務記録更新
  const handleUpdateRecord = (updatedRecord: TimeRecord) => {
    setTimeRecords(prev => prev.map(record => 
      record.id === updatedRecord.id ? updatedRecord : record
    ));
    setShowTimeRecordEdit(false);
    setSelectedRecord(null);
  };

  // CSV出力
  const handleExportCSV = () => {
    const csvContent = [
      ['日付', '時刻', '従業員ID', '従業員名', '部署', '打刻種別', '位置情報', 'IPアドレス', 'デバイス情報', 'メモ'],
      ...filteredRecords.map(record => {
        const employee = employees.find(emp => emp.id === record.employeeId);
        return [
          record.date,
          record.time,
          record.employeeId,
          record.employeeName,
          employee?.department || '',
          record.type,
          record.location || '',
          record.ipAddress || '',
          record.deviceInfo || '',
          record.notes || ''
        ];
      })
    ].map(row => row.map(field => `"${field}"`).join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `勤務記録_${format(selectedDateRange.start, 'yyyyMMdd')}_${format(selectedDateRange.end, 'yyyyMMdd')}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // リアルタイム更新（5分間隔）
  useEffect(() => {
    const interval = setInterval(() => {
      // 実際の実装では、APIから最新データを取得
      console.log('リアルタイム更新実行:', new Date().toISOString());
    }, 5 * 60 * 1000); // 5分

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-6">
      {/* 検索・フィルタ */}
      <AttendanceFilter
        onSearch={setSearchQuery}
        onFilter={setFilters}
        onDateRangeChange={setSelectedDateRange}
        employees={employees}
        selectedDateRange={selectedDateRange}
      />

      {/* 勤務記録一覧 */}
      <TimeRecordList
        timeRecords={filteredRecords}
        employees={employees}
        onView={handleViewRecord}
        onEdit={handleEditRecord}
        onExportCSV={handleExportCSV}
        selectedDateRange={selectedDateRange}
      />

      {/* 勤務記録詳細モーダル */}
      <TimeRecordDetail
        record={selectedRecord}
        employees={employees}
        isOpen={showTimeRecordDetail}
        onClose={() => {
          setShowTimeRecordDetail(false);
          setSelectedRecord(null);
        }}
      />

      {/* 勤務記録編集モーダル */}
      <TimeRecordEdit
        record={selectedRecord}
        employees={employees}
        isOpen={showTimeRecordEdit}
        onClose={() => {
          setShowTimeRecordEdit(false);
          setSelectedRecord(null);
        }}
        onSave={handleUpdateRecord}
      />

      {/* 異常検知アラートパネル */}
      <AlertPanel
        timeRecords={timeRecords}
        employees={employees}
        isVisible={isAlertPanelVisible}
        onToggleVisibility={() => setIsAlertPanelVisible(!isAlertPanelVisible)}
      />
    </div>
  );
}
