// 多企業対応の認証システム
export interface AdminUser {
  id: string;
  username: string;
  name: string;
  companyId: string;
  role: 'admin' | 'super_admin';
  lastLogin: string;
  createdAt: string;
}

export interface CompanyInfo {
  id: string;
  name: string;
  adminUsername: string;
  adminName: string;
  createdAt: string;
  isInitialized: boolean;
}

export interface CompanySettings {
  companyId: string;
  workStartTime: string;
  workEndTime: string;
  breakStartTime: string;
  breakEndTime: string;
  createdAt: string;
  updatedAt: string;
}

// 企業情報の保存
export const saveCompanyInfo = (companyInfo: CompanyInfo): void => {
  try {
    localStorage.setItem('tick_company', JSON.stringify(companyInfo));
  } catch (error) {
    console.error('企業情報保存エラー:', error);
    throw new Error('企業情報の保存に失敗しました');
  }
};

// 企業情報の読み込み
export const loadCompanyInfo = (): CompanyInfo | null => {
  try {
    const saved = localStorage.getItem('tick_company');
    return saved ? JSON.parse(saved) : null;
  } catch (error) {
    console.error('企業情報読み込みエラー:', error);
    return null;
  }
};

// 管理者情報の保存
export const saveAdminUser = (adminUser: AdminUser): void => {
  try {
    localStorage.setItem('tick_admin', JSON.stringify(adminUser));
  } catch (error) {
    console.error('管理者情報保存エラー:', error);
    throw new Error('管理者情報の保存に失敗しました');
  }
};

// 管理者情報の読み込み
export const loadAdminUser = (): AdminUser | null => {
  try {
    const saved = localStorage.getItem('tick_admin');
    return saved ? JSON.parse(saved) : null;
  } catch (error) {
    console.error('管理者情報読み込みエラー:', error);
    return null;
  }
};

// 企業設定の保存
export const saveCompanySettings = (settings: CompanySettings): void => {
  try {
    localStorage.setItem(`tick_settings_${settings.companyId}`, JSON.stringify(settings));
  } catch (error) {
    console.error('企業設定保存エラー:', error);
    throw new Error('企業設定の保存に失敗しました');
  }
};

// 企業設定の読み込み
export const loadCompanySettings = (companyId: string): CompanySettings | null => {
  try {
    const saved = localStorage.getItem(`tick_settings_${companyId}`);
    return saved ? JSON.parse(saved) : null;
  } catch (error) {
    console.error('企業設定読み込みエラー:', error);
    return null;
  }
};

// 企業ID生成
export const generateCompanyId = (): string => {
  const randomNum = Math.floor(Math.random() * 9000000) + 1000000; // 7桁の数字
  return `K-${randomNum}`;
};

// 管理者認証
export const authenticateAdmin = (username: string, password: string): AdminUser | null => {
  try {
    const companyInfo = loadCompanyInfo();
    if (!companyInfo) {
      return null;
    }

    // 企業ごとの管理者認証
    if (username === companyInfo.adminUsername) {
      // パスワードは簡易的なハッシュで検証（本格運用ではbcrypt等を使用）
      const hashedPassword = btoa(password + companyInfo.id); // Base64エンコード
      const storedPassword = localStorage.getItem(`tick_admin_password_${companyInfo.id}`);
      
      if (storedPassword === hashedPassword) {
        const adminUser: AdminUser = {
          id: `admin_${companyInfo.id}`,
          username: username,
          name: companyInfo.adminName,
          companyId: companyInfo.id,
          role: 'admin',
          lastLogin: new Date().toISOString(),
          createdAt: companyInfo.createdAt
        };
        
        saveAdminUser(adminUser);
        return adminUser;
      }
    }
    
    return null;
  } catch (error) {
    console.error('認証エラー:', error);
    return null;
  }
};

// 管理者セッション確認
export const checkAdminSession = (): AdminUser | null => {
  try {
    const adminUser = loadAdminUser();
    if (!adminUser) {
      return null;
    }

    // セッション有効期限チェック（24時間）
    const lastLogin = new Date(adminUser.lastLogin);
    const now = new Date();
    const hoursDiff = (now.getTime() - lastLogin.getTime()) / (1000 * 60 * 60);
    
    if (hoursDiff > 24) {
      localStorage.removeItem('tick_admin');
      return null;
    }

    return adminUser;
  } catch (error) {
    console.error('セッション確認エラー:', error);
    return null;
  }
};

// 管理者ログアウト
export const logoutAdmin = (): void => {
  try {
    localStorage.removeItem('tick_admin');
  } catch (error) {
    console.error('ログアウトエラー:', error);
  }
};

// 企業初期化状態の確認
export const isCompanyInitialized = (): boolean => {
  try {
    const companyInfo = loadCompanyInfo();
    return companyInfo ? companyInfo.isInitialized : false;
  } catch (error) {
    console.error('初期化状態確認エラー:', error);
    return false;
  }
};

// 企業データの初期化
export const initializeCompanyData = (): void => {
  try {
    // 既存のサンプルデータを削除
    localStorage.removeItem('tick_employees');
    localStorage.removeItem('tick_timeRecords');
    
    // 空の配列で初期化
    localStorage.setItem('tick_employees', JSON.stringify([]));
    localStorage.setItem('tick_timeRecords', JSON.stringify([]));
  } catch (error) {
    console.error('企業データ初期化エラー:', error);
    throw new Error('企業データの初期化に失敗しました');
  }
};

// セキュリティイベントのログ
export const logSecurityEvent = (event: string, details?: any): void => {
  try {
    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      event,
      details,
      userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : 'server'
    };
    
    console.log('Security Event:', logEntry);
    
    // 本格運用ではサーバーサイドにログを送信
    // 現在はlocalStorageに保存
    const logs = JSON.parse(localStorage.getItem('tick_security_logs') || '[]');
    logs.push(logEntry);
    if (logs.length > 1000) logs.shift(); // 最新1000件を保持
    localStorage.setItem('tick_security_logs', JSON.stringify(logs));
  } catch (error) {
    console.error('セキュリティログ記録エラー:', error);
  }
};
