import { useEffect, useReducer, useState } from 'react';

class OfflineDetector {
    /** General status */
    onlineGlobal = true;

    /** Access to our server */
    onlineLocal = true;

    private removeListeners: VoidFunction;

    private stopPolling = false;

    private triggers: Record<string, VoidFunction> = {};

    constructor() {
        const goOnline = () => {
            this.onlineGlobal = true;
            this.triggerAll();
        };

        const goOffline = () => {
            this.onlineGlobal = false;
            this.triggerAll();
        };

        window.addEventListener('online', goOnline);
        window.addEventListener('offline', goOffline);

        this.removeListeners = () => {
            window.removeEventListener('online', goOnline);
            window.removeEventListener('offline', goOffline);
        };

        const polling = () => {
            if (this.stopPolling) {
                return;
            }

            if (!this.onlineGlobal) {
                setTimeout(polling, 5000);

                return;
            }

            fetch('/api/health')
                .then((res) => {
                    const newStatus = res.status === 200;
                    const shouldTrigger = newStatus !== this.onlineLocal;

                    this.onlineLocal = newStatus;

                    if (shouldTrigger) {
                        this.triggerAll();
                    }
                })
                .catch(() => {
                    const shouldTrigger = this.onlineLocal === true;
                    this.onlineLocal = false;

                    if (shouldTrigger) {
                        this.triggerAll();
                    }
                })
                .finally(() => {
                    setTimeout(polling, 5000);
                });
        };
        polling();
    }

    private triggerAll() {
        Object.values(this.triggers).forEach((t) => t());
    }

    addTrigger(id: string, trigger: VoidFunction) {
        this.triggers[id] = trigger;
    }

    removeTrigger(id: string) {
        delete this.triggers[id];
    }

    destroy() {
        this.removeListeners();
        this.stopPolling = true;
        this.triggers = {};
    }
}

export const useOfflineDetector = () => {
    const [, trigger] = useReducer((i) => i + 1, 0);

    const [offlineDetector, setOfflineDetector] = useState<OfflineDetector>();

    useEffect(() => {
        if (typeof window === 'undefined') {
            return;
        }

        let detector: OfflineDetector;
        const id = (Math.random() + 1).toString(36).substring(2);

        if (window.offlineDetector instanceof OfflineDetector) {
            detector = window.offlineDetector;
        } else {
            window.offlineDetector = new OfflineDetector();
            detector = window.offlineDetector;
        }

        detector.addTrigger(id, trigger);

        setOfflineDetector(window.offlineDetector);

        return () => detector.removeTrigger(id);
    }, []);

    return offlineDetector ? { online: offlineDetector.onlineGlobal && offlineDetector.onlineLocal } : { online: true };
};
