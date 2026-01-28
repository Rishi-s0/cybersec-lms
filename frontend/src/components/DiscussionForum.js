import React, { useState, useEffect } from 'react';
import { 
  MessageSquare, 
  Plus, 
  ThumbsUp, 
  Reply, 
  Pin, 
  CheckCircle, 
  Eye,
  Filter,
  Search,
  Send,
  X
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const DiscussionForum = ({ courseId, lessonId = null }) => {
  const { user } = useAuth();
  const [discussions, setDiscussions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showNewDiscussion, setShowNewDiscussion] = useState(false);
  const [selectedDiscussion, setSelectedDiscussion] = useState(null);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const [newDiscussion, setNewDiscussion] = useState({
    title: '',
    message: '',
    type: 'discussion',
    tags: []
  });

  const [replyMessage, setReplyMessage] = useState('');

  useEffect(() => {
    fetchDiscussions();
  }, [courseId, lessonId, filter]);

  const fetchDiscussions = async () => {
    try {
      setLoading(true);
      let url = `/api/discussions/course/${courseId}`;
      const params = new URLSearchParams();
      
      if (lessonId) params.append('lessonId', lessonId);
      if (filter !== 'all') params.append('type', filter);
      
      if (params.toString()) {
        url += `?${params.toString()}`;
      }

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setDiscussions(data.discussions);
      }
    } catch (error) {
      console.error('Error fetching discussions:', error);
    } finally {
      setLoading(false);
    }
  };

  const createDiscussion = async (e) => {
    e.preventDefault();
    
    try {
      const response = await fetch('/api/discussions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          courseId,
          lessonId,
          ...newDiscussion
        })
      });

      if (response.ok) {
        const discussion = await response.json();
        setDiscussions([discussion, ...discussions]);
        setNewDiscussion({ title: '', message: '', type: 'discussion', tags: [] });
        setShowNewDiscussion(false);
      }
    } catch (error) {
      console.error('Error creating discussion:', error);
    }
  };

  const addReply = async (discussionId) => {
    if (!replyMessage.trim()) return;

    try {
      const response = await fetch(`/api/discussions/${discussionId}/reply`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ message: replyMessage })
      });

      if (response.ok) {
        const updatedDiscussion = await response.json();
        setDiscussions(discussions.map(d => 
          d._id === discussionId ? updatedDiscussion : d
        ));
        setReplyMessage('');
      }
    } catch (error) {
      console.error('Error adding reply:', error);
    }
  };

  const toggleLike = async (discussionId) => {
    try {
      const response = await fetch(`/api/discussions/${discussionId}/like`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        fetchDiscussions(); // Refresh to get updated like count
      }
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'question':
        return <MessageSquare className="h-4 w-4 text-htb-blue" />;
      case 'announcement':
        return <Pin className="h-4 w-4 text-htb-orange" />;
      case 'help':
        return <MessageSquare className="h-4 w-4 text-htb-red" />;
      default:
        return <MessageSquare className="h-4 w-4 text-htb-green" />;
    }
  };

  const formatTimeAgo = (date) => {
    const now = new Date();
    const discussionDate = new Date(date);
    const diffInMinutes = Math.floor((now - discussionDate) / (1000 * 60));

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  const filteredDiscussions = discussions.filter(discussion =>
    discussion.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    discussion.message.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-htb-green"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-htb-gray-light matrix-text">
          Discussion Forum
        </h2>
        <button
          onClick={() => setShowNewDiscussion(true)}
          className="htb-btn-primary px-4 py-2 rounded-lg flex items-center space-x-2"
        >
          <Plus className="h-4 w-4" />
          <span>New Discussion</span>
        </button>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex items-center space-x-2">
          <Filter className="h-4 w-4 text-htb-gray" />
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="htb-input px-3 py-1 rounded"
          >
            <option value="all">All Types</option>
            <option value="discussion">Discussions</option>
            <option value="question">Questions</option>
            <option value="help">Help</option>
            <option value="announcement">Announcements</option>
          </select>
        </div>

        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-htb-gray" />
          <input
            type="text"
            placeholder="Search discussions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="htb-input w-full pl-10 pr-4 py-2 rounded-lg"
          />
        </div>
      </div>

      {/* New Discussion Modal */}
      {showNewDiscussion && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="htb-card p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-htb-gray-light">New Discussion</h3>
              <button
                onClick={() => setShowNewDiscussion(false)}
                className="text-htb-gray hover:text-htb-red"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={createDiscussion} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-htb-gray-light mb-2">
                  Type
                </label>
                <select
                  value={newDiscussion.type}
                  onChange={(e) => setNewDiscussion({ ...newDiscussion, type: e.target.value })}
                  className="htb-input w-full px-3 py-2 rounded-lg"
                >
                  <option value="discussion">Discussion</option>
                  <option value="question">Question</option>
                  <option value="help">Help Request</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-htb-gray-light mb-2">
                  Title
                </label>
                <input
                  type="text"
                  value={newDiscussion.title}
                  onChange={(e) => setNewDiscussion({ ...newDiscussion, title: e.target.value })}
                  className="htb-input w-full px-3 py-2 rounded-lg"
                  placeholder="Enter discussion title..."
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-htb-gray-light mb-2">
                  Message
                </label>
                <textarea
                  value={newDiscussion.message}
                  onChange={(e) => setNewDiscussion({ ...newDiscussion, message: e.target.value })}
                  className="htb-input w-full px-3 py-2 rounded-lg h-32 resize-none"
                  placeholder="Write your message..."
                  required
                />
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowNewDiscussion(false)}
                  className="htb-btn px-4 py-2 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="htb-btn-primary px-4 py-2 rounded-lg"
                >
                  Create Discussion
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Discussions List */}
      <div className="space-y-4">
        {filteredDiscussions.length === 0 ? (
          <div className="htb-card p-8 text-center">
            <MessageSquare className="h-12 w-12 text-htb-gray mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-htb-gray-light mb-2">No Discussions Yet</h3>
            <p className="text-htb-gray">Be the first to start a discussion!</p>
          </div>
        ) : (
          filteredDiscussions.map(discussion => (
            <div key={discussion._id} className="htb-card p-6">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  {getTypeIcon(discussion.type)}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-2">
                    {discussion.isPinned && (
                      <Pin className="h-4 w-4 text-htb-orange" />
                    )}
                    <h3 className="text-lg font-semibold text-htb-gray-light">
                      {discussion.title}
                    </h3>
                    {discussion.isSolved && (
                      <CheckCircle className="h-4 w-4 text-htb-green" />
                    )}
                  </div>

                  <p className="text-htb-gray text-sm mb-3 line-clamp-2">
                    {discussion.message}
                  </p>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4 text-sm text-htb-gray">
                      <span>
                        by {discussion.userId.username} • {formatTimeAgo(discussion.createdAt)}
                      </span>
                      <div className="flex items-center space-x-1">
                        <Eye className="h-3 w-3" />
                        <span>{discussion.views}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Reply className="h-3 w-3" />
                        <span>{discussion.replies.length}</span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => toggleLike(discussion._id)}
                        className="flex items-center space-x-1 text-htb-gray hover:text-htb-green transition-colors"
                      >
                        <ThumbsUp className="h-4 w-4" />
                        <span>{discussion.likes.length}</span>
                      </button>

                      <button
                        onClick={() => setSelectedDiscussion(
                          selectedDiscussion === discussion._id ? null : discussion._id
                        )}
                        className="htb-btn px-3 py-1 rounded text-sm"
                      >
                        {selectedDiscussion === discussion._id ? 'Hide' : 'View'}
                      </button>
                    </div>
                  </div>

                  {/* Replies Section */}
                  {selectedDiscussion === discussion._id && (
                    <div className="mt-4 pt-4 border-t border-htb-gray-dark/30">
                      {/* Existing Replies */}
                      {discussion.replies.map(reply => (
                        <div key={reply._id} className="mb-4 p-3 bg-htb-darker/30 rounded-lg">
                          <div className="flex items-center space-x-2 mb-2">
                            <span className="text-sm font-medium text-htb-gray-light">
                              {reply.userId.username}
                            </span>
                            {reply.isInstructorReply && (
                              <span className="text-xs bg-htb-green/20 text-htb-green px-2 py-1 rounded">
                                Instructor
                              </span>
                            )}
                            <span className="text-xs text-htb-gray">
                              {formatTimeAgo(reply.createdAt)}
                            </span>
                          </div>
                          <p className="text-htb-gray-light text-sm">{reply.message}</p>
                        </div>
                      ))}

                      {/* Reply Form */}
                      <div className="flex space-x-3">
                        <input
                          type="text"
                          value={replyMessage}
                          onChange={(e) => setReplyMessage(e.target.value)}
                          placeholder="Write a reply..."
                          className="htb-input flex-1 px-3 py-2 rounded-lg"
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                              addReply(discussion._id);
                            }
                          }}
                        />
                        <button
                          onClick={() => addReply(discussion._id)}
                          className="htb-btn-primary px-4 py-2 rounded-lg flex items-center space-x-2"
                        >
                          <Send className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default DiscussionForum;