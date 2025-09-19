// 環境変数を設定
process.env.JWT_SECRET = 'test-secret-key';

// データベースのモック
const mockDb = {
  get: jest.fn(),
  all: jest.fn(),
  run: jest.fn(),
  serialize: jest.fn()
};

// データベースモジュールをモック
jest.mock('../api/database', () => ({
  db: mockDb
}));

const TournamentSessionService = require('../api/services/tournament-session-service');

describe('TournamentSessionService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('addTournamentPlayer', () => {
    test('should add tournament player successfully', async () => {
      // Mock tournament check
      const mockTournament = { id: 1, max_players: 4, current_players: 2 };
      
      mockDb.get
        .mockImplementationOnce((sql, params, callback) => {
          // Tournament query
          callback(null, mockTournament);
        })
        .mockImplementationOnce((sql, params, callback) => {
          // Duplicate check query
          callback(null, null); // No existing player
        });

      mockDb.run.mockImplementation((sql, params, callback) => {
        callback.call({ lastID: 1 }, null);
      });

      const result = await TournamentSessionService.addTournamentPlayer(1, 'TestPlayer', 123);

      expect(result).toEqual({
        playerId: 1,
        tournamentId: 1,
        alias: 'TestPlayer',
        userId: 123
      });
    });

    test('should reject when tournament is full', async () => {
      const mockTournament = { id: 1, max_players: 2, current_players: 2 };
      
      mockDb.get.mockImplementation((sql, params, callback) => {
        callback(null, mockTournament);
      });

      await expect(TournamentSessionService.addTournamentPlayer(1, 'TestPlayer', 123))
        .rejects.toThrow('Tournament is full');
    });

    test('should reject duplicate alias', async () => {
      const mockTournament = { id: 1, max_players: 4, current_players: 1 };
      const mockExistingPlayer = { id: 1, player_alias: 'TestPlayer' };
      
      mockDb.get
        .mockImplementationOnce((sql, params, callback) => {
          callback(null, mockTournament);
        })
        .mockImplementationOnce((sql, params, callback) => {
          callback(null, mockExistingPlayer); // Existing player found
        });

      await expect(TournamentSessionService.addTournamentPlayer(1, 'TestPlayer', 123))
        .rejects.toThrow('Alias already taken');
    });
  });

  describe('getTournamentPlayers', () => {
    test('should get tournament players with user info', async () => {
      const mockPlayers = [
        {
          id: 1,
          tournament_id: 1,
          player_alias: 'Player1',
          user_id: 123,
          username: 'user1',
          display_name: 'User One',
          is_online: true
        },
        {
          id: 2,
          tournament_id: 1,
          player_alias: 'AnonymousPlayer',
          user_id: null,
          username: null,
          display_name: null,
          is_online: null
        }
      ];

      mockDb.all.mockImplementation((sql, params, callback) => {
        callback(null, mockPlayers);
      });

      const result = await TournamentSessionService.getTournamentPlayers(1);

      expect(mockDb.all).toHaveBeenCalledWith(
        expect.stringContaining('LEFT JOIN users'),
        [1],
        expect.any(Function)
      );
      expect(result).toEqual(mockPlayers);
    });

    test('should handle empty player list', async () => {
      mockDb.all.mockImplementation((sql, params, callback) => {
        callback(null, []);
      });

      const result = await TournamentSessionService.getTournamentPlayers(1);

      expect(result).toEqual([]);
    });

    test('should handle database errors', async () => {
      mockDb.all.mockImplementation((sql, params, callback) => {
        callback(new Error('Database error'), null);
      });

      await expect(TournamentSessionService.getTournamentPlayers(1))
        .rejects.toThrow('Database error');
    });
  });

  // Note: createTournamentSession and validateToken tests are skipped
  // due to complex JWT and crypto mocking requirements.
  // These are covered by integration tests.
});

