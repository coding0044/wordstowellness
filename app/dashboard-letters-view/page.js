'use client';
import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCurrentUser } from '@/hooks/useAuth';
import { useTopics, useLettersByTopic } from '@/hooks/useContent';
import Link from 'next/link';

// Navigation Component
function Navbar({ user }) {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <nav className="flex items-center justify-between px-6 py-4 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
      <Link href="/dashboard" className="flex items-center gap-2">
        <svg className="w-6 h-6 text-sky-500" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
        </svg>
        <span className="text-xl font-semibold text-gray-800">Wordstowellness</span>
      </Link>

      <div className="hidden md:flex items-center gap-1">
        <Link href="/dashboard" className="px-4 py-2 rounded-full text-gray-600 hover:bg-gray-100 font-medium text-sm transition-colors">Dashboard</Link>
        <Link href="/dashboard-letters" className="px-4 py-2 rounded-full bg-sky-100 text-sky-700 font-medium text-sm">Browse letters</Link>
        <Link href="/search-feelings" className="px-4 py-2 rounded-full text-gray-600 hover:bg-gray-100 font-medium text-sm transition-colors">Search by feelings</Link>
        <Link href="/improve-message" className="px-4 py-2 rounded-full text-gray-600 hover:bg-gray-100 font-medium text-sm transition-colors">Improve my message</Link>
        <Link href="/pricing" className="px-4 py-2 rounded-full text-gray-600 hover:bg-gray-100 font-medium text-sm transition-colors">Pricing</Link>
      </div>

      <div className="flex items-center gap-3">
        <span className="px-3 py-1.5 bg-sky-50 text-sky-600 rounded-full text-sm font-medium">Free plan</span>
        <button onClick={handleLogout} className="flex items-center gap-1 px-3 py-1.5 text-gray-600 hover:text-gray-800 text-sm font-medium transition-colors">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
          </svg>
          Log out
        </button>
      </div>
    </nav>
  );
}

// Letter Card Component
function LetterCard({ letter }) {
  return (
    <div className="group block bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md hover:border-orange-200 transition-all duration-200">
      <div className="flex items-start justify-between mb-4">
        <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-orange-400 to-amber-500 flex items-center justify-center text-white text-2xl shadow-md">
          📄
        </div>
        <span className="px-2.5 py-1 bg-orange-50 text-orange-600 rounded-full text-xs font-semibold uppercase tracking-wide">Letter</span>
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-3 group-hover:text-orange-600 transition-colors line-clamp-2">{letter.title}</h3>
      {letter.content && (
        <p className="text-sm text-gray-600 mb-4 line-clamp-4 leading-relaxed">{letter.content}</p>
      )}
      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
        <span className="text-xs text-gray-500">{letter.createdAt ? new Date(letter.createdAt).toLocaleDateString() : ''}</span>
        <button className="flex items-center space-x-1 text-orange-600 font-semibold text-sm hover:translate-x-1 transition-transform">
          <span>Read More</span>
          <span>→</span>
        </button>
      </div>
    </div>
  );
}

// Main Letters View Content
function LettersViewContent() {
  const [isClient, setIsClient] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const topicId = searchParams.get('topic');
  const [searchQuery, setSearchQuery] = useState('');

  const { data: userData, isLoading: userLoading, error: userError } = useCurrentUser();
  const { data: topicsData } = useTopics();
  const { data: lettersData, isLoading: lettersLoading } = useLettersByTopic(topicId);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (userError) router.push('/login');
  }, [userError, router]);

  useEffect(() => {
    if (!topicId && isClient) {
      router.push('/dashboard-letters');
    }
  }, [topicId, isClient, router]);

  const topics = Array.isArray(topicsData) ? topicsData : [];
  const letters = Array.isArray(lettersData) ? lettersData : [];
  const currentTopic = topics.find(t => t._id === topicId);

  const filteredLetters = letters.filter(letter =>
    letter.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    letter.content?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!isClient || userLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-sky-50 to-teal-50 flex items-center justify-center">
        <div className="space-y-4">
          <div className="w-12 h-12 border-4 border-sky-200 border-t-sky-500 rounded-full animate-spin mx-auto"></div>
          <p className="text-gray-600 text-center">Loading...</p>
        </div>
      </div>
    );
  }

  if (!userData) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-sky-50 to-teal-50">
      <Navbar user={userData} />

      <main className="max-w-6xl mx-auto px-6 py-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 mb-4 text-sm text-gray-500">
          <Link href="/dashboard" className="hover:text-sky-600 transition-colors">Dashboard</Link>
          <span>/</span>
          <Link href="/dashboard-letters" className="hover:text-sky-600 transition-colors">Categories</Link>
          <span>/</span>
          <span className="text-gray-400">...</span>
          <span>/</span>
          <span className="text-gray-900 font-medium">{currentTopic?.name || 'Letters'}</span>
        </div>

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <button onClick={() => router.back()} className="flex items-center gap-1 text-gray-500 hover:text-gray-700 transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7"/>
              </svg>
              Back
            </button>
          </div>
          <div className="flex items-center gap-4 mb-2">
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-orange-400 to-amber-500 flex items-center justify-center text-white text-2xl shadow-md">
              📄
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{currentTopic?.name || 'Letters'}</h1>
              <p className="text-gray-600">{letters.length} letters available</p>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative mb-8">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
            </svg>
          </div>
          <input
            type="text"
            placeholder="Search letters..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="block w-full pl-12 pr-5 py-3.5 text-base border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition-all duration-200 bg-white"
          />
        </div>

        {/* Letters Grid */}
        {lettersLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="space-y-4">
              <div className="w-12 h-12 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin mx-auto"></div>
              <p className="text-gray-600 text-center">Loading letters...</p>
            </div>
          </div>
        ) : filteredLetters.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-24 h-24 mx-auto bg-gray-100 rounded-2xl flex items-center justify-center text-4xl mb-4">📄</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">{searchQuery ? 'No letters found' : 'No letters available'}</h3>
            <p className="text-gray-600">{searchQuery ? 'Try a different search term' : 'Letters will appear here once they\'re added.'}</p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredLetters.map((letter) => (
              <LetterCard key={letter._id} letter={letter} />
            ))}
          </div>
        )}

        <footer className="mt-16 text-center">
          <p className="text-sm text-gray-500">Wordstowellness - write with care.</p>
        </footer>
      </main>
    </div>
  );
}

export default function LettersViewPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-sky-50 to-teal-50 flex items-center justify-center">
        <div className="space-y-4">
          <div className="w-12 h-12 border-4 border-sky-200 border-t-sky-500 rounded-full animate-spin mx-auto"></div>
          <p className="text-gray-600 text-center">Loading...</p>
        </div>
      </div>
    }>
      <LettersViewContent />
    </Suspense>
  );
}
