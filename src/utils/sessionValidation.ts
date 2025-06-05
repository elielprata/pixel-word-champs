
export const validateSession = (session: any): boolean => {
  return !!(session?.user);
};

export const getSessionId = (session: any): string | null => {
  return session?.user?.id || null;
};

export const shouldProcessSession = (
  sessionId: string | null,
  lastProcessedSessionRef: React.MutableRefObject<string | null>,
  isProcessingRef: React.MutableRefObject<boolean>,
  isMountedRef: React.MutableRefObject<boolean>
): boolean => {
  // Prevent multiple simultaneous processing of the same session
  if (isProcessingRef.current || !isMountedRef.current) {
    console.log('Processamento já em andamento ou componente desmontado');
    return false;
  }

  if (lastProcessedSessionRef.current === sessionId) {
    console.log('Sessão já processada:', sessionId);
    return false;
  }

  return true;
};
