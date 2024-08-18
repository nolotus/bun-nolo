// components/PerformanceMonitor.tsx
import { useEffect } from "react";

const PerformanceMonitor: React.FC = () => {
  useEffect(() => {
    if ("PerformanceObserver" in window) {
      // LCP
      let lcp: number;
      new PerformanceObserver((entryList) => {
        const entries = entryList.getEntries();
        const lastEntry = entries[entries.length - 1];
        lcp = lastEntry.startTime;
        console.log("LCP:", lcp);
      }).observe({ type: "largest-contentful-paint", buffered: true });

      // FID
      new PerformanceObserver((entryList) => {
        for (const entry of entryList.getEntries()) {
          const fid = entry.processingStart - entry.startTime;
          console.log("FID:", fid);
        }
      }).observe({ type: "first-input", buffered: true });

      // CLS
      let clsValue = 0;
      let clsEntries: PerformanceEntry[] = [];

      const entryHandler = (entries: PerformanceEntry[]) => {
        for (const entry of entries) {
          if (!entry.hadRecentInput) {
            const firstSessionEntry = clsEntries[0];
            const lastSessionEntry = clsEntries[clsEntries.length - 1];

            if (
              sessionValue > clsValue &&
              entry.startTime - firstSessionEntry.startTime < 5000 &&
              entry.startTime - lastSessionEntry.startTime < 1000
            ) {
              clsValue = sessionValue;
              console.log("CLS:", clsValue);
            }

            clsEntries.push(entry);
          }
        }
      };

      const sessionValue = () => {
        return clsEntries.reduce((sum, entry) => sum + entry.value, 0);
      };

      new PerformanceObserver(entryHandler).observe({
        type: "layout-shift",
        buffered: true,
      });

      // 清理函数
      return () => {
        // 如果需要，这里可以添加清理逻辑
      };
    }
  }, []);

  return null;
};

export default PerformanceMonitor;
