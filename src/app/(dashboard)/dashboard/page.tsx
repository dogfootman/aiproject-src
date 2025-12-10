export default function DashboardPage() {
  const stats = [
    { label: '총 사용자', value: '2', change: '+0%' },
    { label: '총 게시글', value: '0', change: '+0%' },
    { label: '총 메뉴', value: '4', change: '+0%' },
    { label: '알림', value: '1', change: '+100%' },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-zinc-900 dark:text-white mb-6">
        대시보드
      </h1>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="bg-white dark:bg-zinc-800 rounded-lg shadow p-6"
          >
            <p className="text-sm text-zinc-500 dark:text-zinc-400">{stat.label}</p>
            <p className="text-3xl font-bold text-zinc-900 dark:text-white mt-2">
              {stat.value}
            </p>
            <p className="text-sm text-green-600 mt-1">{stat.change}</p>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="bg-white dark:bg-zinc-800 rounded-lg shadow p-6 mb-8">
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-white mb-4">
          빠른 작업
        </h2>
        <div className="flex flex-wrap gap-4">
          <a
            href="/dashboard/users"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            사용자 추가
          </a>
          <a
            href="/dashboard/boards"
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            게시판 생성
          </a>
          <a
            href="/dashboard/menus"
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            메뉴 관리
          </a>
        </div>
      </div>

      {/* System Status */}
      <div className="bg-white dark:bg-zinc-800 rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-white mb-4">
          시스템 상태
        </h2>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-zinc-600 dark:text-zinc-400">환경</span>
            <span className="px-2 py-1 bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-200 rounded text-sm">
              PoC
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-zinc-600 dark:text-zinc-400">데이터베이스</span>
            <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-200 rounded text-sm">
              File (Mock)
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-zinc-600 dark:text-zinc-400">서버 상태</span>
            <span className="px-2 py-1 bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-200 rounded text-sm">
              정상
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
