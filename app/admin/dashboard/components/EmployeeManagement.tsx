'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Employee } from '@/app/lib/localStorage';
import EmployeeList from './EmployeeList';
import EmployeeSearch from './EmployeeSearch';
import EmployeeDetail from './EmployeeDetail';
import EmployeeForm from './EmployeeForm';
import { addEmployee, updateEmployee, deleteEmployee, getEmployees } from '@/app/lib/localStorage';

export default function EmployeeManagement() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [filteredEmployees, setFilteredEmployees] = useState<Employee[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    department: '',
    position: '',
    status: '',
    salaryRange: ''
  });
  
  // モーダル状態
  const [showEmployeeForm, setShowEmployeeForm] = useState(false);
  const [showEmployeeDetail, setShowEmployeeDetail] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);

  // 初期データ読み込み
  useEffect(() => {
    const loadEmployees = () => {
      const loadedEmployees = getEmployees();
      setEmployees(loadedEmployees);
      setFilteredEmployees(loadedEmployees);
    };

    loadEmployees();
  }, []);

  // 検索とフィルタリングの適用
  useEffect(() => {
    let result = [...employees];

    // 検索クエリの適用
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(employee =>
        employee.name.toLowerCase().includes(query) ||
        employee.department.toLowerCase().includes(query) ||
        employee.position.toLowerCase().includes(query) ||
        employee.id.toLowerCase().includes(query)
      );
    }

    // フィルタの適用
    if (filters.department) {
      result = result.filter(employee => employee.department === filters.department);
    }

    if (filters.position) {
      result = result.filter(employee => employee.position === filters.position);
    }

    if (filters.status) {
      const isActive = filters.status === 'active';
      result = result.filter(employee => employee.isActive === isActive);
    }

    if (filters.salaryRange) {
      result = result.filter(employee => {
        const salary = employee.monthlySalary || 0;
        switch (filters.salaryRange) {
          case 'low':
            return salary < 200000;
          case 'medium':
            return salary >= 200000 && salary < 400000;
          case 'high':
            return salary >= 400000;
          default:
            return true;
        }
      });
    }

    setFilteredEmployees(result);
  }, [employees, searchQuery, filters]);

  // 部署と役職の一覧を取得
  const departments = useMemo(() => {
    const depts = new Set(employees.map(emp => emp.department));
    return Array.from(depts).sort();
  }, [employees]);

  const positions = useMemo(() => {
    const pos = new Set(employees.map(emp => emp.position));
    return Array.from(pos).sort();
  }, [employees]);

  // 従業員追加
  const handleAddEmployee = (employeeData: Omit<Employee, 'id'>) => {
    const newEmployee = addEmployee(employeeData);
    if (newEmployee) {
      setEmployees(prev => [...prev, newEmployee]);
      setShowEmployeeForm(false);
    }
  };

  // 従業員更新
  const handleUpdateEmployee = (updatedEmployee: Employee) => {
    if (updateEmployee(updatedEmployee)) {
      setEmployees(prev => prev.map(emp => 
        emp.id === updatedEmployee.id ? updatedEmployee : emp
      ));
      setShowEmployeeDetail(false);
      setSelectedEmployee(null);
    }
  };

  // 従業員削除
  const handleDeleteEmployee = (employeeId: string) => {
    if (deleteEmployee(employeeId)) {
      setEmployees(prev => prev.filter(emp => emp.id !== employeeId));
      setShowEmployeeDetail(false);
      setSelectedEmployee(null);
    }
  };

  // 従業員詳細表示
  const handleViewEmployee = (employee: Employee) => {
    setSelectedEmployee(employee);
    setShowEmployeeDetail(true);
  };

  // 従業員編集
  const handleEditEmployee = (employee: Employee) => {
    setSelectedEmployee(employee);
    setShowEmployeeDetail(true);
  };

  // CSV出力
  const handleExportCSV = () => {
    const csvContent = [
      ['社員ID', '氏名', '部署', '役職', '時給', '基本給', '交通費', '食事手当', '入社日', 'ステータス'],
      ...filteredEmployees.map(emp => [
        emp.id,
        emp.name,
        emp.department,
        emp.position,
        emp.hourlyWage || '',
        emp.monthlySalary || '',
        emp.transportationAllowance || '',
        emp.mealAllowance || '',
        emp.hireDate || '',
        emp.isActive ? '在籍' : '退職'
      ])
    ].map(row => row.map(field => `"${field}"`).join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `従業員一覧_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // CSV一括登録
  const handleImportCSV = () => {
    // ファイル入力要素を作成
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.csv';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          const csv = event.target?.result as string;
          const lines = csv.split('\n');
          const headers = lines[0].split(',').map(h => h.replace(/"/g, '').trim());
          
          let successCount = 0;
          let errorCount = 0;

          for (let i = 1; i < lines.length; i++) {
            if (lines[i].trim()) {
              const values = lines[i].split(',').map(v => v.replace(/"/g, '').trim());
              const employeeData: any = {};
              
              headers.forEach((header, index) => {
                const value = values[index];
                switch (header) {
                  case '氏名':
                    employeeData.name = value;
                    break;
                  case '部署':
                    employeeData.department = value;
                    break;
                  case '役職':
                    employeeData.position = value;
                    break;
                  case '時給':
                    employeeData.hourlyWage = value ? parseInt(value) : undefined;
                    break;
                  case '基本給':
                    employeeData.monthlySalary = value ? parseInt(value) : undefined;
                    break;
                  case '交通費':
                    employeeData.transportationAllowance = value ? parseInt(value) : undefined;
                    break;
                  case '食事手当':
                    employeeData.mealAllowance = value ? parseInt(value) : undefined;
                    break;
                  case '入社日':
                    employeeData.hireDate = value;
                    break;
                  case 'ステータス':
                    employeeData.isActive = value === '在籍';
                    break;
                }
              });

              if (employeeData.name && employeeData.department && employeeData.position) {
                const newEmployee = addEmployee(employeeData);
                if (newEmployee) {
                  successCount++;
                } else {
                  errorCount++;
                }
              } else {
                errorCount++;
              }
            }
          }

          // 結果を表示
          alert(`CSV一括登録完了\n成功: ${successCount}件\nエラー: ${errorCount}件`);
          
          // 従業員リストを再読み込み
          const loadedEmployees = getEmployees();
          setEmployees(loadedEmployees);
        };
        reader.readAsText(file);
      }
    };
    input.click();
  };

  return (
    <div className="space-y-6">
      {/* 検索・フィルタ */}
      <EmployeeSearch
        onSearch={setSearchQuery}
        onFilter={setFilters}
        departments={departments}
        positions={positions}
      />

      {/* 従業員一覧 */}
      <EmployeeList
        employees={filteredEmployees}
        onEdit={handleEditEmployee}
        onDelete={handleDeleteEmployee}
        onView={handleViewEmployee}
        onAdd={() => setShowEmployeeForm(true)}
        onExportCSV={handleExportCSV}
        onImportCSV={handleImportCSV}
      />

      {/* 新規従業員登録フォーム */}
      <EmployeeForm
        isOpen={showEmployeeForm}
        onClose={() => setShowEmployeeForm(false)}
        onSave={handleAddEmployee}
      />

      {/* 従業員詳細・編集モーダル */}
      <EmployeeDetail
        employee={selectedEmployee}
        isOpen={showEmployeeDetail}
        onClose={() => {
          setShowEmployeeDetail(false);
          setSelectedEmployee(null);
        }}
        onSave={handleUpdateEmployee}
        onDelete={handleDeleteEmployee}
      />
    </div>
  );
}
