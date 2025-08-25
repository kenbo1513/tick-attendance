# システム管理者向け 運用・保守マニュアル

## 概要

このマニュアルは、Tick勤怠管理システムの運用・保守を担当するシステム管理者向けの技術的な手順書です。

## システム構成

### 1. 技術スタック

- **フロントエンド**: Next.js 14 (App Router)
- **言語**: TypeScript
- **スタイリング**: Tailwind CSS
- **データ管理**: localStorage (クライアントサイド)
- **認証**: カスタム認証システム
- **アイコン**: Lucide React

### 2. アーキテクチャ

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   共有端末      │    │   管理者端末     │    │   システム      │
│   (ブラウザ)    │◄──►│   (ブラウザ)     │◄──►│   (localStorage)│
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### 3. ファイル構造

```
tick-attendance/
├── app/                    # Next.js App Router
│   ├── admin/             # 管理者関連ページ
│   │   ├── page.tsx       # 管理者ログイン
│   │   └── dashboard/     # 管理者ダッシュボード
│   ├── lib/               # ユーティリティ関数
│   │   └── localStorage.ts # データ永続化
│   ├── globals.css        # グローバルスタイル
│   ├── layout.tsx         # ルートレイアウト
│   ├── page.tsx           # メインページ
│   ├── error.tsx          # エラーページ
│   ├── loading.tsx        # ローディングページ
│   └── not-found.tsx      # 404ページ
├── prisma/                # データベーススキーマ
├── public/                # 静的ファイル
├── docs/                  # ドキュメント
├── package.json           # 依存関係
└── README.md              # プロジェクト概要
```

## 開発環境の管理

### 1. 環境構築

#### 前提条件
- Node.js 18.0.0以上
- npm または yarn
- Git

#### セットアップ手順
```bash
# リポジトリのクローン
git clone <repository-url>
cd tick-attendance

# 依存関係のインストール
npm install

# 開発サーバーの起動
npm run dev
```

### 2. 開発コマンド

```bash
# 開発サーバー起動
npm run dev

# ビルド
npm run build

# 本番環境での起動
npm start

# リンター実行
npm run lint

# 型チェック
npm run type-check
```

### 3. 環境変数

#### 開発環境
```env
NODE_ENV=development
NEXT_PUBLIC_APP_NAME=Tick
NEXT_PUBLIC_APP_VERSION=1.0.0
```

#### 本番環境
```env
NODE_ENV=production
NEXT_PUBLIC_APP_NAME=Tick
NEXT_PUBLIC_APP_VERSION=1.0.0
```

## データ管理

### 1. localStorageの構造

#### 社員データ
```typescript
interface Employee {
  id: string;
  name: string;
  department: string;
  position: string;
  hourlyWage: number;
  monthlySalary: number;
  isAdmin: boolean;
  isActive: boolean;
  hireDate: string;
}
```

#### 勤怠データ
```typescript
interface AttendanceRecord {
  id: string;
  employeeId: string;
  employeeName: string;
  date: string;
  clockIn: string;
  clockOut: string;
  breakStart: string;
  breakEnd: string;
  location: string;
  ipAddress: string;
  deviceInfo: string;
}
```

### 2. データのバックアップ

#### 手動バックアップ
1. ブラウザの開発者ツール（F12）を開く
2. Applicationタブ → Local Storage → 該当ドメイン
3. データをJSON形式でエクスポート

#### 自動バックアップ（推奨）
```javascript
// 定期的なバックアップスクリプト
setInterval(() => {
  const data = {
    employees: localStorage.getItem('tick_employees'),
    attendance: localStorage.getItem('tick_attendance'),
    admin: localStorage.getItem('tick_admin'),
    timestamp: new Date().toISOString()
  };
  
  // ファイルに保存またはAPIに送信
  console.log('Backup:', data);
}, 24 * 60 * 60 * 1000); // 24時間ごと
```

### 3. データの復旧

#### 手動復旧
1. バックアップファイルを読み込み
2. localStorageに直接設定
3. ページをリロード

