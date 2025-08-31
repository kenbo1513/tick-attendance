// 勤怠データを強制的にリセットするスクリプト
// ブラウザのコンソールで実行してください

console.log('勤怠データ強制リセットスクリプトを実行中...');

// 既存の打刻データを削除
localStorage.removeItem('tick_timeRecords');
console.log('✅ tick_timeRecords を削除しました');

// 既存のアプリデータも削除
localStorage.removeItem('tick_app_data');
console.log('✅ tick_app_data を削除しました');

// 新しいサンプルデータを作成
const sampleTimeRecords = [
  {
    id: '1',
    employeeId: '0001',
    employeeName: '田中太郎',
    type: 'clockIn',
    time: '09:00',
    date: '2025-08-30',
    location: '東京都渋谷区',
    ipAddress: '192.168.1.100',
    deviceInfo: 'iPhone 14, Chrome 120.0',
    notes: ''
  },
  {
    id: '2',
    employeeId: '0002',
    employeeName: '田中太郎',
    type: 'clockIn',
    time: '09:00',
    date: '2025-08-30',
    location: '東京都渋谷区',
    ipAddress: '192.168.1.100',
    deviceInfo: 'iPhone 14, Chrome 120.0',
    notes: ''
  }
];

// 新しい打刻データを保存
localStorage.setItem('tick_timeRecords', JSON.stringify(sampleTimeRecords));
console.log('✅ 新しい打刻データを作成しました:', sampleTimeRecords);

// サンプル社員データを作成
const sampleEmployees = [
  {
    id: '12345',
    name: '田中太郎',
    department: '営業部',
    position: '主任',
    hourlyWage: 1200,
    monthlySalary: 250000,
    isActive: true
  }
];

// 新しい社員データを保存
const appData = {
  employees: sampleEmployees,
  attendanceRecords: []
};
localStorage.setItem('tick_app_data', JSON.stringify(appData));
console.log('✅ 新しい社員データを作成しました:', appData);

console.log('🎉 リセット完了！ページを再読み込みしてください');
console.log('location.reload(); を実行してください');
