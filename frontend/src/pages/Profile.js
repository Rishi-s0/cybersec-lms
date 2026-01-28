import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useMutation, useQueryClient } from 'react-query';
import axios from 'axios';
import {
  User, Mail, Save, AlertCircle, CheckCircle,
  StickyNote, Trash2, BookOpen, Calendar,
  Shield, Key, Terminal, Activity, Award,
  Cpu, Lock, Edit3
} from 'lucide-react';
import { Link } from 'react-router-dom';

const Profile = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    firstName: user?.profile?.firstName || '',
    lastName: user?.profile?.lastName || '',
    bio: user?.profile?.bio || '',
    securityLevel: user?.profile?.securityLevel || 'beginner',
    skills: user?.profile?.skills || [],
    linkedIn: user?.profile?.linkedIn || '',
    github: user?.profile?.github || '',
    website: user?.profile?.website || ''
  });
  const [message, setMessage] = useState({ type: '', text: '' });
  const [notes, setNotes] = useState([]);
  const [loadingNotes, setLoadingNotes] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [privacySettings, setPrivacySettings] = useState({
    profileVisible: true,
    showBio: true,
    showCertificates: true,
    showAchievements: true,
    searchable: true
  });

  // Calculate profile completion dynamically
  const calculateProfileCompletion = () => {
    const fields = [
      formData.firstName,
      formData.lastName,
      formData.bio,
      formData.securityLevel,
      user?.email
    ];
    const filledFields = fields.filter(field => field && field.trim() !== '').length;
    return Math.round((filledFields / fields.length) * 100);
  };

  useEffect(() => {
    fetchAllNotes();
  }, []);

  const updateProfileMutation = useMutation(
    (profileData) => {
      const token = localStorage.getItem('token');
      return axios.put('/api/users/profile',
        { profile: profileData },
        { headers: { Authorization: `Bearer ${token}` } }
      );
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries('user');
        setMessage({ type: 'success', text: 'Profile updated successfully!' });
        setTimeout(() => setMessage({ type: '', text: '' }), 3000);
      },
      onError: (error) => {
        setMessage({
          type: 'error',
          text: error.response?.data?.message || 'Failed to update profile'
        });
      }
    }
  );

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    updateProfileMutation.mutate(formData);
  };

  const fetchAllNotes = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/notes', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setNotes(data);
      }
    } catch (error) {
      console.error('Error fetching notes:', error);
    } finally {
      setLoadingNotes(false);
    }
  };

  const handlePrivacyChange = (setting) => {
    setPrivacySettings(prev => ({
      ...prev,
      [setting]: !prev[setting]
    }));
  };

  const savePrivacySettings = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.put('/api/users/privacy', 
        { privacy: privacySettings },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessage({ type: 'success', text: 'Privacy settings updated successfully!' });
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } catch (error) {
      setMessage({
        type: 'error',
        text: error.response?.data?.message || 'Failed to update privacy settings'
      });
    }
  };

  const deleteNote = async (noteId) => {
    if (!window.confirm('Delete this note?')) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/notes/${noteId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        setNotes(prev => prev.filter(note => note._id !== noteId));
      }
    } catch (error) {
      console.error('Error deleting note:', error);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header Profile Card */}
      <div className="htb-card p-8 rounded-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-10">
          <Shield className="w-64 h-64 text-htb-green" />
        </div>

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center gap-8">
          <div className="relative group">
            <div className="w-32 h-32 rounded-xl bg-htb-darker border-2 border-htb-green flex items-center justify-center text-5xl font-bold text-htb-green shadow-[0_0_20px_rgba(159,239,0,0.2)] group-hover:shadow-[0_0_30px_rgba(159,239,0,0.4)] transition-all duration-300">
              {user?.username?.charAt(0).toUpperCase()}
            </div>
            <div className="absolute -bottom-2 -right-2 bg-htb-dark border border-htb-green rounded-full p-2">
              <Shield className="w-5 h-5 text-htb-green" />
            </div>
          </div>

          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-4">
              <h1 className="text-4xl font-bold text-white tracking-wide font-mono">
                {user?.username}
              </h1>
              <span className="px-3 py-1 rounded-full text-xs font-bold border border-htb-green text-htb-green bg-htb-green/10 uppercase tracking-wider">
                {user?.role}
              </span>
            </div>

            <div className="flex flex-wrap gap-6 text-htb-gray text-sm">
              <span className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-htb-green" />
                {user?.email?.replace(/(.{2})(.*)(@.*)/, '$1***$3')} {/* Partially hide email */}
              </span>
              <span className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-htb-green" />
                Joined {new Date(user?.createdAt).toLocaleDateString()}
              </span>
              <span className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-htb-green" />
                Level: {formData.securityLevel.charAt(0).toUpperCase() + formData.securityLevel.slice(1)}
              </span>
            </div>

            <p className="text-gray-400 max-w-2xl mt-4 font-light italic border-l-2 border-htb-gray-dark pl-4">
              "{formData.bio || 'No bio set yet. Add one closely to complete your profile.'}"
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Navigation */}
        <div className="lg:col-span-1 space-y-6">
          <div className="htb-card p-4 rounded-xl space-y-2">
            {[
              { id: 'overview', icon: User, label: 'Profile Overview' },
              { id: 'edit', icon: Edit3, label: 'Edit Profile' },
              { id: 'privacy', icon: Lock, label: 'Privacy Settings' },
              { id: 'notes', icon: StickyNote, label: `My Notes (${notes.length})` },
              { id: 'security', icon: Key, label: 'Security Settings' },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center justify-between p-3 rounded-lg transition-all duration-200 ${activeTab === item.id
                  ? 'bg-htb-green/10 text-htb-green border border-htb-green/30'
                  : 'text-gray-400 hover:bg-htb-darker hover:text-white'
                  }`}
              >
                <div className="flex items-center gap-3">
                  <item.icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                </div>
                {activeTab === item.id && <div className="w-1.5 h-1.5 rounded-full bg-htb-green shadow-glow"></div>}
              </button>
            ))}
          </div>

          {/* Quick Stats Widget */}
          <div className="htb-card p-6 rounded-xl">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <Terminal className="w-5 h-5 text-htb-green" />
              System Status
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-400">Profile Completion</span>
                <span className="text-htb-green font-mono">{calculateProfileCompletion()}%</span>
              </div>
              <div className="w-full bg-htb-darker rounded-full h-1.5">
                <div 
                  className="bg-htb-green h-1.5 rounded-full shadow-[0_0_10px_rgba(159,239,0,0.5)] transition-all duration-500" 
                  style={{ width: `${calculateProfileCompletion()}%` }}
                ></div>
              </div>
              <div className="text-xs text-gray-500">
                {calculateProfileCompletion() === 100 
                  ? 'Profile Complete!' 
                  : `${5 - Math.floor(calculateProfileCompletion() / 20)} fields remaining`
                }
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Content Area */}
        <div className="lg:col-span-2">

          {/* Messages */}
          {message.text && (
            <div className={`mb-6 p-4 rounded-lg flex items-center gap-3 border ${message.type === 'success'
              ? 'bg-green-900/20 border-green-500/50 text-green-400'
              : 'bg-red-900/20 border-red-500/50 text-red-400'
              }`}>
              {message.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
              {message.text}
            </div>
          )}

          {activeTab === 'edit' && (
            <div className="htb-card p-8 rounded-xl animate-fade-in">
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                <Edit3 className="w-6 h-6 text-htb-green" />
                Edit Profile
              </h2>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="group">
                    <label className="block text-sm font-medium text-gray-400 mb-2 group-focus-within:text-htb-green transition-colors">First Name</label>
                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      className="w-full bg-htb-darker border border-gray-700 text-white p-3 rounded-lg focus:outline-none focus:border-htb-green focus:shadow-[0_0_15px_rgba(159,239,0,0.1)] transition-all"
                    />
                  </div>
                  <div className="group">
                    <label className="block text-sm font-medium text-gray-400 mb-2 group-focus-within:text-htb-green transition-colors">Last Name</label>
                    <input
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      className="w-full bg-htb-darker border border-gray-700 text-white p-3 rounded-lg focus:outline-none focus:border-htb-green focus:shadow-[0_0_15px_rgba(159,239,0,0.1)] transition-all"
                    />
                  </div>
                </div>

                <div className="group">
                  <label className="block text-sm font-medium text-gray-400 mb-2 group-focus-within:text-htb-green transition-colors">Security Level</label>
                  <select
                    name="securityLevel"
                    value={formData.securityLevel}
                    onChange={handleChange}
                    className="w-full bg-htb-darker border border-gray-700 text-white p-3 rounded-lg focus:outline-none focus:border-htb-green transition-all appearance-none cursor-pointer hover:bg-htb-darker/80"
                  >
                    <option value="beginner">Level 1 - Beginner Analyst</option>
                    <option value="intermediate">Level 2 - Security Specialist</option>
                    <option value="advanced">Level 3 - Senior Architect</option>
                  </select>
                </div>

                <div className="group">
                  <label className="block text-sm font-medium text-gray-400 mb-2 group-focus-within:text-htb-green transition-colors">
                    Bio
                    <span className="text-xs ml-2 text-gray-500">
                      ({formData.bio.length}/500 characters)
                    </span>
                  </label>
                  <textarea
                    name="bio"
                    value={formData.bio}
                    onChange={handleChange}
                    maxLength={500}
                    rows={4}
                    className="w-full bg-htb-darker border border-gray-700 text-white p-3 rounded-lg focus:outline-none focus:border-htb-green focus:shadow-[0_0_15px_rgba(159,239,0,0.1)] transition-all resize-none"
                    placeholder="Tell us about your professional background, interests, and goals..."
                  />
                  <div className="mt-1 text-xs text-gray-500">
                    Describe your cybersecurity experience and learning objectives
                  </div>
                </div>

                {/* Social Links Section */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                    <Terminal className="w-5 h-5 text-htb-green" />
                    Professional Links
                  </h3>
                  
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="group">
                      <label className="block text-sm font-medium text-gray-400 mb-2 group-focus-within:text-htb-green transition-colors">LinkedIn Profile</label>
                      <input
                        type="url"
                        name="linkedIn"
                        value={formData.linkedIn}
                        onChange={handleChange}
                        placeholder="https://linkedin.com/in/username"
                        className="w-full bg-htb-darker border border-gray-700 text-white p-3 rounded-lg focus:outline-none focus:border-htb-green focus:shadow-[0_0_15px_rgba(159,239,0,0.1)] transition-all"
                      />
                    </div>
                    
                    <div className="group">
                      <label className="block text-sm font-medium text-gray-400 mb-2 group-focus-within:text-htb-green transition-colors">GitHub Profile</label>
                      <input
                        type="url"
                        name="github"
                        value={formData.github}
                        onChange={handleChange}
                        placeholder="https://github.com/username"
                        className="w-full bg-htb-darker border border-gray-700 text-white p-3 rounded-lg focus:outline-none focus:border-htb-green focus:shadow-[0_0_15px_rgba(159,239,0,0.1)] transition-all"
                      />
                    </div>
                  </div>
                  
                  <div className="group">
                    <label className="block text-sm font-medium text-gray-400 mb-2 group-focus-within:text-htb-green transition-colors">Personal Website</label>
                    <input
                      type="url"
                      name="website"
                      value={formData.website}
                      onChange={handleChange}
                      placeholder="https://yourwebsite.com"
                      className="w-full bg-htb-darker border border-gray-700 text-white p-3 rounded-lg focus:outline-none focus:border-htb-green focus:shadow-[0_0_15px_rgba(159,239,0,0.1)] transition-all"
                    />
                  </div>
                </div>

                <div className="pt-4 flex justify-end">
                  <button
                    type="submit"
                    disabled={updateProfileMutation.isLoading}
                    className="bg-htb-green text-black font-bold py-3 px-8 rounded-lg hover:bg-htb-green-light hover:shadow-[0_0_20px_rgba(159,239,0,0.4)] disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:-translate-y-1 flex items-center gap-2"
                  >
                    <Save className="w-5 h-5" />
                    {updateProfileMutation.isLoading ? 'Processing...' : 'Save Changes'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {activeTab === 'notes' && (
            <div className="space-y-6 animate-fade-in">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                  <StickyNote className="w-6 h-6 text-htb-green" />
                  My Notes
                </h2>
                <span className="text-gray-500 font-mono text-sm">{notes.length} ENTRIES FOUND</span>
              </div>

              {loadingNotes ? (
                <div className="text-center py-20">
                  <div className="w-12 h-12 border-4 border-htb-green border-t-transparent rounded-full animate-spin mx-auto"></div>
                  <p className="mt-4 text-htb-green font-mono">Loading Notes...</p>
                </div>
              ) : notes.length === 0 ? (
                <div className="htb-card p-12 rounded-xl text-center border-2 border-dashed border-gray-800">
                  <StickyNote className="h-16 w-16 text-gray-700 mx-auto mb-4" />
                  <p className="text-gray-400 text-lg">No notes recorded yet.</p>
                  <p className="text-gray-600 mt-2">Start taking notes during your courses to track learning.</p>
                </div>
              ) : (
                <div className="grid gap-4">
                  {notes.map((note) => (
                    <div
                      key={note._id}
                      className="htb-card p-6 rounded-xl hover:border-htb-green/50 transition-all group relative"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="space-y-1">
                          <Link
                            to={`/courses/${note.courseId._id}/lesson/${note.lessonId}`}
                            className="text-lg font-bold text-htb-green hover:underline flex items-center gap-2"
                          >
                            <Terminal className="w-4 h-4" />
                            {note.lessonTitle}
                          </Link>
                          <p className="text-xs text-gray-500 font-mono uppercase tracking-wide">
                            {note.courseId?.title || 'Unknown Course'}
                          </p>
                        </div>
                        <button
                          onClick={() => deleteNote(note._id)}
                          className="opacity-0 group-hover:opacity-100 text-red-500 hover:text-red-400 p-2 hover:bg-red-500/10 rounded-lg transition-all"
                          title="Delete Note"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="bg-htb-darker p-4 rounded-lg font-mono text-sm text-gray-300 border-l-2 border-gray-700">
                        {note.content}
                      </div>

                      <div className="mt-4 flex items-center gap-4 text-xs text-gray-500 font-mono">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {new Date(note.createdAt).toLocaleDateString()}
                        </span>
                        {note.updatedAt !== note.createdAt && (
                          <span>// EDITED: {new Date(note.updatedAt).toLocaleDateString()}</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'overview' && (
            <div className="htb-card p-8 rounded-xl animate-fade-in text-center py-20">
              <Shield className="w-20 h-20 text-gray-800 mx-auto mb-6" />
              <h2 className="text-2xl font-bold text-white mb-2">Welcome Back, {user?.username}</h2>
              <p className="text-gray-400 max-w-md mx-auto">
                Select a module from the left to manage your profile settings, view your notes, or update your security preferences.
              </p>
              <div className="mt-8 flex justify-center gap-4">
                <button onClick={() => setActiveTab('edit')} className="htb-btn flex items-center gap-2 px-6 py-2 rounded-lg">
                  <Edit3 className="w-4 h-4" /> Edit Profile
                </button>
                <Link to="/courses" className="htb-btn-primary flex items-center gap-2 px-6 py-2 rounded-lg">
                  <BookOpen className="w-4 h-4" /> Continue Learning
                </Link>
              </div>
            </div>
          )}

          {activeTab === 'privacy' && (
            <div className="htb-card p-8 rounded-xl animate-fade-in">
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                <Lock className="w-6 h-6 text-htb-green" />
                Privacy Settings
              </h2>
              
              <div className="space-y-6">
                <div className="bg-yellow-900/20 border border-yellow-500/50 text-yellow-400 p-4 rounded-lg flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium mb-1">Privacy Controls</p>
                    <p className="text-sm text-yellow-300">
                      Control what information is visible on your public profile. These settings affect how other users see your profile.
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-htb-darker rounded-lg border border-gray-700">
                    <div>
                      <h3 className="text-white font-medium">Public Profile Visibility</h3>
                      <p className="text-gray-400 text-sm">Allow others to view your public profile</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        className="sr-only peer" 
                        checked={privacySettings.profileVisible}
                        onChange={() => handlePrivacyChange('profileVisible')}
                      />
                      <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-htb-green"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-htb-darker rounded-lg border border-gray-700">
                    <div>
                      <h3 className="text-white font-medium">Show Bio</h3>
                      <p className="text-gray-400 text-sm">Display your bio on public profile</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        className="sr-only peer" 
                        checked={privacySettings.showBio}
                        onChange={() => handlePrivacyChange('showBio')}
                      />
                      <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-htb-green"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-htb-darker rounded-lg border border-gray-700">
                    <div>
                      <h3 className="text-white font-medium">Show Certificates</h3>
                      <p className="text-gray-400 text-sm">Display your earned certificates publicly</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        className="sr-only peer" 
                        checked={privacySettings.showCertificates}
                        onChange={() => handlePrivacyChange('showCertificates')}
                      />
                      <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-htb-green"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-htb-darker rounded-lg border border-gray-700">
                    <div>
                      <h3 className="text-white font-medium">Show Achievements</h3>
                      <p className="text-gray-400 text-sm">Display your achievements and badges</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        className="sr-only peer" 
                        checked={privacySettings.showAchievements}
                        onChange={() => handlePrivacyChange('showAchievements')}
                      />
                      <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-htb-green"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-htb-darker rounded-lg border border-gray-700">
                    <div>
                      <h3 className="text-white font-medium">Searchable Profile</h3>
                      <p className="text-gray-400 text-sm">Allow your profile to appear in search results</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        className="sr-only peer" 
                        checked={privacySettings.searchable}
                        onChange={() => handlePrivacyChange('searchable')}
                      />
                      <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-htb-green"></div>
                    </label>
                  </div>
                </div>

                <div className="pt-4 flex justify-end">
                  <button
                    onClick={savePrivacySettings}
                    className="bg-htb-green text-black font-bold py-3 px-8 rounded-lg hover:bg-htb-green-light hover:shadow-[0_0_20px_rgba(159,239,0,0.4)] transition-all transform hover:-translate-y-1 flex items-center gap-2"
                  >
                    <Save className="w-5 h-5" />
                    Save Privacy Settings
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="htb-card p-8 rounded-xl animate-fade-in text-center py-20">
              <Key className="w-16 h-16 text-htb-green mx-auto mb-6" />
              <h2 className="text-2xl font-bold text-white mb-4">Security Settings</h2>
              <p className="text-gray-400 mb-8">
                Password rotation and 2FA settings are managed via the central Identity Provider.
              </p>
              <button className="bg-gray-800 text-gray-500 px-6 py-3 rounded-lg cursor-not-allowed border border-gray-700 pointer-events-none">
                Configured Externally
              </button>
            </div>
          )}
            <div className="htb-card p-8 rounded-xl animate-fade-in text-center py-20">
              <Lock className="w-16 h-16 text-htb-green mx-auto mb-6" />
              <h2 className="text-2xl font-bold text-white mb-4">Security Settings</h2>
              <p className="text-gray-400 mb-8">
                Password rotation and 2FA settings are managed via the central Identity Provider.
              </p>
              <button className="bg-gray-800 text-gray-500 px-6 py-3 rounded-lg cursor-not-allowed border border-gray-700 pointer-events-none">
                Configured Externally
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default Profile;