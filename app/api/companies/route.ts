import { NextRequest, NextResponse } from 'next/server';

// 企業データの型定義
interface Company {
  id: string;
  name: string;
  adminId: string;
  adminPassword: string;
  createdAt: string;
  updatedAt: string;
}

// 企業情報取得
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
    const company: Company = {
      id: companyId,
      name: '株式会社サンプル',
      adminId: 'admin001',
      adminPassword: '********',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    return NextResponse.json({
      success: true,
      data: company
    });

  } catch (error) {
    console.error('企業情報取得エラー:', error);
    return NextResponse.json(
      { error: '企業情報の取得中にエラーが発生しました' },
      { status: 500 }
    );
  }
}

// 企業登録
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { companyName, adminId, adminPassword } = body;

    if (!companyName || !adminId || !adminPassword) {
      return NextResponse.json(
        { error: '会社名、管理者ID、パスワードは必須です' },
        { status: 400 }
      );
    }

    // パスワードのバリデーション
    if (adminPassword.length < 6) {
      return NextResponse.json(
        { error: 'パスワードは6文字以上である必要があります' },
        { status: 400 }
      );
    }

    // 企業IDの自動生成（K-から始まる7桁の数字）
    const companyId = generateCompanyId();

    // 新しい企業を作成
    const newCompany: Company = {
      id: companyId,
      name: companyName,
      adminId,
      adminPassword,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // ここでDBに保存、現在はレスポンスのみ
    return NextResponse.json({
      success: true,
      message: '企業が登録されました',
      data: newCompany
    }, { status: 201 });

  } catch (error) {
    console.error('企業登録エラー:', error);
    return NextResponse.json(
      { error: '企業登録中にエラーが発生しました' },
      { status: 500 }
    );
  }
}

// 企業情報更新
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { companyId, ...updateData } = body;

    if (!companyId) {
      return NextResponse.json(
        { error: '企業IDが必要です' },
        { status: 400 }
      );
    }

    // 更新処理（現在はレスポンスのみ）
    const updatedCompany = {
      id: companyId,
      ...updateData,
      updatedAt: new Date().toISOString()
    };

    return NextResponse.json({
      success: true,
      message: '企業情報が更新されました',
      data: updatedCompany
    });

  } catch (error) {
    console.error('企業情報更新エラー:', error);
    return NextResponse.json(
      { error: '企業情報更新中にエラーが発生しました' },
      { status: 500 }
    );
  }
}

// 企業削除
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get('companyId');

    if (!companyId) {
      return NextResponse.json(
        { error: '企業IDが必要です' },
        { status: 400 }
      );
    }

    // 削除処理（現在はレスポンスのみ）
    return NextResponse.json({
      success: true,
      message: '企業が削除されました',
      data: { companyId }
    });

  } catch (error) {
    console.error('企業削除エラー:', error);
    return NextResponse.json(
      { error: '企業削除中にエラーが発生しました' },
      { status: 500 }
    );
  }
}

// 企業IDを生成（K-から始まる7桁の数字）
function generateCompanyId(): string {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 1000000);
  const companyNumber = String(timestamp % 10000000 + random % 1000000).padStart(7, '0');
  return `K-${companyNumber}`;
}
