import React, { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { X, Lock, CreditCard, CheckCircle, AlertCircle } from 'lucide-react';

// Initialize Stripe outside component to avoid recreation
const stripeKey = process.env.REACT_APP_STRIPE_KEY;
const stripePromise = stripeKey ? loadStripe(stripeKey) : null;

// Checkout Form Component
const CheckoutForm = ({ course, onSuccess, onCancel }) => {
    const stripe = useStripe();
    const elements = useElements();
    const [error, setError] = useState(null);
    const [processing, setProcessing] = useState(false);
    const [clientSecret, setClientSecret] = useState('');
    const [mockMode, setMockMode] = useState(false);

    useEffect(() => {
        // Create PaymentIntent as soon as the page loads
        fetch('/api/payments/create-payment-intent', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({ courseId: course._id }),
        })
            .then((res) => res.json())
            .then((data) => {
                if (data.mockMode) {
                    setMockMode(true);
                }
                setClientSecret(data.clientSecret);
            })
            .catch((err) => {
                console.error(err);
                setError('Failed to initialize payment');
            });
    }, [course]);

    const handleSubmit = async (event) => {
        event.preventDefault();
        setProcessing(true);

        if (mockMode) {
            // Handle mock payment
            setTimeout(async () => {
                // Call mock confirmation endpoint
                try {
                    const res = await fetch('/api/payments/confirm-mock-payment', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${localStorage.getItem('token')}`
                        },
                        body: JSON.stringify({ courseId: course._id }),
                    });
                    const data = await res.json();
                    if (data.success) {
                        onSuccess();
                    } else {
                        setError(data.message || 'Payment failed');
                        setProcessing(false);
                    }
                } catch (err) {
                    setError('Network error');
                    setProcessing(false);
                }
            }, 1500);
            return;
        }

        if (!stripe || !elements) {
            return;
        }

        const card = elements.getElement(CardElement);

        if (card == null) {
            return;
        }

        try {
            const result = await stripe.confirmCardPayment(clientSecret, {
                payment_method: {
                    card: card,
                    billing_details: {
                        name: 'Student Name', // Should get from context
                    },
                },
            });

            if (result.error) {
                setError(result.error.message);
                setProcessing(false);
            } else {
                if (result.paymentIntent.status === 'succeeded') {
                    // Payment successful - calling enrollment endpoint (or webhook handles it)
                    // For this implementation, we will assume webhook handles it or allow client to call enroll
                    // But usually we call backend to verify.
                    await fetch(`/api/courses/${course._id}/enroll`, {
                        method: 'POST',
                        headers: {
                            'Authorization': `Bearer ${localStorage.getItem('token')}`
                        }
                    });
                    onSuccess();
                }
            }
        } catch (err) {
            setError(err.message);
            setProcessing(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="bg-htb-darker p-4 rounded-lg mb-6">
                <h3 className="text-white font-bold mb-2">{course.title}</h3>
                <div className="flex justify-between text-gray-400 text-sm">
                    <span>Price</span>
                    <span className="text-white font-bold">${course.price}</span>
                </div>
            </div>

            {mockMode ? (
                <div className="bg-yellow-500/10 border border-yellow-500/30 p-4 rounded-lg mb-4">
                    <div className="flex items-center gap-2 text-yellow-500 mb-2">
                        <AlertCircle className="h-4 w-4" />
                        <span className="font-bold text-sm">Demo Mode</span>
                    </div>
                    <p className="text-sm text-gray-400">Stripe keys are not configured. This is a simulation.</p>
                </div>
            ) : (
                <div className="bg-white p-4 rounded-md">
                    <CardElement options={{
                        style: {
                            base: {
                                fontSize: '16px',
                                color: '#424770',
                                '::placeholder': {
                                    color: '#aab7c4',
                                },
                            },
                            invalid: {
                                color: '#9e2146',
                            },
                        },
                    }} />
                </div>
            )}

            {error && (
                <div className="text-red-500 text-sm flex items-center gap-2">
                    <AlertCircle className="h-4 w-4" />
                    {error}
                </div>
            )}

            <button
                type="submit"
                disabled={processing || (!stripe && !mockMode) || !clientSecret}
                className="w-full htb-btn-primary py-3 rounded-lg font-bold flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {processing ? (
                    <>Processing...</>
                ) : (
                    <>
                        <Lock className="h-4 w-4" />
                        Pay ${course.price}
                    </>
                )}
            </button>

            <div className="flex justify-center flex-col items-center gap-2 mt-4">
                <div className="flex gap-2">
                    <CreditCard className="h-6 w-6 text-gray-500" />
                    <span className="text-gray-500 text-sm">Secure Payment</span>
                </div>
                <p className="text-xs text-gray-600">Powered by Stripe</p>
            </div>
        </form>
    );
};

// Wrapper Modal
const PaymentModal = ({ course, isOpen, onClose, onSuccess }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <div className="htb-card w-full max-w-md rounded-xl p-6 relative animate-in fade-in zoom-in duration-200">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
                >
                    <X className="h-5 w-5" />
                </button>

                <div className="text-center mb-6">
                    <div className="w-12 h-12 bg-htb-green/20 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Lock className="h-6 w-6 text-htb-green" />
                    </div>
                    <h2 className="text-2xl font-bold text-white">Enroll in Course</h2>
                    <p className="text-gray-400 mt-1">Complete secure payment to start learning</p>
                </div>

                {stripePromise || !process.env.REACT_APP_STRIPE_KEY ? (
                    <Elements stripe={stripePromise}>
                        <CheckoutForm course={course} onSuccess={onSuccess} onCancel={onClose} />
                    </Elements>
                ) : (
                    <div className="text-center text-red-500">
                        Stripe configuration error.
                    </div>
                )}
            </div>
        </div>
    );
};

export default PaymentModal;
