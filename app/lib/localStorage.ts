// 社員データの型定義
export interface Employee {
  id: string;
  name: string;
  department: string;
  position: string;
  hourlyWage?: number;
  monthlySalary?: number;
  transportationAllowance?: number; // 交通費
  mealAllowance?: number; // 食事手当
  overtimeRate?: number; // 残業倍率
  nightShiftRate?: number; // 夜勤手当倍率
  holidayRate?: number; // 休日出勤倍率
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

// 勤務記録の型定義
export interface TimeRecord {
  id: string;
  employeeId: string;
  employeeName: string;
  department?: string; // 部署情報を追加
  type: 'clockIn' | 'clockOut' | 'breakStart' | 'breakEnd';
  time: string;
  date: string;
  location?: string;
  ipAddress?: string;
  deviceInfo?: string;
  notes?: string;
}

// 申請関連の型定義
export interface ApprovalRequest {
  id: string;
  employeeId: string;
  employeeName: string;
  department: string;
  requestType: 'timeCorrection' | 'leaveRequest';
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: string;
  processedAt?: string;
  processedBy?: string;
  reason?: string;
  notes?: string;
}

// 時刻修正申請の型定義
export interface TimeCorrectionRequest extends ApprovalRequest {
  requestType: 'timeCorrection';
  originalRecord: {
    id: string;
    date: string;
    time: string;
    type: string;
  };
  requestedChanges: {
    date: string;
    time: string;
    type: string;
    notes: string;
  };
}

// 休暇申請の型定義
export interface LeaveRequest extends ApprovalRequest {
  requestType: 'leaveRequest';
  leaveType: 'paid' | 'unpaid' | 'sick' | 'special';
  startDate: string;
  endDate: string;
  days: number;
  reason: string;
  supportingDocuments?: string[];
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
    transportationAllowance: 15000,
    mealAllowance: 8000,
    overtimeRate: 1.25,
    nightShiftRate: 1.35,
    holidayRate: 1.5,
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
    transportationAllowance: 20000,
    mealAllowance: 10000,
    overtimeRate: 1.25,
    nightShiftRate: 1.35,
    holidayRate: 1.5,
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
    transportationAllowance: 12000,
    mealAllowance: 8000,
    overtimeRate: 1.25,
    nightShiftRate: 1.35,
    holidayRate: 1.5,
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
    transportationAllowance: 25000,
    mealAllowance: 12000,
    overtimeRate: 1.25,
    nightShiftRate: 1.35,
    holidayRate: 1.5,
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
    transportationAllowance: 10000,
    mealAllowance: 6000,
    overtimeRate: 1.25,
    nightShiftRate: 1.35,
    holidayRate: 1.5,
    isAdmin: false,
    isActive: true,
    hireDate: '2022-04-01'
  },
  { 
    id: '3397535', 
    name: '高田賢', 
    department: '開発部', 
    position: 'エンジニア',
    hourlyWage: 1400,
    monthlySalary: 300000,
    isAdmin: false,
    isActive: true,
    hireDate: '2023-04-01'
  },
  { 
    id: '1159212', 
    name: '針尾義和', 
    department: '営業部', 
    position: '担当者',
    hourlyWage: 1250,
    monthlySalary: 260000,
    isAdmin: false,
    isActive: true,
    hireDate: '2023-01-15'
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
    clockOut: '18:00',
    breakStart: '12:00',
    breakEnd: '13:00',
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
    clockOut: '17:45',
    breakStart: '12:00',
    breakEnd: '13:00',
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
    clockOut: '18:15',
    breakStart: '12:00',
    breakEnd: '13:00',
    location: '東京オフィス',
    ipAddress: '192.168.1.102',
    deviceInfo: 'Safari/Mac',
    notes: '通常出勤'
  },
  // 先月のテストデータを追加
  {
    id: '4',
    employeeId: '12345',
    employeeName: '田中太郎',
    date: new Date(new Date().getFullYear(), new Date().getMonth() - 1, 15).toISOString().split('T')[0],
    clockIn: '09:00',
    clockOut: '18:00',
    breakStart: '12:00',
    breakEnd: '13:00',
    location: '東京オフィス',
    ipAddress: '192.168.1.100',
    deviceInfo: 'Chrome/Windows',
    notes: '先月のテストデータ'
  },
  {
    id: '5',
    employeeId: '67890',
    employeeName: '佐藤花子',
    date: new Date(new Date().getFullYear(), new Date().getMonth() - 1, 15).toISOString().split('T')[0],
    clockIn: '08:45',
    clockOut: '17:45',
    breakStart: '12:00',
    breakEnd: '13:00',
    location: '東京オフィス',
    ipAddress: '192.168.1.101',
    deviceInfo: 'Chrome/Windows',
    notes: '先月のテストデータ'
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



// 日付範囲の打刻データを取得
export const getAttendanceByDateRange = (startDate: string, endDate: string): AttendanceRecord[] => {
  try {
    const records = loadAttendanceData();
    return records.filter(record => 
      record.date >= startDate && record.date <= endDate
    );
  } catch (error) {
    console.error('日付範囲別打刻データ取得エラー:', error);
    return [];
  }
};

// 今日の出勤状況サマリー
export const getTodayAttendanceSummary = () => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const records = getAttendanceByDate(today);
    const employees = loadEmployeeData();
    
    const summary = {
      totalEmployees: employees.length,
      presentEmployees: records.filter(r => r.clockIn).length,
      absentEmployees: employees.length - records.filter(r => r.clockIn).length,
      onBreakEmployees: records.filter(r => r.breakStart && !r.breakEnd).length,
      clockedOutEmployees: records.filter(r => r.clockOut).length
    };
    
    return summary;
  } catch (error) {
    console.error('今日の出勤状況サマリー取得エラー:', error);
    return {
      totalEmployees: 0,
      presentEmployees: 0,
      absentEmployees: 0,
      onBreakEmployees: 0,
      clockedOutEmployees: 0
    };
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

// 高度なバリデーション結果の型定義
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

// 重複打刻チェック
export const checkDuplicateTimeRecord = (
  employeeId: string, 
  date: string, 
  type: 'clockIn' | 'clockOut' | 'breakStart' | 'breakEnd'
): boolean => {
  try {
    const records = loadAttendanceData();
    const existingRecord = records.find(record => 
      record.employeeId === employeeId && 
      record.date === date
    );
    
    if (!existingRecord) return false;
    
    // 打刻種別に応じて重複チェック
    switch (type) {
      case 'clockIn':
        return !!existingRecord.clockIn;
      case 'clockOut':
        return !!existingRecord.clockOut;
      case 'breakStart':
        return !!existingRecord.breakStart;
      case 'breakEnd':
        return !!existingRecord.breakEnd;
      default:
        return false;
    }
  } catch (error) {
    console.error('重複チェックエラー:', error);
    return false;
  }
};

// 包括的な打刻バリデーション
export const validateTimeRecord = (
  employeeId: string,
  date: string,
  type: 'clockIn' | 'clockOut' | 'breakStart' | 'breakEnd',
  time: string
): ValidationResult => {
  const result: ValidationResult = {
    isValid: true,
    errors: [],
    warnings: []
  };

  try {
    // 1. 時刻の妥当性チェック
    const currentTime = new Date();
    // 時刻フォーマットを「HH:MM:SS」に統一
    const timeWithSeconds = time.includes(':') && time.split(':').length === 2 ? `${time}:00` : time;
    const recordTime = new Date(`${date}T${timeWithSeconds}`);
    
    // Date オブジェクトの妥当性チェック
    if (isNaN(recordTime.getTime())) {
      result.isValid = false;
      result.errors.push('無効な時刻形式です');
      return result;
    }
    
    // 未来日時の打刻防止（5分の誤差は許容）
    const timeDiff = recordTime.getTime() - currentTime.getTime();
    if (timeDiff > 5 * 60 * 1000) {
      result.isValid = false;
      result.errors.push('未来の時刻での打刻はできません');
    }

    // 2. 重複チェック
    if (checkDuplicateTimeRecord(employeeId, date, type)) {
      result.isValid = false;
      result.errors.push(`${getTypeLabel(type)}は既に記録されています`);
    }

    // 3. 順序チェック
    const records = loadAttendanceData();
    const existingRecord = records.find(record => 
      record.employeeId === employeeId && 
      record.date === date
    );

    if (existingRecord) {
      switch (type) {
        case 'clockOut':
          if (!existingRecord.clockIn) {
            result.isValid = false;
            result.errors.push('出勤記録がない状態で退勤はできません');
          }
          break;
        case 'breakEnd':
          if (!existingRecord.breakStart) {
            result.isValid = false;
            result.errors.push('休憩開始記録がない状態で休憩終了はできません');
          }
          break;
        case 'breakStart':
          if (!existingRecord.clockIn) {
            result.isValid = false;
            result.errors.push('出勤記録がない状態で休憩はできません');
          }
          break;
      }
    } else {
      // 新規記録の場合
      if (type !== 'clockIn') {
        result.isValid = false;
        result.errors.push('初回の打刻は出勤から開始してください');
      }
    }

    // 4. 休憩時間の整合性チェック
    if (type === 'breakEnd' && existingRecord?.breakStart) {
      const breakStart = new Date(`2000-01-01T${existingRecord.breakStart}`);
      const breakEnd = new Date(`2000-01-01T${time}`);
      
      if (breakEnd <= breakStart) {
        result.isValid = false;
        result.errors.push('休憩終了時刻は開始時刻より後である必要があります');
      }
      
      const breakDuration = (breakEnd.getTime() - breakStart.getTime()) / (1000 * 60);
      if (breakDuration > 120) { // 2時間以上
        result.warnings.push('休憩時間が2時間を超えています');
      }
    }

    // 5. 勤務時間の妥当性チェック
    if (type === 'clockOut' && existingRecord?.clockIn) {
      const clockIn = new Date(`2000-01-01T${existingRecord.clockIn}`);
      const clockOut = new Date(`2000-01-01T${time}`);
      
      const workDuration = (clockOut.getTime() - clockIn.getTime()) / (1000 * 60);
      
      if (workDuration < 60) { // 1時間未満
        result.warnings.push('勤務時間が1時間未満です');
      }
      
      if (workDuration > 1440) { // 24時間超過
        result.isValid = false;
        result.errors.push('勤務時間が24時間を超えています');
      }
    }

    // 6. 時刻範囲の妥当性チェック
    const hour = parseInt(time.split(':')[0]);
    if (hour < 0 || hour > 23) {
      result.isValid = false;
      result.errors.push('時刻は0:00から23:59の範囲で入力してください');
    }

  } catch (error) {
    console.error('バリデーションエラー:', error);
    result.isValid = false;
    if (error instanceof Error) {
      result.errors.push(`バリデーション処理エラー: ${error.message}`);
    } else {
      result.errors.push('バリデーション処理中にエラーが発生しました');
    }
  }

  return result;
};

// 打刻種別のラベル取得
export const getTypeLabel = (type: 'clockIn' | 'clockOut' | 'breakStart' | 'breakEnd'): string => {
  switch (type) {
    case 'clockIn': return '出勤';
    case 'clockOut': return '退勤';
    case 'breakStart': return '休憩開始';
    case 'breakEnd': return '休憩終了';
    default: return '';
  }
};

// 指定日付の打刻記録を取得
export const getAttendanceByDate = (date: string): AttendanceRecord[] => {
  try {
    const records = loadAttendanceData();
    return records.filter(record => record.date === date);
  } catch (error) {
    console.error('日付別打刻記録の取得エラー:', error);
    return [];
  }
};

// 新しい打刻記録の追加（重複チェック付き）
export const addAttendanceRecord = (record: Omit<AttendanceRecord, 'id'>): boolean => {
  try {
    // 重複チェック
    let type: 'clockIn' | 'clockOut' | 'breakStart' | 'breakEnd' = 'clockIn';
    if (record.clockIn) type = 'clockIn';
    else if (record.clockOut) type = 'clockOut';
    else if (record.breakStart) type = 'breakStart';
    else if (record.breakEnd) type = 'breakEnd';
    
    if (checkDuplicateTimeRecord(record.employeeId, record.date, type)) {
      console.warn('重複する打刻記録が存在します');
      return false;
    }
    
    const records = loadAttendanceData();
    const newRecord: AttendanceRecord = {
      ...record,
      id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}` // より一意性の高いID
    };
    
    // 既存の記録がある場合は更新、ない場合は新規作成
    const existingIndex = records.findIndex(r => 
      r.employeeId === record.employeeId && r.date === record.date
    );
    
    if (existingIndex !== -1) {
      // 既存記録を更新
      records[existingIndex] = { ...records[existingIndex], ...record };
    } else {
      // 新規記録を追加
      records.push(newRecord);
    }
    
    saveAttendanceData(records);
    console.log('打刻記録を保存しました');
    return true;
  } catch (error) {
    console.error('打刻記録追加エラー:', error);
    return false;
  }
};

// 新しい社員の追加
export const addEmployee = (employee: Omit<Employee, 'id'> & { employeeNumber?: string }): Employee | null => {
  try {
    const employees = loadEmployeeData();
    
    // 社員番号の生成
    let employeeNumber: string;
    if (employee.employeeNumber && employee.employeeNumber.trim() !== '') {
      // ユーザーが指定した社員番号を使用
      employeeNumber = employee.employeeNumber.trim();
      
      // 重複チェック
      if (employees.some(emp => emp.id === employeeNumber)) {
        console.error('指定された社員番号は既に使用されています');
        return null;
      }
    } else {
      // 自動生成：既存の社員番号の最大値+1、または1001から開始
      const existingNumbers = employees
        .map(emp => emp.id)
        .filter(id => /^\d{4}$/.test(id)) // 4桁の数字のみ
        .map(id => parseInt(id))
        .sort((a, b) => b - a);
      
      const nextNumber = existingNumbers.length > 0 ? existingNumbers[0] + 1 : 1001;
      employeeNumber = nextNumber.toString().padStart(4, '0');
    }
    
    // 新しい社員を作成
    const newEmployee: Employee = {
      ...employee,
      id: employeeNumber
    };
    
    employees.push(newEmployee);
    saveEmployeeData(employees);
    console.log('新しい社員を追加しました');
    return newEmployee;
  } catch (error) {
    console.error('社員追加エラー:', error);
    return null;
  }
};



// 社員データの削除
export const deleteEmployee = (id: string): boolean => {
  try {
    const employees = loadEmployeeData();
    const filteredEmployees = employees.filter(emp => emp.id !== id);
    
    if (filteredEmployees.length !== employees.length) {
      saveEmployeeData(filteredEmployees);
      console.log('社員データを削除しました');
      return true;
    }
    return false;
  } catch (error) {
    console.error('社員データ削除エラー:', error);
    return false;
  }
};

// 全従業員データを取得
export const getEmployees = (): Employee[] => {
  try {
    return loadEmployeeData();
  } catch (error) {
    console.error('従業員データ取得エラー:', error);
    return [];
  }
};

// 従業員データを更新（Employeeオブジェクト全体を受け取る）
export const updateEmployee = (employee: Employee): boolean => {
  try {
    const employees = loadEmployeeData();
    const index = employees.findIndex(emp => emp.id === employee.id);
    
    if (index !== -1) {
      employees[index] = employee;
      saveEmployeeData(employees);
      console.log('社員データを更新しました');
      return true;
    }
    return false;
  } catch (error) {
    console.error('社員データ更新エラー:', error);
    return false;
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

// 勤怠データをCSV形式でエクスポート
export const exportAttendanceCSV = (
  startDate: string, 
  endDate: string, 
  fileName?: string
): void => {
  try {
    const employees = loadEmployeeData();
    const records = getAttendanceByDateRange(startDate, endDate);
    
    // CSVヘッダー（UTF-8 BOM付き）
    const BOM = '\uFEFF';
    const headers = [
      '社員番号',
      '氏名', 
      '部署',
      '日付',
      '出勤時刻',
      '退勤時刻',
      '休憩開始',
      '休憩終了',
      '実働時間',
      '残業時間',
      '備考'
    ];
    
    let csvContent = BOM + headers.join(',') + '\n';
    
    // 各社員の勤怠データを処理
    employees.forEach(employee => {
      const employeeRecords = records.filter(r => r.employeeId === employee.id);
      
      if (employeeRecords.length === 0) {
        // 勤怠記録がない日も含める
        const dateRange = getDateRange(startDate, endDate);
        dateRange.forEach(date => {
          const row = [
            employee.id,
            employee.name,
            employee.department,
            date,
            '', // 出勤時刻
            '', // 退勤時刻
            '', // 休憩開始
            '', // 休憩終了
            '', // 実働時間
            '', // 残業時間
            '勤怠記録なし' // 備考
          ];
          csvContent += row.join(',') + '\n';
        });
      } else {
        // 勤怠記録がある日
        employeeRecords.forEach(record => {
          const workTime = calculateWorkTime(record);
          const overtime = calculateOvertime(record);
          
          const row = [
            employee.id,
            employee.name,
            employee.department,
            record.date,
            record.clockIn || '',
            record.clockOut || '',
            record.breakStart || '',
            record.breakEnd || '',
            workTime,
            overtime,
            record.notes || ''
          ];
          csvContent += row.join(',') + '\n';
        });
      }
    });
    
    // CSVファイルをダウンロード
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName || `勤怠データ_${startDate}_${endDate}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    console.log('CSVエクスポートが完了しました');
  } catch (error) {
    console.error('CSVエクスポートエラー:', error);
  }
};

// 日付範囲を取得
const getDateRange = (startDate: string, endDate: string): string[] => {
  const dates: string[] = [];
  const current = new Date(startDate);
  const end = new Date(endDate);
  
  while (current <= end) {
    dates.push(current.toISOString().split('T')[0]);
    current.setDate(current.getDate() + 1);
  }
  
  return dates;
};

// 実働時間を計算（分単位）
const calculateWorkTime = (record: AttendanceRecord): string => {
  if (!record.clockIn || !record.clockOut) return '';
  
  try {
    const clockIn = new Date(`2000-01-01T${record.clockIn}`);
    const clockOut = new Date(`2000-01-01T${record.clockOut}`);
    
    let totalMinutes = (clockOut.getTime() - clockIn.getTime()) / (1000 * 60);
    
    // 休憩時間を引く
    if (record.breakStart && record.breakEnd) {
      const breakStart = new Date(`2000-01-01T${record.breakStart}`);
      const breakEnd = new Date(`2000-01-01T${record.breakEnd}`);
      const breakMinutes = (breakEnd.getTime() - breakStart.getTime()) / (1000 * 60);
      totalMinutes -= breakMinutes;
    }
    
    if (totalMinutes < 0) return '0';
    
    const hours = Math.floor(totalMinutes / 60);
    const minutes = Math.floor(totalMinutes % 60);
    return `${hours}:${minutes.toString().padStart(2, '0')}`;
  } catch (error) {
    console.error('実働時間計算エラー:', error);
    return '';
  }
};

// 残業時間を計算（18:00以降を残業とする）
const calculateOvertime = (record: AttendanceRecord): string => {
  if (!record.clockOut) return '';
  
  try {
    const clockOut = new Date(`2000-01-01T${record.clockOut}`);
    const standardTime = new Date(`2000-01-01T18:00`);
    
    if (clockOut <= standardTime) return '';
    
    const overtimeMinutes = (clockOut.getTime() - standardTime.getTime()) / (1000 * 60);
    const hours = Math.floor(overtimeMinutes / 60);
    const minutes = Math.floor(overtimeMinutes % 60);
    return `${hours}:${minutes.toString().padStart(2, '0')}`;
  } catch (error) {
    console.error('残業時間計算エラー:', error);
    return '';
  }
};

// 月次勤怠データをCSVエクスポート
export const exportMonthlyAttendanceCSV = (year: number, month: number): void => {
  const startDate = `${year}-${month.toString().padStart(2, '0')}-01`;
  const lastDay = new Date(year, month, 0).getDate();
  const endDate = `${year}-${month.toString().padStart(2, '0')}-${lastDay}`;
  
  const fileName = `勤怠データ_${year}年${month}月.csv`;
  exportAttendanceCSV(startDate, endDate, fileName);
};

// 位置情報取得のエラーハンドリング
export const getLocationWithFallback = (): Promise<{ latitude: number; longitude: number; error?: string }> => {
  return new Promise((resolve) => {
    if (!navigator.geolocation) {
      resolve({ latitude: 0, longitude: 0, error: '位置情報がサポートされていません' });
      return;
    }

    const timeoutId = setTimeout(() => {
      resolve({ latitude: 0, longitude: 0, error: '位置情報の取得がタイムアウトしました' });
    }, 10000); // 10秒でタイムアウト

    navigator.geolocation.getCurrentPosition(
      (position) => {
        clearTimeout(timeoutId);
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        });
      },
      (error) => {
        clearTimeout(timeoutId);
        let errorMessage = '位置情報の取得に失敗しました';
        
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = '位置情報の使用が許可されていません';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = '位置情報が利用できません';
            break;
          case error.TIMEOUT:
            errorMessage = '位置情報の取得がタイムアウトしました';
            break;
        }
        
        resolve({ latitude: 0, longitude: 0, error: errorMessage });
      },
      {
        enableHighAccuracy: false,
        timeout: 10000,
        maximumAge: 300000 // 5分間キャッシュ
      }
    );
  });
};

