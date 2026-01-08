// hooks/useIsRTL.ts
import { useState, useEffect } from 'react';

const useIsRTL = (): boolean => {
  const [isRTL, setIsRTL] = useState(false);

  useEffect(() => {
    const dir = document.documentElement.dir;
    setIsRTL(dir === 'rtl');

    const observer = new MutationObserver(() => {
      setIsRTL(document.documentElement.dir === 'rtl');
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['dir'],
    });

    return () => observer.disconnect();
  }, []);

  return isRTL;
};

export default useIsRTL;
