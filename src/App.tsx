import React, { useState, useEffect } from 'react';
import { FileText, Plus, Upload, Download, Code2, Database, Terminal, Settings, Boxes, Layout, GitBranch, Calendar } from 'lucide-react';
import { useAuthStore } from './store/authStore';
import { useSnippetStore } from './store';
import { AuthForm } from './components/AuthForm';
import { SnippetList } from './components/SnippetList';
import { NewSnippetModal } from './components/NewSnippetModal';
import { ImportSnippetsModal } from './components/ImportSnippetsModal';
import { CategoryFilter } from './components/CategoryFilter';
import { AdvancedSearch, SearchParams } from './components/AdvancedSearch';
import { OnCallPlanner } from './components/OnCallPlanner/OnCallPlanner';
import { utils, writeFile } from 'xlsx';
import toast from 'react-hot-toast';

const AppCard = ({ icon: Icon, title, description, onClick, isAvailable = false }) => (
  <div 
    className={`relative group rounded-xl shadow-sm border border-gray-200 p-6 transition-all duration-200 ${
      isAvailable 
        ? 'hover:shadow-lg hover:border-blue-300 cursor-pointer bg-white'
        : 'bg-gray-50 cursor-not-allowed'
    }`}
    onClick={isAvailable ? onClick : () => toast.error('Coming soon!')}
  >
    <div className="flex items-center space-x-4">
      <div className={`p-3 rounded-lg ${isAvailable ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-400'}`}>
        <Icon className="h-6 w-6" />
      </div>
      <div>
        <h3 className={`text-lg font-semibold ${isAvailable ? 'text-gray-900' : 'text-gray-500'}`}>
          {title}
        </h3>
        <p className={`text-sm ${isAvailable ? 'text-gray-600' : 'text-gray-400'}`}>
          {description}
        </p>
      </div>
    </div>
    {!isAvailable && (
      <div className="absolute top-3 right-3">
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
          Coming Soon
        </span>
      </div>
    )}
  </div>
);

export default function App() {
  const { user, signOut } = useAuthStore();
  const [currentApp, setCurrentApp] = useState<string | null>(null);
  const { snippets, addSnippet, updateSnippet, deleteSnippet, loadUserSnippets } = useSnippetStore();
  const [searchParams, setSearchParams] = useState<SearchParams>({
    query: '',
    fields: {
      name: true,
      content: true,
      categories: true
    }
  });
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [isNewSnippetModalOpen, setIsNewSnippetModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [showCategoryFilter, setShowCategoryFilter] = useState(false);

  useEffect(() => {
    if (user) {
      loadUserSnippets(user.uid);
    }
  }, [user]);

  if (!user) {
    return <AuthForm onSuccess={() => {}} />;
  }

  if (currentApp === 'snippets') {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => setCurrentApp(null)}
                  className="text-gray-600 hover:text-gray-900"
                >
                  ← Back to Dashboard
                </button>
                <div className="flex items-center">
                  <FileText className="h-8 w-8 text-blue-600" />
                  <h1 className="ml-2 text-2xl font-bold text-gray-900">Snippet Manager</h1>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => setIsNewSnippetModalOpen(true)}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  New Snippet
                </button>
                <button
                  onClick={() => setIsImportModalOpen(true)}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Import
                </button>
                <button
                  onClick={handleExport}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </button>
                <button
                  onClick={signOut}
                  className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
                >
                  Sign out
                </button>
              </div>
            </div>

            {/* Search and Filters */}
            <div className="mt-4 space-y-4">
              <AdvancedSearch onSearch={setSearchParams} />
              
              <div className="flex items-center justify-end">
                <div className="relative">
                  <button
                    onClick={() => setShowCategoryFilter(!showCategoryFilter)}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                  >
                    Categories ({selectedCategories.length})
                  </button>
                  {showCategoryFilter && (
                    <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg z-10">
                      <CategoryFilter
                        categories={Array.from(new Set(snippets.flatMap(s => s.categories || [])))}
                        selectedCategories={selectedCategories}
                        onSelectCategories={setSelectedCategories}
                        onClose={() => setShowCategoryFilter(false)}
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <SnippetList
            snippets={snippets}
            onDelete={deleteSnippet}
            onUpdate={updateSnippet}
          />
        </main>

        {/* Modals */}
        <NewSnippetModal
          isOpen={isNewSnippetModalOpen}
          onClose={() => setIsNewSnippetModalOpen(false)}
          onSubmit={addSnippet}
        />

        <ImportSnippetsModal
          isOpen={isImportModalOpen}
          onClose={() => setIsImportModalOpen(false)}
          onImport={async (snippets) => {
            try {
              await useSnippetStore.getState().addBatchSnippets(snippets);
              toast.success(`Successfully imported ${snippets.length} snippets`);
            } catch (error) {
              console.error('Error importing snippets:', error);
              toast.error('Failed to import snippets');
            }
          }}
        />
      </div>
    );
  }

  if (currentApp === 'oncall') {
    return <OnCallPlanner />;
  }

  // Dashboard View
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Boxes className="h-8 w-8 text-blue-600" />
              <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">Welcome, {user.email}</span>
              <button
                onClick={signOut}
                className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
              >
                Sign out
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AppCard
            icon={Code2}
            title="Snippet Manager"
            description="Organize and manage your code snippets efficiently"
            onClick={() => setCurrentApp('snippets')}
            isAvailable={true}
          />
          <AppCard
            icon={Calendar}
            title="On-Call Planner"
            description="Plan and manage on-call schedules"
            onClick={() => setCurrentApp('oncall')}
            isAvailable={true}
          />
          <AppCard
            icon={Database}
            title="Database Explorer"
            description="Browse and manage your databases with ease"
          />
          <AppCard
            icon={Terminal}
            title="CLI Tools"
            description="Command-line utilities and scripts"
          />
          <AppCard
            icon={Layout}
            title="UI Components"
            description="Reusable UI component library"
          />
          <AppCard
            icon={Settings}
            title="Settings"
            description="Configure your development environment"
          />
        </div>
      </main>
    </div>
  );
}