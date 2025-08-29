'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Clock, Users, UserCheck, UserX, BarChart3, Calendar, LogOut, Building2, Plus, Settings, CheckCircle, FileSpreadsheet } from 'lucide-react';
import * as XLSX from 'xlsx';
import { 
  checkAdminSession, 
  logoutAdmin, 
  loadCompanyInfo, 
  loadCompanySettings,
  logSecurityEvent 
} from '../../lib/auth';

// 基本的なデータ型定義
interface Employee {
  id: string;
  name: string;
  department: string;
  position: string;
  hourlyWage?: number;
  monthlySalary?: number;
  transportationAllowance?: number;
  mealAllowance?: number;
  overtimeRate?: number;
  nightShiftRate?: number;
  holidayRate?: number;
}

interface TimeRecord {
  id: string;
  employeeId: string;
  employeeName: string;
  type: 'clockIn' | 'clockOut' | 'breakStart' | 'breakEnd';
  time: string;
  date: string;
}

interface CompanyInfo {
  id: string;
  name: string;
  adminUsername: string;
  adminName: string;
  createdAt: string;
  isInitialized: boolean;
}

interface CompanySettings {
  companyId: string;
  workStartTime: string;
  workEndTime: string;
  breakStartTime: string;
  breakEndTime: string;
  createdAt: string;
  updatedAt: string;
}

