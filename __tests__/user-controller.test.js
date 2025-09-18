// User Serviceのモック
const mockUserService = {
  createUser: jest.fn(),
  authenticateUser: jest.fn()
};

jest.mock('../api/services/user-service', () => mockUserService);

const UserController = require('../api/controllers/user-controller');

describe('UserController', () => {
  let mockRequest, mockReply;

  beforeEach(() => {
    jest.clearAllMocks();

    mockRequest = {
      body: {}
    };

    mockReply = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn().mockReturnThis()
    };
  });

  describe('register', () => {
    test('should register user successfully', async () => {
      const userData = { id: 1, username: 'testuser' };
      mockRequest.body = { username: 'testuser', password: 'password123' };
      mockUserService.createUser.mockResolvedValue(userData);

      await UserController.register(mockRequest, mockReply);

      expect(mockUserService.createUser).toHaveBeenCalledWith('testuser', 'password123');
      expect(mockReply.send).toHaveBeenCalledWith({
        message: 'User registered successfully',
        user: userData
      });
    });

    test('should handle service errors', async () => {
      mockRequest.body = { username: 'testuser', password: 'password123' };
      mockUserService.createUser.mockRejectedValue(new Error('Username already exists'));

      await UserController.register(mockRequest, mockReply);

      expect(mockReply.status).toHaveBeenCalledWith(400);
      expect(mockReply.send).toHaveBeenCalledWith({ error: 'Username already exists' });
    });

    test('should handle missing body data gracefully', async () => {
      mockRequest.body = {};
      mockUserService.createUser.mockRejectedValue(new Error('Username and password are required'));

      await UserController.register(mockRequest, mockReply);

      expect(mockReply.status).toHaveBeenCalledWith(400);
      expect(mockReply.send).toHaveBeenCalledWith({ error: 'Username and password are required' });
    });
  });

  describe('login', () => {
    test('should login user successfully', async () => {
      const userData = { id: 1, username: 'testuser' };
      mockRequest.body = { username: 'testuser', password: 'password123' };
      mockUserService.authenticateUser.mockResolvedValue(userData);

      await UserController.login(mockRequest, mockReply);

      expect(mockUserService.authenticateUser).toHaveBeenCalledWith('testuser', 'password123');
      expect(mockReply.send).toHaveBeenCalledWith({
        message: 'Login successful',
        user: userData
      });
    });

    test('should handle authentication errors', async () => {
      mockRequest.body = { username: 'testuser', password: 'wrongpassword' };
      mockUserService.authenticateUser.mockRejectedValue(new Error('Invalid username or password'));

      await UserController.login(mockRequest, mockReply);

      expect(mockReply.status).toHaveBeenCalledWith(400);
      expect(mockReply.send).toHaveBeenCalledWith({ error: 'Invalid username or password' });
    });

    test('should handle missing credentials', async () => {
      mockRequest.body = { username: '', password: 'password' };
      mockUserService.authenticateUser.mockRejectedValue(new Error('Username and password are required'));

      await UserController.login(mockRequest, mockReply);

      expect(mockReply.status).toHaveBeenCalledWith(400);
      expect(mockReply.send).toHaveBeenCalledWith({ error: 'Username and password are required' });
    });
  });
});