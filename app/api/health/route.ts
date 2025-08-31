import { NextResponse } from 'next/server';
import { isDatabaseConnected } from '../../lib/database';

// ヘルスチェック用のAPIエンドポイント
export async function GET() {
  try {
    const dbStatus = isDatabaseConnected();
    
    return NextResponse.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      database: dbStatus ? 'connected' : 'disconnected',
      environment: process.env.NODE_ENV || 'development',
      version: '1.0.0'
    });
  } catch (error) {
    return NextResponse.json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
