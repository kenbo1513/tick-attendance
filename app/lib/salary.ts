// 給与計算とExcel/Googleスプレッドシート連携ユーティリティ
import { TimeRecord } from './localStorage';

export interface SalarySettings {
  companyId: string;
  baseSalary: number; // 基本給
  hourlyWage: number; // 時給
  overtimeRate: number; // 残業倍率（通常1.25）
  transportationAllowance: number; // 交通費
  mealAllowance: number; // 食事手当
  socialInsuranceRate: number; // 社会保険料率（概算）
  taxRate: number; // 所得税率（概算）
  createdAt: string;
  updatedAt: string;
}

export interface EmployeeSalary {
  employeeId: string;
  employeeName: string;
  department: string;
  position: string;
  baseSalary: number;
  hourlyWage: number;
  workDays: number;
  totalWorkHours: number;
  regularWorkHours: number;
  overtimeHours: number;
  breakHours: number;
  actualWorkHours: number;
  overtimePay: number;
  transportationAllowance: number;
  mealAllowance: number;
  grossSalary: number;
  socialInsurance: number;
  tax: number;
  netSalary: number;
}



export interface Employee {
  id: string;
  name: string;
  department: string;
  position: string;
}

// 給与設定の保存
export const saveSalarySettings = (settings: SalarySettings): void => {
  try {
    localStorage.setItem(`tick_salary_settings_${settings.companyId}`, JSON.stringify(settings));
  } catch (error) {
    console.error('給与設定保存エラー:', error);
    throw new Error('給与設定の保存に失敗しました');
  }
};

// 給与設定の読み込み
export const loadSalarySettings = (companyId: string): SalarySettings | null => {
  try {
    const saved = localStorage.getItem(`tick_salary_settings_${companyId}`);
    return saved ? JSON.parse(saved) : null;
  } catch (error) {
    console.error('給与設定読み込みエラー:', error);
    return null;
  }
};

// デフォルト給与設定の作成
export const createDefaultSalarySettings = (companyId: string): SalarySettings => {
  return {
    companyId,
    baseSalary: 200000, // 20万円
    hourlyWage: 1000, // 1000円/時
    overtimeRate: 1.25, // 25%増
    transportationAllowance: 15000, // 1.5万円
    mealAllowance: 10000, // 1万円
    socialInsuranceRate: 0.15, // 15%
    taxRate: 0.10, // 10%
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
};

// 月次勤怠データの集計
export const calculateMonthlyAttendance = (
  timeRecords: TimeRecord[],
  employees: Employee[],
  year: number,
  month: number
): Map<string, any> => {
  const monthlyData = new Map<string, any>();
  
  // 対象月の日数を取得
  const daysInMonth = new Date(year, month, 0).getDate();
  
  employees.forEach(employee => {
    const employeeRecords = timeRecords.filter(record => 
      record.employeeId === employee.id && 
      new Date(record.date).getFullYear() === year &&
      new Date(record.date).getMonth() + 1 === month
    );
    
    // 日別の勤怠データを整理
    const dailyData = new Map<string, any>();
    
    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
      const dayRecords = employeeRecords.filter(record => record.date === dateStr);
      
      if (dayRecords.length > 0) {
        const clockIn = dayRecords.find(r => r.type === 'clockIn');
        const clockOut = dayRecords.find(r => r.type === 'clockOut');
        const breakStart = dayRecords.find(r => r.type === 'breakStart');
        const breakEnd = dayRecords.find(r => r.type === 'breakEnd');
        
        if (clockIn && clockOut) {
          const startTime = new Date(`2000-01-01T${clockIn.time}`);
          const endTime = new Date(`2000-01-01T${clockOut.time}`);
          let workHours = (endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60);
          
          // 休憩時間を差し引く
          if (breakStart && breakEnd) {
            const breakStartTime = new Date(`2000-01-01T${breakStart.time}`);
            const breakEndTime = new Date(`2000-01-01T${breakEnd.time}`);
            const breakHours = (breakEndTime.getTime() - breakStartTime.getTime()) / (1000 * 60 * 60);
            workHours -= breakHours;
          }
          
          dailyData.set(dateStr, {
            clockIn: clockIn.time,
            clockOut: clockOut.time,
            workHours: Math.max(0, workHours),
            isPresent: true
          });
        }
      }
    }
    
    monthlyData.set(employee.id, {
      employee,
      dailyData,
      totalWorkDays: Array.from(dailyData.values()).filter(d => d.isPresent).length,
      totalWorkHours: Array.from(dailyData.values()).reduce((sum, d) => sum + d.workHours, 0)
    });
  });
  
  return monthlyData;
};

