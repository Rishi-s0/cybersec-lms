import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Award, Eye, ExternalLink, Calendar, Clock, CheckCircle } from 'lucide-react';

const Certificates = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [certificates, setCertificates] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user) {
            fetchCertificates();
        }
    }, [user]);

    const fetchCertificates = async () => {
        try {
            const response = await fetch('/api/certificates', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            if (response.ok) {
                const data = await response.json();
                setCertificates(data);
            }
        } catch (error) {
            console.error('Error fetching certificates:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleViewCertificate = (certId) => {
        navigate(`/certificate-view/${certId}`);
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-htb-green mx-auto mb-4"></div>
                    <p className="text-htb-gray">Loading certificates...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                <div className="text-center md:text-left">
                    <h1 className="text-3xl font-bold text-htb-gray-light matrix-text mb-2">My Certificates</h1>
                    <p className="text-htb-gray">Track and download your earned credentials</p>
                </div>
                <div className="bg-htb-darker p-4 rounded-xl border border-htb-gray-dark/30 flex items-center space-x-3 w-full md:w-auto justify-center">
                    <div className="bg-htb-green/20 p-2 rounded-lg">
                        <Award className="h-6 w-6 text-htb-green" />
                    </div>
                    <div>
                        <div className="text-2xl font-bold text-htb-gray-light">{certificates.length}</div>
                        <div className="text-xs text-htb-gray">Total Certificates</div>
                    </div>
                </div>
            </div>

            {certificates.length === 0 ? (
                <div className="htb-card p-12 text-center rounded-2xl border-dashed border-2 border-htb-gray-dark/30">
                    <div className="bg-htb-darker inline-flex p-4 rounded-full mb-4">
                        <Award className="h-12 w-12 text-htb-gray-dark" />
                    </div>
                    <h3 className="text-xl font-semibold text-htb-gray-light mb-2">No Certificates Yet</h3>
                    <p className="text-htb-gray mb-6 max-w-md mx-auto">
                        Complete courses to earn certificates. Check out our course catalog to get started!
                    </p>
                    <Link to="/courses" className="htb-btn-primary px-6 py-2 rounded-lg inline-flex items-center space-x-2">
                        <span>Browse Courses</span>
                        <ExternalLink className="h-4 w-4" />
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {certificates.map((cert) => (
                        <div key={cert._id} className="htb-card group hover:border-htb-green/50 transition-all duration-300">
                            {/* Certificate Preview/Top */}
                            <div className="relative h-48 bg-htb-darker border-b border-htb-gray-dark/30 flex items-center justify-center overflow-hidden">
                                <div className="absolute inset-0 bg-gradient-to-br from-htb-green/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                                <Award className="h-20 w-20 text-htb-gray-dark group-hover:text-htb-green/30 transition-colors duration-300 transform group-hover:scale-110" />
                                <div className="absolute top-4 right-4 bg-htb-green text-htb-dark font-bold text-xs px-2 py-1 rounded">
                                    VERIFIED
                                </div>
                            </div>

                            {/* Content */}
                            <div className="p-6">
                                <div className="mb-4">
                                    <div className="text-xs text-htb-green font-medium mb-1 uppercase tracking-wider">
                                        {cert.course?.category || 'General'}
                                    </div>
                                    <h3 className="text-lg font-bold text-htb-gray-light group-hover:text-htb-green transition-colors line-clamp-2 min-h-[3.5rem]">
                                        {cert.courseName}
                                    </h3>
                                </div>

                                <div className="space-y-3 text-sm text-htb-gray mb-6">
                                    <div className="flex items-center space-x-2">
                                        <Calendar className="h-4 w-4" />
                                        <span>Issued: {new Date(cert.issuedAt).toLocaleDateString()}</span>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <Clock className="h-4 w-4" />
                                        <span>{cert.totalTimeSpent} hours • Score: {cert.finalScore}%</span>
                                    </div>
                                    <div className="flex items-center space-x-2 text-xs font-mono bg-htb-darker p-1 rounded border border-htb-gray-dark/30 truncate">
                                        <CheckCircle className="h-3 w-3 text-htb-green" />
                                        <span className="truncate">ID: {cert.certificateId}</span>
                                    </div>
                                </div>

                                <button
                                    onClick={() => handleViewCertificate(cert.certificateId)}
                                    className="w-full htb-btn-primary py-2 rounded-lg flex items-center justify-center space-x-2 group-hover:shadow-[0_0_15px_rgba(0,255,136,0.3)]"
                                >
                                    <Eye className="h-4 w-4" />
                                    <span>View Certificate</span>
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Certificates;
