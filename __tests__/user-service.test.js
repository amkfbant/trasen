const bcrypt = require('bcrypt');

// データベースのモック
const mockDb = {
  get: jest.fn(),
  run: jest.fn()
};

// データベースモジュールをモック
jest.mock('../api/database', () => ({
  db: mockDb
}));

const UserService = require('../api/services/user-service');

describe('UserService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('findUserByUsername', () => {
    test('should find existing user', async () => {
      const mockUser = { id: 1, username: 'testuser', password: 'hashedpassword' };
      mockDb.get.mockImplementation((sql, params, callback) => {
        callback(null, mockUser);
      });

      const result = await UserService.findUserByUsername('testuser');

      expect(mockDb.get).toHaveBeenCalledWith(
        'SELECT * FROM users WHERE username = ?',
        ['testuser'],
        expect.any(Function)
      );
      expect(result).toEqual(mockUser);
    });

    test('should return null for non-existing user', async () => {
      mockDb.get.mockImplementation((sql, params, callback) => {
        callback(null, null);
      });

      const result = await UserService.findUserByUsername('nonexistent');

      expect(result).toBeNull();
    });

    test('should handle database errors', async () => {
      const error = new Error('Database error');
      mockDb.get.mockImplementation((sql, params, callback) => {
        callback(error);
      });

      await expect(UserService.findUserByUsername('testuser')).rejects.toThrow('Database error');
    });
  });

  describe('createUser', () => {
    test('should create new user successfully', async () => {
      // 重複チェックのモック（ユーザーが存在しない）
      mockDb.get.mockImplementation((sql, params, callback) => {
        callback(null, null);
      });

      // ユーザー作成のモック
      mockDb.run.mockImplementation((sql, params, callback) => {
        callback.call({ lastID: 1 }, null);
      });

      const result = await UserService.createUser('newuser', 'password123');

      expect(mockDb.get).toHaveBeenCalledWith(
        'SELECT * FROM users WHERE username = ?',
        ['newuser'],
        expect.any(Function)
      );
      expect(mockDb.run).toHaveBeenCalledWith(
        'INSERT INTO users (username, password) VALUES (?, ?)',
        ['newuser', expect.any(String)],
        expect.any(Function)
      );
      expect(result).toEqual({ id: 1, username: 'newuser' });
    });

    test('should throw error for missing username', async () => {
      await expect(UserService.createUser('', 'password123')).rejects.toThrow('Username and password are required');
    });

    test('should throw error for missing password', async () => {
      await expect(UserService.createUser('username', '')).rejects.toThrow('Username and password are required');
    });

    test('should throw error for existing username', async () => {
      const existingUser = { id: 1, username: 'existinguser' };
      mockDb.get.mockImplementation((sql, params, callback) => {
        callback(null, existingUser);
      });

      await expect(UserService.createUser('existinguser', 'password123')).rejects.toThrow('Username already exists');
    });

    test('should hash password before storing', async () => {
      mockDb.get.mockImplementation((sql, params, callback) => {
        callback(null, null);
      });

      mockDb.run.mockImplementation((sql, params, callback) => {
        callback.call({ lastID: 1 }, null);
      });

      await UserService.createUser('testuser', 'plainpassword');

      // パスワードがハッシュ化されていることを確認
      const createUserCall = mockDb.run.mock.calls.find(call => call[0].includes('INSERT INTO users'));
      const hashedPassword = createUserCall[1][1];
      expect(hashedPassword).not.toBe('plainpassword');
      expect(typeof hashedPassword).toBe('string');
      expect(hashedPassword.length).toBeGreaterThan(50); // bcryptハッシュは通常60文字
    });
  });

  describe('authenticateUser', () => {
    test('should authenticate valid user', async () => {
      const hashedPassword = await bcrypt.hash('correctpassword', 10);
      const mockUser = { id: 1, username: 'testuser', password: hashedPassword };

      mockDb.get.mockImplementation((sql, params, callback) => {
        callback(null, mockUser);
      });

      const result = await UserService.authenticateUser('testuser', 'correctpassword');

      expect(result).toEqual({ id: 1, username: 'testuser' });
    });

    test('should reject invalid username', async () => {
      mockDb.get.mockImplementation((sql, params, callback) => {
        callback(null, null);
      });

      await expect(UserService.authenticateUser('wronguser', 'password')).rejects.toThrow('Invalid username or password');
    });

    test('should reject invalid password', async () => {
      const hashedPassword = await bcrypt.hash('correctpassword', 10);
      const mockUser = { id: 1, username: 'testuser', password: hashedPassword };

      mockDb.get.mockImplementation((sql, params, callback) => {
        callback(null, mockUser);
      });

      await expect(UserService.authenticateUser('testuser', 'wrongpassword')).rejects.toThrow('Invalid username or password');
    });

    test('should throw error for missing username', async () => {
      await expect(UserService.authenticateUser('', 'password')).rejects.toThrow('Username and password are required');
    });

    test('should throw error for missing password', async () => {
      await expect(UserService.authenticateUser('username', '')).rejects.toThrow('Username and password are required');
    });
  });
});