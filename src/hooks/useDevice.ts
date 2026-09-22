import { useState, useEffect } from 'react';

export type DeviceType = 'mobile' | 'tablet' | 'desktop';

export interface DeviceInfo {
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  deviceType: DeviceType;
  isTouch: boolean;
  screenWidth: number;
  screenHeight: number;
}

export function useDevice(): DeviceInfo {
  const [deviceInfo, setDeviceInfo] = useState<DeviceInfo>(() => {
    if (typeof window === 'undefined') {
      return {
        isMobile: false,
        isTablet: false,
        isDesktop: true,
        deviceType: 'desktop',
        isTouch: false,
        screenWidth: 1200,
        screenHeight: 800,
      };
    }

    const width = window.innerWidth;
    const height = window.innerHeight;
    const isTouch = window.matchMedia('(pointer: coarse)').matches;
    const isMobile = width < 768;
    const isTablet = width >= 768 && width < 1024;
    const isDesktop = width >= 1024;

    return {
      isMobile,
      isTablet,
      isDesktop,
      deviceType: isMobile ? 'mobile' : isTablet ? 'tablet' : 'desktop',
      isTouch,
      screenWidth: width,
      screenHeight: height,
    };
  });

  useEffect(() => {
    function handleResize() {
      const width = window.innerWidth;
      const height = window.innerHeight;
      const isTouch = window.matchMedia('(pointer: coarse)').matches;
      const isMobile = width < 768;
      const isTablet = width >= 768 && width < 1024;
      const isDesktop = width >= 1024;

      setDeviceInfo({
        isMobile,
        isTablet,
        isDesktop,
        deviceType: isMobile ? 'mobile' : isTablet ? 'tablet' : 'desktop',
        isTouch,
        screenWidth: width,
        screenHeight: height,
      });
    }

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return deviceInfo;
}
