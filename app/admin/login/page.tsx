'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Clock, 
  User, 
  Lock, 
  ArrowRight, 
  Shield, 
  AlertCircle,
  Building2,
  CheckCircle
} from 'lucide-react';
import { initializeApp } from '../../lib/localStorage';

export default function AdminLoginPage() {
  const [adminId, setAdminId] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const router = useRouter();

  // アプリケーション初期化
  useEffect(() => {
    initializeApp();
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
      // 簡易認証（実際の運用では適切な認証システムを使用）
      if (adminId.toLowerCase().trim() === 'admin' && password.trim() === 'password') {
        // 管理者情報をlocalStorageに保存
        const adminInfo = {
          id: adminId.trim(),
          name: '管理者',
          role: 'admin'
        };
        localStorage.setItem('tick_admin', JSON.stringify(adminInfo));
        
        // 管理者ダッシュボードに遷移
        router.push('/admin/dashboard');
      } else {
        setErrorMessage('管理者IDまたはパスワードが正しくありません');
      }
    } catch (error) {
      console.error('ログインエラー:', error);
      setErrorMessage('ログイン処理中にエラーが発生しました');
    } finally {
      setIsLoading(false);
    }
  };

  // 入力値の変更処理
  const handleAdminIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAdminId(e.target.value);
    if (errorMessage) setErrorMessage('');
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
    if (errorMessage) setErrorMessage('');
  };

  // キーボードショートカット
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && adminId.trim() && password.trim()) {
      handleLogin(e as any);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* ロゴとタイトル */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-600 rounded-full mb-4 shadow-lg">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">管理者ログイン</h1>
          <p className="text-sm text-gray-600">管理者アカウントでログインしてください</p>
        </div>

        {/* 企業情報カード */}
        <div className="bg-gray-100 rounded-lg p-4 mb-6">
          <div className="flex items-center mb-2">
            <Building2 className="w-4 h-4 text-gray-500 mr-2" />
            <span className="text-sm text-gray-600 font-medium">企業情報</span>
          </div>
          <div className="text-center">
            <p className="text-lg font-bold text-gray-800 mb-1">株式会社サンプル</p>
            <p className="text-sm text-gray-600 mb-2">K-7127372</p>
            <div className="flex items-center justify-center text-green-600">
              <CheckCircle className="w-4 h-4 mr-1" />
              <span className="text-sm font-medium">初期設定完了</span>
            </div>
          </div>
        </div>

        {/* ログインフォーム */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <form onSubmit={handleLogin} className="space-y-4">
            {/* 管理者ID入力 */}
            <div>
              <label htmlFor="adminId" className="block text-sm font-medium text-gray-700 mb-2">
                管理者ID
              </label>
              <input
                id="adminId"
                type="text"
                value={adminId}
                onChange={handleAdminIdChange}
                onKeyUp={handleKeyPress}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                placeholder="管理者IDを入力"
                required
                autoFocus
              />
            </div>

            {/* パスワード入力 */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                パスワード
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={handlePasswordChange}
                onKeyUp={handleKeyPress}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                placeholder="パスワードを入力"
                required
              />
            </div>

            {/* エラーメッセージ */}
            {errorMessage && (
              <div className="bg-red-50 border border-red-200 rounded-md p-3">
                <div className="flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4 text-red-600" />
                  <p className="text-sm text-red-800">{errorMessage}</p>
                </div>
              </div>
            )}

            {/* ログインボタン */}
            <button
              type="submit"
              disabled={!adminId.trim() || !password.trim() || isLoading}
              className="w-full bg-green-600 hover:bg-green-700 disabled:bg-green-300 disabled:cursor-not-allowed text-white font-semibold py-2 px-4 rounded-md transition-colors duration-200"
            >
              {isLoading ? '認証中...' : 'ログイン'}
            </button>
          </form>
        </div>

        {/* フッター */}
        <div className="text-center mt-8">
          <p className="text-sm text-gray-500">
            © 2025 Tick勤怠管理システム
          </p>
          <p className="text-sm text-gray-500 mt-1">
            多企業対応の勤怠管理システム
          </p>
        </div>
      </div>
    </div>
  );
}

