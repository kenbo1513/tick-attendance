// デバッグ用のテストデータ作成スクリプト
// ブラウザのコンソールで実行してください

console.log('デバッグ用のテストデータを作成中...');

// 企業情報の作成
const companyInfo = {
  id: 'K-1234567',
  name: 'テスト株式会社',
  adminUsername: 'admin',
  adminName: '管理者',
  createdAt: new Date().toISOString(),
  isInitialized: true
};

// 管理者情報の作成
const adminUser = {
  id: 'admin_K-1234567',
  username: 'admin',
  name: '管理者',
  companyId: 'K-1234567',
  role: 'admin',
  lastLogin: new Date().toISOString(),
  createdAt: new Date().toISOString()
};

// 企業設定の作成
const companySettings = {
  companyId: 'K-1234567',
  workStartTime: '09:00',
  workEndTime: '18:00',
  breakStartTime: '12:00',
  breakEndTime: '13:00',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
};

// 管理者パスワードの設定
const adminPassword = 'admin123';
const hashedPassword = btoa(adminPassword + companyInfo.id);

// localStorageに保存
try {
  localStorage.setItem('tick_company', JSON.stringify(companyInfo));
  localStorage.setItem('tick_admin', JSON.stringify(adminUser));
  localStorage.setItem(`tick_settings_${companyInfo.id}`, JSON.stringify(companySettings));
  localStorage.setItem(`tick_admin_password_${companyInfo.id}`, hashedPassword);
  
  // サンプル社員データ
  const sampleEmployees = [
    {
      id: '001',
      name: '田中太郎',
      department: '営業部',
      position: '主任',
      hourlyWage: 1200,
      monthlySalary: 250000,
      isActive: true
    },
    {
      id: '002',
      name: '佐藤花子',
      department: '総務部',
      position: '課長',
      hourlyWage: 1500,
      monthlySalary: 300000,
      isActive: true
    }
  ];
  
  localStorage.setItem('tick_employees', JSON.stringify(sampleEmployees));
  
  console.log('✅ テストデータの作成が完了しました！');
  console.log('企業情報:', companyInfo);
  console.log('管理者情報:', adminUser);
  console.log('企業設定:', companySettings);
  console.log('サンプル社員:', sampleEmployees);
  console.log('');
  console.log('📝 次の手順:');
  console.log('1. ページをリロードしてください');
  console.log('2. 管理者ダッシュボードにアクセスしてください');
  console.log('3. ログイン情報: admin / admin123');
  
} catch (error) {
  console.error('❌ テストデータの作成に失敗しました:', error);
}