#### プログラムによる復旧
```javascript
// 復旧スクリプト
function restoreData(backupData) {
  try {
    if (backupData.employees) {
      localStorage.setItem('tick_employees', backupData.employees);
    }
    if (backupData.attendance) {
      localStorage.setItem('tick_attendance', backupData.attendance);
    }
    if (backupData.admin) {
      localStorage.setItem('tick_admin', backupData.admin);
    }
    console.log('Data restored successfully');
  } catch (error) {
    console.error('Restore failed:', error);
  }
}
```

## セキュリティ管理

### 1. 認証システム

#### 現在の実装
- 管理者ID: `admin`
- パスワード: `password`
- ハードコードされた認証情報

#### セキュリティ強化の推奨事項
1. **環境変数による認証情報管理**
```env
ADMIN_USERNAME=admin
ADMIN_PASSWORD=secure_password_hash
```

2. **パスワードハッシュ化**
```typescript
import bcrypt from 'bcrypt';

const hashedPassword = await bcrypt.hash(password, 10);
const isValid = await bcrypt.compare(inputPassword, hashedPassword);
```

3. **セッション管理**
```typescript
// JWTトークンの実装
import jwt from 'jsonwebtoken';

const token = jwt.sign({ userId: adminId }, process.env.JWT_SECRET);
```

### 2. アクセス制御

#### 推奨される実装
```typescript
// ミドルウェアによる認証チェック
export function withAuth(handler: NextApiHandler) {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded;
      return handler(req, res);
    } catch (error) {
      return res.status(401).json({ error: 'Invalid token' });
    }
  };
}
```

### 3. データ暗号化

#### localStorageデータの暗号化
```typescript
import CryptoJS from 'crypto-js';

const SECRET_KEY = process.env.ENCRYPTION_KEY || 'default-key';

export function encryptData(data: any): string {
  return CryptoJS.AES.encrypt(JSON.stringify(data), SECRET_KEY).toString();
}

export function decryptData(encryptedData: string): any {
  const bytes = CryptoJS.AES.decrypt(encryptedData, SECRET_KEY);
  return JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
}
```

## パフォーマンス最適化

### 1. コード分割

#### 動的インポート
```typescript
// 管理者ダッシュボードの遅延読み込み
const AdminDashboard = dynamic(() => import('./AdminDashboard'), {
  loading: () => <LoadingSpinner />,
  ssr: false
});
```

### 2. キャッシュ戦略

#### ブラウザキャッシュ
```typescript
// データのキャッシュ管理
const CACHE_DURATION = 5 * 60 * 1000; // 5分

function getCachedData(key: string) {
  const cached = localStorage.getItem(`cache_${key}`);
  if (cached) {
    const { data, timestamp } = JSON.parse(cached);
    if (Date.now() - timestamp < CACHE_DURATION) {
      return data;
    }
  }
  return null;
}
```

### 3. バンドルサイズの最適化

#### 依存関係の最適化
```json
// package.json
{
  "dependencies": {
    "lucide-react": "^0.263.1"
  },
  "devDependencies": {
    "@types/node": "^20.0.0",
    "typescript": "^5.0.0"
  }
}
```

## 監視・ログ

### 1. エラーログの実装

#### クライアントサイドエラーログ
```typescript
// エラーログの収集
window.addEventListener('error', (event) => {
  const errorLog = {
    message: event.message,
    filename: event.filename,
    lineno: event.lineno,
    colno: event.colno,
    error: event.error?.stack,
    timestamp: new Date().toISOString(),
    userAgent: navigator.userAgent
  };
  
  // エラーログをサーバーに送信
  sendErrorLog(errorLog);
});
```

#### パフォーマンスログ
```typescript
// パフォーマンスメトリクスの収集
function collectPerformanceMetrics() {
  const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
  
  const metrics = {
    pageLoadTime: navigation.loadEventEnd - navigation.loadEventStart,
    domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
    firstPaint: performance.getEntriesByName('first-paint')[0]?.startTime,
    firstContentfulPaint: performance.getEntriesByName('first-contentful-paint')[0]?.startTime,
    timestamp: new Date().toISOString()
  };
  
  // メトリクスをサーバーに送信
  sendPerformanceMetrics(metrics);
}
```

