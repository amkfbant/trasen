// データベースのモック
const mockDb = {
  get: jest.fn(),
  all: jest.fn(),
  run: jest.fn(),
  serialize: jest.fn(),
  prepare: jest.fn()
};

// データベースモジュールをモック
jest.mock('../api/database', () => ({
  db: mockDb
}));

const TournamentService = require('../api/services/tournament-service');

describe('TournamentService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createTournament', () => {
    test('should create tournament successfully', async () => {
      mockDb.run.mockImplementation((sql, params, callback) => {
        callback.call({ lastID: 1 }, null);
      });

      const result = await TournamentService.createTournament('Test Tournament', 4);

      expect(mockDb.run).toHaveBeenCalledWith(
        'INSERT INTO tournaments (name, max_players) VALUES (?, ?)',
        ['Test Tournament', 4],
        expect.any(Function)
      );
      expect(result).toEqual({ id: 1, name: 'Test Tournament', maxPlayers: 4, status: 'waiting' });
    });

    test('should throw error for missing name', async () => {
      await expect(TournamentService.createTournament('', 4)).rejects.toThrow('Tournament name is required');
    });

    test('should throw error for invalid max_players', async () => {
      await expect(TournamentService.createTournament('Test', 3)).rejects.toThrow('Max players must be 2, 4, 8, or 16');
      await expect(TournamentService.createTournament('Test', 32)).rejects.toThrow('Max players must be 2, 4, 8, or 16');
    });

    test('should accept valid max_players values', async () => {
      mockDb.run.mockImplementation((sql, params, callback) => {
        callback.call({ lastID: 1 }, null);
      });

      for (const maxPlayers of [2, 4, 8, 16]) {
        await TournamentService.createTournament(`Test ${maxPlayers}`, maxPlayers);
        expect(mockDb.run).toHaveBeenLastCalledWith(
          'INSERT INTO tournaments (name, max_players) VALUES (?, ?)',
          [`Test ${maxPlayers}`, maxPlayers],
          expect.any(Function)
        );
      }
    });
  });

  describe('generateBracket', () => {
    const tournamentId = 1;

    test('should generate bracket for 2 players', () => {
      const players = [{ alias: 'Player1' }, { alias: 'Player2' }];
      const matches = TournamentService.generateBracket(players, tournamentId);

      expect(matches).toHaveLength(1);
      expect(matches[0]).toEqual({
        tournament_id: tournamentId,
        round: 1,
        match_number: 1,
        player1_alias: 'Player1',
        player2_alias: 'Player2',
        player1_id: null,
        player2_id: null
      });
    });

    test('should generate bracket for 4 players', () => {
      const players = [
        { alias: 'Player1' }, { alias: 'Player2' },
        { alias: 'Player3' }, { alias: 'Player4' }
      ];
      const matches = TournamentService.generateBracket(players, tournamentId);

      expect(matches).toHaveLength(2);
      expect(matches[0]).toEqual({
        tournament_id: tournamentId,
        round: 1,
        match_number: 1,
        player1_alias: 'Player1',
        player2_alias: 'Player2',
        player1_id: null,
        player2_id: null
      });
      expect(matches[1]).toEqual({
        tournament_id: tournamentId,
        round: 1,
        match_number: 2,
        player1_alias: 'Player3',
        player2_alias: 'Player4',
        player1_id: null,
        player2_id: null
      });
    });

    test('should generate bracket for 8 players', () => {
      const players = Array.from({ length: 8 }, (_, i) => ({ alias: `Player${i + 1}` }));
      const matches = TournamentService.generateBracket(players, tournamentId);

      expect(matches).toHaveLength(4);
      for (let i = 0; i < 4; i++) {
        expect(matches[i]).toEqual({
          tournament_id: tournamentId,
          round: 1,
          match_number: i + 1,
          player1_alias: `Player${i * 2 + 1}`,
          player2_alias: `Player${i * 2 + 2}`,
          player1_id: null,
          player2_id: null
        });
      }
    });

    test('should generate bracket for 16 players', () => {
      const players = Array.from({ length: 16 }, (_, i) => ({ alias: `Player${i + 1}` }));
      const matches = TournamentService.generateBracket(players, tournamentId);

      expect(matches).toHaveLength(8);
      for (let i = 0; i < 8; i++) {
        expect(matches[i]).toEqual({
          tournament_id: tournamentId,
          round: 1,
          match_number: i + 1,
          player1_alias: `Player${i * 2 + 1}`,
          player2_alias: `Player${i * 2 + 2}`,
          player1_id: null,
          player2_id: null
        });
      }
    });

    test('should generate bracket with user IDs for logged-in players', () => {
      const players = [
        { alias: 'Player1', user_id: 1 },
        { alias: 'Player2', user_id: 2 }
      ];
      const matches = TournamentService.generateBracket(players, tournamentId);

      expect(matches).toHaveLength(1);
      expect(matches[0]).toEqual({
        tournament_id: tournamentId,
        round: 1,
        match_number: 1,
        player1_alias: 'Player1',
        player2_alias: 'Player2',
        player1_id: 1,
        player2_id: 2
      });
    });

    test('should handle mix of logged-in and anonymous players', () => {
      const players = [
        { alias: 'LoggedPlayer', user_id: 1 },
        { alias: 'AnonymousPlayer', user_id: null }
      ];
      const matches = TournamentService.generateBracket(players, tournamentId);

      expect(matches).toHaveLength(1);
      expect(matches[0]).toEqual({
        tournament_id: tournamentId,
        round: 1,
        match_number: 1,
        player1_alias: 'LoggedPlayer',
        player2_alias: 'AnonymousPlayer',
        player1_id: 1,
        player2_id: null
      });
    });

    test('should handle player_alias vs alias field names', () => {
      const players = [
        { player_alias: 'Player1', user_id: 1 },
        { alias: 'Player2', user_id: 2 }
      ];
      const matches = TournamentService.generateBracket(players, tournamentId);

      expect(matches[0].player1_alias).toBe('Player1');
      expect(matches[0].player2_alias).toBe('Player2');
      expect(matches[0].player1_id).toBe(1);
      expect(matches[0].player2_id).toBe(2);
    });
  });

  describe('joinTournament', () => {
    test('should join tournament successfully', async () => {
      const tournament = { id: 1, status: 'waiting', max_players: 4 };
      const players = [{ alias: 'ExistingPlayer' }];

      // トーナメント存在確認
      mockDb.get.mockImplementationOnce((sql, params, callback) => {
        callback(null, tournament);
      });

      // 参加者数確認
      mockDb.all.mockImplementationOnce((sql, params, callback) => {
        callback(null, players);
      });

      // エイリアス重複確認
      mockDb.get.mockImplementationOnce((sql, params, callback) => {
        callback(null, null);
      });

      // 参加者追加
      mockDb.run.mockImplementation((sql, params, callback) => {
        callback.call({ lastID: 2 }, null);
      });

      const result = await TournamentService.joinTournament(1, 'NewPlayer');

      expect(result).toEqual({ id: 2, alias: 'NewPlayer' });
    });

    test('should throw error for missing alias', async () => {
      await expect(TournamentService.joinTournament(1, '')).rejects.toThrow('Alias is required');
    });

    test('should throw error for non-existing tournament', async () => {
      mockDb.get.mockImplementation((sql, params, callback) => {
        callback(null, null);
      });

      await expect(TournamentService.joinTournament(1, 'Player')).rejects.toThrow('Tournament not found');
    });

    test('should throw error for full tournament', async () => {
      const tournament = { id: 1, status: 'waiting', max_players: 2 };
      const players = [{ alias: 'Player1' }, { alias: 'Player2' }];

      mockDb.get.mockImplementationOnce((sql, params, callback) => {
        callback(null, tournament);
      });

      mockDb.all.mockImplementationOnce((sql, params, callback) => {
        callback(null, players);
      });

      await expect(TournamentService.joinTournament(1, 'Player3')).rejects.toThrow('Tournament is full');
    });

    test('should throw error for duplicate alias', async () => {
      const tournament = { id: 1, status: 'waiting', max_players: 4 };
      const players = [{ alias: 'ExistingPlayer' }];
      const existingAlias = { alias: 'ExistingPlayer' };

      mockDb.get.mockImplementationOnce((sql, params, callback) => {
        callback(null, tournament);
      });

      mockDb.all.mockImplementationOnce((sql, params, callback) => {
        callback(null, players);
      });

      mockDb.get.mockImplementationOnce((sql, params, callback) => {
        callback(null, existingAlias);
      });

      await expect(TournamentService.joinTournament(1, 'ExistingPlayer')).rejects.toThrow('Alias already taken');
    });
  });

  describe('recordMatchResult', () => {
    test('should throw error for missing parameters', async () => {
      await expect(TournamentService.recordMatchResult(1, 1, '', 5, 3)).rejects.toThrow('Winner and scores are required');
      await expect(TournamentService.recordMatchResult(1, 1, 'Player1', undefined, 3)).rejects.toThrow('Winner and scores are required');
      await expect(TournamentService.recordMatchResult(1, 1, 'Player1', 5, undefined)).rejects.toThrow('Winner and scores are required');
    });

    test('should throw error for non-existing match', async () => {
      mockDb.get.mockImplementation((sql, params, callback) => {
        callback(null, null);
      });

      await expect(TournamentService.recordMatchResult(1, 999, 'Player1', 5, 3)).rejects.toThrow('Match not found');
    });

    test('should throw error for already completed match', async () => {
      const completedMatch = { id: 1, status: 'completed', player1_alias: 'Player1', player2_alias: 'Player2' };

      mockDb.get.mockImplementation((sql, params, callback) => {
        callback(null, completedMatch);
      });

      await expect(TournamentService.recordMatchResult(1, 1, 'Player1', 5, 3)).rejects.toThrow('Match already completed');
    });

    test('should throw error for invalid winner', async () => {
      const match = { id: 1, status: 'pending', player1_alias: 'Player1', player2_alias: 'Player2' };

      mockDb.get.mockImplementation((sql, params, callback) => {
        callback(null, match);
      });

      await expect(TournamentService.recordMatchResult(1, 1, 'InvalidPlayer', 5, 3)).rejects.toThrow('Winner must be one of the match players');
    });
  });

  describe('getTournament', () => {
    test('should return tournament if exists', async () => {
      const tournament = { id: 1, name: 'Test Tournament', status: 'waiting' };

      mockDb.get.mockImplementation((sql, params, callback) => {
        callback(null, tournament);
      });

      const result = await TournamentService.getTournament(1);

      expect(mockDb.get).toHaveBeenCalledWith(
        'SELECT * FROM tournaments WHERE id = ?',
        [1],
        expect.any(Function)
      );
      expect(result).toEqual(tournament);
    });

    test('should return null if tournament does not exist', async () => {
      mockDb.get.mockImplementation((sql, params, callback) => {
        callback(null, null);
      });

      const result = await TournamentService.getTournament(999);

      expect(result).toBeNull();
    });
  });

  describe('getAllTournaments', () => {
    test('should return all tournaments', async () => {
      const tournaments = [
        { id: 1, name: 'Tournament 1' },
        { id: 2, name: 'Tournament 2' }
      ];

      mockDb.all.mockImplementation((sql, callback) => {
        callback(null, tournaments);
      });

      const result = await TournamentService.getAllTournaments();

      expect(mockDb.all).toHaveBeenCalledWith(
        expect.stringContaining('FROM tournaments t'),
        expect.any(Function)
      );
      expect(result).toEqual(tournaments);
    });

    test('should return empty array if no tournaments', async () => {
      mockDb.all.mockImplementation((sql, callback) => {
        callback(null, null);
      });

      const result = await TournamentService.getAllTournaments();

      expect(result).toEqual([]);
    });
  });
});