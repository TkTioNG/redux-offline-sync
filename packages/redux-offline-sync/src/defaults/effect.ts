import type { Config, OfflineAction } from '../types';

export class NetworkError extends Error {
  status: number;
  response: any;

  constructor(response: any, status: number) {
    super();
    this.name = 'NetworkError';
    this.status = status;
    this.response = { ...response };
  }
}

const tryParseJSON = (json: string) => {
  if (!json) {
    return null;
  }
  try {
    return JSON.parse(json);
  } catch (e) {
    throw new Error(`Failed to parse unexpected JSON response: ${json}`);
  }
};

const getResponseBody = (res: Response): Promise<any> => {
  const contentType = res.headers.get('content-type') || false;
  if (contentType && contentType.indexOf('json') >= 0) {
    return res.text().then(tryParseJSON);
  }
  return res.text();
};

export const getHeaders = (
  headers: Record<string, string>
): Record<string, string> => {
  const {
    'Content-Type': contentTypeCapitalized,
    'content-type': contentTypeLowerCase,
    ...restOfHeaders
  } = headers || {};
  const contentType =
    contentTypeCapitalized || contentTypeLowerCase || 'application/json';
  return {
    ...restOfHeaders,
    'content-type': contentType,
  };
};

export const getFormData = (object: Record<string, any>) => {
  const formData = new FormData();
  Object.keys(object).forEach((key) => {
    Object.keys(object[key]).forEach((innerObj) => {
      const newObj = object[key][innerObj];
      formData.append(newObj[0], newObj[1]);
    });
  });

  return formData;
};

const effectCaller: Config['effect'] = (
  effect: any,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  action: OfflineAction
): Promise<any> => {
  const { url, json, ...options } = effect;
  const headers = getHeaders(options.headers);

  if (
    !(options.body instanceof FormData) &&
    Object.prototype.hasOwnProperty.call(headers, 'content-type') &&
    headers['content-type'].toLowerCase().includes('multipart/form-data')
  ) {
    options.body = getFormData(options.body);
  }

  if (json !== null && json !== undefined) {
    try {
      options.body = JSON.stringify(json);
    } catch (e) {
      return Promise.reject(e);
    }
  }
  return fetch(url, { ...options, headers }).then((res: Response) => {
    if (res.ok) {
      return getResponseBody(res);
    }
    return getResponseBody(res).then((body) => {
      throw new NetworkError(body || '', res.status);
    });
  });
};

export default effectCaller;
