import { NextRequest, NextResponse } from 'next/server';

// 勤務記録データの型定義
interface TimeRecord {
  id: string;
  employeeId: string;
  employeeName: string;
  type: 'clockIn' | 'clockOut';
  time: string;
  date: string;
  location: string;
  ipAddress: string;
  deviceInfo: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

// 勤務記録一覧取得
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get('companyId');
    const employeeId = searchParams.get('employeeId');
    const dateFrom = searchParams.get('dateFrom');
    const dateTo = searchParams.get('dateTo');
    
    if (!companyId) {
      return NextResponse.json(
        { error: '企業IDが必要です' },
        { status: 400 }
      );
    }

    // 現在はlocalStorageから取得、後でDBに変更予定
    // ここではサンプルデータを返す
    const timeRecords: TimeRecord[] = [
      {
        id: '1',
        employeeId: '0001',
        employeeName: '田中太郎',
        type: 'clockIn',
        time: '09:00',
        date: new Date().toISOString().split('T')[0],
        location: '東京都渋谷区',
        ipAddress: '192.168.1.100',
        deviceInfo: 'iPhone 14, Chrome 120.0',
        notes: '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: '2',
        employeeId: '0001',
        employeeName: '田中太郎',
        type: 'clockOut',
        time: '18:00',
        date: new Date().toISOString().split('T')[0],
        location: '東京都渋谷区',
        ipAddress: '192.168.1.100',
        deviceInfo: 'iPhone 14, Chrome 120.0',
        notes: '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];

    // フィルタリング処理
    let filteredRecords = timeRecords;
    
    if (employeeId) {
      filteredRecords = filteredRecords.filter(record => record.employeeId === employeeId);
    }
    
    if (dateFrom) {
      filteredRecords = filteredRecords.filter(record => record.date >= dateFrom);
    }
    
    if (dateTo) {
      filteredRecords = filteredRecords.filter(record => record.date <= dateTo);
    }

    return NextResponse.json({
      success: true,
      data: filteredRecords,
      total: filteredRecords.length
    });

  } catch (error) {
    console.error('勤務記録一覧取得エラー:', error);
    return NextResponse.json(
      { error: '勤務記録一覧の取得中にエラーが発生しました' },
      { status: 500 }
    );
  }
}

// 勤務記録登録（打刻）
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { companyId, employeeId, type, location, ipAddress, deviceInfo, notes } = body;

    if (!companyId || !employeeId || !type) {
      return NextResponse.json(
        { error: '企業ID、従業員ID、打刻種別は必須です' },
        { status: 400 }
      );
    }

    // 打刻種別のバリデーション
    if (!['clockIn', 'clockOut'].includes(type)) {
      return NextResponse.json(
        { error: '打刻種別はclockInまたはclockOutである必要があります' },
        { status: 400 }
      );
    }

    // 現在時刻と日付を取得
    const now = new Date();
    const time = now.toTimeString().split(' ')[0].substring(0, 5);
    const date = now.toISOString().split('T')[0];

    // 新しい勤務記録を作成
    const newTimeRecord: TimeRecord = {
      id: generateTimeRecordId(),
      employeeId,
      employeeName: '田中太郎', // 後でDBから取得
      type,
      time,
      date,
      location: location || '不明',
      ipAddress: ipAddress || '不明',
      deviceInfo: deviceInfo || '不明',
      notes: notes || '',
      createdAt: now.toISOString(),
      updatedAt: now.toISOString()
    };

    // ここでDBに保存、現在はレスポンスのみ
    return NextResponse.json({
      success: true,
      message: `${type === 'clockIn' ? '出勤' : '退勤'}が記録されました`,
      data: newTimeRecord
    }, { status: 201 });

  } catch (error) {
    console.error('勤務記録登録エラー:', error);
    return NextResponse.json(
      { error: '勤務記録登録中にエラーが発生しました' },
      { status: 500 }
    );
  }
}

// 勤務記録更新
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { companyId, recordId, ...updateData } = body;

    if (!companyId || !recordId) {
      return NextResponse.json(
        { error: '企業IDと記録IDが必要です' },
        { status: 400 }
      );
    }

    // 更新処理（現在はレスポンスのみ）
    const updatedRecord = {
      id: recordId,
      ...updateData,
      updatedAt: new Date().toISOString()
    };

    return NextResponse.json({
      success: true,
      message: '勤務記録が更新されました',
      data: updatedRecord
    });

  } catch (error) {
    console.error('勤務記録更新エラー:', error);
    return NextResponse.json(
      { error: '勤務記録更新中にエラーが発生しました' },
      { status: 500 }
    );
  }
}

// 勤務記録削除
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get('companyId');
    const recordId = searchParams.get('recordId');

    if (!companyId || !recordId) {
      return NextResponse.json(
        { error: '企業IDと記録IDが必要です' },
        { status: 400 }
      );
    }

    // 削除処理（現在はレスポンスのみ）
    return NextResponse.json({
      success: true,
      message: '勤務記録が削除されました',
      data: { recordId }
    });

  } catch (error) {
    console.error('勤務記録削除エラー:', error);
    return NextResponse.json(
      { error: '勤務記録削除中にエラーが発生しました' },
      { status: 500 }
    );
  }
}

// 勤務記録IDを生成
function generateTimeRecordId(): string {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 1000);
  return `TR${timestamp}${random}`;
}
