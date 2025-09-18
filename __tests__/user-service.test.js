const bcrypt = require('bcrypt');

// データベースのモック
const mockDb = {
  get: jest.fn(),
  run: jest.fn(),
  all: jest.fn(),
  serialize: jest.fn((fn) => fn())
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

  // User Management拡張機能のテスト
  describe('User Management Extended Features', () => {

    describe('findUserById', () => {
      test('should find user by ID', async () => {
        const mockUser = { id: 1, username: 'testuser', display_name: 'Test User' };
        mockDb.get.mockImplementation((sql, params, callback) => {
          callback(null, mockUser);
        });

        const result = await UserService.findUserById(1);

        expect(mockDb.get).toHaveBeenCalledWith(
          'SELECT * FROM users WHERE id = ?',
          [1],
          expect.any(Function)
        );
        expect(result).toEqual(mockUser);
      });
    });

    describe('searchUsers', () => {
      test('should search users by query', async () => {
        const mockUsers = [
          { id: 1, username: 'alice', display_name: 'Alice' },
          { id: 2, username: 'bob', display_name: 'Bob' }
        ];
        mockDb.all.mockImplementation((sql, params, callback) => {
          callback(null, mockUsers);
        });

        const result = await UserService.searchUsers('al');

        expect(mockDb.all).toHaveBeenCalledWith(
          expect.stringContaining('WHERE username LIKE ? OR display_name LIKE ? OR email LIKE ?'),
          ['%al%', '%al%', '%al%'],
          expect.any(Function)
        );
        expect(result).toEqual(mockUsers);
      });
    });

    describe('updateProfile', () => {
      test('should update user profile successfully', async () => {
        // email重複チェック
        mockDb.get.mockImplementation((sql, params, callback) => {
          callback(null, null);
        });

        mockDb.run.mockImplementation((sql, params, callback) => {
          callback.call({ changes: 1 }, null);
        });

        const profileData = {
          display_name: 'New Name',
          email: 'new@email.com',
          bio: 'New bio'
        };

        const result = await UserService.updateProfile(1, profileData);

        expect(result).toEqual({ message: 'Profile updated successfully' });
      });

      test('should reject duplicate email', async () => {
        const existingUser = { id: 2 };
        mockDb.get.mockImplementation((sql, params, callback) => {
          callback(null, existingUser);
        });

        const profileData = { email: 'existing@email.com' };

        await expect(UserService.updateProfile(1, profileData))
          .rejects.toThrow('Email already exists');
      });
    });

    describe('updateOnlineStatus', () => {
      test('should update online status', async () => {
        mockDb.run.mockImplementation((sql, params, callback) => {
          callback(null);
        });

        const result = await UserService.updateOnlineStatus(1, true);

        expect(mockDb.run).toHaveBeenCalledWith(
          expect.stringContaining('UPDATE users'),
          [true, 1],
          expect.any(Function)
        );
        expect(result).toEqual({ message: 'Online status updated' });
      });
    });

    describe('getUserProfile', () => {
      test('should get user profile', async () => {
        const mockProfile = {
          id: 1,
          username: 'testuser',
          display_name: 'Test User',
          wins: 5,
          losses: 2
        };
        mockDb.get.mockImplementation((sql, params, callback) => {
          callback(null, mockProfile);
        });

        const result = await UserService.getUserProfile(1);

        expect(result).toEqual(mockProfile);
      });

      test('should reject non-existing user', async () => {
        mockDb.get.mockImplementation((sql, params, callback) => {
          callback(null, null);
        });

        await expect(UserService.getUserProfile(999))
          .rejects.toThrow('User not found');
      });
    });

    describe('sendFriendRequest', () => {
      test('should send friend request successfully', async () => {
        // 相手ユーザー存在チェック
        const friendUser = { id: 2, username: 'friend' };
        mockDb.get
          .mockImplementationOnce((sql, params, callback) => {
            callback(null, friendUser);
          })
          // 既存関係チェック
          .mockImplementationOnce((sql, params, callback) => {
            callback(null, null);
          });

        mockDb.run.mockImplementation((sql, params, callback) => {
          callback.call({ lastID: 1 }, null);
        });

        const result = await UserService.sendFriendRequest(1, 2);

        expect(result).toEqual({ message: 'Friend request sent', id: 1 });
      });

      test('should reject self friend request', async () => {
        await expect(UserService.sendFriendRequest(1, 1))
          .rejects.toThrow('Cannot add yourself as friend');
      });

      test('should reject request to non-existing user', async () => {
        mockDb.get.mockImplementation((sql, params, callback) => {
          callback(null, null);
        });

        await expect(UserService.sendFriendRequest(1, 999))
          .rejects.toThrow('User not found');
      });
    });

    describe('getFriends', () => {
      test('should get user friends', async () => {
        const mockFriends = [
          { id: 2, username: 'friend1', display_name: 'Friend One' },
          { id: 3, username: 'friend2', display_name: 'Friend Two' }
        ];
        mockDb.all.mockImplementation((sql, params, callback) => {
          callback(null, mockFriends);
        });

        const result = await UserService.getFriends(1);

        expect(result).toEqual(mockFriends);
      });
    });

    describe('getMatchHistory', () => {
      test('should get user match history', async () => {
        const mockHistory = [
          {
            id: 1,
            player1_id: 1,
            player2_id: 2,
            winner_id: 1,
            game_type: '1v1',
            played_at: '2025-09-18 13:00:00'
          }
        ];
        mockDb.all.mockImplementation((sql, params, callback) => {
          callback(null, mockHistory);
        });

        const result = await UserService.getMatchHistory(1, 10);

        expect(mockDb.all).toHaveBeenCalledWith(
          expect.stringContaining('WHERE mh.player1_id = ? OR mh.player2_id = ?'),
          [1, 1, 10],
          expect.any(Function)
        );
        expect(result).toEqual(mockHistory);
      });
    });

    describe('getUserStats', () => {
      test('should get user statistics', async () => {
        const mockStats = { wins: 5, losses: 2, total_games: 7, win_rate: 71.43 };
        const mockGameTypeStats = [{ game_type: '1v1', games_played: 5, wins: 3, losses: 2 }];
        const mockRecentMatches = [{ won: 1, played_at: '2025-09-18 13:00:00' }];

        mockDb.get.mockImplementation((sql, params, callback) => {
          callback(null, mockStats);
        });

        mockDb.all
          .mockImplementationOnce((sql, params, callback) => {
            callback(null, mockGameTypeStats);
          })
          .mockImplementationOnce((sql, params, callback) => {
            callback(null, mockRecentMatches);
          });

        const result = await UserService.getUserStats(1);

        expect(result).toEqual({
          overall: mockStats,
          by_game_type: mockGameTypeStats,
          recent_performance: mockRecentMatches
        });
      });
    });
  });
});