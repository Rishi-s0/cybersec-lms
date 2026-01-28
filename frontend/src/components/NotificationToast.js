import React, { useEffect, useState } from 'react';
// Temporarily disabled socket import to fix runtime errors
// import { useSocket } from '../contexts/SocketContext';
import { Bell, X } from 'lucide-react';

const NotificationToast = () => {
    // Temporarily disabled socket functionality
    const socket = null;
    const [notifications, setNotifications] = useState([]);

    useEffect(() => {
        // Temporarily disabled socket functionality
        /*
        if (!socket) return;

        const handleNotification = (data) => {
            const id = Date.now();
            const newNotification = {
                id,
                message: data.message,
                type: data.type || 'info'
            };

            setNotifications(prev => [...prev, newNotification]);

            // Auto remove after 5 seconds
            setTimeout(() => {
                setNotifications(prev => prev.filter(n => n.id !== id));
            }, 5000);

            // Play sound
            try {
                const audio = new Audio('/notification.mp3'); // Assuming file exists or fails silently
                audio.play().catch(e => { });
            } catch (e) { }
        };

        socket.on('notification', handleNotification);

        return () => {
            socket.off('notification', handleNotification);
        };
        */
    }, [socket]);

    if (notifications.length === 0) return null;

    return (
        <div className="fixed top-24 right-4 z-50 flex flex-col space-y-2">
            {notifications.map(notification => (
                <div
                    key={notification.id}
                    className="bg-htb-darker border border-htb-green text-htb-gray-light p-4 rounded-lg shadow-lg flex items-start space-x-3 w-80 animate-slide-in"
                >
                    <Bell className="h-5 w-5 text-htb-green mt-1 flex-shrink-0 animate-bounce" />
                    <div className="flex-1">
                        <h4 className="font-semibold text-sm text-htb-green mb-1">New Notification</h4>
                        <p className="text-sm">{notification.message}</p>
                    </div>
                    <button
                        onClick={() => setNotifications(prev => prev.filter(n => n.id !== notification.id))}
                        className="text-htb-gray hover:text-htb-white"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>
            ))}
        </div>
    );
};

export default NotificationToast;
