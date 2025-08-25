// 社員データの型定義
export interface Employee {
  id: string;
  name: string;
  department: string;
  position: string;
  hourlyWage?: number;
  monthlySalary?: number;
  isAdmin?: boolean;
  isActive?: boolean;
  hireDate?: string;
}

// 打刻データの型定義
export interface AttendanceRecord {
  id: string;
  employeeId: string;
  employeeName: string;
  date: string;
  clockIn?: string;
  clockOut?: string;
  breakStart?: string;
  breakEnd?: string;
  location?: string;
  ipAddress?: string;
  deviceInfo?: string;
  notes?: string;
}

// 統合データの型定義
export interface AppData {
  employees: Employee[];
  attendanceRecords: AttendanceRecord[];
  lastUpdated: string;
}

// ローカルストレージのキー
const STORAGE_KEYS = {
  APP_DATA: 'tick_app_data'
} as const;

// デフォルトの社員データ
const DEFAULT_EMPLOYEES: Employee[] = [
  { 
    id: '12345', 
    name: '田中太郎', 
    department: '営業部', 
    position: '主任',
    hourlyWage: 1200,
    monthlySalary: 250000,
    isAdmin: false,
    isActive: true,
    hireDate: '2020-04-01'
  },
  { 
    id: '67890', 
    name: '佐藤花子', 
    department: '総務部', 
    position: '課長',
    hourlyWage: 1500,
    monthlySalary: 350000,
    isAdmin: true,
    isActive: true,
    hireDate: '2018-04-01'
  },
  { 
    id: '11111', 
    name: '山田次郎', 
    department: '開発部', 
    position: 'エンジニア',
    hourlyWage: 1300,
    monthlySalary: 280000,
    isAdmin: false,
    isActive: true,
    hireDate: '2021-04-01'
  },
  { 
    id: '22222', 
    name: '鈴木一郎', 
    department: '営業部', 
    position: 'マネージャー',
    hourlyWage: 1800,
    monthlySalary: 400000,
    isAdmin: false,
    isActive: true,
    hireDate: '2015-04-01'
  },
  { 
    id: '33333', 
    name: '高橋美咲', 
    department: '人事部', 
    position: '担当者',
    hourlyWage: 1100,
    monthlySalary: 230000,
    isAdmin: false,
    isActive: true,
    hireDate: '2022-04-01'
  }
];

// デフォルトの打刻データ（今日のサンプル）
const DEFAULT_ATTENDANCE_RECORDS: AttendanceRecord[] = [
  {
    id: '1',
    employeeId: '12345',
    employeeName: '田中太郎',
    date: new Date().toISOString().split('T')[0],
    clockIn: '09:00',
    location: '東京オフィス',
    ipAddress: '192.168.1.100',
    deviceInfo: 'Chrome/Windows',
    notes: '通常出勤'
  },
  {
    id: '2',
    employeeId: '67890',
    employeeName: '佐藤花子',
    date: new Date().toISOString().split('T')[0],
    clockIn: '08:45',
    location: '東京オフィス',
    ipAddress: '192.168.1.101',
    deviceInfo: 'Chrome/Windows',
    notes: '早めの出勤'
  },
  {
    id: '3',
    employeeId: '11111',
    employeeName: '山田次郎',
    date: new Date().toISOString().split('T')[0],
    clockIn: '09:15',
    location: '東京オフィス',
    ipAddress: '192.168.1.102',
    deviceInfo: 'Safari/Mac',
    notes: '通常出勤'
  }
];

// 全データの保存
export const saveAppData = (data: AppData): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.APP_DATA, JSON.stringify(data));
    console.log('アプリデータを保存しました');
  } catch (error) {
    console.error('データ保存エラー:', error);
  }
};

