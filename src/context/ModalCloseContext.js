import React, { createContext, useRef, useCallback } from 'react';

export const ModalCloseContext = createContext({
  register: () => () => {},
  closeAll: () => {},
});

export const ModalCloseProvider = ({ children }) => {
  const handlers = useRef(new Set());

  const register = useCallback((fn) => {
    handlers.current.add(fn);
    return () => handlers.current.delete(fn);
  }, []);

  const closeAll = useCallback(() => {
    // call all handlers
    handlers.current.forEach((h) => {
      try { h(); } catch (e) { console.warn('modal closer error', e); }
    });
  }, []);

  return (
    <ModalCloseContext.Provider value={{ register, closeAll }}>
      {children}
    </ModalCloseContext.Provider>
  );
};

export default ModalCloseContext;