// 給与計算
export const calculateSalary = (
  monthlyData: Map<string, any>,
  salarySettings: SalarySettings
): EmployeeSalary[] => {
  const salaries: EmployeeSalary[] = [];
  
  monthlyData.forEach((data, employeeId) => {
    const { employee, totalWorkDays, totalWorkHours } = data;
    
    // 基本給（月額）
    const baseSalary = salarySettings.baseSalary;
    
    // 通常勤務時間（8時間/日 × 勤務日数）
    const regularWorkHours = 8 * totalWorkDays;
    
    // 残業時間
    const overtimeHours = Math.max(0, totalWorkHours - regularWorkHours);
    
    // 休憩時間（1時間/日 × 勤務日数）
    const breakHours = totalWorkDays;
    
    // 実働時間
    const actualWorkHours = totalWorkHours - breakHours;
    
    // 残業代
    const overtimePay = overtimeHours * salarySettings.hourlyWage * salarySettings.overtimeRate;
    
    // 各種手当
    const transportationAllowance = salarySettings.transportationAllowance;
    const mealAllowance = salarySettings.mealAllowance;
    
    // 総支給額
    const grossSalary = baseSalary + overtimePay + transportationAllowance + mealAllowance;
    
    // 控除額
    const socialInsurance = grossSalary * salarySettings.socialInsuranceRate;
    const tax = grossSalary * salarySettings.taxRate;
    
    // 手取り額
    const netSalary = grossSalary - socialInsurance - tax;
    
    salaries.push({
      employeeId,
      employeeName: employee.name,
      department: employee.department,
      position: employee.position,
      baseSalary,
      hourlyWage: salarySettings.hourlyWage,
      workDays: totalWorkDays,
      totalWorkHours,
      regularWorkHours,
      overtimeHours,
      breakHours,
      actualWorkHours,
      overtimePay,
      transportationAllowance,
      mealAllowance,
      grossSalary,
      socialInsurance,
      tax,
      netSalary
    });
  });
  
  return salaries;
};

// Excel用CSVデータの生成
export const generateExcelCSV = (
  salaries: EmployeeSalary[],
  year: number,
  month: number
): string => {
  const headers = [
    '社員ID',
    '氏名',
    '部署',
    '役職',
    '基本給',
    '勤務日数',
    '総勤務時間',
    '通常勤務時間',
    '残業時間',
    '実働時間',
    '残業代',
    '交通費',
    '食事手当',
    '総支給額',
    '社会保険料',
    '所得税',
    '手取り額'
  ];
  
  const rows = salaries.map(salary => [
    salary.employeeId,
    salary.employeeName,
    salary.department,
    salary.position,
    salary.baseSalary,
    salary.workDays,
    salary.totalWorkHours.toFixed(2),
    salary.regularWorkHours.toFixed(2),
    salary.overtimeHours.toFixed(2),
    salary.actualWorkHours.toFixed(2),
    salary.overtimePay,
    salary.transportationAllowance,
    salary.mealAllowance,
    salary.grossSalary,
    Math.round(salary.socialInsurance),
    Math.round(salary.tax),
    Math.round(salary.netSalary)
  ]);
  
  const csvContent = [headers, ...rows]
    .map(row => row.map(cell => `"${cell}"`).join(','))
    .join('\n');
  
  // UTF-8 BOMを追加（Excelで文字化けを防ぐ）
  const BOM = '\uFEFF';
  return BOM + csvContent;
};

