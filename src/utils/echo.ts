import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

declare global {
    interface Window {
        Pusher: any;
        Echo: any;
    }
}

window.Pusher = Pusher;

const echo = new Echo({
    broadcaster: 'reverb',
    key: import.meta.env.VITE_REVERB_APP_KEY || '1234567890abcdef',
    wsHost: import.meta.env.VITE_REVERB_HOST || window.location.hostname,
    wsPort: import.meta.env.VITE_REVERB_PORT || 8080,
    wssPort: import.meta.env.VITE_REVERB_PORT || 8080,
    forceTLS: (import.meta.env.VITE_REVERB_SCHEME ?? 'http') === 'https',
    enabledTransports: ['ws', 'wss'],
    authorizer: (channel: any, _options: any) => {
        return {
            authorize: (socketId: any, callback: any) => {
                fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api'}/broadcasting/auth`, {
                    method: 'POST',
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    },
                    body: JSON.stringify({
                        socket_id: socketId,
                        channel_name: channel.name
                    })
                })
                .then(response => {
                    if (!response.ok) throw new Error('Authorization error');
                    return response.json();
                })
                .then(data => callback(false, data))
                .catch(error => callback(true, error));
            }
        };
    },
});

export default echo;
