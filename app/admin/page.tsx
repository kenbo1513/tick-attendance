'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Shield, Building2, AlertCircle, CheckCircle } from 'lucide-react';
import { authenticateAdmin, loadCompanyInfo, isCompanyInitialized, logSecurityEvent } from '../lib/auth';

export default function AdminLoginPage() {
  const router = useRouter();
  const [adminId, setAdminId] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [companyInfo, setCompanyInfo] = useState<any>(null);
  const [isCompanyReady, setIsCompanyReady] = useState(false);

  // 企業情報の確認
  useEffect(() => {
    try {
      const company = loadCompanyInfo();
      setCompanyInfo(company);
      
      if (company) {
        setIsCompanyReady(isCompanyInitialized());
      }
    } catch (error) {
      console.error('企業情報確認エラー:', error);
    }
  }, []);

  // ログイン処理
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!adminId.trim() || !password.trim()) {
      setErrorMessage('管理者IDとパスワードを入力してください');
      return;
    }

    setIsLoading(true);
    setErrorMessage('');

    try {
      // 企業情報の確認
      if (!companyInfo) {
        setErrorMessage('企業情報が設定されていません。初期設定を行ってください。');
        return;
      }

      if (!isCompanyReady) {
        setErrorMessage('システムの初期設定が完了していません。初期設定を完了してください。');
        return;
      }

      // 管理者認証
      const adminUser = authenticateAdmin(adminId.trim(), password.trim());
      
      if (adminUser) {
        // セキュリティログ
        logSecurityEvent('管理者ログイン成功', { 
          username: adminId, 
          companyId: companyInfo.id,
          companyName: companyInfo.name 
        });
        
        // 管理者ダッシュボードへリダイレクト
        router.push('/admin/dashboard');
      } else {
        setErrorMessage('管理者IDまたはパスワードが正しくありません');
        
        // セキュリティログ
        logSecurityEvent('管理者ログイン失敗', { 
          username: adminId, 
          companyId: companyInfo.id,
          companyName: companyInfo.name 
        });
      }
    } catch (error) {
      console.error('ログインエラー:', error);
      setErrorMessage('ログイン処理中にエラーが発生しました');
    } finally {
      setIsLoading(false);
    }
  };

  // 初期設定画面へリダイレクト
  const handleGoToSetup = () => {
    router.push('/admin/setup');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 border border-white/20 max-w-md w-full">
        {/* ヘッダー */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-slate-800 mb-2">管理者ログイン</h1>
          <p className="text-slate-600">管理者アカウントでログインしてください</p>
        </div>

        {/* 企業情報表示 */}
        {companyInfo && (
          <div className="mb-6 p-4 bg-slate-50 rounded-xl border border-slate-200">
            <div className="flex items-center space-x-2 mb-2">
              <Building2 className="w-4 h-4 text-slate-600" />
              <span className="text-sm font-medium text-slate-700">企業情報</span>
            </div>
            <div className="text-center">
              <p className="text-lg font-semibold text-slate-800">{companyInfo.name}</p>
              <p className="text-sm text-slate-600">{companyInfo.id}</p>
              <div className="flex items-center justify-center space-x-2 mt-2">
                {isCompanyReady ? (
                  <>
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span className="text-sm text-green-600">初期設定完了</span>
                  </>
                ) : (
                  <>
                    <AlertCircle className="w-4 h-4 text-yellow-600" />
                    <span className="text-sm text-yellow-600">初期設定未完了</span>
                  </>
                )}
              </div>
            </div>
          </div>
        )}

        {/* 初期設定未完了の場合 */}
        {companyInfo && !isCompanyReady && (
          <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
            <div className="flex items-center space-x-2 mb-2">
              <AlertCircle className="w-4 h-4 text-yellow-600" />
              <span className="text-sm font-medium text-yellow-800">初期設定が必要です</span>
            </div>
            <p className="text-sm text-yellow-700 mb-3">
              システムの初期設定が完了していません。初期設定を完了してからログインしてください。
            </p>
            <button
              onClick={handleGoToSetup}
              className="w-full bg-yellow-600 hover:bg-yellow-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200 text-sm"
            >
              初期設定を完了する
            </button>
          </div>
        )}

        {/* 企業情報が存在しない場合 */}
        {!companyInfo && (
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-xl">
            <div className="flex items-center space-x-2 mb-2">
              <Building2 className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-800">初回アクセス</span>
            </div>
            <p className="text-sm text-blue-700 mb-3">
              初回アクセスを検出しました。企業情報の登録と初期設定を行ってください。
            </p>
            <button
              onClick={handleGoToSetup}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200 text-sm"
            >
              企業情報登録・初期設定
            </button>
          </div>
        )}

        {/* ログインフォーム */}
        {companyInfo && isCompanyReady && (
          <form onSubmit={handleLogin} className="space-y-4">
            {/* 管理者ID */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                管理者ID
              </label>
              <input
                type="text"
                value={adminId}
                onChange={(e) => setAdminId(e.target.value)}
                placeholder="管理者IDを入力"
                className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={isLoading}
              />
            </div>

            {/* パスワード */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                パスワード
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="パスワードを入力"
                className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={isLoading}
              />
            </div>

            {/* エラーメッセージ */}
            {errorMessage && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600">{errorMessage}</p>
              </div>
            )}

            {/* ログインボタン */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-400 text-white font-semibold py-3 px-6 rounded-xl transition-colors duration-200"
            >
              {isLoading ? 'ログイン中...' : 'ログイン'}
            </button>
          </form>
        )}

        {/* フッター */}
        <div className="mt-8 text-center">
          <p className="text-sm text-slate-500 mb-2">© 2024 Tick勤怠管理システム</p>
          <p className="text-xs text-slate-400">多企業対応の勤怠管理システム</p>
        </div>
      </div>
    </div>
  );
}
