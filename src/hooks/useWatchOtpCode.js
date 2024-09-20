import { useEffect, useState } from 'preact/hooks';

const useOtpWatcher = (otp, condition) => {
  const [resolved, setResolved] = useState(false);

  useEffect(() => {
    if (condition(otp)) {
      setResolved(true);
    }
  }, [otp, condition]);

  return resolved;
};

export default useOtpWatcher;