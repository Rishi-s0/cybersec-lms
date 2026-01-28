import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Download, ArrowLeft, Printer, Share2 } from 'lucide-react';

const CertificateView = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [certificate, setCertificate] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const contentRef = useRef(null);

    useEffect(() => {
        fetchCertificate();
    }, [id]);

    const fetchCertificate = async () => {
        try {
            const response = await fetch(`/api/certificates/${id}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (!response.ok) {
                throw new Error('Certificate not found');
            }

            const data = await response.json();
            setCertificate(data);
        } catch (err) {
            console.error('Error fetching certificate:', err);
            setError('Certificate not found or you do not have permission to view it.');
        } finally {
            setLoading(false);
        }
    };

    const handlePrint = () => {
        window.print();
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-htb-dark">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-htb-green mx-auto mb-4"></div>
                    <p className="text-htb-gray">Loading certificate...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-htb-dark">
                <div className="text-center max-w-md mx-auto p-6">
                    <div className="text-htb-red text-5xl mb-4">⚠️</div>
                    <h2 className="text-2xl font-bold text-white mb-2">Error</h2>
                    <p className="text-htb-gray mb-6">{error}</p>
                    <button
                        onClick={() => navigate('/dashboard')}
                        className="htb-btn px-6 py-2 rounded-lg bg-htb-darker border border-htb-green text-htb-green hover:bg-htb-green hover:text-htb-dark transition-all"
                    >
                        Return to Dashboard
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-htb-dark flex flex-col items-center py-10 print:py-0 print:bg-white">
            {/* Toolbar - Hidden when printing */}
            <div className="w-full max-w-4xl px-4 mb-8 flex items-center justify-between print:hidden">
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center space-x-2 text-htb-gray hover:text-white transition-colors"
                >
                    <ArrowLeft className="h-5 w-5" />
                    <span>Back</span>
                </button>

                <div className="flex items-center space-x-4">
                    <button
                        onClick={handlePrint}
                        className="flex items-center space-x-2 bg-htb-green text-htb-dark font-bold px-6 py-2 rounded-lg hover:bg-htb-green-light transition-all shadow-lg hover:shadow-htb-green/20"
                    >
                        <Printer className="h-5 w-5" />
                        <span>Print / Save PDF</span>
                    </button>
                </div>
            </div>

            {/* Certificate Container */}
            <div className="certificate-container w-full flex justify-center print:block print:w-full print:h-full print:m-0" ref={contentRef}>
                <div className="relative w-full max-w-5xl aspect-[1.414/1] bg-black text-white p-8 md:p-12 mx-auto shadow-2xl border-4 border-htb-green rounded-lg overflow-hidden print:fixed print:inset-0 print:w-screen print:h-screen print:max-w-none print:aspect-auto print:border-4 print:border-black print:bg-white print:text-black print:shadow-none print:rounded-none print:z-50 print:m-0">

                    {/* Background Pattern */}
                    <div className="absolute inset-0 opacity-10 pointer-events-none print:opacity-5">
                        <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(#00ff88 1px, transparent 1px)', backgroundSize: '30px 30px' }}></div>
                    </div>

                    {/* Corner Decorations */}
                    <div className="absolute top-0 left-0 w-24 h-24 md:w-32 md:h-32 border-t-4 border-l-4 border-htb-green rounded-tl-3xl print:border-black"></div>
                    <div className="absolute top-0 right-0 w-24 h-24 md:w-32 md:h-32 border-t-4 border-r-4 border-htb-green rounded-tr-3xl print:border-black"></div>
                    <div className="absolute bottom-0 left-0 w-24 h-24 md:w-32 md:h-32 border-b-4 border-l-4 border-htb-green rounded-bl-3xl print:border-black"></div>
                    <div className="absolute bottom-0 right-0 w-24 h-24 md:w-32 md:h-32 border-b-4 border-r-4 border-htb-green rounded-br-3xl print:border-black"></div>

                    {/* Content */}
                    <div className="relative z-10 h-full flex flex-col items-center justify-between py-8">

                        {/* Header */}
                        <div className="text-center mt-4">
                            <h1 className="text-4xl md:text-6xl font-serif font-bold tracking-wider text-htb-green mb-2 print:text-black">CERTIFICATE</h1>
                            <p className="text-lg md:text-xl tracking-[0.3em] uppercase text-gray-400 print:text-gray-600">Of Completion</p>
                        </div>

                        {/* Body */}
                        <div className="space-y-4 text-center my-4">
                            <p className="text-lg text-gray-400 font-serif italic print:text-gray-600">This certifies that</p>
                            <h2 className="text-3xl md:text-5xl font-bold py-2 text-white print:text-black">{certificate.studentName}</h2>
                            <p className="text-lg text-gray-400 font-serif italic print:text-gray-600">has successfully completed the course</p>
                            <h3 className="text-2xl md:text-4xl font-bold text-htb-green py-2 print:text-black">{certificate.courseName}</h3>
                        </div>

                        {/* Details */}
                        <div className="grid grid-cols-3 gap-8 w-full max-w-4xl px-8">
                            <div className="text-center">
                                <p className="text-xs uppercase tracking-wider text-gray-500 mb-1">Date Completed</p>
                                <p className="text-lg font-mono font-bold">{new Date(certificate.completedAt).toLocaleDateString()}</p>
                            </div>
                            <div className="text-center">
                                <p className="text-xs uppercase tracking-wider text-gray-500 mb-1">Final Score</p>
                                <p className="text-lg font-mono font-bold">{certificate.finalScore}%</p>
                            </div>
                            <div className="text-center">
                                <p className="text-xs uppercase tracking-wider text-gray-500 mb-1">Time Invested</p>
                                <p className="text-lg font-mono font-bold">{certificate.totalTimeSpent} Hours</p>
                            </div>
                        </div>

                        {/* Signatures & Footer */}
                        <div className="w-full max-w-3xl mt-8">
                            <div className="flex justify-between w-full pt-8 border-t border-gray-800 print:border-gray-300">
                                <div className="text-center">
                                    <div className="font-script text-2xl mb-1 text-htb-green print:text-black font-signature">{certificate.instructorName}</div>
                                    <div className="text-xs uppercase tracking-wider text-gray-500">Instructor</div>
                                </div>
                                <div className="text-center">
                                    <div className="font-bold text-xl mb-1 text-white print:text-black">HACKADEMY</div>
                                    <div className="text-xs uppercase tracking-wider text-gray-500">Platform Director</div>
                                </div>
                            </div>

                            <div className="mt-8 text-center">
                                <p className="text-[10px] text-gray-600 font-mono">
                                    ID: {certificate.certificateId} • Verification Code: {certificate.verificationCode}
                                </p>
                            </div>
                        </div>

                    </div>
                </div>
            </div>

            <style>
                {`
                    @media print {
                        @page {
                            size: landscape;
                            margin: 0;
                        }
                        html, body {
                            height: 100%;
                            overflow: hidden !important;
                            margin: 0 !important;
                            padding: 0 !important;
                        }
                        .print\\:hidden {
                            display: none !important;
                        }
                        /* Ensure specific elements don't take up space */
                        .min-h-screen {
                            min-height: 0 !important;
                            height: 0 !important;
                            padding: 0 !important;
                        }
                    }
                `}
            </style>
        </div>
    );
};

export default CertificateView;
