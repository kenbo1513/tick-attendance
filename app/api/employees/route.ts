import { NextRequest, NextResponse } from 'next/server';

// 従業員データの型定義
interface Employee {
  id: string;
  name: string;
  department: string;
  position: string;
  hourlyWage: number;
  monthlySalary: number;
  transportationAllowance: number;
  mealAllowance: number;
  overtimeRate: number;
  nightShiftRate: number;
  holidayRate: number;
  createdAt: string;
  updatedAt: string;
}

// 従業員一覧取得
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get('companyId');
    
    if (!companyId) {
      return NextResponse.json(
        { error: '企業IDが必要です' },
        { status: 400 }
      );
    }

    // 現在はlocalStorageから取得、後でDBに変更予定
    // ここではサンプルデータを返す
    const employees: Employee[] = [
      {
        id: '0001',
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
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];

    return NextResponse.json({
      success: true,
      data: employees,
      total: employees.length
    });

  } catch (error) {
    console.error('従業員一覧取得エラー:', error);
    return NextResponse.json(
      { error: '従業員一覧の取得中にエラーが発生しました' },
      { status: 500 }
    );
  }
}

// 従業員登録
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { companyId, ...employeeData } = body;

    if (!companyId) {
      return NextResponse.json(
        { error: '企業IDが必要です' },
        { status: 400 }
      );
    }

    // 必須フィールドのバリデーション
    if (!employeeData.name || !employeeData.department) {
      return NextResponse.json(
        { error: '氏名と部署は必須です' },
        { status: 400 }
      );
    }

    // 従業員IDの自動生成（4桁）
    const newEmployee: Employee = {
      id: generateEmployeeId(),
      ...employeeData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // ここでDBに保存、現在はレスポンスのみ
    return NextResponse.json({
      success: true,
      message: '従業員が登録されました',
      data: newEmployee
    }, { status: 201 });

  } catch (error) {
    console.error('従業員登録エラー:', error);
    return NextResponse.json(
      { error: '従業員登録中にエラーが発生しました' },
      { status: 500 }
    );
  }
}

// 従業員更新
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { companyId, employeeId, ...updateData } = body;

    if (!companyId || !employeeId) {
      return NextResponse.json(
        { error: '企業IDと従業員IDが必要です' },
        { status: 400 }
      );
    }

    // 更新処理（現在はレスポンスのみ）
    const updatedEmployee = {
      id: employeeId,
      ...updateData,
      updatedAt: new Date().toISOString()
    };

    return NextResponse.json({
      success: true,
      message: '従業員情報が更新されました',
      data: updatedEmployee
    });

  } catch (error) {
    console.error('従業員更新エラー:', error);
    return NextResponse.json(
      { error: '従業員更新中にエラーが発生しました' },
      { status: 500 }
    );
  }
}

// 従業員削除
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get('companyId');
    const employeeId = searchParams.get('employeeId');

    if (!companyId || !employeeId) {
      return NextResponse.json(
        { error: '企業IDと従業員IDが必要です' },
        { status: 400 }
      );
    }

    // 削除処理（現在はレスポンスのみ）
    return NextResponse.json({
      success: true,
      message: '従業員が削除されました',
      data: { employeeId }
    });

  } catch (error) {
    console.error('従業員削除エラー:', error);
    return NextResponse.json(
      { error: '従業員削除中にエラーが発生しました' },
      { status: 500 }
    );
  }
}

// 4桁の従業員IDを生成
function generateEmployeeId(): string {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 1000);
  return String(timestamp % 10000).padStart(4, '0');
}
