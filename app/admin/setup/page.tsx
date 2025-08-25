'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Building2, User, Settings, Clock, CheckCircle, ArrowRight } from 'lucide-react';
import { 
  generateCompanyId, 
  saveCompanyInfo, 
  saveCompanySettings, 
  initializeCompanyData,
  logSecurityEvent 
} from '../../lib/auth';

interface CompanyForm {
  name: string;
  adminUsername: string;
  adminPassword: string;
  adminPasswordConfirm: string;
  adminName: string;
}

interface SettingsForm {
  workStartTime: string;
  workEndTime: string;
  breakStartTime: string;
  breakEndTime: string;
}

export default function SetupPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<'company' | 'settings' | 'complete'>('company');
  const [companyForm, setCompanyForm] = useState<CompanyForm>({
    name: '',
    adminUsername: '',
    adminPassword: '',
    adminPasswordConfirm: '',
    adminName: ''
  });
  const [settingsForm, setSettingsForm] = useState<SettingsForm>({
    workStartTime: '09:00',
    workEndTime: '18:00',
    breakStartTime: '12:00',
    breakEndTime: '13:00'
  });
  const [generatedCompanyId, setGeneratedCompanyId] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 企業IDの自動生成
  useEffect(() => {
    setGeneratedCompanyId(generateCompanyId());
  }, []);

  // 企業情報の保存
  const handleSaveCompany = async () => {
    if (!companyForm.name.trim()) {
      alert('会社名を入力してください');
      return;
    }
    if (!companyForm.adminUsername.trim()) {
      alert('管理者IDを入力してください');
      return;
    }
    if (!companyForm.adminPassword) {
      alert('パスワードを入力してください');
      return;
    }
    if (companyForm.adminPassword !== companyForm.adminPasswordConfirm) {
      alert('パスワードが一致しません');
      return;
    }
    if (!companyForm.adminName.trim()) {
      alert('管理者名を入力してください');
      return;
    }

    setIsSubmitting(true);
    try {
      // 企業情報を保存
      const companyInfo = {
        id: generatedCompanyId,
        name: companyForm.name.trim(),
        adminUsername: companyForm.adminUsername.trim(),
        adminName: companyForm.adminName.trim(),
        createdAt: new Date().toISOString(),
        isInitialized: false
      };

      // 管理者パスワードをハッシュ化して保存
      const hashedPassword = btoa(companyForm.adminPassword + generatedCompanyId);
      localStorage.setItem(`tick_admin_password_${generatedCompanyId}`, hashedPassword);

      saveCompanyInfo(companyInfo);
      
      // セキュリティログ
      logSecurityEvent('企業情報登録', { companyId: generatedCompanyId, companyName: companyForm.name });
      
      setCurrentStep('settings');
    } catch (error) {
      console.error('企業情報保存エラー:', error);
      alert('企業情報の保存に失敗しました');
    } finally {
      setIsSubmitting(false);
    }
  };

  // 初期設定の保存
  const handleSaveSettings = async () => {
    setIsSubmitting(true);
    try {
      // 企業設定を保存
      const settings = {
        companyId: generatedCompanyId,
        workStartTime: settingsForm.workStartTime,
        workEndTime: settingsForm.workEndTime,
        breakStartTime: settingsForm.breakStartTime,
        breakEndTime: settingsForm.breakEndTime,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      saveCompanySettings(settings);

      // 企業データを初期化
      initializeCompanyData();

      // 企業情報を初期化完了に更新
      const companyInfo = {
        id: generatedCompanyId,
        name: companyForm.name.trim(),
        adminUsername: companyForm.adminUsername.trim(),
        adminName: companyForm.adminName.trim(),
        createdAt: new Date().toISOString(),
        isInitialized: true
      };
      saveCompanyInfo(companyInfo);

      // セキュリティログ
      logSecurityEvent('初期設定完了', { companyId: generatedCompanyId });

      setCurrentStep('complete');
    } catch (error) {
      console.error('初期設定保存エラー:', error);
      alert('初期設定の保存に失敗しました');
    } finally {
      setIsSubmitting(false);
    }
  };

  // 運用開始
  const handleStartSystem = () => {
    router.push('/admin');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* ヘッダー */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-white/20 shadow-lg">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center">
              <Building2 className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
              Tick 初期設定
            </h1>
          </div>
        </div>
      </header>

      {/* メインコンテンツ */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* ステップインジケーター */}
        <div className="mb-8">
          <div className="flex items-center justify-center space-x-4">
            <div className={`flex items-center space-x-2 ${currentStep === 'company' ? 'text-blue-600' : 'text-slate-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep === 'company' ? 'bg-blue-600 text-white' : 'bg-slate-200'}`}>
                1
              </div>
              <span className="text-sm font-medium">企業情報</span>
            </div>
            <ArrowRight className="w-5 h-5 text-slate-400" />
            <div className={`flex items-center space-x-2 ${currentStep === 'settings' ? 'text-blue-600' : currentStep === 'complete' ? 'text-green-600' : 'text-slate-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep === 'settings' ? 'bg-blue-600 text-white' : currentStep === 'complete' ? 'bg-green-600 text-white' : 'bg-slate-200'}`}>
                2
              </div>
              <span className="text-sm font-medium">初期設定</span>
            </div>
            <ArrowRight className="w-5 h-5 text-slate-400" />
            <div className={`flex items-center space-x-2 ${currentStep === 'complete' ? 'text-green-600' : 'text-slate-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep === 'complete' ? 'bg-green-600 text-white' : 'bg-slate-200'}`}>
                3
              </div>
              <span className="text-sm font-medium">完了</span>
            </div>
          </div>
        </div>

        {/* 企業情報登録ステップ */}
        {currentStep === 'company' && (
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 border border-white/20">
            <div className="text-center mb-8">
              <Building2 className="w-16 h-16 text-blue-600 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-slate-800 mb-2">企業情報登録</h2>
              <p className="text-slate-600">企業の基本情報と管理者アカウントを設定してください</p>
            </div>

            <div className="space-y-6">
              {/* 企業ID表示 */}
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 text-center">
                <p className="text-sm text-blue-600 font-medium mb-2">生成された企業ID</p>
                <p className="text-3xl font-bold text-blue-800">{generatedCompanyId}</p>
                <p className="text-sm text-blue-600 mt-2">このIDは企業を識別するために使用されます</p>
              </div>

              {/* 会社名 */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  会社名 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={companyForm.name}
                  onChange={(e) => setCompanyForm({ ...companyForm, name: e.target.value })}
                  placeholder="株式会社サンプル"
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* 管理者ID */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  管理者ID <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={companyForm.adminUsername}
                  onChange={(e) => setCompanyForm({ ...companyForm, adminUsername: e.target.value })}
                  placeholder="admin"
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <p className="text-xs text-slate-500 mt-1">管理者としてログインする際に使用するID</p>
              </div>

              {/* 管理者パスワード */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  管理者パスワード <span className="text-red-500">*</span>
                </label>
                <input
                  type="password"
                  value={companyForm.adminPassword}
                  onChange={(e) => setCompanyForm({ ...companyForm, adminPassword: e.target.value })}
                  placeholder="パスワードを入力"
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* パスワード確認 */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  パスワード確認 <span className="text-red-500">*</span>
                </label>
                <input
                  type="password"
                  value={companyForm.adminPasswordConfirm}
                  onChange={(e) => setCompanyForm({ ...companyForm, adminPasswordConfirm: e.target.value })}
                  placeholder="パスワードを再入力"
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* 管理者名 */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  管理者名 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={companyForm.adminName}
                  onChange={(e) => setCompanyForm({ ...companyForm, adminName: e.target.value })}
                  placeholder="田中太郎"
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* 保存ボタン */}
              <button
                onClick={handleSaveCompany}
                disabled={isSubmitting}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-400 text-white font-semibold py-3 px-6 rounded-xl transition-colors duration-200"
              >
                {isSubmitting ? '保存中...' : '企業情報を保存して次へ'}
              </button>
            </div>
          </div>
        )}

        {/* 初期設定ステップ */}
        {currentStep === 'settings' && (
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 border border-white/20">
            <div className="text-center mb-8">
              <Settings className="w-16 h-16 text-blue-600 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-slate-800 mb-2">初期設定</h2>
              <p className="text-slate-600">勤務時間と休憩時間の基本設定を行ってください</p>
            </div>

            <div className="space-y-6">
              {/* 勤務時間設定 */}
              <div className="bg-slate-50 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center space-x-2">
                  <Clock className="w-5 h-5" />
                  <span>勤務時間設定</span>
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      勤務開始時刻
                    </label>
                    <input
                      type="time"
                      value={settingsForm.workStartTime}
                      onChange={(e) => setSettingsForm({ ...settingsForm, workStartTime: e.target.value })}
                      className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      勤務終了時刻
                    </label>
                    <input
                      type="time"
                      value={settingsForm.workEndTime}
                      onChange={(e) => setSettingsForm({ ...settingsForm, workEndTime: e.target.value })}
                      className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>

              {/* 休憩時間設定 */}
              <div className="bg-slate-50 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center space-x-2">
                  <Clock className="w-5 h-5" />
                  <span>休憩時間設定</span>
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      休憩開始時刻
                    </label>
                    <input
                      type="time"
                      value={settingsForm.breakStartTime}
                      onChange={(e) => setSettingsForm({ ...settingsForm, breakStartTime: e.target.value })}
                      className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      休憩終了時刻
                    </label>
                    <input
                      type="time"
                      value={settingsForm.breakEndTime}
                      onChange={(e) => setSettingsForm({ ...settingsForm, breakEndTime: e.target.value })}
                      className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>

              {/* 保存ボタン */}
              <button
                onClick={handleSaveSettings}
                disabled={isSubmitting}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-400 text-white font-semibold py-3 px-6 rounded-xl transition-colors duration-200"
              >
                {isSubmitting ? '保存中...' : '初期設定を完了する'}
              </button>
            </div>
          </div>
        )}

        {/* 完了ステップ */}
        {currentStep === 'complete' && (
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 border border-white/20 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            
            <h2 className="text-2xl font-bold text-slate-800 mb-4">初期設定完了！</h2>
            
            <div className="bg-green-50 border border-green-200 rounded-xl p-6 mb-6">
              <p className="text-green-800 font-medium mb-2">企業情報</p>
              <p className="text-2xl font-bold text-green-800 mb-1">{companyForm.name}</p>
              <p className="text-sm text-green-600">{generatedCompanyId}</p>
            </div>
            
            <p className="text-slate-600 mb-6">
              おめでとうございます！Tick勤怠管理システムの初期設定が完了しました。<br />
              管理者としてログインして、従業員の登録やシステムの運用を開始できます。
            </p>
            
            <button
              onClick={handleStartSystem}
              className="bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-8 rounded-xl transition-colors duration-200"
            >
              運用開始
            </button>
          </div>
        )}
      </main>

      {/* フッター */}
      <footer className="mt-12 text-center">
        <p className="text-sm text-slate-500 mb-2">© 2024 Tick勤怠管理システム</p>
        <p className="text-xs text-slate-400">多企業対応の勤怠管理システム</p>
      </footer>
    </div>
  );
}