// デバイス情報の取得
export const getDeviceInfo = (): string => {
  try {
    const userAgent = navigator.userAgent;
    const platform = navigator.platform;
    const language = navigator.language;
    
    return `${platform} - ${userAgent.split(' ').pop()?.split('/')[0] || 'Unknown'} - ${language}`;
  } catch (error) {
    return 'Unknown Device';
  }
};

// IPアドレスの取得（簡易版）
export const getIPAddress = async (): Promise<string> => {
  try {
    const response = await fetch('https://api.ipify.org?format=json');
    const data = await response.json();
    return data.ip;
  } catch (error) {
    return 'Unknown IP';
  }
};

// データの整合性チェックと修復（強化版）
export const validateAndRepairData = (): ValidationResult => {
  const result: ValidationResult = {
    isValid: true,
    errors: [],
    warnings: []
  };

  try {
    const data = loadAppData();
    
    // 基本的な構造チェック
    if (!Array.isArray(data.employees) || !Array.isArray(data.attendanceRecords)) {
      result.isValid = false;
      result.errors.push('データ構造が破損しています');
      return result;
    }

    // 社員データの整合性チェック
    const employeeIds = new Set(data.employees.map(emp => emp.id));
    const recordEmployeeIds = new Set(data.attendanceRecords.map(record => record.employeeId));
    
    // 存在しない社員IDの打刻記録をチェック
    const invalidRecords = data.attendanceRecords.filter(record => !employeeIds.has(record.employeeId));
    if (invalidRecords.length > 0) {
      result.warnings.push(`${invalidRecords.length}件の無効な打刻記録が見つかりました`);
    }

    // 日付形式の検証
    const invalidDates = data.attendanceRecords.filter(record => {
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      return !dateRegex.test(record.date);
    });
    
    if (invalidDates.length > 0) {
      result.warnings.push(`${invalidDates.length}件の無効な日付形式が見つかりました`);
    }

    // 時刻形式の検証
    const invalidTimes = data.attendanceRecords.filter(record => {
      const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
      return (record.clockIn && !timeRegex.test(record.clockIn)) ||
             (record.clockOut && !timeRegex.test(record.clockOut)) ||
             (record.breakStart && !timeRegex.test(record.breakStart)) ||
             (record.breakEnd && !timeRegex.test(record.breakEnd));
    });
    
    if (invalidTimes.length > 0) {
      result.warnings.push(`${invalidTimes.length}件の無効な時刻形式が見つかりました`);
    }

    // データの自動修復
    if (result.warnings.length > 0) {
      repairData();
      result.warnings.push('データの自動修復を実行しました');
    }

  } catch (error) {
    console.error('データ整合性チェックエラー:', error);
    result.isValid = false;
    result.errors.push('データ整合性チェック中にエラーが発生しました');
  }

  return result;
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
    let isValid = true;
    recordEmployeeIds.forEach(recordId => {
      if (!employeeIds.has(recordId)) {
        console.warn(`存在しない社員IDの打刻記録: ${recordId}`);
        isValid = false;
      }
    });
    
    // 日付形式の検証
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    data.attendanceRecords.forEach(record => {
      if (!dateRegex.test(record.date)) {
        console.warn(`無効な日付形式: ${record.date}`);
        isValid = false;
      }
    });
    
    return isValid;
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

// 従業員の給与設定を更新
export const updateEmployeeSalarySettings = (
  employeeId: string, 
  settings: Partial<Pick<Employee, 'hourlyWage' | 'monthlySalary' | 'transportationAllowance' | 'mealAllowance' | 'overtimeRate' | 'nightShiftRate' | 'holidayRate'>>
): boolean => {
  try {
    const data = loadAppData();
    const employeeIndex = data.employees.findIndex(emp => emp.id === employeeId);
    
    if (employeeIndex === -1) {
      console.error(`従業員が見つかりません: ${employeeId}`);
      return false;
    }
    
    // 給与設定を更新
    data.employees[employeeIndex] = {
      ...data.employees[employeeIndex],
      ...settings
    };
    
    // データを保存
    saveAppData(data);
    console.log(`従業員 ${employeeId} の給与設定を更新しました`);
    return true;
  } catch (error) {
    console.error('給与設定の更新エラー:', error);
    return false;
  }
};

// 従業員の給与設定を取得
export const getEmployeeSalarySettings = (employeeId: string): Partial<Employee> | null => {
  try {
    const data = loadAppData();
    const employee = data.employees.find(emp => emp.id === employeeId);
    
    if (!employee) {
      return null;
    }
    
    return {
      hourlyWage: employee.hourlyWage,
      monthlySalary: employee.monthlySalary,
      transportationAllowance: employee.transportationAllowance,
      mealAllowance: employee.mealAllowance,
      overtimeRate: employee.overtimeRate,
      nightShiftRate: employee.nightShiftRate,
      holidayRate: employee.holidayRate
    };
  } catch (error) {
    console.error('給与設定の取得エラー:', error);
    return null;
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
