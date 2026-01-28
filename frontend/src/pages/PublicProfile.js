import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { User, Shield, Award, Calendar, ExternalLink, MapPin, Briefcase } from 'lucide-react';

const PublicProfile = () => {
    const { username } = useParams();
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchProfile();
    }, [username]);

    const fetchProfile = async () => {
        try {
            setLoading(true);
            const response = await fetch(`/api/users/public/${username}`);

            if (!response.ok) {
                if (response.status === 404) throw new Error('User not found');
                if (response.status === 403) throw new Error('Profile is private');
                throw new Error('Failed to load profile');
            }

            const data = await response.json();
            setProfile(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-[80vh] flex items-center justify-center">
                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-htb-green"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
                <Shield className="h-16 w-16 text-htb-gray mb-4" />
                <h2 className="text-2xl font-bold text-white mb-2">Profile Unavailable</h2>
                <p className="text-htb-gray">{error}</p>
            </div>
        );
    }

    if (!profile) return null;

    return (
        <div className="max-w-6xl mx-auto px-4 py-8">
            {/* Profile Header */}
            <div className="htb-card rounded-lg p-8 mb-8 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-htb-green to-htb-blue"></div>

                <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
                    {/* Avatar */}
                    <div className="flex-shrink-0 relative group">
                        <div className="w-32 h-32 rounded-full bg-htb-darker border-4 border-htb-green/20 overflow-hidden flex items-center justify-center shadow-lg shadow-htb-green/10">
                            {profile.profile?.avatar ? (
                                <img src={profile.profile.avatar} alt={profile.username} className="w-full h-full object-cover" />
                            ) : (
                                <User className="h-16 w-16 text-htb-green" />
                            )}
                        </div>
                        {profile.profile?.securityLevel && (
                            <div className="absolute -bottom-2 md:bottom-2 -right-2 md:-right-2 bg-htb-green text-black text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-lg border-2 border-htb-dark">
                                {profile.profile.securityLevel}
                            </div>
                        )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 text-center md:text-left">
                        <h1 className="text-3xl font-bold text-white mb-2">{profile.profile?.firstName} {profile.profile?.lastName}</h1>
                        <p className="text-xl text-htb-gray mb-4">@{profile.username}</p>

                        {(profile.profile?.department || profile.profile?.bio) && (
                            <div className="max-w-2xl text-htb-gray-light leading-relaxed mb-6">
                                {profile.profile.bio || "Cybersecurity Enthusiast"}
                            </div>
                        )}

                        <div className="flex flex-wrap gap-4 justify-center md:justify-start text-sm text-htb-gray">
                            {profile.profile?.department && (
                                <div className="flex items-center gap-2">
                                    <Briefcase className="h-4 w-4 text-htb-green" />
                                    <span>{profile.profile.department}</span>
                                </div>
                            )}
                            {profile.profile?.location && (
                                <div className="flex items-center gap-2">
                                    <MapPin className="h-4 w-4 text-htb-green" />
                                    <span>{profile.profile.location}</span>
                                </div>
                            )}
                            <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4 text-htb-green" />
                                <span>Joined {new Date(profile.createdAt).toLocaleDateString()}</span>
                            </div>
                        </div>
                    </div>

                    {/* Stats Card */}
                    <div className="bg-htb-darker/50 rounded-lg p-6 min-w-[200px] border border-htb-gray-dark/20 text-center">
                        <div className="text-3xl font-bold text-htb-green">{profile.achievements?.length || 0}</div>
                        <div className="text-sm text-htb-gray uppercase tracking-wider font-medium mt-1">Achievements</div>

                        <div className="h-px bg-htb-gray-dark/30 my-4"></div>

                        <div className="text-3xl font-bold text-htb-blue">{profile.certificates?.length || 0}</div>
                        <div className="text-sm text-htb-gray uppercase tracking-wider font-medium mt-1">Certificates</div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Achievements Column */}
                <div className="md:col-span-1 space-y-6">
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                        <Award className="h-6 w-6 text-htb-orange" />
                        Achievements
                    </h2>

                    {profile.achievements && profile.achievements.length > 0 ? (
                        <div className="grid gap-4">
                            {profile.achievements.map((achievement, idx) => (
                                <div key={idx} className="bg-htb-darker/30 border border-htb-gray-dark/20 rounded-lg p-4 flex gap-4 hover:border-htb-orange/30 transition-colors">
                                    <div className="bg-htb-orange/10 p-2 rounded-lg h-fit">
                                        <Award className="h-6 w-6 text-htb-orange" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-white text-sm">{achievement.title}</h3>
                                        <p className="text-xs text-htb-gray mt-1">{achievement.description}</p>
                                        <p className="text-[10px] text-htb-gray-dark mt-2">{new Date(achievement.earnedAt).toLocaleDateString()}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-htb-gray italic bg-htb-darker/30 p-6 rounded-lg text-center border border-dashed border-htb-gray-dark/30">
                            No achievements yet
                        </div>
                    )}
                </div>

                {/* Certificates Column */}
                <div className="md:col-span-2 space-y-6">
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                        <Shield className="h-6 w-6 text-htb-green" />
                        Certifications
                    </h2>

                    {profile.certificates && profile.certificates.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {profile.certificates.map((cert) => (
                                <div key={cert.certificateId} className="htb-card rounded-lg p-5 border border-htb-gray-dark/20 group hover:border-htb-green/50 transition-all">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="bg-htb-green/10 p-2 rounded-lg">
                                            <Shield className="h-6 w-6 text-htb-green" />
                                        </div>
                                        <span className="text-xs bg-htb-darker px-2 py-1 rounded text-htb-gray border border-htb-gray-dark/30">
                                            {cert.courseCategory}
                                        </span>
                                    </div>

                                    <h3 className="font-bold text-white mb-1 group-hover:text-htb-green transition-colors">{cert.courseTitle}</h3>
                                    <p className="text-xs text-htb-gray mb-4">Issued: {new Date(cert.issuedAt).toLocaleDateString()}</p>

                                    <div className="mt-auto pt-4 border-t border-htb-gray-dark/20 flex flex-wrap gap-2">
                                        <span className="text-[10px] text-htb-blue bg-htb-blue/10 px-2 py-0.5 rounded">
                                            {cert.skillsCount || 0} skills earned
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-htb-gray italic bg-htb-darker/30 p-8 rounded-lg text-center border border-dashed border-htb-gray-dark/30 flex flex-col items-center">
                            <Shield className="h-10 w-10 text-htb-gray-dark mb-2" />
                            <p>No certifications earned yet</p>
                        </div>
                    )}

                    {/* Recent Activity Mockup if needed (Optional) */}
                </div>
            </div>
        </div>
    );
};

export default PublicProfile;
