'use client';

import { useState, useEffect } from 'react';
import { Clock, User, Play, Square, Coffee, Timer, Shield, Building2, Settings, CheckCircle } from 'lucide-react';
import { loadCompanyInfo, isCompanyInitialized } from './lib/auth';

// 基本的なデータ型定義
interface Employee {
  id: string;
  name: string;
  department: string;
  position: string;
}

interface TimeRecord {
  id: string;
  employeeId: string;
  employeeName: string;
  type: 'clockIn' | 'clockOut' | 'breakStart' | 'breakEnd';
  time: string;
  date: string;
}

interface CompanyInfo {
  id: string;
  name: string;
  adminUsername: string;
  adminName: string;
  createdAt: string;
  isInitialized: boolean;
}

export default function MainPage() {
  const [currentTime, setCurrentTime] = useState('');
  const [currentDate, setCurrentDate] = useState('');
  const [modalEmployeeId, setModalEmployeeId] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [modalType, setModalType] = useState<'clockIn' | 'clockOut' | 'breakStart' | 'breakEnd'>('clockIn');
  const [isLoading, setIsLoading] = useState(true);
  const [showSetupGuide, setShowSetupGuide] = useState(false);
  const [companyInfo, setCompanyInfo] = useState<CompanyInfo | null>(null);
  const [timeRecords, setTimeRecords] = useState<TimeRecord[]>([]);

  // 現在時刻の更新
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString('ja-JP', { 
        hour: '2-digit', 
        minute: '2-digit', 
        second: '2-digit' 
      }));
      setCurrentDate(now.toLocaleDateString('ja-JP', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        weekday: 'long'
      }));
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);

    return () => clearInterval(interval);
  }, []);

  // 企業情報の読み込み
  useEffect(() => {
    try {
      const company = loadCompanyInfo();
      if (company) {
        setCompanyInfo(company);
        if (isCompanyInitialized()) {
          // 初期化完了済みの場合、打刻記録を読み込み
          loadTimeRecords();
        } else {
          setShowSetupGuide(true);
        }
      } else {
        setShowSetupGuide(true);
      }
      setIsLoading(false);
    } catch (error) {
      console.error('企業情報の読み込みエラー:', error);
      setShowSetupGuide(true);
      setIsLoading(false);
    }
  }, []);

  // 打刻記録の読み込み
  const loadTimeRecords = () => {
    try {
      const savedRecords = localStorage.getItem('tick_timeRecords');
      if (savedRecords) {
        setTimeRecords(JSON.parse(savedRecords));
      }
    } catch (error) {
      console.error('打刻記録の読み込みエラー:', error);
    }
  };

  // 打刻ボタンクリック時の処理
  const handleClockButton = (type: 'clockIn' | 'clockOut' | 'breakStart' | 'breakEnd') => {
    setModalType(type);
    setModalEmployeeId('');
    setShowModal(true);
  };

  // 打刻確認
  const handleConfirmTimeRecord = () => {
    if (!modalEmployeeId.trim()) {
      alert('社員番号を入力してください');
      return;
    }

    // 社員情報を取得
    const savedEmployees = localStorage.getItem('tick_employees');
    let employees: Employee[] = [];
    if (savedEmployees) {
      employees = JSON.parse(savedEmployees);
    }

    const employee = employees.find(emp => emp.id === modalEmployeeId.trim());
    if (!employee) {
      alert('社員番号が見つかりません');
      return;
    }

    // 打刻記録を作成
    const now = new Date();
    const timeRecord: TimeRecord = {
      id: Date.now().toString(),
      employeeId: employee.id,
      employeeName: employee.name,
      type: modalType,
      time: now.toLocaleTimeString('ja-JP', { 
        hour: '2-digit', 
        minute: '2-digit', 
        second: '2-digit' 
      }),
      date: now.toISOString().split('T')[0]
    };

    // 打刻記録を保存
    const updatedRecords = [...timeRecords, timeRecord];
    setTimeRecords(updatedRecords);
    localStorage.setItem('tick_timeRecords', JSON.stringify(updatedRecords));

    // 成功メッセージを表示
    const typeLabels = {
      clockIn: '出勤',
      clockOut: '退勤',
      breakStart: '休憩開始',
      breakEnd: '休憩終了'
    };

    setSuccessMessage(`${employee.name}さんの${typeLabels[modalType]}を記録しました`);
    setShowSuccessMessage(true);
    setShowModal(false);
    setModalEmployeeId('');

    // 3秒後に成功メッセージを非表示
    setTimeout(() => {
      setShowSuccessMessage(false);
    }, 3000);
  };

  // 今日の出勤者数
  const todayRecords = timeRecords.filter(record => 
    record.date === new Date().toISOString().split('T')[0]
  );
  const presentCount = todayRecords.length;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 border border-white/20 text-center">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Clock className="w-8 h-8 text-blue-600 animate-spin" />
          </div>
          <p className="text-slate-600">データを読み込み中...</p>
        </div>
      </div>
    );
  }

  if (showSetupGuide) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 border border-white/20 text-center max-w-2xl mx-4">
          <Building2 className="w-16 h-16 text-blue-600 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-slate-800 mb-4">Tick勤怠管理システム</h1>
          <p className="text-slate-600 mb-6">
            システムの初期設定が完了していません。<br />
            管理者画面で初期設定を行ってください。
          </p>
          <div className="space-y-4">
            <a
              href="/admin/setup"
              className="inline-block w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-xl transition-colors duration-200"
            >
              初期設定を開始
            </a>
            <a
              href="/login"
              className="inline-block w-full border border-slate-300 text-slate-700 font-semibold py-3 px-6 rounded-xl hover:bg-slate-50 transition-colors duration-200"
            >
              管理者ログイン
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* ヘッダー */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-white/20 shadow-lg">
        <div className="max-w-6xl mx-auto px-3 py-3 sm:px-4 sm:py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 sm:space-x-6">
              <div className="flex items-center space-x-2 sm:space-x-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center">
                  <Clock className="w-4 h-4 sm:w-6 sm:w-6 text-white" />
                </div>
                <h1 className="text-lg sm:text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
                  Tick
                </h1>
              </div>
              <div className="hidden md:block">
                <p className="text-sm sm:text-lg font-semibold text-slate-800">共有端末</p>
                {companyInfo && (
                  <div className="text-xs sm:text-sm text-slate-600">
                    <span className="font-medium">{companyInfo.name}</span>
                    <span className="ml-2 text-blue-600">{companyInfo.id}</span>
                  </div>
                )}
              </div>
            </div>
            
            {/* 現在時刻 */}
            <div className="text-center flex-1 mx-2 sm:mx-4">
              <div className="text-2xl sm:text-4xl md:text-6xl font-bold text-slate-800 font-mono">
                {currentTime}
              </div>
            </div>

            {/* 管理者ログインボタン */}
            <a 
              href="/login" 
              className="flex items-center space-x-1 sm:space-x-2 px-2 py-2 sm:px-4 text-slate-600 hover:text-slate-800 hover:bg-slate-50 rounded-xl transition-all duration-200 min-w-[44px] min-h-[44px]"
            >
              <Shield className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="hidden sm:inline text-sm">管理者ログイン</span>
            </a>
          </div>
        </div>
      </header>

      {/* メインコンテンツ */}
      <main className="max-w-6xl mx-auto px-3 py-4 sm:px-4 sm:py-8">
        {/* 企業情報表示 */}
        {companyInfo && (
          <div className="mb-6 sm:mb-8">
            <div className="bg-white/80 backdrop-blur-sm rounded-xl sm:rounded-2xl shadow-xl p-4 sm:p-6 border border-white/20">
              <div className="flex items-center space-x-3 mb-4">
                <Building2 className="w-6 h-6 text-blue-600" />
                <h2 className="text-lg font-bold text-slate-800">企業情報</h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="text-center sm:text-left">
                  <p className="text-sm text-slate-600">企業ID</p>
                  <p className="text-xl sm:text-2xl font-bold text-blue-600">{companyInfo.id}</p>
                </div>
                <div className="text-center sm:text-left">
                  <p className="text-sm text-slate-600">会社名</p>
                  <p className="text-lg sm:text-xl font-bold text-slate-800">{companyInfo.name}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 今日の出勤状況サマリー */}
        <div className="mb-6 sm:mb-8">
          <div className="bg-white/80 backdrop-blur-sm rounded-xl sm:rounded-2xl shadow-xl p-4 sm:p-6 border border-white/20">
            <div className="grid grid-cols-2 sm:grid-cols-2 gap-4">
              <div className="text-center">
                <div className="text-2xl sm:text-3xl font-bold text-slate-800">
                  {companyInfo ? '設定済み' : '-'}
                </div>
                <div className="text-sm text-slate-600">システム状態</div>
              </div>
              <div className="text-center">
                <div className="text-2xl sm:text-3xl font-bold text-green-600">{presentCount}</div>
                <div className="text-sm text-slate-600">今日の打刻数</div>
              </div>
            </div>
          </div>
        </div>

        {/* 打刻ボタン */}
        <div className="grid grid-cols-2 gap-3 sm:gap-6 md:gap-8 mb-6 sm:mb-8">
          {/* 出勤ボタン */}
          <button 
            onClick={() => handleClockButton('clockIn')}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-6 px-4 sm:py-10 sm:px-6 md:py-12 md:px-8 rounded-xl sm:rounded-2xl md:rounded-3xl text-lg sm:text-xl md:text-2xl transition-all duration-200 shadow-xl hover:shadow-2xl transform hover:-translate-y-1 sm:hover:-translate-y-2 active:translate-y-0 min-h-[120px] sm:min-h-[140px] md:min-h-[160px]"
          >
            <div className="flex flex-col items-center space-y-2 sm:space-y-3 md:space-y-4">
              <Play className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12" />
              <div>
                <div className="text-xl sm:text-2xl md:text-3xl font-bold">出勤</div>
                <div className="text-xs sm:text-sm md:text-base opacity-90">勤務開始</div>
              </div>
            </div>
          </button>

          {/* 退勤ボタン */}
          <button 
            onClick={() => handleClockButton('clockOut')}
            className="bg-red-600 hover:bg-red-700 text-white font-bold py-6 px-4 sm:py-10 sm:px-6 md:py-12 md:px-8 rounded-xl sm:rounded-2xl md:rounded-3xl text-lg sm:text-xl md:text-2xl transition-all duration-200 shadow-xl hover:shadow-2xl transform hover:-translate-y-1 sm:hover:-translate-y-2 active:translate-y-0 min-h-[120px] sm:min-h-[140px] md:min-h-[160px]"
          >
            <div className="flex flex-col items-center space-y-2 sm:space-y-3 md:space-y-4">
              <Square className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12" />
              <div>
                <div className="text-xl sm:text-2xl md:text-3xl font-bold">退勤</div>
                <div className="text-xs sm:text-sm md:text-base opacity-90">勤務終了</div>
              </div>
            </div>
          </button>

          {/* 休憩開始ボタン */}
          <button 
            onClick={() => handleClockButton('breakStart')}
            className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-6 px-4 sm:py-10 sm:px-6 md:py-12 md:px-8 rounded-xl sm:rounded-2xl md:rounded-3xl text-lg sm:text-xl md:text-2xl transition-all duration-200 shadow-xl hover:shadow-2xl transform hover:-translate-y-1 sm:hover:-translate-y-2 active:translate-y-0 min-h-[120px] sm:min-h-[140px] md:min-h-[160px]"
          >
            <div className="flex flex-col items-center space-y-2 sm:space-y-3 md:space-y-4">
              <Coffee className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12" />
              <div>
                <div className="text-xl sm:text-2xl md:text-3xl font-bold">休憩開始</div>
                <div className="text-xs sm:text-sm md:text-base opacity-90">休憩開始</div>
              </div>
            </div>
          </button>

          {/* 休憩終了ボタン */}
          <button 
            onClick={() => handleClockButton('breakEnd')}
            className="bg-green-600 hover:bg-green-700 text-white font-bold py-6 px-4 sm:py-10 sm:px-6 md:py-12 md:px-8 rounded-xl sm:rounded-2xl md:rounded-3xl text-lg sm:text-xl md:text-2xl transition-all duration-200 shadow-xl hover:shadow-2xl transform hover:-translate-y-1 sm:hover:-translate-y-2 active:translate-y-0 min-h-[120px] sm:min-h-[140px] md:min-h-[160px]"
          >
            <div className="flex flex-col items-center space-y-2 sm:space-y-3 md:space-y-4">
              <Timer className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12" />
              <div>
                <div className="text-xl sm:text-2xl md:text-3xl font-bold">休憩終了</div>
                <div className="text-xs sm:text-sm md:text-base opacity-90">休憩終了</div>
              </div>
            </div>
          </button>
        </div>

        {/* 今日の日付 */}
        <div className="text-center mb-6">
          <p className="text-lg sm:text-xl text-slate-600">
            {currentDate}
          </p>
        </div>

        {/* 今日の打刻履歴 */}
        {todayRecords.length > 0 && (
          <div className="bg-white/80 backdrop-blur-sm rounded-xl sm:rounded-2xl shadow-xl p-4 sm:p-6 border border-white/20">
            <h3 className="text-lg font-bold text-slate-800 mb-4">今日の打刻履歴</h3>
            <div className="space-y-2">
              {todayRecords.map((record) => (
                <div key={record.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <span className="font-medium text-slate-800">{record.employeeName}</span>
                    <span className="text-sm text-slate-500">
                      {record.type === 'clockIn' ? '出勤' : 
                       record.type === 'clockOut' ? '退勤' : 
                       record.type === 'breakStart' ? '休憩開始' : '休憩終了'}
                    </span>
                  </div>
                  <span className="text-sm text-slate-600">{record.time}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* フッター */}
      <footer className="mt-12 text-center">
        <p className="text-sm text-slate-500 mb-2">© 2025 Tick勤怠管理システム</p>
      </footer>

      {/* 打刻確認モーダル */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 max-w-md mx-4 w-full">
            <h3 className="text-xl font-bold text-slate-800 mb-6 text-center">
              {modalType === 'clockIn' ? '出勤' : 
               modalType === 'clockOut' ? '退勤' : 
               modalType === 'breakStart' ? '休憩開始' : '休憩終了'}
            </h3>
            
            <div className="mb-6">
              <label className="block text-sm font-medium text-slate-700 mb-2">
                社員番号
              </label>
              <input
                type="text"
                value={modalEmployeeId}
                onChange={(e) => setModalEmployeeId(e.target.value)}
                placeholder="社員番号を入力してください"
                className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                onKeyPress={(e) => e.key === 'Enter' && handleConfirmTimeRecord()}
                autoFocus
              />
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 py-3 px-4 border border-slate-300 text-slate-700 rounded-xl hover:bg-slate-50 transition-colors duration-200"
              >
                キャンセル
              </button>
              <button
                onClick={handleConfirmTimeRecord}
                className="flex-1 py-3 px-4 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors duration-200"
              >
                確認
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 成功メッセージ */}
      {showSuccessMessage && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 max-w-md mx-4 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Clock className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">打刻完了</h3>
            <p className="text-slate-600 mb-4">{successMessage}</p>
            <button
              onClick={() => setShowSuccessMessage(false)}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-xl transition-colors duration-200"
            >
              閉じる
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