// Googleスプレッドシート用CSVデータの生成
export const generateGoogleSheetsCSV = (
  salaries: EmployeeSalary[],
  year: number,
  month: number
): string => {
  const headers = [
    '社員ID',
    '氏名',
    '部署',
    '役職',
    '基本給',
    '勤務日数',
    '総勤務時間',
    '通常勤務時間',
    '残業時間',
    '実働時間',
    '残業代',
    '交通費',
    '食事手当',
    '総支給額',
    '社会保険料',
    '所得税',
    '手取り額',
    '備考'
  ];
  
  const rows = salaries.map(salary => [
    salary.employeeId,
    salary.employeeName,
    salary.department,
    salary.position,
    salary.baseSalary,
    salary.workDays,
    salary.totalWorkHours.toFixed(2),
    salary.regularWorkHours.toFixed(2),
    salary.overtimeHours.toFixed(2),
    salary.actualWorkHours.toFixed(2),
    salary.overtimePay,
    salary.transportationAllowance,
    salary.mealAllowance,
    salary.grossSalary,
    Math.round(salary.socialInsurance),
    Math.round(salary.tax),
    Math.round(salary.netSalary),
    `${year}年${month}月給与`
  ]);
  
  const csvContent = [headers, ...rows]
    .map(row => row.map(cell => `"${cell}"`).join(','))
    .join('\n');
  
  return csvContent;
};

// 汎用CSVデータの生成
export const generateGenericCSV = (
  salaries: EmployeeSalary[],
  year: number,
  month: number
): string => {
  const headers = [
    'employee_id',
    'name',
    'department',
    'position',
    'base_salary',
    'work_days',
    'total_hours',
    'regular_hours',
    'overtime_hours',
    'actual_hours',
    'overtime_pay',
    'transportation',
    'meal_allowance',
    'gross_salary',
    'insurance',
    'tax',
    'net_salary',
    'period'
  ];
  
  const rows = salaries.map(salary => [
    salary.employeeId,
    salary.employeeName,
    salary.department,
    salary.position,
    salary.baseSalary,
    salary.workDays,
    salary.totalWorkHours.toFixed(2),
    salary.regularWorkHours.toFixed(2),
    salary.overtimeHours.toFixed(2),
    salary.actualWorkHours.toFixed(2),
    salary.overtimePay,
    salary.transportationAllowance,
    salary.mealAllowance,
    salary.grossSalary,
    Math.round(salary.socialInsurance),
    Math.round(salary.tax),
    Math.round(salary.netSalary),
    `${year}-${month.toString().padStart(2, '0')}`
  ]);
  
  const csvContent = [headers, ...rows]
    .map(row => row.map(cell => `"${cell}"`).join(','))
    .join('\n');
  
  return csvContent;
};

// ファイルダウンロード
export const downloadCSV = (csvContent: string, filename: string): void => {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};

// 月次データの取得
export const getMonthlyData = (
  timeRecords: TimeRecord[],
  employees: Employee[],
  year: number,
  month: number
): { monthlyData: Map<string, any>; salaries: EmployeeSalary[] } => {
  const monthlyData = calculateMonthlyAttendance(timeRecords, employees, year, month);
  
  // 給与設定を読み込み（デフォルト設定を使用）
  const companyId = employees.length > 0 ? 'default' : 'default';
  let salarySettings = loadSalarySettings(companyId);
  if (!salarySettings) {
    salarySettings = createDefaultSalarySettings(companyId);
    saveSalarySettings(salarySettings);
  }
  
  const salaries = calculateSalary(monthlyData, salarySettings);
  
  return { monthlyData, salaries };
};

