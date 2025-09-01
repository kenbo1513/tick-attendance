'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { TimeRecord, Employee } from '@/app/lib/localStorage';
import TimeRecordList from './TimeRecordList';
import TimeRecordDetail from './TimeRecordDetail';
import TimeRecordEdit from './TimeRecordEdit';
import AttendanceFilter from './AttendanceFilter';
import { format, subDays, startOfDay, endOfDay } from 'date-fns';

interface AttendanceManagementProps {
  timeRecords?: TimeRecord[];
  employees?: Employee[];
}

export default function AttendanceManagement({ timeRecords: propTimeRecords, employees: propEmployees }: AttendanceManagementProps) {
  const [timeRecords, setTimeRecords] = useState<TimeRecord[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [filteredRecords, setFilteredRecords] = useState<TimeRecord[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    employeeId: '',
    department: '',
    type: '',
    hasLocation: false
  });
  const [selectedDateRange, setSelectedDateRange] = useState({
    start: startOfDay(subDays(new Date(), 30)), // 過去30日
    end: endOfDay(new Date())
  });
  
  // モーダル状態
  const [showTimeRecordDetail, setShowTimeRecordDetail] = useState(false);
  const [showTimeRecordEdit, setShowTimeRecordEdit] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<TimeRecord | null>(null);

  // 初期データ読み込み
  useEffect(() => {
    const loadData = () => {
      // 社員データを先に読み込み
      const savedAppData = localStorage.getItem('tick_app_data');
      let actualEmployees: Employee[] = [];
      
      if (savedAppData) {
        try {
          const appData = JSON.parse(savedAppData);
          actualEmployees = appData.employees || [];
          console.log('読み込まれた社員データ:', actualEmployees);
        } catch (error) {
          console.error('社員データの読み込みエラー:', error);
        }
      }
      
      // 共有端末からの打刻データを読み込み
      const savedTimeRecords = localStorage.getItem('tick_timeRecords');
      let actualRecords: TimeRecord[] = [];
      
      if (savedTimeRecords) {
        try {
          const parsedRecords = JSON.parse(savedTimeRecords);
          actualRecords = parsedRecords;
          console.log('読み込まれた打刻データ:', actualRecords);
        } catch (error) {
          console.error('打刻データの読み込みエラー:', error);
        }
      }
      
      // 打刻データがない場合はモックデータを使用
      if (actualRecords.length === 0) {
        console.log('打刻データが見つからないため、モックデータを使用します');
        const mockRecords: TimeRecord[] = [
          {
            id: '1',
            employeeId: '0001',
            employeeName: '田中太郎',
            type: 'clockIn',
            time: '09:00',
            date: '2025-01-27',
            location: '東京都渋谷区',
            ipAddress: '192.168.1.100',
            deviceInfo: 'iPhone 14, Chrome 120.0',
            notes: ''
          }
        ];
        actualRecords = mockRecords;
      }
      
      // propsから渡されたデータを優先、なければlocalStorageから読み込み
      const finalTimeRecords = propTimeRecords || actualRecords;
      const finalEmployees = propEmployees || actualEmployees;
      
      // 打刻データの社員名と部署を最新の社員データで更新
      const updatedTimeRecords = finalTimeRecords.map(record => {
        // 社員データから該当する社員を検索
        const mappedEmployee = finalEmployees.find(emp => emp.id === record.employeeId);
        
        if (mappedEmployee) {
          return {
            ...record,
            employeeName: mappedEmployee.name,
            department: mappedEmployee.department || '不明'
          };
        } else {
          // 社員が見つからない場合は元のデータを返す
          return {
            ...record,
            employeeName: record.employeeName || '不明',
            department: record.department || '不明'
          };
        }
      });
      
      // 更新された打刻データをlocalStorageに保存
      const hasChanges = updatedTimeRecords.some((record, index) => {
        const original = finalTimeRecords[index];
        return record.employeeName !== original.employeeName || record.department !== original.department;
      });
      
      if (hasChanges) {
        localStorage.setItem('tick_timeRecords', JSON.stringify(updatedTimeRecords));
        console.log('打刻データの社員名と部署を更新しました');
      }
      
      setTimeRecords(updatedTimeRecords);
      setFilteredRecords(updatedTimeRecords);
      setEmployees(finalEmployees);
    };

    loadData();
    
    // 5分間隔でデータを更新
    const interval = setInterval(loadData, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, [propTimeRecords, propEmployees]);

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

    setFilteredRecords(result);
  }, [timeRecords, searchQuery, filters, selectedDateRange, employees]);

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
      ['日付', '時刻', '社員番号', '社員名', '部署', '打刻種別', '位置情報', 'IPアドレス', 'デバイス情報', 'メモ'],
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
    </div>
  );
}
