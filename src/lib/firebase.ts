import { getAnalytics, isSupported, logEvent } from "firebase/analytics";
import { getApps, initializeApp } from "firebase/app";
import { Platform } from "react-native";

const firebaseConfig = {
    apiKey: "AIzaSyBEe23a9A-VRGqAL398kSGHtuTojIUr6Fo",
    authDomain: "corphealthexpo.firebaseapp.com",
    projectId: "corphealthexpo",
    storageBucket: "corphealthexpo.firebasestorage.app",
    messagingSenderId: "1070917461549",
    appId: "1:1070917461549:web:12a188e650e42ac1653aa4",
    measurementId: "G-9G8086LRYL"
};

let analyticsInstance: any = null;

export const initFirebase = async () => {
    if (!getApps().length) {
        initializeApp(firebaseConfig);
    }

    // Analytics работает только если поддерживается средой
    if (Platform.OS !== "web") {
        try {
            const supported = await isSupported();
            if (supported) {
                analyticsInstance = getAnalytics();
            }
        } catch (e) {
            console.log("Analytics not supported:", e);
        }
    }
};

export const logAnalyticsEvent = (
    eventName: string,
    params?: Record<string, any>
) => {
    if (!analyticsInstance) return;
    logEvent(analyticsInstance, eventName, params);
};