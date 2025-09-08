import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      {/* Hero Section */}
      <section className="container mx-auto px-6 py-16">
        <div className="text-center">
          <h1 className="text-5xl font-bold text-gray-900 dark:text-white mb-6">
            Welcome to <span className="text-blue-600">SeekSphere</span>
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto">
            Experience the future of property search with intelligent, semantic search capabilities 
            that understand what you're really looking for.
          </p>
          
          {/* Navigation Links */}
          <div className="flex gap-6 justify-center flex-col sm:flex-row">
            <Link
              href="/search"
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-lg transition-colors duration-200 shadow-lg"
            >
              Try Traditional Search
            </Link>
            <Link
              href="/seeksphere"
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-8 rounded-lg transition-colors duration-200 shadow-lg"
            >
              Experience SeekSphere Search
            </Link>
          </div>
        </div>
      </section>

      {/* What is SeekSphere Section */}
      <section className="bg-white dark:bg-gray-800 py-16">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8 text-center">
              What is SeekSphere?
            </h2>
            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Intelligent Search Technology
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  SeekSphere is an advanced search package that goes beyond traditional keyword matching. 
                  It uses semantic understanding to interpret your search intent and deliver more relevant results.
                </p>
              </div>
              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Real Estate Focused
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Built specifically for property search, SeekSphere understands real estate terminology, 
                  location relationships, and property characteristics to provide superior search experiences.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Comparison Section */}
      <section className="py-16">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-12 text-center">
            Traditional vs SeekSphere Search
          </h2>
          
          <div className="grid lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
            {/* Traditional Search */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
              <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6 text-center">
                Traditional Search
              </h3>
              <ul className="space-y-4">
                <li className="flex items-start">
                  <span className="text-red-500 mr-3">•</span>
                  <span className="text-gray-600 dark:text-gray-300">
                    Exact keyword matching only
                  </span>
                </li>
                <li className="flex items-start">
                  <span className="text-red-500 mr-3">•</span>
                  <span className="text-gray-600 dark:text-gray-300">
                    Multiple filter steps required
                  </span>
                </li>
                <li className="flex items-start">
                  <span className="text-red-500 mr-3">•</span>
                  <span className="text-gray-600 dark:text-gray-300">
                    Limited understanding of context
                  </span>
                </li>
                <li className="flex items-start">
                  <span className="text-red-500 mr-3">•</span>
                  <span className="text-gray-600 dark:text-gray-300">
                    Results may miss relevant properties
                  </span>
                </li>
              </ul>
            </div>

            {/* SeekSphere Search */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900 dark:to-indigo-900 rounded-lg shadow-lg p-8 border-2 border-blue-200 dark:border-blue-700">
              <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6 text-center">
                SeekSphere Search
              </h3>
              <ul className="space-y-4">
                <li className="flex items-start">
                  <span className="text-green-500 mr-3">✓</span>
                  <span className="text-gray-600 dark:text-gray-300">
                    Semantic understanding of queries
                  </span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-3">✓</span>
                  <span className="text-gray-600 dark:text-gray-300">
                    Natural language search capabilities
                  </span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-3">✓</span>
                  <span className="text-gray-600 dark:text-gray-300">
                    Intelligent relevance scoring
                  </span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-3">✓</span>
                  <span className="text-gray-600 dark:text-gray-300">
                    Finds properties you didn't know to look for
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Technical Overview Section */}
      <section className="bg-white dark:bg-gray-800 py-16">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8 text-center">
              Technical Benefits
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="bg-blue-100 dark:bg-blue-900 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">🚀</span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Performance
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Optimized for large datasets with efficient indexing and fast query processing
                </p>
              </div>
              <div className="text-center">
                <div className="bg-green-100 dark:bg-green-900 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">🎯</span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Accuracy
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Advanced algorithms ensure the most relevant results appear first
                </p>
              </div>
              <div className="text-center">
                <div className="bg-purple-100 dark:bg-purple-900 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">⚡</span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Easy Integration
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Simple API that integrates seamlessly with existing applications
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Demo Dataset Info */}
      <section className="py-16">
        <div className="container mx-auto px-6 text-center">
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-8 max-w-2xl mx-auto">
            <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              Explore Our Demo Dataset
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              This demonstration features over 20,000 realistic property listings across Canada, 
              showcasing how SeekSphere performs with large-scale real estate data.
            </p>
            <div className="flex gap-4 justify-center flex-col sm:flex-row">
              <Link
                href="/search"
                className="bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 px-6 rounded-lg transition-colors duration-200"
              >
                Start with Traditional Search
              </Link>
              <Link
                href="/seeksphere"
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg transition-colors duration-200"
              >
                Jump to SeekSphere
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