// 全データの読み込み
export const loadAppData = (): AppData => {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.APP_DATA);
    if (data) {
      return JSON.parse(data);
    }
    
    // データがない場合は初期化
    initializeApp();
    return loadAppData();
  } catch (error) {
    console.error('データ読み込みエラー:', error);
    // エラー時はデフォルトデータを返す
    return {
      employees: DEFAULT_EMPLOYEES,
      attendanceRecords: DEFAULT_ATTENDANCE_RECORDS,
      lastUpdated: new Date().toISOString()
    };
  }
};

// 社員データの保存
export const saveEmployeeData = (data: Employee[]): void => {
  try {
    const appData = loadAppData();
    appData.employees = data;
    appData.lastUpdated = new Date().toISOString();
    saveAppData(appData);
    console.log('社員データを保存しました');
  } catch (error) {
    console.error('社員データ保存エラー:', error);
  }
};

// 社員データの読み込み
export const loadEmployeeData = (): Employee[] => {
  try {
    const appData = loadAppData();
    return appData.employees;
  } catch (error) {
    console.error('社員データ読み込みエラー:', error);
    return DEFAULT_EMPLOYEES;
  }
};

// 打刻データの保存
export const saveAttendanceData = (data: AttendanceRecord[]): void => {
  try {
    const appData = loadAppData();
    appData.attendanceRecords = data;
    appData.lastUpdated = new Date().toISOString();
    saveAppData(appData);
    console.log('打刻データを保存しました');
  } catch (error) {
    console.error('打刻データ保存エラー:', error);
  }
};

// 打刻データの読み込み
export const loadAttendanceData = (): AttendanceRecord[] => {
  try {
    const appData = loadAppData();
    return appData.attendanceRecords;
  } catch (error) {
    console.error('打刻データ読み込みエラー:', error);
    return DEFAULT_ATTENDANCE_RECORDS;
  }
};

// 特定の日付の打刻データを取得
export const getAttendanceByDate = (date: string): AttendanceRecord[] => {
  try {
    const records = loadAttendanceData();
    return records.filter(record => record.date === date);
  } catch (error) {
    console.error('日付別打刻データ取得エラー:', error);
    return [];
  }
};

// 特定の社員の打刻データを取得
export const getAttendanceByEmployee = (employeeId: string): AttendanceRecord[] => {
  try {
    const records = loadAttendanceData();
    return records.filter(record => record.employeeId === employeeId);
  } catch (error) {
    console.error('社員別打刻データ取得エラー:', error);
    return [];
  }
};

// 新しい打刻記録の追加
export const addAttendanceRecord = (record: Omit<AttendanceRecord, 'id'>): void => {
  try {
    const records = loadAttendanceData();
    const newRecord: AttendanceRecord = {
      ...record,
      id: Date.now().toString() // 簡易的なID生成
    };
    
    records.push(newRecord);
    saveAttendanceData(records);
    console.log('新しい打刻記録を追加しました');
  } catch (error) {
    console.error('打刻記録追加エラー:', error);
  }
};

// 新しい社員の追加
export const addEmployee = (employee: Omit<Employee, 'id'>): void => {
  try {
    const employees = loadEmployeeData();
    const newEmployee: Employee = {
      ...employee,
      id: Date.now().toString() // 簡易的なID生成
    };
    
    employees.push(newEmployee);
    saveEmployeeData(employees);
    console.log('新しい社員を追加しました');
  } catch (error) {
    console.error('社員追加エラー:', error);
  }
};

// 社員データの更新
export const updateEmployee = (id: string, updates: Partial<Employee>): void => {
  try {
    const employees = loadEmployeeData();
    const index = employees.findIndex(emp => emp.id === id);
    
    if (index !== -1) {
      employees[index] = { ...employees[index], ...updates };
      saveEmployeeData(employees);
      console.log('社員データを更新しました');
    }
  } catch (error) {
    console.error('社員データ更新エラー:', error);
  }
};

