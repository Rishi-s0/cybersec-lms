import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Search, Filter, BookOpen, FileText, User, ChevronDown } from 'lucide-react';
import axios from 'axios';

const SearchResults = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({});
  const [activeFilters, setActiveFilters] = useState({
    type: searchParams.get('type') || '',
    category: searchParams.get('category') || '',
    difficulty: searchParams.get('difficulty') || ''
  });
  const [showFilters, setShowFilters] = useState(false);
  const [total, setTotal] = useState(0);
  
  const query = searchParams.get('q') || '';

  // Fetch search results
  const performSearch = async () => {
    if (!query.trim()) return;
    
    try {
      setLoading(true);
      const params = new URLSearchParams({
        q: query,
        ...activeFilters
      });
      
      const response = await axios.get(`/api/search?${params}`);
      setResults(response.data.results);
      setTotal(response.data.total);
    } catch (error) {
      console.error('Search error:', error);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch available filters
  const fetchFilters = async () => {
    try {
      const response = await axios.get('/api/search/filters');
      setFilters(response.data);
    } catch (error) {
      console.error('Error fetching filters:', error);
    }
  };

  useEffect(() => {
    fetchFilters();
  }, []);

  useEffect(() => {
    performSearch();
  }, [query, activeFilters]);

  const handleFilterChange = (filterType, value) => {
    const newFilters = {
      ...activeFilters,
      [filterType]: value
    };
    setActiveFilters(newFilters);
    
    // Update URL
    const newParams = new URLSearchParams(searchParams);
    if (value) {
      newParams.set(filterType, value);
    } else {
      newParams.delete(filterType);
    }
    setSearchParams(newParams);
  };

  const clearFilters = () => {
    setActiveFilters({ type: '', category: '', difficulty: '' });
    setSearchParams({ q: query });
  };

  const getResultIcon = (type) => {
    switch (type) {
      case 'course':
        return <BookOpen size={20} className="text-green-400" />;
      case 'lesson':
        return <FileText size={20} className="text-blue-400" />;
      case 'user':
        return <User size={20} className="text-purple-400" />;
      default:
        return <Search size={20} className="text-gray-400" />;
    }
  };

  const highlightMatch = (text, query) => {
    if (!query || !text) return text;
    
    const regex = new RegExp(`(${query})`, 'gi');
    const parts = text.split(regex);
    
    return parts.map((part, index) => 
      regex.test(part) ? (
        <span key={index} className="bg-yellow-400 text-black px-1 rounded">
          {part}
        </span>
      ) : part
    );
  };

  if (!query) {
    return (
      <div className="min-h-screen bg-gray-900 text-white">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <Search size={64} className="mx-auto mb-4 text-gray-600" />
            <h1 className="text-2xl font-bold mb-2">Search CyberSec LMS</h1>
            <p className="text-gray-400">Enter a search term to find courses, lessons, and more</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-8">
        {/* Search Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Search Results</h1>
          <p className="text-gray-400">
            {loading ? 'Searching...' : `${total} results for "${query}"`}
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar */}
          <div className="lg:w-64 flex-shrink-0">
            <div className="bg-gray-800 rounded-lg p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold flex items-center">
                  <Filter size={16} className="mr-2" />
                  Filters
                </h3>
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="lg:hidden text-gray-400"
                >
                  <ChevronDown size={16} />
                </button>
              </div>

              <div className={`space-y-4 ${showFilters ? 'block' : 'hidden lg:block'}`}>
                {/* Type Filter */}
                <div>
                  <label className="block text-sm font-medium mb-2">Type</label>
                  <select
                    value={activeFilters.type}
                    onChange={(e) => handleFilterChange('type', e.target.value)}
                    className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-sm"
                  >
                    <option value="">All Types</option>
                    {filters.types?.map(type => (
                      <option key={type} value={type} className="capitalize">
                        {type}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Category Filter */}
                <div>
                  <label className="block text-sm font-medium mb-2">Category</label>
                  <select
                    value={activeFilters.category}
                    onChange={(e) => handleFilterChange('category', e.target.value)}
                    className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-sm"
                  >
                    <option value="">All Categories</option>
                    {filters.categories?.map(category => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Difficulty Filter */}
                <div>
                  <label className="block text-sm font-medium mb-2">Difficulty</label>
                  <select
                    value={activeFilters.difficulty}
                    onChange={(e) => handleFilterChange('difficulty', e.target.value)}
                    className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-sm"
                  >
                    <option value="">All Levels</option>
                    {filters.difficulties?.map(difficulty => (
                      <option key={difficulty} value={difficulty} className="capitalize">
                        {difficulty}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Clear Filters */}
                {(activeFilters.type || activeFilters.category || activeFilters.difficulty) && (
                  <button
                    onClick={clearFilters}
                    className="w-full text-sm text-red-400 hover:text-red-300 py-2"
                  >
                    Clear All Filters
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Results */}
          <div className="flex-1">
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
                <p className="text-gray-400">Searching...</p>
              </div>
            ) : results.length === 0 ? (
              <div className="text-center py-12">
                <Search size={64} className="mx-auto mb-4 text-gray-600" />
                <h3 className="text-xl font-semibold mb-2">No results found</h3>
                <p className="text-gray-400 mb-4">
                  Try adjusting your search terms or filters
                </p>
                <button
                  onClick={clearFilters}
                  className="text-green-400 hover:text-green-300"
                >
                  Clear filters
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {results.map((result, index) => (
                  <div
                    key={index}
                    className="bg-gray-800 rounded-lg p-6 hover:bg-gray-750 transition-colors"
                  >
                    <Link to={result.url} className="block">
                      <div className="flex items-start space-x-4">
                        <div className="mt-1">
                          {getResultIcon(result.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2 mb-2">
                            <span className="text-xs px-2 py-1 bg-gray-700 rounded text-gray-300 capitalize">
                              {result.type}
                            </span>
                            {result.category && (
                              <span className="text-xs text-gray-500">
                                {result.category}
                              </span>
                            )}
                            {result.difficulty && (
                              <span className="text-xs px-2 py-1 bg-blue-600 rounded text-white capitalize">
                                {result.difficulty}
                              </span>
                            )}
                            {result.type === 'lesson' && (
                              <span className="text-xs px-2 py-1 bg-green-600 rounded text-white">
                                Enrolled
                              </span>
                            )}
                          </div>
                          
                          <h3 className="text-lg font-semibold text-white mb-2 hover:text-green-400">
                            {highlightMatch(result.title, query)}
                          </h3>
                          
                          {result.description && (
                            <p className="text-gray-400 text-sm mb-2 line-clamp-2">
                              {highlightMatch(result.description, query)}
                            </p>
                          )}
                          
                          <div className="flex items-center space-x-4 text-xs text-gray-500">
                            {result.instructor && (
                              <span>Instructor: {result.instructor}</span>
                            )}
                            {result.courseName && (
                              <span>Course: {result.courseName}</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchResults;