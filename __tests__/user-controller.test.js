// JWT のモック
jest.mock('jsonwebtoken', () => ({
  sign: jest.fn(() => 'mock.jwt.token'),
  verify: jest.fn()
}));

// User Serviceのモック
const mockUserService = {
  createUser: jest.fn(),
  authenticateUser: jest.fn(),
  updateOnlineStatus: jest.fn(),
  getUserProfile: jest.fn(),
  updateProfile: jest.fn(),
  searchUsers: jest.fn(),
  getFriends: jest.fn(),
  getFriendRequests: jest.fn(),
  sendFriendRequest: jest.fn(),
  acceptFriendRequest: jest.fn(),
  getMatchHistory: jest.fn(),
  getUserStats: jest.fn(),
  recordMatchHistory: jest.fn()
};

jest.mock('../api/services/user-service', () => mockUserService);

const UserController = require('../api/controllers/user-controller');

describe('UserController', () => {
  let mockRequest, mockReply;

  beforeEach(() => {
    jest.clearAllMocks();

    mockRequest = {
      body: {},
      params: {},
      query: {}
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
      mockUserService.updateOnlineStatus.mockResolvedValue({ message: 'Status updated' });

      await UserController.login(mockRequest, mockReply);

      expect(mockUserService.authenticateUser).toHaveBeenCalledWith('testuser', 'password123');
      expect(mockUserService.updateOnlineStatus).toHaveBeenCalledWith(1, true);
      expect(mockReply.send).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Login successful',
          user: userData,
          token: expect.any(String)
        })
      );
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

  // User Management拡張機能のテスト
  describe('User Management Extended Features', () => {

    describe('getProfile', () => {
      test('should get user profile successfully', async () => {
        const mockProfile = { id: 1, username: 'testuser', display_name: 'Test User' };
        mockUserService.getUserProfile.mockResolvedValue(mockProfile);

        mockRequest.params = { userId: '1' };

        await UserController.getProfile(mockRequest, mockReply);

        expect(mockUserService.getUserProfile).toHaveBeenCalledWith(1);
        expect(mockReply.send).toHaveBeenCalledWith({ profile: mockProfile });
      });

      test('should handle user not found', async () => {
        mockUserService.getUserProfile.mockRejectedValue(new Error('User not found'));

        mockRequest.params = { userId: '999' };

        await UserController.getProfile(mockRequest, mockReply);

        expect(mockReply.status).toHaveBeenCalledWith(404);
        expect(mockReply.send).toHaveBeenCalledWith({ error: 'User not found' });
      });
    });

    describe('updateProfile', () => {
      test('should update profile successfully', async () => {
        mockUserService.updateProfile.mockResolvedValue({ message: 'Profile updated successfully' });

        mockRequest.params = { userId: '1' };
        mockRequest.body = { display_name: 'New Name', bio: 'New bio' };

        await UserController.updateProfile(mockRequest, mockReply);

        expect(mockUserService.updateProfile).toHaveBeenCalledWith(1, {
          display_name: 'New Name',
          bio: 'New bio'
        });
        expect(mockReply.send).toHaveBeenCalledWith({ message: 'Profile updated successfully' });
      });
    });

    describe('searchUsers', () => {
      test('should search users successfully', async () => {
        const mockUsers = [
          { id: 1, username: 'alice', display_name: 'Alice' },
          { id: 2, username: 'alicia', display_name: 'Alicia' }
        ];
        mockUserService.searchUsers.mockResolvedValue(mockUsers);

        mockRequest.query = { q: 'ali' };

        await UserController.searchUsers(mockRequest, mockReply);

        expect(mockUserService.searchUsers).toHaveBeenCalledWith('ali');
        expect(mockReply.send).toHaveBeenCalledWith({ users: mockUsers });
      });

      test('should reject short query', async () => {
        mockRequest.query = { q: 'a' };

        await UserController.searchUsers(mockRequest, mockReply);

        expect(mockReply.status).toHaveBeenCalledWith(400);
        expect(mockReply.send).toHaveBeenCalledWith({
          error: 'Query must be at least 2 characters'
        });
      });
    });

    describe('getFriends', () => {
      test('should get friends successfully', async () => {
        const mockFriends = [
          { id: 2, username: 'friend1', display_name: 'Friend One' }
        ];
        mockUserService.getFriends.mockResolvedValue(mockFriends);

        mockRequest.params = { userId: '1' };

        await UserController.getFriends(mockRequest, mockReply);

        expect(mockUserService.getFriends).toHaveBeenCalledWith(1);
        expect(mockReply.send).toHaveBeenCalledWith({ friends: mockFriends });
      });
    });

    describe('sendFriendRequest', () => {
      test('should send friend request successfully', async () => {
        mockUserService.sendFriendRequest.mockResolvedValue({
          message: 'Friend request sent',
          id: 1
        });

        mockRequest.params = { userId: '1' };
        mockRequest.body = { friendId: 2 };

        await UserController.sendFriendRequest(mockRequest, mockReply);

        expect(mockUserService.sendFriendRequest).toHaveBeenCalledWith(1, 2);
        expect(mockReply.send).toHaveBeenCalledWith({
          message: 'Friend request sent',
          id: 1
        });
      });
    });

    describe('getFriendRequests', () => {
      test('should get friend requests successfully', async () => {
        const mockRequests = [
          { id: 1, user_id: 2, username: 'requester1', display_name: 'Requester One' }
        ];
        mockUserService.getFriendRequests.mockResolvedValue(mockRequests);

        mockRequest.params = { userId: '1' };

        await UserController.getFriendRequests(mockRequest, mockReply);

        expect(mockUserService.getFriendRequests).toHaveBeenCalledWith(1);
        expect(mockReply.send).toHaveBeenCalledWith({
          friendRequests: mockRequests
        });
      });

      test('should handle service errors', async () => {
        mockUserService.getFriendRequests.mockRejectedValue(new Error('Database error'));

        mockRequest.params = { userId: '1' };

        await UserController.getFriendRequests(mockRequest, mockReply);

        expect(mockReply.status).toHaveBeenCalledWith(400);
        expect(mockReply.send).toHaveBeenCalledWith({ error: 'Database error' });
      });
    });

    describe('acceptFriendRequest', () => {
      test('should accept friend request successfully', async () => {
        mockUserService.acceptFriendRequest.mockResolvedValue({
          message: 'Friend request accepted'
        });

        mockRequest.params = { userId: '2', requestId: '1' };

        await UserController.acceptFriendRequest(mockRequest, mockReply);

        expect(mockUserService.acceptFriendRequest).toHaveBeenCalledWith(2, 1);
        expect(mockReply.send).toHaveBeenCalledWith({
          message: 'Friend request accepted'
        });
      });

      test('should handle service errors', async () => {
        mockUserService.acceptFriendRequest.mockRejectedValue(new Error('Friend request not found'));

        mockRequest.params = { userId: '2', requestId: '1' };

        await UserController.acceptFriendRequest(mockRequest, mockReply);

        expect(mockReply.status).toHaveBeenCalledWith(400);
        expect(mockReply.send).toHaveBeenCalledWith({ error: 'Friend request not found' });
      });
    });

    describe('updateOnlineStatus', () => {
      test('should update online status successfully', async () => {
        mockUserService.updateOnlineStatus.mockResolvedValue({
          message: 'Online status updated'
        });

        mockRequest.params = { userId: '1' };
        mockRequest.body = { isOnline: true };

        await UserController.updateOnlineStatus(mockRequest, mockReply);

        expect(mockUserService.updateOnlineStatus).toHaveBeenCalledWith(1, true);
        expect(mockReply.send).toHaveBeenCalledWith({
          message: 'Online status updated'
        });
      });

      test('should handle service errors', async () => {
        mockUserService.updateOnlineStatus.mockRejectedValue(new Error('Database error'));

        mockRequest.params = { userId: '1' };
        mockRequest.body = { isOnline: true };

        await UserController.updateOnlineStatus(mockRequest, mockReply);

        expect(mockReply.status).toHaveBeenCalledWith(400);
        expect(mockReply.send).toHaveBeenCalledWith({ error: 'Database error' });
      });
    });

    describe('getMatchHistory', () => {
      test('should get match history successfully', async () => {
        const mockHistory = [
          {
            id: 1,
            player1_id: 1,
            player2_id: 2,
            winner_id: 1,
            game_type: '1v1'
          }
        ];
        mockUserService.getMatchHistory.mockResolvedValue(mockHistory);

        mockRequest.params = { userId: '1' };
        mockRequest.query = { limit: '10' };

        await UserController.getMatchHistory(mockRequest, mockReply);

        expect(mockUserService.getMatchHistory).toHaveBeenCalledWith(1, 10);
        expect(mockReply.send).toHaveBeenCalledWith({ match_history: mockHistory });
      });

      test('should use default limit', async () => {
        mockUserService.getMatchHistory.mockResolvedValue([]);

        mockRequest.params = { userId: '1' };
        mockRequest.query = {};

        await UserController.getMatchHistory(mockRequest, mockReply);

        expect(mockUserService.getMatchHistory).toHaveBeenCalledWith(1, 20);
      });
    });

    describe('getUserStats', () => {
      test('should get user stats successfully', async () => {
        const mockStats = {
          overall: { wins: 5, losses: 2, total_games: 7, win_rate: 71.43 },
          by_game_type: [{ game_type: '1v1', games_played: 5, wins: 3, losses: 2 }],
          recent_performance: [{ won: 1, played_at: '2025-09-18 13:00:00' }]
        };
        mockUserService.getUserStats.mockResolvedValue(mockStats);

        mockRequest.params = { userId: '1' };

        await UserController.getUserStats(mockRequest, mockReply);

        expect(mockUserService.getUserStats).toHaveBeenCalledWith(1);
        expect(mockReply.send).toHaveBeenCalledWith({ stats: mockStats });
      });
    });

    describe('recordMatch', () => {
      test('should record match successfully', async () => {
        mockUserService.recordMatchHistory.mockResolvedValue({
          message: 'Match history recorded',
          id: 1
        });

        const matchData = {
          player1_id: 1,
          player2_id: 2,
          winner_id: 1,
          player1_score: 5,
          player2_score: 3,
          game_type: '1v1'
        };
        mockRequest.body = matchData;

        await UserController.recordMatch(mockRequest, mockReply);

        expect(mockUserService.recordMatchHistory).toHaveBeenCalledWith(matchData);
        expect(mockReply.send).toHaveBeenCalledWith({
          message: 'Match history recorded',
          id: 1
        });
      });
    });

    describe('login', () => {
      test('should login and return JWT token', async () => {
        const mockUser = { id: 1, username: 'testuser' };
        mockUserService.authenticateUser.mockResolvedValue(mockUser);
        mockUserService.updateOnlineStatus.mockResolvedValue();

        mockRequest.body = { username: 'testuser', password: 'password123' };

        await UserController.login(mockRequest, mockReply);

        expect(mockUserService.authenticateUser).toHaveBeenCalledWith('testuser', 'password123');
        expect(mockUserService.updateOnlineStatus).toHaveBeenCalledWith(1, true);
        expect(mockReply.send).toHaveBeenCalledWith(
          expect.objectContaining({
            message: 'Login successful',
            user: { id: 1, username: 'testuser' },
            token: expect.any(String)
          })
        );
      });

      test('should handle invalid credentials', async () => {
        mockUserService.authenticateUser.mockRejectedValue(new Error('Invalid username or password'));

        mockRequest.body = { username: 'testuser', password: 'wrongpassword' };

        await UserController.login(mockRequest, mockReply);

        expect(mockReply.status).toHaveBeenCalledWith(400);
        expect(mockReply.send).toHaveBeenCalledWith({ error: 'Invalid username or password' });
      });

      test('should handle missing credentials', async () => {
        mockUserService.authenticateUser.mockRejectedValue(new Error('Invalid username or password'));
        
        mockRequest.body = { username: '', password: '' };

        await UserController.login(mockRequest, mockReply);

        expect(mockReply.status).toHaveBeenCalledWith(400);
        expect(mockReply.send).toHaveBeenCalledWith({ error: 'Invalid username or password' });
      });
    });

    // Note: recordMatch tests are covered by integration tests in app.test.js
  });
});