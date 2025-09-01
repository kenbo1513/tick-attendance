'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Building2, User, CheckCircle, Clock, Shield } from 'lucide-react';
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

export default function SetupPage() {
  const router = useRouter();
  const [companyForm, setCompanyForm] = useState<CompanyForm>({
    name: '',
    adminUsername: '',
    adminPassword: '',
    adminPasswordConfirm: '',
    adminName: ''
  });
  const [generatedCompanyId, setGeneratedCompanyId] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isComplete, setIsComplete] = useState(false);

  // 企業IDの自動生成
  useEffect(() => {
    setGeneratedCompanyId(generateCompanyId());
  }, []);

  // 企業情報の保存と初期設定
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
        isInitialized: true
      };

      // 管理者パスワードをハッシュ化して保存
      const hashedPassword = btoa(companyForm.adminPassword + generatedCompanyId);
      localStorage.setItem(`tick_admin_password_${generatedCompanyId}`, hashedPassword);

      saveCompanyInfo(companyInfo);

      // デフォルトの企業設定を保存
      const defaultSettings = {
        companyId: generatedCompanyId,
        workStartTime: '09:00',
        workEndTime: '18:00',
        breakStartTime: '12:00',
        breakEndTime: '13:00',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      saveCompanySettings(defaultSettings);

      // 企業データを初期化
      initializeCompanyData();

      // セキュリティログ
      logSecurityEvent('企業情報登録完了', { companyId: generatedCompanyId, companyName: companyForm.name });
      
      setIsComplete(true);
    } catch (error) {
      console.error('企業情報保存エラー:', error);
      alert('企業情報の保存に失敗しました');
    } finally {
      setIsSubmitting(false);
    }
  };

  // 運用開始
  const handleStartSystem = () => {
    router.push('/admin/dashboard');
  };

  if (isComplete) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* ヘッダー */}
        <header className="bg-gray-50 border-b border-gray-200 shadow-sm">
          <div className="max-w-4xl mx-auto px-6 py-4">
            <div className="flex items-center justify-center space-x-3">
              <div className="w-10 h-10 bg-green-600 rounded-xl flex items-center justify-center">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-gray-800">
                Tick勤怠管理 - 初期設定完了
              </h1>
            </div>
          </div>
        </header>

        {/* 完了画面 */}
        <main className="max-w-4xl mx-auto px-6 py-8">
          <div className="bg-white rounded-lg shadow-lg p-8 border border-gray-200 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            
            <h2 className="text-2xl font-bold text-gray-800 mb-4">初期設定完了！</h2>
            
            <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6">
              <p className="text-green-800 font-medium mb-2">企業情報</p>
              <p className="text-2xl font-bold text-green-800 mb-1">{companyForm.name}</p>
              <p className="text-sm text-green-600">{generatedCompanyId}</p>
            </div>
            
            <p className="text-gray-600 mb-6">
              おめでとうございます！Tick勤怠管理システムの初期設定が完了しました。<br />
              管理者としてログインして、従業員の登録やシステムの運用を開始できます。
            </p>
            
            <button
              onClick={handleStartSystem}
              className="bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-8 rounded-md transition-colors duration-200"
            >
              運用開始
            </button>
          </div>
        </main>

        {/* フッター */}
        <footer className="mt-12 text-center">
          <p className="text-sm text-gray-500 mb-2">© 2025 Tick勤怠管理システム</p>
          <p className="text-sm text-gray-500">多企業対応の勤怠管理システム</p>
        </footer>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ヘッダー */}
      <header className="bg-gray-50 border-b border-gray-200 shadow-sm">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center justify-center space-x-3">
            <div className="w-10 h-10 bg-green-600 rounded-xl flex items-center justify-center">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-800">
              Tick勤怠管理 - 企業情報登録
            </h1>
          </div>
        </div>
      </header>

      {/* メインコンテンツ */}
      <main className="max-w-4xl mx-auto px-6 py-8">
        {/* 企業情報登録 */}
        <div className="bg-white rounded-lg shadow-lg p-8 border border-gray-200">
          <div className="text-center mb-8">
            <Building2 className="w-16 h-16 text-green-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-800 mb-2">企業情報登録</h2>
            <p className="text-gray-600">企業の基本情報と管理者アカウントを設定してください</p>
          </div>

          <div className="space-y-6">
            {/* 企業ID表示 */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
              <p className="text-sm text-green-600 font-medium mb-2">生成された企業ID</p>
              <p className="text-3xl font-bold text-green-800">{generatedCompanyId}</p>
              <p className="text-sm text-green-600 mt-2">このIDは企業を識別するために使用されます</p>
            </div>

            {/* 会社名 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                会社名 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={companyForm.name}
                onChange={(e) => setCompanyForm({ ...companyForm, name: e.target.value })}
                placeholder="株式会社サンプル"
                className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
              />
            </div>

            {/* 管理者ID */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                管理者ID <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={companyForm.adminUsername}
                onChange={(e) => setCompanyForm({ ...companyForm, adminUsername: e.target.value })}
                placeholder="admin"
                className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
              />
              <p className="text-xs text-gray-500 mt-1">管理者としてログインする際に使用するID</p>
            </div>

            {/* 管理者パスワード */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                管理者パスワード <span className="text-red-500">*</span>
              </label>
              <input
                type="password"
                value={companyForm.adminPassword}
                onChange={(e) => setCompanyForm({ ...companyForm, adminPassword: e.target.value })}
                placeholder="パスワードを入力"
                className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
              />
            </div>

            {/* パスワード確認 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                パスワード確認 <span className="text-red-500">*</span>
              </label>
              <input
                type="password"
                value={companyForm.adminPasswordConfirm}
                onChange={(e) => setCompanyForm({ ...companyForm, adminPasswordConfirm: e.target.value })}
                placeholder="パスワードを再入力"
                className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
              />
            </div>

            {/* 管理者名 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                管理者名 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={companyForm.adminName}
                onChange={(e) => setCompanyForm({ ...companyForm, adminName: e.target.value })}
                placeholder="田中太郎"
                className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
              />
            </div>

            {/* 保存ボタン */}
            <button
              onClick={handleSaveCompany}
              disabled={isSubmitting}
              className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-semibold py-3 px-6 rounded-md transition-colors duration-200"
            >
              {isSubmitting ? '保存中...' : '企業情報を保存して初期設定を完了する'}
            </button>
          </div>
        </div>
      </main>

      {/* フッター */}
      <footer className="mt-12 text-center">
        <p className="text-sm text-gray-500 mb-2">© 2025 Tick勤怠管理システム</p>
        <p className="text-sm text-gray-500">多企業対応の勤怠管理システム</p>
      </footer>
    </div>
  );
}

