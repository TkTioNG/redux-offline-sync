export const serializeError = (error: Error | any): object => {
  if (error instanceof Error) {
    return JSON.parse(JSON.stringify(error, Object.getOwnPropertyNames(error)));
  }
  return error;
};

const checkIsConstantCase = (str: string) => /^[A-Z][A-Z0-9_]*/.test(str);

export const getOfflineQueueType = (type: string): string => {
  if (checkIsConstantCase(type)) {
    return `${type}_OFFLINE_QUEUED`;
  }
  return `${type}OfflineQueued`;
};

export const getOfflineCommitType = (type: string): string => {
  if (checkIsConstantCase(type)) {
    return `${type}_OFFLINE_COMMIT`;
  }
  return `${type}OfflineCommit`;
};

export const getOfflineRollbackType = (type: string): string => {
  if (checkIsConstantCase(type)) {
    return `${type}_OFFLINE_ROLLBACK`;
  }
  return `${type}OfflineRollback`;
};
