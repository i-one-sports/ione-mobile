const mockAxiosInstance = {
  get: jest.fn(),
  post: jest.fn(),
  put: jest.fn(),
  delete: jest.fn(),
  patch: jest.fn(),
  interceptors: {
    response: { use: jest.fn(), eject: jest.fn() },
    request: { use: jest.fn(), eject: jest.fn() },
  },
};

const axios = {
  create: jest.fn(() => mockAxiosInstance),
  ...mockAxiosInstance,
};

export default axios;
export { mockAxiosInstance };