### 2. ヘルスチェック

#### システム状態の監視
```typescript
// ヘルスチェック関数
function healthCheck() {
  const checks = {
    localStorage: typeof localStorage !== 'undefined',
    dataIntegrity: checkDataIntegrity(),
    performance: checkPerformance(),
    timestamp: new Date().toISOString()
  };
  
  return checks;
}

function checkDataIntegrity() {
  try {
    const employees = JSON.parse(localStorage.getItem('tick_employees') || '[]');
    const attendance = JSON.parse(localStorage.getItem('tick_attendance') || '[]');
    
    return {
      employeesCount: employees.length,
      attendanceCount: attendance.length,
      isValid: Array.isArray(employees) && Array.isArray(attendance)
    };
  } catch (error) {
    return { error: error.message };
  }
}
```

## デプロイメント

### 1. Vercelでのデプロイ

#### デプロイ手順
1. **Vercelアカウントの設定**
   - GitHubリポジトリと連携
   - 環境変数の設定

2. **ビルド設定**
```json
// vercel.json
{
  "buildCommand": "npm run build",
  "outputDirectory": ".next",
  "framework": "nextjs",
  "installCommand": "npm install"
}
```

3. **環境変数の設定**
```env
NEXT_PUBLIC_APP_NAME=Tick
NEXT_PUBLIC_APP_VERSION=1.0.0
ADMIN_USERNAME=admin
ADMIN_PASSWORD=secure_password
JWT_SECRET=your_jwt_secret
ENCRYPTION_KEY=your_encryption_key
```

### 2. 本番環境での動作確認

#### チェックリスト
- [ ] 共有端末での打刻機能
- [ ] 管理者ログイン・ダッシュボード
- [ ] CSVエクスポート機能
- [ ] レスポンシブデザイン
- [ ] エラーハンドリング
- [ ] パフォーマンス

### 3. ロールバック手順

#### 緊急時対応
1. **Vercelダッシュボードでロールバック**
   - 前のバージョンに戻す
   - 問題の特定と修正

2. **データの復旧**
   - バックアップからの復旧
   - ユーザーへの影響最小化

## メンテナンス

### 1. 定期メンテナンス

#### 月次タスク
- データの整合性チェック
- パフォーマンスメトリクスの確認
- セキュリティアップデートの適用

#### 四半期タスク
- 依存関係の更新
- コードの最適化
- ドキュメントの更新

### 2. アップデート手順

#### 依存関係の更新
```bash
# セキュリティアップデート
npm audit fix

# 依存関係の更新
npm update

# メジャーバージョンの更新
npm install package@latest
```

#### データベーススキーマの更新
```bash
# Prismaスキーマの更新
npx prisma migrate dev

# 本番環境での適用
npx prisma migrate deploy
```

## トラブルシューティング

### 1. よくある問題

#### ビルドエラー
```bash
# 解決方法
rm -rf .next node_modules
npm install
npm run build
```

#### パフォーマンス問題
1. バンドルサイズの確認
2. 不要な依存関係の削除
3. コード分割の実装

#### セキュリティ問題
1. 依存関係の脆弱性チェック
2. 認証システムの強化
3. データ暗号化の実装

### 2. 緊急時対応

#### システムダウン時
1. 状況の迅速な把握
2. 影響範囲の特定
3. 一時的な回避策の実装
4. 根本原因の特定と修正

#### データ損失時
1. バックアップからの復旧
2. データ整合性の確認
3. 再発防止策の実装

## サポート・連絡先

### 1. 技術サポート

- **開発チーム**: システム関連の技術的な質問
- **運用チーム**: 日常的な運用に関する質問
- **緊急時**: システム障害やセキュリティインシデント

### 2. 連絡方法

- **通常時**: 社内チャットツール
- **緊急時**: 電話または緊急連絡先
- **定期報告**: 月次レポートの提出

## 更新履歴

- v1.0.0: 初回作成
  - 基本的な運用・保守手順
  - セキュリティ強化の推奨事項
  - パフォーマンス最適化の指針

