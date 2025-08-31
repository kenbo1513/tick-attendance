import { NextRequest, NextResponse } from 'next/server';

// 認証用のAPIエンドポイント
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { companyId, adminId, password } = body;

    // 基本的なバリデーション
    if (!companyId || !adminId || !password) {
      return NextResponse.json(
        { error: '企業ID、管理者ID、パスワードは必須です' },
        { status: 400 }
      );
    }

    // 認証ロジック（現在はlocalStorageベース、後でDBに変更予定）
    // ここでは基本的な認証チェックのみ
    if (password.length < 6) {
      return NextResponse.json(
        { error: 'パスワードは6文字以上である必要があります' },
        { status: 401 }
      );
    }

    // 認証成功時のレスポンス
    const authData = {
      companyId,
      adminId,
      isAuthenticated: true,
      timestamp: new Date().toISOString()
    };

    return NextResponse.json({
      success: true,
      message: '認証が完了しました',
      data: authData
    });

  } catch (error) {
    console.error('認証エラー:', error);
    return NextResponse.json(
      { error: '認証処理中にエラーが発生しました' },
      { status: 500 }
    );
  }
}

// GETメソッド（認証状態確認用）
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get('companyId');
    const adminId = searchParams.get('adminId');

    if (!companyId || !adminId) {
      return NextResponse.json(
        { error: '企業IDと管理者IDが必要です' },
        { status: 400 }
      );
    }

    // 認証状態確認ロジック
    return NextResponse.json({
      success: true,
      isAuthenticated: true,
      companyId,
      adminId
    });

  } catch (error) {
    console.error('認証状態確認エラー:', error);
    return NextResponse.json(
      { error: '認証状態確認中にエラーが発生しました' },
      { status: 500 }
    );
  }
}
