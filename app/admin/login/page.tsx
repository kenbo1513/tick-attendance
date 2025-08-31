'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Clock, 
  User, 
  Lock, 
  ArrowRight, 
  Shield, 
  AlertCircle 
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
    <div className="min-h-screen bg-green-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* ロゴとタイトル */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-green-600 rounded-2xl mb-6 shadow-2xl transform hover:scale-105 transition-transform duration-300">
            <Shield className="w-12 h-12 text-white" />
          </div>
          <h1 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-green-800 mb-3">Tick</h1>
          <p className="text-xl text-green-700 font-medium">管理者ログイン</p>
          <p className="text-sm text-green-600 mt-2">システム管理用</p>
        </div>

        {/* ログインフォーム */}
        <div className="bg-white rounded-3xl shadow-2xl p-8 border border-green-200">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-green-800 mb-3">管理者認証</h2>
            <p className="text-green-700">管理者IDとパスワードを入力してください</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            {/* 管理者ID入力 */}
            <div>
              <label htmlFor="adminId" className="block text-sm font-semibold text-green-700 mb-3">
                管理者ID
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-green-400 group-focus-within:text-green-600 transition-colors" />
                </div>
                <input
                  id="adminId"
                  type="text"
                  value={adminId}
                  onChange={handleAdminIdChange}
                  onKeyUp={handleKeyPress}
                  className="block w-full pl-12 pr-4 py-4 text-xl font-medium border-2 border-green-200 rounded-2xl focus:ring-4 focus:ring-green-100 focus:border-green-500 transition-all duration-200 bg-white"
                  placeholder="管理者ID"
                  required
                  autoFocus
                />
              </div>
            </div>

            {/* パスワード入力 */}
            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-green-700 mb-3">
                パスワード
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-green-400 group-focus-within:text-green-600 transition-colors" />
                </div>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={handlePasswordChange}
                  onKeyUp={handleKeyPress}
                  className="block w-full pl-12 pr-4 py-4 text-xl font-medium border-2 border-green-200 rounded-2xl focus:ring-4 focus:ring-green-100 focus:border-green-500 transition-all duration-200 bg-white"
                  placeholder="パスワード"
                  required
                />
              </div>
            </div>

            {/* エラーメッセージ */}
            {errorMessage && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                <div className="flex items-center space-x-2">
                  <AlertCircle className="w-5 h-5 text-red-600" />
                  <p className="text-red-800 font-medium">{errorMessage}</p>
                </div>
              </div>
            )}

            {/* ログインボタン */}
            <button
              type="submit"
              disabled={!adminId.trim() || !password.trim() || isLoading}
              className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 disabled:from-green-300 disabled:to-green-400 disabled:cursor-not-allowed text-white font-bold py-4 px-6 rounded-2xl text-lg transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1 active:translate-y-0 group"
            >
              <span className="flex items-center justify-center">
                {isLoading ? '認証中...' : 'ログイン'}
                {!isLoading && <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />}
              </span>
            </button>
          </form>

          {/* 共有端末に戻るリンク */}
          <div className="mt-8 pt-6 border-t border-green-200">
            <button
              onClick={() => router.push('/')}
              className="inline-flex items-center text-sm text-green-600 hover:text-green-800 transition-colors font-medium"
            >
              <Clock className="w-4 h-4 mr-2" />
              共有端末に戻る
            </button>
          </div>
        </div>

        {/* フッター */}
        <div className="text-center mt-8">
          <p className="text-sm text-green-600">
            © 2025 Tick勤怠管理システム
          </p>
        </div>
      </div>
    </div>
  );
}

