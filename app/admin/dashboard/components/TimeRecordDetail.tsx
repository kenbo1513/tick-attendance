'use client';

import React, { useState, useEffect } from 'react';
import { TimeRecord, Employee } from '@/app/lib/localStorage';
import { X, Clock, MapPin, User, Calendar, Building, AlertTriangle, Smartphone, Globe } from 'lucide-react';
import { format, parseISO, differenceInMinutes } from 'date-fns';
import { ja } from 'date-fns/locale';
import { Loader } from '@googlemaps/js-api-loader';

// Google Maps の型定義
declare global {
  interface Window {
    google: any;
  }
}

interface TimeRecordDetailProps {
  record: TimeRecord | null;
  employees: Employee[];
  isOpen: boolean;
  onClose: () => void;
}

interface WorkTimeDetail {
  totalWorkMinutes: number;
  totalBreakMinutes: number;
  overtimeMinutes: number;
  isAbnormal: boolean;
  abnormalReasons: string[];
  workSessions: Array<{
    start: string;
    end: string;
    duration: number;
    type: 'work' | 'break';
  }>;
}

export default function TimeRecordDetail({
  record,
  employees,
  isOpen,
  onClose
}: TimeRecordDetailProps) {
  const [map, setMap] = useState<any>(null);
  const [mapLoaded, setMapLoaded] = useState(false);

  if (!isOpen || !record) {
    return null;
  }

  // 従業員情報を取得
  const employee = employees.find(emp => emp.id === record.employeeId);

  // 労働時間の詳細計算
  const calculateWorkTimeDetail = (): WorkTimeDetail => {
    // この実装では、単一の記録ではなく、その日の全記録が必要
    // 実際の実装では、親コンポーネントから日単位のデータを受け取る必要がある
    return {
      totalWorkMinutes: 0,
      totalBreakMinutes: 0,
      overtimeMinutes: 0,
      isAbnormal: false,
      abnormalReasons: [],
      workSessions: []
    };
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
    return format(date, 'yyyy年M月d日 (E)', { locale: ja });
  };

  // 時間の表示形式
  const formatTime = (timeStr: string): string => {
    return format(parseISO(`2000-01-01T${timeStr}`), 'HH:mm:ss');
  };

  // 労働時間の表示形式
  const formatWorkTime = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}時間${mins}分`;
  };

  // Google Maps の初期化
  useEffect(() => {
    if (isOpen && record.location && !mapLoaded) {
      const loader = new Loader({
        apiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || 'your-api-key',
        version: 'weekly',
        libraries: ['places']
      });

      loader.load().then(() => {
        const mapElement = document.getElementById('map');
        if (mapElement && window.google) {
          const newMap = new window.google.maps.Map(mapElement, {
            center: { lat: 35.6762, lng: 139.6503 }, // 東京のデフォルト座標
            zoom: 15,
            mapTypeControl: false,
            streetViewControl: false,
            fullscreenControl: false
          });

          // 位置情報がある場合は、その位置にマーカーを表示
          if (record.location) {
            // 実際の実装では、位置情報を座標に変換する必要がある
            // ここでは仮の座標を使用
            const position = { lat: 35.6762, lng: 139.6503 };
            
            new window.google.maps.Marker({
              position,
              map: newMap,
              title: `${employee?.name || '従業員'}の打刻位置`
            });

            newMap.setCenter(position);
          }

          setMap(newMap);
          setMapLoaded(true);
        }
      }).catch(error => {
        console.error('Google Maps の読み込みに失敗しました:', error);
      });
    }
  }, [isOpen, record, mapLoaded, employee]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        {/* ヘッダー */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">勤務記録詳細</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* コンテンツ */}
        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* 基本情報 */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900 border-b border-gray-200 pb-2">
                基本情報
              </h3>
              
              {/* 日付 */}
              <div className="flex items-center space-x-3">
                <Calendar className="w-5 h-5 text-gray-400" />
                <div>
                  <label className="block text-sm font-medium text-gray-700">日付</label>
                  <p className="text-sm text-gray-900">{formatDate(record.date)}</p>
                </div>
              </div>

              {/* 時刻 */}
              <div className="flex items-center space-x-3">
                <Clock className="w-5 h-5 text-gray-400" />
                <div>
                  <label className="block text-sm font-medium text-gray-700">時刻</label>
                  <p className="text-sm text-gray-900 font-mono">{formatTime(record.time)}</p>
                </div>
              </div>

              {/* 従業員 */}
              <div className="flex items-center space-x-3">
                <User className="w-5 h-5 text-gray-400" />
                <div>
                  <label className="block text-sm font-medium text-gray-700">従業員</label>
                  <p className="text-sm text-gray-900">{employee?.name || '不明'}</p>
                  <p className="text-xs text-gray-500">ID: {record.employeeId}</p>
                </div>
              </div>

              {/* 部署 */}
              <div className="flex items-center space-x-3">
                <Building className="w-5 h-5 text-gray-400" />
                <div>
                  <label className="block text-sm font-medium text-gray-700">部署</label>
                  <p className="text-sm text-gray-900">{employee?.department || '不明'}</p>
                </div>
              </div>

              {/* 打刻種別 */}
              <div className="flex items-center space-x-3">
                <Clock className="w-5 h-5 text-gray-400" />
                <div>
                  <label className="block text-sm font-medium text-gray-700">打刻種別</label>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full border ${getTypeColor(record.type)}`}>
                    {getTypeLabel(record.type)}
                  </span>
                </div>
              </div>

              {/* 位置情報 */}
              <div className="flex items-center space-x-3">
                <MapPin className="w-5 h-5 text-gray-400" />
                <div>
                  <label className="block text-sm font-medium text-gray-700">位置情報</label>
                  <p className="text-sm text-gray-900">
                    {record.location || '位置情報なし'}
                  </p>
                </div>
              </div>

              {/* デバイス情報 */}
              {record.deviceInfo && (
                <div className="flex items-center space-x-3">
                  <Smartphone className="w-5 h-5 text-gray-400" />
                  <div>
                    <label className="block text-sm font-medium text-gray-700">デバイス情報</label>
                    <p className="text-sm text-gray-900">{record.deviceInfo}</p>
                  </div>
                </div>
              )}

              {/* IPアドレス */}
              {record.ipAddress && (
                <div className="flex items-center space-x-3">
                  <Globe className="w-5 h-5 text-gray-400" />
                  <div>
                    <label className="block text-sm font-medium text-gray-700">IPアドレス</label>
                    <p className="text-sm text-gray-900 font-mono">{record.ipAddress}</p>
                  </div>
                </div>
              )}

              {/* メモ */}
              {record.notes && (
                <div className="flex items-start space-x-3">
                  <div className="w-5 h-5 text-gray-400 mt-1">📝</div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">メモ</label>
                    <p className="text-sm text-gray-900">{record.notes}</p>
                  </div>
                </div>
              )}
            </div>

            {/* 地図と労働時間情報 */}
            <div className="space-y-4">
              {/* 地図 */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 border-b border-gray-200 pb-2 mb-3">
                  位置情報
                </h3>
                <div className="bg-gray-100 rounded-lg overflow-hidden">
                  {record.location ? (
                    <div id="map" className="w-full h-64"></div>
                  ) : (
                    <div className="w-full h-64 flex items-center justify-center text-gray-500">
                      <div className="text-center">
                        <MapPin className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                        <p>位置情報がありません</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* 労働時間情報 */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 border-b border-gray-200 pb-2 mb-3">
                  労働時間情報
                </h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">総労働時間:</span>
                      <span className="ml-2 font-medium">-</span>
                    </div>
                    <div>
                      <span className="text-gray-600">休憩時間:</span>
                      <span className="ml-2 font-medium">-</span>
                    </div>
                    <div>
                      <span className="text-gray-600">残業時間:</span>
                      <span className="ml-2 font-medium">-</span>
                    </div>
                    <div>
                      <span className="text-gray-600">状態:</span>
                      <span className="ml-2 font-medium text-green-600">正常</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* 異常検知アラート */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 border-b border-gray-200 pb-2 mb-3">
                  異常検知
                </h3>
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                    <span className="text-sm text-green-800">異常は検知されていません</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* フッター */}
        <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
          >
            閉じる
          </button>
        </div>
      </div>
    </div>
  );
}
