// Lightweight logging adapter - replace with Sentry/LogRocket/AWS Pinpoint as needed

const isEnabled = () => {
  try {
    return process.env.NODE_ENV === 'production';
  } catch (e) {
    return false;
  }
};

export const log = (...args) => {
  // In dev, keep console logs; in prod, route to remote service
  if (!isEnabled()) {
    // eslint-disable-next-line no-console
    console.log(...args);
    return;
  }
  // TODO: send to remote logger
};

export const warn = (...args) => {
  if (!isEnabled()) {
     
    console.warn(...args);
    return;
  }
  // TODO: send to remote logger as warning
};

export const error = (...args) => {
  if (!isEnabled()) {
     
    console.error(...args);
    return;
  }
  // TODO: send to remote logger as error
};

export default { log, warn, error };
