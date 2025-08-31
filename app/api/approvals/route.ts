import { NextRequest, NextResponse } from 'next/server';

// 申請データの型定義
interface ApprovalRequest {
  id: string;
  employeeId: string;
  employeeName: string;
  type: 'timeCorrection' | 'leaveRequest';
  title: string;
  content: string;
  requestDate: string;
  urgency: 'low' | 'normal' | 'urgent';
  status: 'pending' | 'approved' | 'rejected';
  reason?: string;
  processedAt?: string;
  processedBy?: string;
  createdAt: string;
  updatedAt: string;
}

// 申請一覧取得
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get('companyId');
    const status = searchParams.get('status');
    const type = searchParams.get('type');
    const employeeId = searchParams.get('employeeId');
    
    if (!companyId) {
      return NextResponse.json(
        { error: '企業IDが必要です' },
        { status: 400 }
      );
    }

    // 現在はlocalStorageから取得、後でDBに変更予定
    // ここではサンプルデータを返す
    const approvals: ApprovalRequest[] = [
      {
        id: '1',
        employeeId: '0001',
        employeeName: '田中太郎',
        type: 'timeCorrection',
        title: '時刻修正申請',
        content: '昨日の出勤時刻を9:00から8:30に修正したい',
        requestDate: new Date().toISOString().split('T')[0],
        urgency: 'normal',
        status: 'pending',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: '2',
        employeeId: '0001',
        employeeName: '田中太郎',
        type: 'leaveRequest',
        title: '有給休暇申請',
        content: '来週月曜日から水曜日まで有給休暇を取得したい',
        requestDate: new Date().toISOString().split('T')[0],
        urgency: 'low',
        status: 'pending',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];

    // フィルタリング処理
    let filteredApprovals = approvals;
    
    if (status) {
      filteredApprovals = filteredApprovals.filter(approval => approval.status === status);
    }
    
    if (type) {
      filteredApprovals = filteredApprovals.filter(approval => approval.type === type);
    }
    
    if (employeeId) {
      filteredApprovals = filteredApprovals.filter(approval => approval.employeeId === employeeId);
    }

    return NextResponse.json({
      success: true,
      data: filteredApprovals,
      total: filteredApprovals.length
    });

  } catch (error) {
    console.error('申請一覧取得エラー:', error);
    return NextResponse.json(
      { error: '申請一覧の取得中にエラーが発生しました' },
      { status: 500 }
    );
  }
}

// 申請登録
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { companyId, employeeId, type, title, content, urgency } = body;

    if (!companyId || !employeeId || !type || !title || !content) {
      return NextResponse.json(
        { error: '企業ID、従業員ID、申請種別、タイトル、内容は必須です' },
        { status: 400 }
      );
    }

    // 申請種別のバリデーション
    if (!['timeCorrection', 'leaveRequest'].includes(type)) {
      return NextResponse.json(
        { error: '申請種別はtimeCorrectionまたはleaveRequestである必要があります' },
        { status: 400 }
      );
    }

    // 緊急度のバリデーション
    if (!['low', 'normal', 'urgent'].includes(urgency)) {
      return NextResponse.json(
        { error: '緊急度はlow、normal、urgentのいずれかである必要があります' },
        { status: 400 }
      );
    }

    // 新しい申請を作成
    const newApproval: ApprovalRequest = {
      id: generateApprovalId(),
      employeeId,
      employeeName: '田中太郎', // 後でDBから取得
      type,
      title,
      content,
      requestDate: new Date().toISOString().split('T')[0],
      urgency: urgency || 'normal',
      status: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // ここでDBに保存、現在はレスポンスのみ
    return NextResponse.json({
      success: true,
      message: '申請が登録されました',
      data: newApproval
    }, { status: 201 });

  } catch (error) {
    console.error('申請登録エラー:', error);
    return NextResponse.json(
      { error: '申請登録中にエラーが発生しました' },
      { status: 500 }
    );
  }
}

// 申請承認・否認処理
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { companyId, approvalId, action, reason, processedBy } = body;

    if (!companyId || !approvalId || !action) {
      return NextResponse.json(
        { error: '企業ID、申請ID、処理内容は必須です' },
        { status: 400 }
      );
    }

    // 処理内容のバリデーション
    if (!['approve', 'reject'].includes(action)) {
      return NextResponse.json(
        { error: '処理内容はapproveまたはrejectである必要があります' },
        { status: 400 }
      );
    }

    // 承認・否認処理
    const status = action === 'approve' ? 'approved' : 'rejected';
    const processedApproval = {
      id: approvalId,
      status,
      reason: reason || '',
      processedAt: new Date().toISOString(),
      processedBy: processedBy || '管理者',
      updatedAt: new Date().toISOString()
    };

    // ここでDBに保存、現在はレスポンスのみ
    return NextResponse.json({
      success: true,
      message: `申請が${action === 'approve' ? '承認' : '否認'}されました`,
      data: processedApproval
    });

  } catch (error) {
    console.error('申請処理エラー:', error);
    return NextResponse.json(
      { error: '申請処理中にエラーが発生しました' },
      { status: 500 }
    );
  }
}

// 一括承認・否認処理
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { companyId, approvalIds, action, reason, processedBy } = body;

    if (!companyId || !approvalIds || !Array.isArray(approvalIds) || !action) {
      return NextResponse.json(
        { error: '企業ID、申請ID配列、処理内容は必須です' },
        { status: 400 }
      );
    }

    // 処理内容のバリデーション
    if (!['approve', 'reject'].includes(action)) {
      return NextResponse.json(
        { error: '処理内容はapproveまたはrejectである必要があります' },
        { status: 400 }
      );
    }

    // 一括処理
    const status = action === 'approve' ? 'approved' : 'rejected';
    const processedApprovals = approvalIds.map(approvalId => ({
      id: approvalId,
      status,
      reason: reason || '',
      processedAt: new Date().toISOString(),
      processedBy: processedBy || '管理者',
      updatedAt: new Date().toISOString()
    }));

    // ここでDBに保存、現在はレスポンスのみ
    return NextResponse.json({
      success: true,
      message: `${approvalIds.length}件の申請が${action === 'approve' ? '承認' : '否認'}されました`,
      data: processedApprovals
    });

  } catch (error) {
    console.error('一括申請処理エラー:', error);
    return NextResponse.json(
      { error: '一括申請処理中にエラーが発生しました' },
      { status: 500 }
    );
  }
}

// 申請削除
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get('companyId');
    const approvalId = searchParams.get('approvalId');

    if (!companyId || !approvalId) {
      return NextResponse.json(
        { error: '企業IDと申請IDが必要です' },
        { status: 400 }
      );
    }

    // 削除処理（現在はレスポンスのみ）
    return NextResponse.json({
      success: true,
      message: '申請が削除されました',
      data: { approvalId }
    });

  } catch (error) {
    console.error('申請削除エラー:', error);
    return NextResponse.json(
      { error: '申請削除中にエラーが発生しました' },
      { status: 500 }
    );
  }
}

// 申請IDを生成
function generateApprovalId(): string {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 1000);
  return `AP${timestamp}${random}`;
}
