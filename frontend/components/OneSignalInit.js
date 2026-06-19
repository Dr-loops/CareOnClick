"use client";
/**
 * OneSignalInit.js
 * Client-side component that:
 * 1. Initializes the OneSignal Web SDK
 * 2. Links the device to the logged-in user's DB ID via external_id (OneSignal.login)
 * 3. Handles permission prompting automatically via OneSignal's built-in UI
 *
 * Place this in RootLayout below <AuthProvider> — it's a zero-render component.
 */

import { useEffect } from 'react';
import { useSession } from 'next-auth/react';
const ONESIGNAL_APP_ID = process.env.NEXT_PUBLIC_ONESIGNAL_APP_ID;
let initialized = false;

export default function OneSignalInit() {
    const { data: session } = useSession();

    useEffect(() => {
        if (typeof window === 'undefined' || initialized || !ONESIGNAL_APP_ID) return;
        initialized = true;

        window.OneSignalDeferred = window.OneSignalDeferred || [];
        window.OneSignalDeferred.push(async function(OneSignal) {
            try {
                await OneSignal.init({
                    appId: ONESIGNAL_APP_ID,
                    serviceWorkerPath: '/OneSignalSDKWorker.js',
                    notifyButton: { enable: false },
                    allowLocalhostAsSecureOrigin: true,
                    promptOptions: {
                        slidedown: {
                            prompts: [
                                {
                                    type: 'push',
                                    autoPrompt: true,
                                    text: {
                                        actionMessage: 'CareOnClick would like to send you real-time health updates.',
                                        acceptButton: 'Allow Notifications',
                                        cancelButton: 'Not Now',
                                    },
                                    delay: { pageViews: 1, timeDelay: 3 },
                                },
                            ],
                        },
                    },
                });
                console.log('[OneSignal] SDK Initialized via script');
            } catch (e) {
                console.error('[OneSignal] Init error:', e);
            }
        });
    }, []);

    useEffect(() => {
        if (!session?.user?.id || typeof window === 'undefined') return;

        window.OneSignalDeferred = window.OneSignalDeferred || [];
        window.OneSignalDeferred.push(async function(OneSignal) {
            try {
                await OneSignal.login(session.user.id);
                console.log('[OneSignal] User linked:', session.user.id);

                await OneSignal.User.addTags({
                    role: session.user.role || 'user',
                    name: session.user.name || '',
                });
            } catch (e) {
                console.warn('[OneSignal] Login warning:', e);
            }
        });
    }, [session?.user?.id]);

    return null;
}