export default function AdminDashboardPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'overview' | 'employees' | 'attendance' | 'company' | 'salary' | 'terminal' | 'employeeList'>('overview');
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [timeRecords, setTimeRecords] = useState<TimeRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [adminUser, setAdminUser] = useState<any>(null);
  const [companyInfo, setCompanyInfo] = useState<CompanyInfo | null>(null);
  const [companySettings, setCompanySettings] = useState<CompanySettings | null>(null);
  
  // 従業員追加関連
  const [showAddEmployeeModal, setShowAddEmployeeModal] = useState(false);
  const [newEmployee, setNewEmployee] = useState({
    id: '',
    name: '',
    department: '',
    position: ''
  });

  // 給与テンプレート関連
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [salarySettings, setSalarySettings] = useState({
    baseSalary: 200000,
    hourlyWage: 1000,
    overtimeRate: 1.25,
    transportationAllowance: 15000,
    mealAllowance: 10000,
    socialInsuranceRate: 0.15,
    taxRate: 0.10,
  });



  // 認証チェックとデータ読み込み
  useEffect(() => {
    try {
      // 管理者セッション確認
      const admin = checkAdminSession();
      if (!admin) {
        router.push('/admin');
        return;
      }
      setAdminUser(admin);

      // 企業情報読み込み
      const company = loadCompanyInfo();
      if (!company) {
        router.push('/admin/setup');
        return;
      }
      setCompanyInfo(company);

      // 企業設定読み込み
      const settings = loadCompanySettings(company.id);
      setCompanySettings(settings);

      // 社員データ読み込み
      const savedEmployees = localStorage.getItem('tick_employees');
      if (savedEmployees) {
        setEmployees(JSON.parse(savedEmployees));
      }

      // 打刻記録読み込み
      const savedRecords = localStorage.getItem('tick_timeRecords');
      if (savedRecords) {
        setTimeRecords(JSON.parse(savedRecords));
      } else {
        // デフォルトの打刻データを読み込み
        const savedAppData = localStorage.getItem('tick_app_data');
        if (savedAppData) {
          const appData = JSON.parse(savedAppData);
          if (appData.attendanceRecords) {
            // AttendanceRecordをTimeRecordに変換
            const convertedRecords = appData.attendanceRecords.flatMap((record: any) => {
              const records = [];
              if (record.clockIn) {
                records.push({
                  id: `${record.id}_in`,
                  employeeId: record.employeeId,
                  employeeName: record.employeeName,
                  type: 'clockIn' as const,
                  time: record.clockIn,
                  date: record.date
                });
              }
              if (record.clockOut) {
                records.push({
                  id: `${record.id}_out`,
                  employeeId: record.employeeId,
                  employeeName: record.employeeName,
                  type: 'clockOut' as const,
                  time: record.clockOut,
                  date: record.date
                });
              }
              if (record.breakStart) {
                records.push({
                  id: `${record.id}_break_start`,
                  employeeId: record.employeeId,
                  employeeName: record.employeeName,
                  type: 'breakStart' as const,
                  time: record.breakStart,
                  date: record.date
                });
              }
              if (record.breakEnd) {
                records.push({
                  id: `${record.id}_break_end`,
                  employeeId: record.employeeId,
                  employeeName: record.employeeName,
                  type: 'breakEnd' as const,
                  time: record.breakEnd,
                  date: record.date
                });
              }
              return records;
            });
            setTimeRecords(convertedRecords);
          }
        }
      }

      // 給与設定読み込み
      const savedSalarySettings = localStorage.getItem(`tick_salary_settings_${company.id}`);
      if (savedSalarySettings) {
        const parsed = JSON.parse(savedSalarySettings);
        setSalarySettings({
          baseSalary: parsed.baseSalary || 200000,
          hourlyWage: parsed.hourlyWage || 1000,
          overtimeRate: parsed.overtimeRate || 1.25,
          transportationAllowance: parsed.transportationAllowance || 15000,
          mealAllowance: parsed.mealAllowance || 10000,
          socialInsuranceRate: parsed.socialInsuranceRate || 0.15,
          taxRate: parsed.taxRate || 0.10,
        });
      }

      setIsLoading(false);
    } catch (error) {
      console.error('データ読み込みエラー:', error);
      router.push('/admin');
    }
  }, [router]);

  // ログアウト処理
  const handleLogout = () => {
    try {
      logSecurityEvent('管理者ログアウト', { 
        username: adminUser?.username,
        companyId: companyInfo?.id 
      });
      logoutAdmin();
      router.push('/admin');
    } catch (error) {
      console.error('ログアウトエラー:', error);
      router.push('/admin');
    }
  };

  // 従業員の勤怠データを計算
  const calculateEmployeeStats = (employeeId: string) => {
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();
    
    // 今月の勤怠記録を取得
    const monthRecords = timeRecords.filter(record => {
      const recordDate = new Date(record.date);
      return record.employeeId === employeeId && 
             recordDate.getMonth() === currentMonth && 
             recordDate.getFullYear() === currentYear;
    });
    
    // 出勤日数を計算
    const attendanceDays = new Set(monthRecords.map(record => record.date)).size;
    
    // 労働時間を計算（今月の合計）
    let totalWorkHours = 0;
    monthRecords.forEach(record => {
      if (record.type === 'clockIn' || record.type === 'clockOut') {
        // 簡易的な時間計算（実際の運用ではより詳細な計算が必要）
        totalWorkHours += 8; // 仮定：1日8時間
      }
    });
    
    return {
      attendanceDays,
      totalWorkHours,
      totalRecords: monthRecords.length
    };
  };

  // 従業員の給与設定を編集
  const handleEditEmployeeSalary = (employee: Employee) => {
    // 給与設定編集モーダルを表示する処理
    alert(`${employee.name}の給与設定を編集します。\n\n時給: ${employee.hourlyWage || '未設定'}円\n基本給: ${employee.monthlySalary || '未設定'}円\n交通費: ${employee.transportationAllowance || '未設定'}円\n食事手当: ${employee.mealAllowance || '未設定'}円`);
  };



  // 従業員追加
  const handleAddEmployee = () => {
    if (!newEmployee.name.trim() || !newEmployee.department.trim() || !newEmployee.position.trim()) {
      alert('必須項目を入力してください');
      return;
    }

    // 社員IDが未入力の場合は自動採番
    let employeeId = newEmployee.id.trim();
    if (!employeeId) {
      const maxId = Math.max(...employees.map(emp => parseInt(emp.id) || 0), 0);
      employeeId = (maxId + 1).toString().padStart(7, '0');
    }

    const newEmp: Employee = {
      id: employeeId,
      name: newEmployee.name.trim(),
      department: newEmployee.department.trim(),
      position: newEmployee.position.trim(),
      hourlyWage: 1000,
      monthlySalary: 200000,
      transportationAllowance: 10000,
      mealAllowance: 6000,
      overtimeRate: 1.25,
      nightShiftRate: 1.35,
      holidayRate: 1.5
    };

    const updatedEmployees = [...employees, newEmp];
    setEmployees(updatedEmployees);
    localStorage.setItem('tick_employees', JSON.stringify(updatedEmployees));
    
    // セキュリティログ
    logSecurityEvent('従業員追加', { 
      employeeId: newEmp.id,
      employeeName: newEmp.name,
      companyId: companyInfo?.id 
    });
    
    setNewEmployee({ id: '', name: '', department: '', position: '' });
    setShowAddEmployeeModal(false);
  };

  // 給与テンプレートエクスポート
  const handleExportSalary = async (format: 'excel' | 'google' | 'csv') => {
    if (!companyInfo) {
      alert('企業情報が読み込まれていません。');
      return;
    }

    if (employees.length === 0) {
      alert('従業員が登録されていません。');
      return;
    }

    const year = selectedYear;
    const month = selectedMonth;
    
    try {
      // 月次勤怠データを計算
      const { monthlyData, salaries } = await calculateMonthlySalary(year, month);
      
      if (salaries.length === 0) {
        alert('選択された月の勤怠データがありません。');
        return;
      }

      let data: any;
      let filename: string;

      if (format === 'excel') {
        // Excel用の詳細なテンプレート
        data = generateExcelTemplate(salaries, year, month);
        filename = `${companyInfo.name}_${year}年${month}月_給与計算テンプレート.xlsx`;
      } else if (format === 'google') {
        // Googleスプレッドシート用
        data = generateGoogleSheetsTemplate(salaries, year, month);
        filename = `${companyInfo.name}_${year}年${month}月_給与計算テンプレート.xlsx`;
      } else if (format === 'csv') {
        // CSV形式
        data = generateCSVTemplate(salaries, year, month);
        filename = `${companyInfo.name}_${year}年${month}月_給与計算テンプレート.csv`;
      } else {
        return;
      }

      // ファイルダウンロード
      downloadFile(data, filename, format);
      
      // セキュリティログ
      logSecurityEvent('給与テンプレートエクスポート', { 
        companyId: companyInfo.id,
        format,
        year,
        month,
        employeeCount: salaries.length
      });

    } catch (error) {
      console.error('給与テンプレート生成エラー:', error);
      alert('給与テンプレートの生成に失敗しました。');
    }
  };

  // 月次給与計算
  const calculateMonthlySalary = async (year: number, month: number) => {
    const startDate = `${year}-${month.toString().padStart(2, '0')}-01`;
    const endDate = `${year}-${month.toString().padStart(2, '0')}-${new Date(year, month, 0).getDate().toString().padStart(2, '0')}`;
    
    const monthRecords = timeRecords.filter(record => 
      record.date >= startDate && record.date <= endDate
    );

    // 従業員ごとの勤怠データを集計
    const monthlyData = new Map();
    
    employees.forEach(employee => {
      const employeeRecords = monthRecords.filter(record => record.employeeId === employee.id);
      const dailyData = new Map();
      
      // 月の日数分ループ
      for (let day = 1; day <= new Date(year, month, 0).getDate(); day++) {
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
      
      const totalWorkDays = Array.from(dailyData.values()).filter(d => d.isPresent).length;
      const totalWorkHours = Array.from(dailyData.values()).reduce((sum, d) => sum + d.workHours, 0);
      
      monthlyData.set(employee.id, {
        employee,
        dailyData,
        totalWorkDays,
        totalWorkHours
      });
    });

    // 給与計算
    const salaries = Array.from(monthlyData.values()).map(data => {
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
      
      return {
        employeeId: employee.id,
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
      };
    });

    return { monthlyData, salaries };
  };

  // Excelテンプレート生成
  const generateExcelTemplate = (salaries: any[], year: number, month: number) => {
    // 給与明細シート
    const salarySheet = XLSX.utils.json_to_sheet(salaries.map(salary => ({
      '社員ID': salary.employeeId,
      '氏名': salary.employeeName,
      '部署': salary.department,
      '役職': salary.position,
      '基本給': salary.baseSalary,
      '勤務日数': salary.workDays,
      '総勤務時間': salary.totalWorkHours.toFixed(2),
      '通常勤務時間': salary.regularWorkHours.toFixed(2),
      '残業時間': salary.overtimeHours.toFixed(2),
      '実働時間': salary.actualWorkHours.toFixed(2),
      '残業代': salary.overtimePay,
      '交通費': salary.transportationAllowance,
      '食事手当': salary.mealAllowance,
      '総支給額': salary.grossSalary,
      '社会保険料': Math.round(salary.socialInsurance),
      '所得税': Math.round(salary.tax),
      '手取り額': Math.round(salary.netSalary)
    })));

    // 勤怠データシート
    const attendanceData: Array<{
      '社員ID': string;
      '氏名': string;
      '部署': string;
      '役職': string;
      '勤務日数': number;
      '総勤務時間': string;
      '残業時間': string;
      '基本給': number;
      '残業代': number;
      '各種手当': number;
      '総支給額': number;
    }> = [];
    salaries.forEach(salary => {
      attendanceData.push({
        '社員ID': salary.employeeId,
        '氏名': salary.employeeName,
        '部署': salary.department,
        '役職': salary.position,
        '勤務日数': salary.workDays,
        '総勤務時間': salary.totalWorkHours.toFixed(2),
        '残業時間': salary.overtimeHours.toFixed(2),
        '基本給': salary.baseSalary,
        '残業代': salary.overtimePay,
        '各種手当': salary.transportationAllowance + salary.mealAllowance,
        '総支給額': salary.grossSalary
      });
    });

    const attendanceSheet = XLSX.utils.json_to_sheet(attendanceData);

    // ワークブック作成
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, salarySheet, '給与明細');
    XLSX.utils.book_append_sheet(workbook, attendanceSheet, '勤怠データ');

    return workbook;
  };

  // Googleスプレッドシートテンプレート生成
  const generateGoogleSheetsTemplate = (salaries: any[], year: number, month: number) => {
    return generateExcelTemplate(salaries, year, month);
  };

  // CSVテンプレート生成
  const generateCSVTemplate = (salaries: any[], year: number, month: number) => {
    const headers = [
      '社員ID', '氏名', '部署', '役職', '基本給', '勤務日数', '総勤務時間',
      '通常勤務時間', '残業時間', '実働時間', '残業代', '交通費', '食事手当',
      '総支給額', '社会保険料', '所得税', '手取り額'
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
    
    return [headers, ...rows]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');
  };

  // ファイルダウンロード
  const downloadFile = (data: any, filename: string, format: string) => {
    if (format === 'csv') {
      // CSVファイル
      const blob = new Blob([data], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      link.click();
      URL.revokeObjectURL(url);
    } else {
      // Excelファイル
      XLSX.writeFile(data, filename);
    }
  };

  // 給与設定保存
  const handleSaveSalarySettings = () => {
    if (!companyInfo) {
      alert('企業情報が読み込まれていません。');
      return;
    }

    const settings = {
      companyId: companyInfo.id,
      baseSalary: salarySettings.baseSalary,
      hourlyWage: salarySettings.hourlyWage,
      overtimeRate: salarySettings.overtimeRate,
      transportationAllowance: salarySettings.transportationAllowance,
      mealAllowance: salarySettings.mealAllowance,
      socialInsuranceRate: salarySettings.socialInsuranceRate,
      taxRate: salarySettings.taxRate,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    localStorage.setItem(`tick_salary_settings_${companyInfo.id}`, JSON.stringify(settings));
    logSecurityEvent('給与設定保存', { 
      companyId: companyInfo.id,
      baseSalary: settings.baseSalary,
      hourlyWage: settings.hourlyWage,
      overtimeRate: settings.overtimeRate,
      transportationAllowance: settings.transportationAllowance,
      mealAllowance: settings.mealAllowance,
      socialInsuranceRate: settings.socialInsuranceRate,
      taxRate: settings.taxRate
    });
    alert('給与設定を保存しました。');
  };

  // 今日の出勤状況
  const todayAttendance = employees.map(emp => ({
    ...emp,
    isPresent: timeRecords.some(record => 
      record.employeeId === emp.id && 
      record.type === 'clockIn' && 
      record.date === new Date().toISOString().split('T')[0]
    )
  }));

  const presentCount = todayAttendance.filter(emp => emp.isPresent).length;

  // 今日の打刻記録
  const todayRecords = timeRecords.filter(record => 
    record.date === new Date().toISOString().split('T')[0]
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 border border-white/20 text-center">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Clock className="w-8 h-8 text-blue-600 animate-spin" />
          </div>
          <p className="text-slate-600">データを読み込み中...</p>
        </div>
      </div>
    );
  }

  if (!adminUser || !companyInfo) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#f8f6f3]">
      {/* ヘッダー */}
      <header className="bg-[#f8f6f3] border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-green-600 rounded-xl flex items-center justify-center">
                  <Clock className="w-6 h-6 text-white" />
                </div>
                <h1 className="text-2xl font-bold text-gray-800">Tick</h1>
              </div>
              <div className="hidden md:block">
                <h2 className="text-3xl font-bold text-gray-800">Human Resources</h2>
                <p className="text-gray-600">HR - PROD</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5z" />
                </svg>
              </button>
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                  <span className="text-sm font-medium text-gray-700">{adminUser.name?.charAt(0)}</span>
                </div>
                <span className="text-sm text-gray-600">{adminUser.name}さん</span>
              </div>
              <button
                onClick={handleLogout}
                className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* メインコンテンツ */}
      <div className="max-w-7xl mx-auto px-3 py-4 sm:px-4 sm:py-8">
        <div className="flex flex-col lg:flex-row space-y-6 lg:space-y-0 lg:space-x-8">
          {/* サイドバー */}
          <aside className="w-full lg:w-64 flex-shrink-0">
            <nav className="bg-green-800 rounded-xl lg:rounded-2xl shadow-xl p-4 lg:p-6">
              <div className="grid grid-cols-2 lg:grid-cols-1 gap-2 lg:gap-2">
                <button
                  onClick={() => setActiveTab('overview')}
                                      className={`flex flex-col lg:flex-row items-center justify-center lg:justify-start space-y-1 lg:space-y-0 lg:space-x-3 px-3 lg:px-4 py-3 rounded-lg lg:rounded-xl transition-colors text-sm lg:text-base min-h-[44px] ${
                      activeTab === 'overview' ? 'bg-green-600 text-white' : 'text-green-100 hover:bg-green-700'
                    }`}
                >
                  <BarChart3 className="w-4 h-4 lg:w-5 lg:h-5" />
                  <span>概要</span>
                </button>
                <button
                  onClick={() => setActiveTab('employees')}
                                      className={`flex flex-col lg:flex-row items-center justify-center lg:justify-start space-y-1 lg:space-y-0 lg:space-x-3 px-3 lg:px-4 py-3 rounded-lg lg:rounded-xl transition-colors text-sm lg:text-base min-h-[44px] ${
                      activeTab === 'employees' ? 'bg-green-600 text-white' : 'text-green-100 hover:bg-green-700'
                    }`}
                >
                  <Users className="w-4 h-4 lg:w-5 lg:h-5" />
                  <span>社員管理</span>
                </button>
                <button
                  onClick={() => setActiveTab('attendance')}
                                      className={`flex flex-col lg:flex-row items-center justify-center lg:justify-start space-y-1 lg:space-y-0 lg:space-x-3 px-3 lg:px-4 py-3 rounded-lg lg:rounded-xl transition-colors text-sm lg:text-base min-h-[44px] ${
                      activeTab === 'attendance' ? 'bg-green-600 text-white' : 'text-green-100 hover:bg-green-700'
                    }`}
                >
                  <Calendar className="w-4 h-4 lg:w-5 lg:h-5" />
                  <span>勤怠管理</span>
                </button>
                <button
                  onClick={() => setActiveTab('company')}
                                      className={`flex flex-col lg:flex-row items-center justify-center lg:justify-start space-y-1 lg:space-y-0 lg:space-x-3 px-3 lg:px-4 py-3 rounded-lg lg:rounded-xl transition-colors text-sm lg:text-base min-h-[44px] ${
                      activeTab === 'company' ? 'bg-green-600 text-white' : 'text-green-100 hover:bg-green-700'
                    }`}
                >
                  <Building2 className="w-4 h-4 lg:w-5 lg:h-5" />
                  <span>企業設定</span>
                </button>
                <button
                  onClick={() => setActiveTab('salary')}
                                      className={`flex flex-col lg:flex-row items-center justify-center lg:justify-start space-y-1 lg:space-y-0 lg:space-x-3 px-3 lg:px-4 py-3 rounded-lg lg:rounded-xl transition-colors text-sm lg:text-base min-h-[44px] ${
                      activeTab === 'salary' ? 'bg-green-600 text-white' : 'text-green-100 hover:bg-green-700'
                    }`}
                >
                  <FileSpreadsheet className="w-4 h-4 lg:w-5 lg:h-5" />
                  <span>給与テンプレート</span>
                </button>
                <button
                  onClick={() => setActiveTab('terminal')}
                                      className={`flex flex-col lg:flex-row items-center justify-center lg:justify-start space-y-1 lg:space-y-0 lg:space-x-3 px-3 lg:px-4 py-3 rounded-lg lg:rounded-xl transition-colors text-sm lg:text-base min-h-[44px] ${
                      activeTab === 'terminal' ? 'bg-green-600 text-white' : 'text-green-100 hover:bg-green-700'
                    }`}
                >
                  <Clock className="w-4 h-4 lg:w-5 lg:h-5" />
                  <span>共有端末</span>
                </button>
                <button
                  onClick={() => setActiveTab('employeeList')}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-colors text-sm font-medium ${
                    activeTab === 'employeeList' ? 'bg-green-600 text-white' : 'text-green-100 hover:bg-green-700'
                  }`}
                >
                  <Users className="w-5 h-5" />
                  <span>従業員一覧</span>
                </button>
              </div>
            </nav>
          </aside>

          {/* メインエリア */}
          <main className="flex-1">
            <div className="space-y-6">
              {/* 概要タブ */}
              {activeTab === 'overview' && (
                <>
                  {/* 企業情報表示 */}
                  <div className="bg-white/80 backdrop-blur-sm rounded-xl sm:rounded-2xl shadow-xl p-4 sm:p-6 border border-white/20">
                    <div className="flex items-center space-x-3 mb-4">
                      <Building2 className="w-6 h-6 text-blue-600" />
                      <h2 className="text-lg font-bold text-slate-800">企業情報</h2>
                      <div className="ml-auto flex items-center space-x-2 text-sm text-green-600">
                        <CheckCircle className="w-4 h-4" />
                        <span>初期設定完了</span>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-slate-600">企業ID</p>
                        <p className="text-lg font-bold text-blue-600">{companyInfo.id}</p>
                      </div>
                      <div>
                        <p className="text-sm text-slate-600">会社名</p>
                        <p className="text-lg font-bold text-slate-800">{companyInfo.name}</p>
                      </div>
                    </div>
                  </div>

                  {/* 統計情報 */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                    <div className="bg-white/80 backdrop-blur-sm rounded-xl sm:rounded-2xl shadow-xl p-4 sm:p-6 border border-white/20">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                          <Users className="w-5 h-5 sm:w-6 sm:w-6 text-blue-600" />
                        </div>
                        <div>
                          <p className="text-xs sm:text-sm text-slate-600">総社員数</p>
                          <p className="text-xl sm:text-2xl font-bold text-slate-800">{employees.length}名</p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white/80 backdrop-blur-sm rounded-xl sm:rounded-2xl shadow-xl p-4 sm:p-6 border border-white/20">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-100 rounded-xl flex items-center justify-center">
                          <UserCheck className="w-5 h-5 sm:w-6 sm:w-6 text-green-600" />
                        </div>
                        <div>
                          <p className="text-xs sm:text-sm text-slate-600">今日の出勤者</p>
                          <p className="text-xl sm:text-2xl font-bold text-slate-800">{presentCount}名</p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white/80 backdrop-blur-sm rounded-xl sm:rounded-2xl shadow-xl p-4 sm:p-6 border border-white/20">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                          <Calendar className="w-5 h-5 sm:w-6 sm:w-6 text-purple-600" />
                        </div>
                        <div>
                          <p className="text-xs sm:text-sm text-slate-600">今日の打刻数</p>
                          <p className="text-xl sm:text-2xl font-bold text-slate-800">{todayRecords.length}件</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 今日の出勤状況 */}
                  {employees.length > 0 && (
                    <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-white/20">
                      <h2 className="text-xl font-bold text-slate-800 mb-4">今日の出勤状況</h2>
                      <div className="space-y-3">
                        {todayAttendance.map((employee) => (
                          <div
                            key={employee.id}
                            className={`flex items-center justify-between p-3 rounded-xl border ${
                              employee.isPresent
                                ? 'bg-green-50 border-green-200'
                                : 'bg-slate-50 border-slate-200'
                            }`}
                          >
                            <div>
                              <span className="font-medium text-slate-800">{employee.name}</span>
                              <span className="text-sm text-slate-500 ml-2">
                                {employee.department} - {employee.position}
                              </span>
                            </div>
                            <div className="flex items-center space-x-2">
                              {employee.isPresent ? (
                                <>
                                  <UserCheck className="w-5 h-5 text-green-600" />
                                  <span className="text-sm text-green-600">出勤済み</span>
                                </>
                              ) : (
                                <>
                                  <UserX className="w-5 h-5 text-slate-400" />
                                  <span className="text-sm text-slate-500">未出勤</span>
                                </>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* 従業員が登録されていない場合 */}
                  {employees.length === 0 && (
                    <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 border border-white/20 text-center">
                      <Users className="w-16 h-16 text-slate-400 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-slate-600 mb-2">従業員が登録されていません</h3>
                      <p className="text-slate-500 mb-6">従業員を登録して勤怠管理を開始しましょう</p>
                      <button
                        onClick={() => setActiveTab('employees')}
                        className="inline-flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl transition-colors duration-200"
                      >
                        <Plus className="w-4 h-4" />
                        <span>従業員を登録</span>
                      </button>
                    </div>
                  )}
                </>
              )}

              {/* 従業員一覧タブ */}
              {activeTab === 'employeeList' && (
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-white/20">
                  <h2 className="text-xl font-bold text-slate-800 mb-6">従業員一覧</h2>
                  
                  {employees.length === 0 ? (
                    <div className="text-center py-12">
                      <Users className="w-16 h-16 text-slate-400 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-slate-600 mb-2">従業員が登録されていません</h3>
                      <p className="text-slate-500 mb-6">社員管理タブで従業員を登録してください</p>
                    </div>
                  ) : (
                    <>
                      {/* PC表示（テーブル） */}
                      <div className="hidden lg:block overflow-x-auto">
                        <table className="w-full">
                          <thead>
                            <tr className="border-b border-slate-200">
                              <th className="text-left py-3 px-4 font-semibold text-slate-700">氏名</th>
                              <th className="text-left py-3 px-4 font-semibold text-slate-700">時給</th>
                              <th className="text-left py-3 px-4 font-semibold text-slate-700">労働時間</th>
                              <th className="text-left py-3 px-4 font-semibold text-slate-700">出勤日数</th>
                              <th className="text-left py-3 px-4 font-semibold text-slate-700">部署</th>
                              <th className="text-left py-3 px-4 font-semibold text-slate-700">役職</th>
                              <th className="text-left py-3 px-4 font-semibold text-slate-700">基本給</th>
                              <th className="text-left py-3 px-4 font-semibold text-slate-700">交通費</th>
                              <th className="text-left py-3 px-4 font-semibold text-slate-700">食事手当</th>
                            </tr>
                          </thead>
                          <tbody>
                            {employees.map((employee) => {
                              const stats = calculateEmployeeStats(employee.id);
                              return (
                                <tr key={employee.id} className="border-b border-slate-100 hover:bg-slate-50">
                                  <td className="py-3 px-4 text-slate-800 font-medium">{employee.name}</td>
                                  <td className="py-3 px-4 text-slate-800">{employee.hourlyWage || '-'}円</td>
                                  <td className="py-3 px-4 text-slate-800">{stats.totalWorkHours}:00</td>
                                  <td className="py-3 px-4 text-slate-800">{stats.attendanceDays}日</td>
                                  <td className="py-3 px-4 text-slate-600">{employee.department}</td>
                                  <td className="py-3 px-4 text-slate-600">{employee.position}</td>
                                  <td className="py-3 px-4 text-slate-800">{employee.monthlySalary || '-'}円</td>
                                  <td className="py-3 px-4 text-slate-800">{employee.transportationAllowance || '-'}円</td>
                                  <td className="py-3 px-4 text-slate-800">{employee.mealAllowance || '-'}円</td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>

                      {/* モバイル表示（カード） */}
                      <div className="lg:hidden space-y-4">
                        {employees.map((employee) => {
                          const stats = calculateEmployeeStats(employee.id);
                          return (
                            <div key={employee.id} className="bg-slate-50 rounded-lg p-4">
                              <div className="flex items-center justify-between mb-3">
                                <h3 className="text-lg font-semibold text-slate-800">{employee.name}</h3>
                                <span className="text-sm text-slate-600">{employee.department} - {employee.position}</span>
                              </div>
                              <div className="grid grid-cols-2 gap-3 text-sm">
                                <div>
                                  <span className="text-slate-600">時給:</span>
                                  <span className="ml-2 font-medium">{employee.hourlyWage || '-'}円</span>
                                </div>
                                <div>
                                  <span className="text-slate-600">労働時間:</span>
                                  <span className="ml-2 font-medium">{stats.totalWorkHours}:00</span>
                                </div>
                                <div>
                                  <span className="text-slate-600">出勤日数:</span>
                                  <span className="ml-2 font-medium">{stats.attendanceDays}日</span>
                                </div>
                                <div>
                                  <span className="text-slate-600">基本給:</span>
                                  <span className="ml-2 font-medium">{employee.monthlySalary || '-'}円</span>
                                </div>
                                <div>
                                  <span className="text-slate-600">交通費:</span>
                                  <span className="ml-2 font-medium">{employee.transportationAllowance || '-'}円</span>
                                </div>
                                <div>
                                  <span className="text-slate-600">食事手当:</span>
                                  <span className="ml-2 font-medium">{employee.mealAllowance || '-'}円</span>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {/* 集計情報 */}
                      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <h3 className="text-lg font-semibold text-blue-800 mb-3">今月の集計</h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div className="text-center">
                            <div className="text-2xl font-bold text-blue-600">{employees.length}</div>
                            <div className="text-blue-600">総従業員数</div>
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-bold text-green-600">
                              {employees.reduce((total, emp) => total + calculateEmployeeStats(emp.id).attendanceDays, 0)}
                            </div>
                            <div className="text-green-600">総出勤日数</div>
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-bold text-purple-600">
                              {employees.reduce((total, emp) => total + calculateEmployeeStats(emp.id).totalWorkHours, 0)}:00
                            </div>
                            <div className="text-purple-600">総労働時間</div>
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-bold text-orange-600">
                              {employees.reduce((total, emp) => total + (emp.hourlyWage || 0), 0)}円
                            </div>
                            <div className="text-orange-600">平均時給</div>
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* 社員管理タブ */}
              {activeTab === 'employees' && (
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-white/20">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-slate-800">社員一覧</h2>
                    <button
                      onClick={() => setShowAddEmployeeModal(true)}
                      className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl transition-colors duration-200"
                    >
                      <Plus className="w-4 h-4" />
                      <span>従業員追加</span>
                    </button>
                  </div>
                  
                  {employees.length === 0 ? (
                    <div className="text-center py-12">
                      <Users className="w-16 h-16 text-slate-400 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-slate-600 mb-2">従業員が登録されていません</h3>
                      <p className="text-slate-500 mb-6">最初の従業員を登録してください</p>
                      <button
                        onClick={() => setShowAddEmployeeModal(true)}
                        className="inline-flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl transition-colors duration-200"
                      >
                        <Plus className="w-4 h-4" />
                        <span>従業員を追加</span>
                      </button>
                    </div>
                  ) : (
                    <>
                      {/* PC表示（テーブル） */}
                      <div className="hidden lg:block overflow-x-auto">
                        <table className="w-full">
                          <thead>
                            <tr className="border-b border-slate-200">
                              <th className="text-left py-3 px-4 font-semibold text-slate-700">社員ID</th>
                              <th className="text-left py-3 px-4 font-semibold text-slate-700">氏名</th>
                              <th className="text-left py-3 px-4 font-semibold text-slate-700">部署</th>
                              <th className="text-left py-3 px-4 font-semibold text-slate-700">役職</th>
                            </tr>
                          </thead>
                          <tbody>
                            {employees.map((employee) => (
                              <tr key={employee.id} className="border-b border-slate-100 hover:bg-slate-50">
                                <td className="py-3 px-4 text-slate-800">{employee.id}</td>
                                <td className="py-3 px-4 text-slate-800">{employee.name}</td>
                                <td className="py-3 px-4 text-slate-600">{employee.department}</td>
                                <td className="py-3 px-4 text-slate-600">{employee.position}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                      {/* モバイル表示（カード） */}
                      <div className="lg:hidden space-y-3">
                        {employees.map((employee) => (
                          <div key={employee.id} className="bg-slate-50 rounded-xl p-4">
                            <div className="flex items-center justify-between mb-2">
                              <span className="font-semibold text-slate-800">{employee.name}</span>
                              <span className="text-sm text-slate-500">{employee.id}</span>
                            </div>
                            <div className="text-sm text-slate-600">
                              {employee.department} - {employee.position}
                            </div>
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* 勤怠管理タブ */}
              {activeTab === 'attendance' && (
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-white/20">
                  <h2 className="text-xl font-bold text-slate-800 mb-4">今日の打刻記録</h2>
                  
                  {todayRecords.length === 0 ? (
                    <div className="text-center py-8">
                      <Calendar className="w-16 h-16 text-slate-400 mx-auto mb-4" />
                      <p className="text-slate-500">今日の打刻記録はありません</p>
                    </div>
                  ) : (
                    <>
                      {/* PC表示（テーブル） */}
                      <div className="hidden lg:block overflow-x-auto">
                        <table className="w-full">
                          <thead>
                            <tr className="border-b border-slate-200">
                              <th className="text-left py-3 px-4 font-semibold text-slate-700">社員名</th>
                              <th className="text-left py-3 px-4 font-semibold text-slate-700">打刻種別</th>
                              <th className="text-left py-3 px-4 font-semibold text-slate-700">時刻</th>
                              <th className="text-left py-3 px-4 font-semibold text-slate-700">日付</th>
                            </tr>
                          </thead>
                          <tbody>
                            {todayRecords.map((record) => (
                              <tr key={record.id} className="border-b border-slate-100 hover:bg-slate-50">
                                <td className="py-3 px-4 text-slate-800">{record.employeeName}</td>
                                <td className="py-3 px-4 text-slate-800">
                                  {record.type === 'clockIn' ? '出勤' : 
                                   record.type === 'clockOut' ? '退勤' : 
                                   record.type === 'breakStart' ? '休憩開始' : '休憩終了'}
                                </td>
                                <td className="py-3 px-4 text-slate-600">{record.time}</td>
                                <td className="py-3 px-4 text-slate-600">{record.date}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                      {/* モバイル表示（カード） */}
                      <div className="lg:hidden space-y-3">
                        {todayRecords.map((record) => (
                          <div key={record.id} className="bg-slate-50 rounded-xl p-4">
                            <div className="flex items-center justify-between mb-2">
                              <span className="font-semibold text-slate-800">{record.employeeName}</span>
                              <span className="text-sm text-slate-500">{record.time}</span>
                            </div>
                            <div className="text-sm text-slate-600">
                              {record.type === 'clockIn' ? '出勤' : 
                               record.type === 'clockOut' ? '退勤' : 
                               record.type === 'breakStart' ? '休憩開始' : '休憩終了'}
                            </div>
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* 企業設定タブ */}
              {activeTab === 'company' && (
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-white/20">
                  <h2 className="text-xl font-bold text-slate-800 mb-6">企業設定</h2>
                  
                  <div className="space-y-6">
                    {/* 企業基本情報 */}
                    <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
                      <h3 className="text-lg font-semibold text-blue-800 mb-4">企業基本情報</h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-blue-600 font-medium">企業ID</p>
                          <p className="text-2xl font-bold text-blue-800">{companyInfo.id}</p>
                        </div>
                        <div>
                          <p className="text-sm text-blue-600 font-medium">会社名</p>
                          <p className="text-xl font-semibold text-blue-800">{companyInfo.name}</p>
                        </div>
                      </div>
                      <p className="text-sm text-blue-600 mt-4">
                        登録日: {new Date(companyInfo.createdAt).toLocaleDateString('ja-JP')}
                      </p>
                    </div>

                    {/* 勤務時間設定 */}
                    {companySettings && (
                      <div className="bg-slate-50 border border-slate-200 rounded-xl p-6">
                        <h3 className="text-lg font-semibold text-slate-800 mb-4">勤務時間設定</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm text-slate-600 font-medium">勤務時間</p>
                            <p className="text-lg font-semibold text-slate-800">
                              {companySettings.workStartTime} - {companySettings.workEndTime}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-slate-600 font-medium">休憩時間</p>
                            <p className="text-lg font-semibold text-slate-800">
                              {companySettings.breakStartTime} - {companySettings.breakEndTime}
                            </p>
                          </div>
                        </div>
                        <p className="text-sm text-slate-600 mt-4">
                          最終更新: {new Date(companySettings.updatedAt).toLocaleDateString('ja-JP')}
                        </p>
                      </div>
                    )}

                    {/* 管理者情報 */}
                    <div className="bg-green-50 border border-green-200 rounded-xl p-6">
                      <h3 className="text-lg font-semibold text-green-800 mb-4">管理者情報</h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-green-600 font-medium">管理者ID</p>
                          <p className="text-lg font-semibold text-green-800">{companyInfo.adminUsername}</p>
                        </div>
                        <div>
                          <p className="text-sm text-green-600 font-medium">管理者名</p>
                          <p className="text-lg font-semibold text-green-800">{companyInfo.adminName}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* 給与テンプレートタブ */}
              {activeTab === 'salary' && (
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-white/20">
                  <h2 className="text-xl font-bold text-slate-800 mb-6">給与テンプレート</h2>
                  
                  <div className="space-y-6">
                    {/* エクスポート形式選択 */}
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6">
                      <h3 className="text-lg font-semibold text-blue-800 mb-4">エクスポート形式選択</h3>
                      <p className="text-sm text-blue-600 mb-4">
                        勤怠データを給与計算用のテンプレートにエクスポートできます
                      </p>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <button
                          onClick={() => handleExportSalary('excel')}
                          className="bg-white border-2 border-blue-200 hover:border-blue-400 rounded-xl p-4 text-center transition-all duration-200 hover:shadow-lg"
                        >
                          <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                            <FileSpreadsheet className="w-6 h-6 text-blue-600" />
                          </div>
                          <h4 className="font-semibold text-blue-800 mb-2">Excel給与計算テンプレート</h4>
                          <p className="text-xs text-blue-600">
                            勤怠データが自動反映される形式<br/>
                            計算式内蔵・給与明細書自動生成
                          </p>
                        </button>

                        <button
                          onClick={() => handleExportSalary('google')}
                          className="bg-white border-2 border-green-200 hover:border-green-400 rounded-xl p-4 text-center transition-all duration-200 hover:shadow-lg"
                        >
                          <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                            <FileSpreadsheet className="w-6 h-6 text-green-600" />
                          </div>
                          <h4 className="font-semibold text-green-800 mb-2">Googleスプレッドシート形式</h4>
                          <p className="text-xs text-green-600">
                            Web上で共有・編集可能<br/>
                            リアルタイム計算更新
                          </p>
                        </button>

                        <button
                          onClick={() => handleExportSalary('csv')}
                          className="bg-white border-2 border-purple-200 hover:border-purple-400 rounded-xl p-4 text-center transition-all duration-200 hover:shadow-lg"
                        >
                          <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                            <FileSpreadsheet className="w-6 h-6 text-purple-600" />
                          </div>
                          <h4 className="font-semibold text-purple-800 mb-2">汎用CSV（その他ソフト用）</h4>
                          <p className="text-xs text-purple-600">
                            一般的な給与ソフトに対応<br/>
                            柔軟なデータ形式
                          </p>
                        </button>
                      </div>
                    </div>

                    {/* 月次データ選択 */}
                    <div className="bg-slate-50 border border-slate-200 rounded-xl p-6">
                      <h3 className="text-lg font-semibold text-slate-800 mb-4">月次データ選択</h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-2">年</label>
                          <select
                            value={selectedYear}
                            onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                            className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          >
                            {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - 2 + i).map(year => (
                              <option key={year} value={year}>{year}年</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-2">月</label>
                          <select
                            value={selectedMonth}
                            onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                            className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          >
                            {Array.from({ length: 12 }, (_, i) => i + 1).map(month => (
                              <option key={month} value={month}>{month}月</option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>

                    {/* 従業員別給与設定 */}
                    <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
                      <h3 className="text-lg font-semibold text-yellow-800 mb-4">従業員別給与設定</h3>
                      <p className="text-sm text-yellow-700 mb-4">
                        各従業員の給与設定を個別に管理できます。時給、交通費、各種手当の設定が可能です。
                      </p>
                      
                      <div className="space-y-4">
                        {employees.map((employee) => (
                          <div key={employee.id} className="bg-white rounded-lg p-4 border border-yellow-200">
                            <div className="flex items-center justify-between mb-3">
                              <h4 className="font-semibold text-slate-800">
                                {employee.name} ({employee.department} - {employee.position})
                              </h4>
                              <button
                                onClick={() => handleEditEmployeeSalary(employee)}
                                className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-lg text-sm transition-colors duration-200"
                              >
                                編集
                              </button>
                            </div>
                            
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                              <div>
                                <span className="text-slate-600">時給:</span>
                                <span className="ml-2 font-medium">{employee.hourlyWage || '-'}円</span>
                              </div>
                              <div>
                                <span className="text-slate-600">基本給:</span>
                                <span className="ml-2 font-medium">{employee.monthlySalary || '-'}円</span>
                              </div>
                              <div>
                                <span className="text-slate-600">交通費:</span>
                                <span className="ml-2 font-medium">{employee.transportationAllowance || '-'}円</span>
                              </div>
                              <div>
                                <span className="text-slate-600">食事手当:</span>
                                <span className="ml-2 font-medium">{employee.mealAllowance || '-'}円</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* 使い方ガイド */}
                    <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-6">
                      <h3 className="text-lg font-semibold text-indigo-800 mb-4">使い方ガイド</h3>
                      <div className="space-y-3 text-sm text-indigo-700">
                        <div className="flex items-start space-x-2">
                          <span className="w-6 h-6 bg-indigo-200 rounded-full flex items-center justify-center text-indigo-800 text-xs font-bold flex-shrink-0 mt-0.5">1</span>
                          <p>上記の給与設定を必要に応じて調整してください</p>
                        </div>
                        <div className="flex items-start space-x-2">
                          <span className="w-6 h-6 bg-indigo-200 rounded-full flex items-center justify-center text-indigo-800 text-xs font-bold flex-shrink-0 mt-0.5">2</span>
                          <p>エクスポートしたい年月を選択してください</p>
                        </div>
                        <div className="flex items-start space-x-2">
                          <span className="w-6 h-6 bg-indigo-200 rounded-full flex items-center justify-center text-indigo-800 text-xs font-bold flex-shrink-0 mt-0.5">3</span>
                          <p>希望する形式のボタンをクリックしてダウンロードしてください</p>
                        </div>
                        <div className="flex items-start space-x-2">
                          <span className="w-6 h-6 bg-indigo-200 rounded-full flex items-center justify-center text-indigo-800 text-xs font-bold flex-shrink-0 mt-0.5">4</span>
                          <p>ダウンロードしたファイルをExcelやGoogleスプレッドシートで開いてご利用ください</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* 共有端末タブ */}
              {activeTab === 'terminal' && (
                <div className="space-y-6">
                  {/* 共有端末へのアクセス */}
                  <div className="bg-white/80 backdrop-blur-sm rounded-xl sm:rounded-2xl shadow-xl p-6 sm:p-8 border border-white/20">
                    <div className="text-center">
                      <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Clock className="w-10 h-10 text-blue-600" />
                      </div>
                      <h2 className="text-2xl font-bold text-slate-800 mb-4">共有端末</h2>
                      <p className="text-slate-600 mb-6 max-w-2xl mx-auto">
                        従業員が勤怠打刻を行う共有端末画面にアクセスできます。<br />
                        出勤・退勤・休憩の打刻、今日の打刻履歴の確認が可能です。
                      </p>
                      
                      <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <a
                          href="/"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-xl transition-colors duration-200 shadow-lg hover:shadow-xl"
                        >
                          <Clock className="w-5 h-5" />
                          <span>共有端末を開く</span>
                        </a>
                        
                        <button
                          onClick={() => {
                            if (typeof window !== 'undefined') {
                              window.open('/', '_blank');
                            }
                          }}
                          className="inline-flex items-center justify-center space-x-2 border border-slate-300 text-slate-700 font-semibold py-3 px-6 rounded-xl hover:bg-slate-50 transition-colors duration-200"
                        >
                          <span>新しいタブで開く</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* 使用方法ガイド */}
                  <div className="bg-white/80 backdrop-blur-sm rounded-xl sm:rounded-2xl shadow-xl p-6 sm:p-8 border border-white/20">
                    <h3 className="text-xl font-bold text-slate-800 mb-4">使用方法</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-semibold text-slate-800 mb-3">従業員向け</h4>
                        <ul className="space-y-2 text-sm text-slate-600">
                          <li className="flex items-start space-x-2">
                            <span className="w-5 h-5 bg-blue-200 rounded-full flex items-center justify-center text-blue-800 text-xs font-bold flex-shrink-0 mt-0.5">1</span>
                            <span>共有端末画面にアクセス</span>
                          </li>
                          <li className="flex items-start space-x-2">
                            <span className="w-5 h-5 bg-blue-200 rounded-full flex items-center justify-center text-blue-800 text-xs font-bold flex-shrink-0 mt-0.5">2</span>
                            <span>出勤・退勤・休憩のボタンをクリック</span>
                          </li>
                          <li className="flex items-start space-x-2">
                            <span className="w-5 h-5 bg-blue-200 rounded-full flex items-center justify-center text-blue-800 text-xs font-bold flex-shrink-0 mt-0.5">3</span>
                            <span>社員番号を入力して打刻完了</span>
                          </li>
                        </ul>
                      </div>
                      
                      <div>
                        <h4 className="font-semibold text-slate-800 mb-3">管理者向け</h4>
                        <ul className="space-y-2 text-sm text-slate-600">
                          <li className="flex items-start space-x-2">
                            <span className="w-5 h-5 bg-green-200 rounded-full flex items-center justify-center text-green-800 text-xs font-bold flex-shrink-0 mt-0.5">1</span>
                            <span>管理者画面で従業員を登録</span>
                          </li>
                          <li className="flex items-start space-x-2">
                            <span className="w-5 h-5 bg-green-200 rounded-full flex items-center justify-center text-green-800 text-xs font-bold flex-shrink-0 mt-0.5">2</span>
                            <span>勤怠データを確認・管理</span>
                          </li>
                          <li className="flex items-start space-x-2">
                            <span className="w-5 h-5 bg-green-200 rounded-full flex items-center justify-center text-green-800 text-xs font-bold flex-shrink-0 mt-0.5">3</span>
                            <span>給与テンプレートでデータ出力</span>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  {/* 現在の状況 */}
                  <div className="bg-white/80 backdrop-blur-sm rounded-xl sm:rounded-2xl shadow-xl p-6 sm:p-8 border border-white/20">
                    <h3 className="text-xl font-bold text-slate-800 mb-4">現在の状況</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="text-center p-4 bg-slate-50 rounded-lg">
                        <div className="text-2xl font-bold text-blue-600">{employees.length}</div>
                        <div className="text-sm text-slate-600">登録従業員数</div>
                      </div>
                      <div className="text-center p-4 bg-slate-50 rounded-lg">
                        <div className="text-2xl font-bold text-green-600">
                          {timeRecords.filter(record => 
                            record.date === new Date().toISOString().split('T')[0]
                          ).length}
                        </div>
                        <div className="text-sm text-slate-600">今日の打刻数</div>
                      </div>
                      <div className="text-center p-4 bg-slate-50 rounded-lg">
                        <div className="text-2xl font-bold text-purple-600">
                          {companyInfo ? '設定済み' : '未設定'}
                        </div>
                        <div className="text-sm text-slate-600">システム状態</div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </main>
        </div>
      </div>

      {/* 従業員追加モーダル */}
      {showAddEmployeeModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 max-w-md mx-4 w-full">
            <h3 className="text-xl font-bold text-slate-800 mb-6 text-center">従業員追加</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  社員番号
                </label>
                <input
                  type="text"
                  value={newEmployee.id}
                  onChange={(e) => setNewEmployee({ ...newEmployee, id: e.target.value })}
                  placeholder="自動採番（空欄可）"
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <p className="text-xs text-slate-500 mt-1">空欄の場合は自動で採番されます</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  氏名 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={newEmployee.name}
                  onChange={(e) => setNewEmployee({ ...newEmployee, name: e.target.value })}
                  placeholder="田中太郎"
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  部署 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={newEmployee.department}
                  onChange={(e) => setNewEmployee({ ...newEmployee, department: e.target.value })}
                  placeholder="営業部"
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  役職 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={newEmployee.position}
                  onChange={(e) => setNewEmployee({ ...newEmployee, position: e.target.value })}
                  placeholder="主任"
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => {
                  setShowAddEmployeeModal(false);
                  setNewEmployee({ id: '', name: '', department: '', position: '' });
                }}
                className="flex-1 py-3 px-4 border border-slate-300 text-slate-700 rounded-xl hover:bg-slate-50 transition-colors duration-200"
              >
                キャンセル
              </button>
              <button
                onClick={handleAddEmployee}
                className="flex-1 py-3 px-4 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors duration-200"
              >
                保存
              </button>
            </div>
          </div>
        </div>
      )}


    </div>
  );
}
