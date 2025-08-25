import Link from 'next/link';
import { Home, Search } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 border border-white/20 max-w-md w-full text-center">
        <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Search className="w-8 h-8 text-yellow-600" />
        </div>
        
        <h1 className="text-2xl font-bold text-slate-800 mb-4">
          ページが見つかりません
        </h1>
        
        <p className="text-slate-600 mb-6">
          お探しのページは存在しないか、移動された可能性があります。
        </p>
        
        <Link
          href="/"
          className="inline-flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-xl transition-colors duration-200"
        >
          <Home className="w-5 h-5" />
          <span>ホームに戻る</span>
        </Link>
      </div>
    </div>
  );
}

