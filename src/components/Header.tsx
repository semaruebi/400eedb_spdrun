import Link from 'next/link'

export function Header() {
    return (
        <header className="fixed top-0 left-0 right-0 z-50 glass border-b border-white/10">
            <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                <Link href="/" className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-600">
                    原神戦績
                </Link>

                <nav className="hidden md:flex items-center gap-8">
                    <Link href="/records" className="text-slate-300 hover:text-white transition-colors">戦績一覧</Link>
                    <Link href="/characters" className="text-slate-300 hover:text-white transition-colors">キャラクター</Link>
                </nav>

                <button className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-sm font-medium transition-colors border border-white/5">
                    ログイン
                </button>
            </div>
        </header>
    )
}
