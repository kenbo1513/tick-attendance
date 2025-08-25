import { useState, useEffect } from 'react';

interface AuthUser {
  companyId: string;
  companyName: string;
  adminId: string;
  adminName: string;
  token: string;
}

export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // ローカルストレージから認証情報を読み込み
    const token = localStorage.getItem('tick_auth_token');
    const companyId = localStorage.getItem('tick_company_id');
    const adminId = localStorage.getItem('tick_admin_id');

    if (token && companyId && adminId) {
      // 簡易的な認証状態復元（実際の運用ではトークンの有効性を検証）
      setUser({
        companyId,
        companyName: '企業名', // 実際の運用ではAPIから取得
        adminId,
        adminName: '管理者名', // 実際の運用ではAPIから取得
        token
      });
    }
    
    setIsLoading(false);
  }, []);

  const login = async (companyId: string, adminId: string, password: string) => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ companyId, adminId, password }),
      });

      if (response.ok) {
        const data = await response.json();
        const authUser: AuthUser = {
          companyId: data.company.id,
          companyName: data.company.name,
          adminId: data.admin.id,
          adminName: data.admin.name,
          token: data.token
        };

        // ローカルストレージに保存
        localStorage.setItem('tick_auth_token', data.token);
        localStorage.setItem('tick_company_id', data.company.id);
        localStorage.setItem('tick_admin_id', data.admin.id);

        setUser(authUser);
        return { success: true };
      } else {
        const errorData = await response.json();
        return { success: false, message: errorData.message };
      }
    } catch (error) {
      return { success: false, message: 'ネットワークエラーが発生しました' };
    }
  };

  const logout = () => {
    localStorage.removeItem('tick_auth_token');
    localStorage.removeItem('tick_company_id');
    localStorage.removeItem('tick_admin_id');
    setUser(null);
  };

  const isAuthenticated = !!user;

  return {
    user,
    isLoading,
    isAuthenticated,
    login,
    logout
  };
}
