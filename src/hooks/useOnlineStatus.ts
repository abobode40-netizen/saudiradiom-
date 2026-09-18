import { useEffect, useState, useCallback } from "react";

const MANUAL_OFFLINE_KEY = "thanawya_manual_offline_mode";

export function useOnlineStatus() {
  const [isBrowserOnline, setIsBrowserOnline] = useState<boolean>(
    typeof navigator !== "undefined" ? navigator.onLine : true
  );

  const [isManualOffline, setIsManualOffline] = useState<boolean>(() => {
    try {
      return localStorage.getItem(MANUAL_OFFLINE_KEY) === "true";
    } catch {
      return false;
    }
  });

  useEffect(() => {
    const handleOnline = () => setIsBrowserOnline(true);
    const handleOffline = () => setIsBrowserOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  const toggleManualOffline = useCallback(() => {
    setIsManualOffline((prev) => {
      const next = !prev;
      try {
        localStorage.setItem(MANUAL_OFFLINE_KEY, String(next));
      } catch {
        // ignore storage error
      }
      return next;
    });
  }, []);

  const setManualOffline = useCallback((val: boolean) => {
    setIsManualOffline(val);
    try {
      localStorage.setItem(MANUAL_OFFLINE_KEY, String(val));
    } catch {
      // ignore
    }
  }, []);

  // Effective status: online ONLY if both browser is online and manual offline is NOT enabled
  const isOnline = isBrowserOnline && !isManualOffline;

  return {
    isOnline,
    isBrowserOnline,
    isManualOffline,
    toggleManualOffline,
    setManualOffline,
  };
}
