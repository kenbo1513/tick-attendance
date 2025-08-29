'use client';

import React, { useState, useEffect } from 'react';
import { AlertTriangle, Clock, User, MapPin, X, Bell, BellOff, RefreshCw } from 'lucide-react';
import { TimeRecord, Employee } from '@/app/lib/localStorage';
import { format, parseISO, differenceInMinutes } from 'date-fns';
import { ja } from 'date-fns/locale';

interface AlertPanelProps {
  timeRecords: TimeRecord[];
  employees: Employee[];
  isVisible: boolean;
  onToggleVisibility: () => void;
}

interface AlertItem {
  id: string;
  type: 'overtime' | 'missing_clockout' | 'late_clockin' | 'early_clockout' | 'location_mismatch' | 'multiple_clockin';
  severity: 'low' | 'medium' | 'high';
  employeeId: string;
  employeeName: string;
  department: string;
  date: string;
  time: string;
  description: string;
  details: string;
  isAcknowledged: boolean;
  createdAt: Date;
}

export default function AlertPanel({
  timeRecords,
  employees,
  isVisible,
  onToggleVisibility
}: AlertPanelProps) {
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [isExpanded, setIsExpanded] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [lastRefresh, setLastRefresh] = useState(new Date());

  // 異常検知の実行
  useEffect(() => {
    if (isVisible) {
      detectAnomalies();
    }
  }, [timeRecords, isVisible]);

  // 自動更新（5分間隔）
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      detectAnomalies();
      setLastRefresh(new Date());
    }, 5 * 60 * 1000); // 5分

    return () => clearInterval(interval);
  }, [autoRefresh, timeRecords]);

  // 異常検知ロジック
  const detectAnomalies = () => {
    const newAlerts: AlertItem[] = [];
    const today = new Date();
    const todayStr = format(today, 'yyyy-MM-dd');

    // 今日の記録のみを対象
    const todayRecords = timeRecords.filter(record => record.date === todayStr);

    // 従業員ごとに異常をチェック
    employees.forEach(employee => {
      const employeeRecords = todayRecords.filter(record => record.employeeId === employee.id);
      
      if (employeeRecords.length === 0) return;

      // 出勤・退勤のペアをチェック
      const clockInRecords = employeeRecords.filter(r => r.type === 'clockIn');
      const clockOutRecords = employeeRecords.filter(r => r.type === 'clockOut');

      // 退勤記録なしのチェック
      clockInRecords.forEach(clockIn => {
        const hasClockOut = clockOutRecords.some(co => 
          new Date(co.time) > new Date(clockIn.time)
        );

        if (!hasClockOut) {
          newAlerts.push({
            id: `missing_clockout_${employee.id}_${clockIn.id}`,
            type: 'missing_clockout',
            severity: 'high',
            employeeId: employee.id,
            employeeName: employee.name,
            department: employee.department,
            date: clockIn.date,
            time: clockIn.time,
            description: '退勤記録なし',
            details: `${format(parseISO(clockIn.time), 'HH:mm')}に出勤したが、退勤記録がありません`,
            isAcknowledged: false,
            createdAt: new Date()
          });
        }
      });

      // 労働時間のチェック
      clockInRecords.forEach(clockIn => {
        const clockOut = clockOutRecords.find(co => 
          new Date(co.time) > new Date(clockIn.time)
        );

        if (clockOut) {
          const workMinutes = differenceInMinutes(new Date(clockOut.time), new Date(clockIn.time));
          
          // 12時間超勤務
          if (workMinutes > 720) {
            newAlerts.push({
              id: `overtime_${employee.id}_${clockIn.id}`,
              type: 'overtime',
              severity: 'high',
              employeeId: employee.id,
              employeeName: employee.name,
              department: employee.department,
              date: clockIn.date,
              time: clockIn.time,
              description: '12時間超勤務',
              details: `${Math.floor(workMinutes / 60)}時間${workMinutes % 60}分の勤務（12時間超過）`,
              isAcknowledged: false,
              createdAt: new Date()
            });
          }
          // 10時間超勤務
          else if (workMinutes > 600) {
            newAlerts.push({
              id: `overtime_${employee.id}_${clockIn.id}`,
              type: 'overtime',
              severity: 'medium',
              employeeId: employee.id,
              employeeName: employee.name,
              department: employee.department,
              date: clockIn.date,
              time: clockIn.time,
              description: '10時間超勤務',
              details: `${Math.floor(workMinutes / 60)}時間${workMinutes % 60}分の勤務（10時間超過）`,
              isAcknowledged: false,
              createdAt: new Date()
            });
          }
        }
      });

      // 複数回出勤のチェック
      if (clockInRecords.length > 1) {
        newAlerts.push({
          id: `multiple_clockin_${employee.id}_${todayStr}`,
          type: 'multiple_clockin',
          severity: 'medium',
          employeeId: employee.id,
          employeeName: employee.name,
          department: employee.department,
          date: todayStr,
          time: clockInRecords[0].time,
          description: '複数回出勤',
          details: `${clockInRecords.length}回の出勤記録があります`,
          isAcknowledged: false,
          createdAt: new Date()
        });
      }

      // 遅刻のチェック（9:00以降の出勤）
      clockInRecords.forEach(clockIn => {
        const clockInTime = parseISO(clockIn.time);
        const nineAM = parseISO('2000-01-01T09:00:00');
        
        if (clockInTime > nineAM) {
          newAlerts.push({
            id: `late_clockin_${employee.id}_${clockIn.id}`,
            type: 'late_clockin',
            severity: 'low',
            employeeId: employee.id,
            employeeName: employee.name,
            department: employee.department,
            date: clockIn.date,
            time: clockIn.time,
            description: '遅刻',
            details: `${format(clockInTime, 'HH:mm')}に出勤（9:00以降）`,
            isAcknowledged: false,
            createdAt: new Date()
          });
        }
      });

      // 早退のチェック（17:00以前の退勤）
      clockOutRecords.forEach(clockOut => {
        const clockOutTime = parseISO(clockOut.time);
        const fivePM = parseISO('2000-01-01T17:00:00');
        
        if (clockOutTime < fivePM) {
          newAlerts.push({
            id: `early_clockout_${employee.id}_${clockOut.id}`,
            type: 'early_clockout',
            severity: 'low',
            employeeId: employee.id,
            employeeName: employee.name,
            department: employee.department,
            date: clockOut.date,
            time: clockOut.time,
            description: '早退',
            details: `${format(clockOutTime, 'HH:mm')}に退勤（17:00以前）`,
            isAcknowledged: false,
            createdAt: new Date()
          });
        }
      });
    });

    setAlerts(newAlerts);
  };

  // アラートの確認
  const acknowledgeAlert = (alertId: string) => {
    setAlerts(prev => prev.map(alert => 
      alert.id === alertId ? { ...alert, isAcknowledged: true } : alert
    ));
  };

  // アラートの削除
  const dismissAlert = (alertId: string) => {
    setAlerts(prev => prev.filter(alert => alert.id !== alertId));
  };

  // 重要度の色を取得
  const getSeverityColor = (severity: string): string => {
    switch (severity) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // 重要度のアイコンを取得
  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'high': return <AlertTriangle className="w-4 h-4 text-red-600" />;
      case 'medium': return <AlertTriangle className="w-4 h-4 text-yellow-600" />;
      case 'low': return <AlertTriangle className="w-4 h-4 text-blue-600" />;
      default: return <AlertTriangle className="w-4 h-4 text-gray-600" />;
    }
  };

  // 未確認のアラート数
  const unacknowledgedCount = alerts.filter(alert => !alert.isAcknowledged).length;

  if (!isVisible) {
    return (
      <div className="fixed bottom-4 right-4 z-40">
        <button
          onClick={onToggleVisibility}
          className="bg-red-600 hover:bg-red-700 text-white p-3 rounded-full shadow-lg transition-all duration-200"
        >
          <Bell className="w-6 h-6" />
          {unacknowledgedCount > 0 && (
            <span className="absolute -top-2 -right-2 bg-white text-red-600 text-xs font-bold rounded-full h-6 w-6 flex items-center justify-center">
              {unacknowledgedCount}
            </span>
          )}
        </button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-40 w-96">
      {/* ヘッダー */}
      <div className="bg-white rounded-t-lg shadow-lg border border-gray-200">
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="w-5 h-5 text-red-600" />
            <h3 className="text-lg font-semibold text-gray-900">異常検知アラート</h3>
            {unacknowledgedCount > 0 && (
              <span className="bg-red-600 text-white text-xs font-bold rounded-full px-2 py-1">
                {unacknowledgedCount}
              </span>
            )}
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setAutoRefresh(!autoRefresh)}
              className={`p-2 rounded-md transition-colors ${
                autoRefresh ? 'text-green-600 hover:bg-green-50' : 'text-gray-400 hover:bg-gray-50'
              }`}
              title={autoRefresh ? '自動更新ON' : '自動更新OFF'}
            >
              {autoRefresh ? <RefreshCw className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
            </button>
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-md transition-colors"
            >
              {isExpanded ? '−' : '+'}
            </button>
            <button
              onClick={onToggleVisibility}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-md transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* 最終更新時刻 */}
        <div className="px-4 py-2 bg-gray-50 text-xs text-gray-500">
          最終更新: {format(lastRefresh, 'HH:mm:ss')}
        </div>
      </div>

      {/* アラート一覧 */}
      {isExpanded && (
        <div className="bg-white rounded-b-lg shadow-lg border border-gray-200 max-h-96 overflow-y-auto">
          {alerts.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              <AlertTriangle className="w-12 h-12 mx-auto mb-2 text-gray-300" />
              <p>異常は検知されていません</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {alerts.map((alert) => (
                <div
                  key={alert.id}
                  className={`p-4 transition-colors ${
                    alert.isAcknowledged ? 'bg-gray-50 opacity-75' : 'bg-white'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        {getSeverityIcon(alert.severity)}
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full border ${getSeverityColor(alert.severity)}`}>
                          {alert.description}
                        </span>
                      </div>
                      
                      <div className="space-y-1 text-sm">
                        <div className="flex items-center space-x-2">
                          <User className="w-4 h-4 text-gray-400" />
                          <span className="font-medium">{alert.employeeName}</span>
                          <span className="text-gray-500">({alert.department})</span>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <Clock className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-600">{alert.date}</span>
                          <span className="text-gray-500">{alert.time}</span>
                        </div>
                        
                        <p className="text-gray-700">{alert.details}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-1 ml-2">
                      {!alert.isAcknowledged && (
                        <button
                          onClick={() => acknowledgeAlert(alert.id)}
                          className="p-1 text-green-600 hover:text-green-800 hover:bg-green-50 rounded transition-colors"
                          title="確認済みにする"
                        >
                          ✓
                        </button>
                      )}
                      <button
                        onClick={() => dismissAlert(alert.id)}
                        className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded transition-colors"
                        title="削除"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