// 社員データの削除
export const deleteEmployee = (id: string): void => {
  try {
    const employees = loadEmployeeData();
    const filteredEmployees = employees.filter(emp => emp.id !== id);
    
    if (filteredEmployees.length !== employees.length) {
      saveEmployeeData(filteredEmployees);
      console.log('社員データを削除しました');
    }
  } catch (error) {
    console.error('社員データ削除エラー:', error);
  }
};

// データの完全リセット
export const resetAllData = (): void => {
  try {
    localStorage.removeItem(STORAGE_KEYS.APP_DATA);
    
    // 初期データを再設定
    initializeApp();
    console.log('全データをリセットしました');
  } catch (error) {
    console.error('データリセットエラー:', error);
  }
};

// データのバックアップ（JSON形式でダウンロード）
export const exportData = (): void => {
  try {
    const data = loadAppData();
    const jsonString = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `tick_attendance_data_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    console.log('データをエクスポートしました');
  } catch (error) {
    console.error('データエクスポートエラー:', error);
  }
};

// データのインポート
export const importData = (jsonString: string): boolean => {
  try {
    const data = JSON.parse(jsonString);
    
    // データ構造の検証
    if (data.employees && data.attendanceRecords && data.lastUpdated) {
      saveAppData(data);
      console.log('データをインポートしました');
      return true;
    } else {
      console.error('無効なデータ形式です');
      return false;
    }
  } catch (error) {
    console.error('データインポートエラー:', error);
    return false;
  }
};

// データの整合性チェック
export const validateData = (): boolean => {
  try {
    const data = loadAppData();
    
    // 基本的な構造チェック
    if (!Array.isArray(data.employees) || !Array.isArray(data.attendanceRecords)) {
      return false;
    }
    
    // 社員データの整合性チェック
    const employeeIds = new Set(data.employees.map(emp => emp.id));
    const recordEmployeeIds = new Set(data.attendanceRecords.map(record => record.employeeId));
    
    // 打刻記録の社員IDが社員データに存在するかチェック
    recordEmployeeIds.forEach(recordId => {
      if (!employeeIds.has(recordId)) {
        console.warn(`存在しない社員IDの打刻記録: ${recordId}`);
        return false;
      }
    });
    
    return true;
  } catch (error) {
    console.error('データ整合性チェックエラー:', error);
    return false;
  }
};

// データの自動修復
export const repairData = (): void => {
  try {
    if (!validateData()) {
      console.log('データの修復を開始します');
      
      // 存在しない社員IDの打刻記録を削除
      const employees = loadEmployeeData();
      const employeeIds = new Set(employees.map(emp => emp.id));
      const records = loadAttendanceData();
      const validRecords = records.filter(record => employeeIds.has(record.employeeId));
      
      if (validRecords.length !== records.length) {
        saveAttendanceData(validRecords);
        console.log(`${records.length - validRecords.length}件の無効な打刻記録を削除しました`);
      }
      
      // 最終更新時刻を更新
      const data = loadAppData();
      data.lastUpdated = new Date().toISOString();
      saveAppData(data);
      
      console.log('データの修復が完了しました');
    }
  } catch (error) {
    console.error('データ修復エラー:', error);
  }
};

// アプリケーション起動時の初期化
export const initializeApp = (): void => {
  console.log('Tick勤怠管理システムの初期化を開始します');
  
  try {
    // 既存データがあるかチェック
    const existingData = localStorage.getItem(STORAGE_KEYS.APP_DATA);
    
    if (!existingData) {
      // 初回起動時はデフォルトデータを設定
      const initialData: AppData = {
        employees: DEFAULT_EMPLOYEES,
        attendanceRecords: DEFAULT_ATTENDANCE_RECORDS,
        lastUpdated: new Date().toISOString()
      };
      
      saveAppData(initialData);
      console.log('初期データを設定しました');
    }
    
    // データの整合性チェックと修復
    repairData();
    
    console.log('初期化が完了しました');
  } catch (error) {
    console.error('初期化エラー:', error);
  }
};
