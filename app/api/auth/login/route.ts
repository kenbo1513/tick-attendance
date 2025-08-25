import { NextRequest, NextResponse } from 'next/server';

// 仮の企業データ（実際の運用ではデータベースから取得）
const COMPANIES = [
  {
    companyId: 'K-1234567',
    name: '株式会社サンプル',
    admins: [
      {
        adminId: 'admin1',
        password: 'password123',
        name: '管理者1'
      }
    ]
  },
  {
    companyId: 'K-2345678',
    name: '株式会社テスト',
    admins: [
      {
        adminId: 'admin2',
        password: 'password456',
        name: '管理者2'
      }
    ]
  }
];

export async function POST(request: NextRequest) {
  try {
    const { companyId, adminId, password } = await request.json();

    // 入力値の検証
    if (!companyId || !adminId || !password) {
      return NextResponse.json(
        { message: '企業ID、管理者ID、パスワードを入力してください' },
        { status: 400 }
      );
    }

    // 企業IDの形式チェック
    if (!/^K-\d{7}$/.test(companyId)) {
      return NextResponse.json(
        { message: '企業IDの形式が正しくありません（例: K-1234567）' },
        { status: 400 }
      );
    }

    // 企業と管理者の認証
    const company = COMPANIES.find(c => c.companyId === companyId);
    if (!company) {
      return NextResponse.json(
        { message: '企業IDが見つかりません' },
        { status: 401 }
      );
    }

    const admin = company.admins.find(a => a.adminId === adminId);
    if (!admin) {
      return NextResponse.json(
        { message: '管理者IDが見つかりません' },
        { status: 401 }
      );
    }

    if (admin.password !== password) {
      return NextResponse.json(
        { message: 'パスワードが正しくありません' },
        { status: 401 }
      );
    }

    // 認証成功
    const token = btoa(`${companyId}:${adminId}:${Date.now()}`); // 簡易的なトークン生成

    return NextResponse.json({
      success: true,
      token,
      company: {
        id: company.companyId,
        name: company.name
      },
      admin: {
        id: admin.adminId,
        name: admin.name
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { message: 'サーバーエラーが発生しました' },
      { status: 500 }
    );
  }
}
