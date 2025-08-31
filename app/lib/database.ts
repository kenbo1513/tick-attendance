// データベース接続設定
// Vercel Postgresまたは外部DBサービスに対応

import { Pool } from 'pg';

// 環境変数からデータベース設定を取得
const {
  POSTGRES_URL,
  POSTGRES_HOST,
  POSTGRES_DATABASE,
  POSTGRES_USERNAME,
  POSTGRES_PASSWORD,
  POSTGRES_PORT
} = process.env;

// データベース接続プール
let pool: Pool | null = null;

// データベース接続を初期化
export function initializeDatabase() {
  try {
    if (POSTGRES_URL) {
      // Vercel Postgresの場合
      pool = new Pool({
        connectionString: POSTGRES_URL,
        ssl: {
          rejectUnauthorized: false
        }
      });
    } else if (POSTGRES_HOST && POSTGRES_DATABASE && POSTGRES_USERNAME && POSTGRES_PASSWORD) {
      // 外部PostgreSQLの場合
      pool = new Pool({
        host: POSTGRES_HOST,
        database: POSTGRES_DATABASE,
        user: POSTGRES_USERNAME,
        password: POSTGRES_PASSWORD,
        port: parseInt(POSTGRES_PORT || '5432'),
        ssl: process.env.NODE_ENV === 'production' ? {
          rejectUnauthorized: false
        } : false
      });
    } else {
      console.warn('データベース設定が不完全です。localStorageを使用します。');
      return null;
    }

    // 接続テスト
    pool.query('SELECT NOW()', (err, result) => {
      if (err) {
        console.error('データベース接続エラー:', err);
        pool = null;
      } else {
        console.log('データベース接続成功:', result.rows[0]);
      }
    });

    return pool;
  } catch (error) {
    console.error('データベース初期化エラー:', error);
    return null;
  }
}

// データベース接続プールを取得
export function getDatabasePool(): Pool | null {
  if (!pool) {
    return initializeDatabase();
  }
  return pool;
}

// データベース接続を閉じる
export async function closeDatabase() {
  if (pool) {
    await pool.end();
    pool = null;
  }
}

// テーブル作成SQL
export const CREATE_TABLES_SQL = `
-- 企業テーブル
CREATE TABLE IF NOT EXISTS companies (
  id VARCHAR(20) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  admin_id VARCHAR(100) NOT NULL,
  admin_password VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 従業員テーブル
CREATE TABLE IF NOT EXISTS employees (
  id VARCHAR(10) PRIMARY KEY,
  company_id VARCHAR(20) NOT NULL,
  name VARCHAR(255) NOT NULL,
  department VARCHAR(100),
  position VARCHAR(100),
  hourly_wage DECIMAL(10,2) DEFAULT 0,
  monthly_salary DECIMAL(12,2) DEFAULT 0,
  transportation_allowance DECIMAL(10,2) DEFAULT 0,
  meal_allowance DECIMAL(10,2) DEFAULT 0,
  overtime_rate DECIMAL(3,2) DEFAULT 1.0,
  night_shift_rate DECIMAL(3,2) DEFAULT 1.0,
  holiday_rate DECIMAL(3,2) DEFAULT 1.0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (company_id) REFERENCES companies(id)
);

-- 勤務記録テーブル
CREATE TABLE IF NOT EXISTS time_records (
  id VARCHAR(50) PRIMARY KEY,
  company_id VARCHAR(20) NOT NULL,
  employee_id VARCHAR(10) NOT NULL,
  type VARCHAR(20) NOT NULL CHECK (type IN ('clockIn', 'clockOut')),
  time TIME NOT NULL,
  date DATE NOT NULL,
  location VARCHAR(255),
  ip_address VARCHAR(45),
  device_info TEXT,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (company_id) REFERENCES companies(id),
  FOREIGN KEY (employee_id) REFERENCES employees(id)
);

-- 申請テーブル
CREATE TABLE IF NOT EXISTS approvals (
  id VARCHAR(50) PRIMARY KEY,
  company_id VARCHAR(20) NOT NULL,
  employee_id VARCHAR(10) NOT NULL,
  type VARCHAR(20) NOT NULL CHECK (type IN ('timeCorrection', 'leaveRequest')),
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  request_date DATE NOT NULL,
  urgency VARCHAR(20) DEFAULT 'normal' CHECK (urgency IN ('low', 'normal', 'urgent')),
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  reason TEXT,
  processed_at TIMESTAMP,
  processed_by VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (company_id) REFERENCES companies(id),
  FOREIGN KEY (employee_id) REFERENCES employees(id)
);

-- インデックス作成
CREATE INDEX IF NOT EXISTS idx_employees_company_id ON employees(company_id);
CREATE INDEX IF NOT EXISTS idx_time_records_company_id ON time_records(company_id);
CREATE INDEX IF NOT EXISTS idx_time_records_employee_id ON time_records(employee_id);
CREATE INDEX IF NOT EXISTS idx_time_records_date ON time_records(date);
CREATE INDEX IF NOT EXISTS idx_approvals_company_id ON approvals(company_id);
CREATE INDEX IF NOT EXISTS idx_approvals_employee_id ON approvals(employee_id);
CREATE INDEX IF NOT EXISTS idx_approvals_status ON approvals(status);
`;

// テーブルを作成
export async function createTables() {
  const db = getDatabasePool();
  if (!db) {
    console.warn('データベース接続が利用できません。テーブル作成をスキップします。');
    return false;
  }

  try {
    await db.query(CREATE_TABLES_SQL);
    console.log('データベーステーブルが作成されました。');
    return true;
  } catch (error) {
    console.error('テーブル作成エラー:', error);
    return false;
  }
}

// データベース接続状態を確認
export function isDatabaseConnected(): boolean {
  return pool !== null;
}
