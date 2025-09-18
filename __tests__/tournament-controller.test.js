// Tournament Serviceのモック
const mockTournamentService = {
  createTournament: jest.fn(),
  getTournament: jest.fn(),
  getAllTournaments: jest.fn(),
  joinTournament: jest.fn(),
  getTournamentPlayers: jest.fn(),
  startTournament: jest.fn(),
  getTournamentMatches: jest.fn(),
  recordMatchResult: jest.fn()
};

jest.mock('../api/services/tournament-service', () => mockTournamentService);

const TournamentController = require('../api/controllers/tournament-controller');

describe('TournamentController', () => {
  let mockRequest, mockReply;

  beforeEach(() => {
    jest.clearAllMocks();

    mockRequest = {
      body: {},
      params: {}
    };

    mockReply = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn().mockReturnThis()
    };
  });

  describe('createTournament', () => {
    test('should create tournament successfully', async () => {
      const tournamentData = { id: 1, name: 'Test Tournament', maxPlayers: 4, status: 'waiting' };
      mockRequest.body = { name: 'Test Tournament', max_players: 4 };
      mockTournamentService.createTournament.mockResolvedValue(tournamentData);

      await TournamentController.createTournament(mockRequest, mockReply);

      expect(mockTournamentService.createTournament).toHaveBeenCalledWith('Test Tournament', 4);
      expect(mockReply.send).toHaveBeenCalledWith({
        message: 'Tournament created successfully',
        tournament: tournamentData
      });
    });

    test('should handle service errors', async () => {
      mockRequest.body = { name: '', max_players: 4 };
      mockTournamentService.createTournament.mockRejectedValue(new Error('Tournament name is required'));

      await TournamentController.createTournament(mockRequest, mockReply);

      expect(mockReply.status).toHaveBeenCalledWith(400);
      expect(mockReply.send).toHaveBeenCalledWith({ error: 'Tournament name is required' });
    });
  });

  describe('getTournament', () => {
    test('should get tournament successfully', async () => {
      const tournament = { id: 1, name: 'Test Tournament' };
      mockRequest.params = { id: '1' };
      mockTournamentService.getTournament.mockResolvedValue(tournament);

      await TournamentController.getTournament(mockRequest, mockReply);

      expect(mockTournamentService.getTournament).toHaveBeenCalledWith('1');
      expect(mockReply.send).toHaveBeenCalledWith({ tournament });
    });

    test('should return 404 for non-existing tournament', async () => {
      mockRequest.params = { id: '999' };
      mockTournamentService.getTournament.mockResolvedValue(null);

      await TournamentController.getTournament(mockRequest, mockReply);

      expect(mockReply.status).toHaveBeenCalledWith(404);
      expect(mockReply.send).toHaveBeenCalledWith({ error: 'Tournament not found' });
    });

    test('should handle service errors', async () => {
      mockRequest.params = { id: '1' };
      mockTournamentService.getTournament.mockRejectedValue(new Error('Database error'));

      await TournamentController.getTournament(mockRequest, mockReply);

      expect(mockReply.status).toHaveBeenCalledWith(500);
      expect(mockReply.send).toHaveBeenCalledWith({ error: 'Database error' });
    });
  });

  describe('getAllTournaments', () => {
    test('should get all tournaments successfully', async () => {
      const tournaments = [
        { id: 1, name: 'Tournament 1' },
        { id: 2, name: 'Tournament 2' }
      ];
      mockTournamentService.getAllTournaments.mockResolvedValue(tournaments);

      await TournamentController.getAllTournaments(mockRequest, mockReply);

      expect(mockTournamentService.getAllTournaments).toHaveBeenCalled();
      expect(mockReply.send).toHaveBeenCalledWith({ tournaments });
    });

    test('should handle service errors', async () => {
      mockTournamentService.getAllTournaments.mockRejectedValue(new Error('Database error'));

      await TournamentController.getAllTournaments(mockRequest, mockReply);

      expect(mockReply.status).toHaveBeenCalledWith(500);
      expect(mockReply.send).toHaveBeenCalledWith({ error: 'Database error' });
    });
  });

  describe('joinTournament', () => {
    test('should join tournament successfully', async () => {
      const playerData = { id: 1, alias: 'TestPlayer' };
      mockRequest.params = { id: '1' };
      mockRequest.body = { alias: 'TestPlayer', user_id: 1 };
      mockTournamentService.joinTournament.mockResolvedValue(playerData);

      await TournamentController.joinTournament(mockRequest, mockReply);

      expect(mockTournamentService.joinTournament).toHaveBeenCalledWith('1', 'TestPlayer', 1);
      expect(mockReply.send).toHaveBeenCalledWith({
        message: 'Successfully joined tournament',
        player: playerData
      });
    });

    test('should handle join errors', async () => {
      mockRequest.params = { id: '1' };
      mockRequest.body = { alias: 'TestPlayer' };
      mockTournamentService.joinTournament.mockRejectedValue(new Error('Tournament is full'));

      await TournamentController.joinTournament(mockRequest, mockReply);

      expect(mockReply.status).toHaveBeenCalledWith(400);
      expect(mockReply.send).toHaveBeenCalledWith({ error: 'Tournament is full' });
    });
  });

  describe('startTournament', () => {
    test('should start tournament successfully', async () => {
      const result = { message: 'Tournament started successfully' };
      mockRequest.params = { id: '1' };
      mockTournamentService.startTournament.mockResolvedValue(result);

      await TournamentController.startTournament(mockRequest, mockReply);

      expect(mockTournamentService.startTournament).toHaveBeenCalledWith('1');
      expect(mockReply.send).toHaveBeenCalledWith(result);
    });

    test('should handle start errors', async () => {
      mockRequest.params = { id: '1' };
      mockTournamentService.startTournament.mockRejectedValue(new Error('Need exactly 4 players to start'));

      await TournamentController.startTournament(mockRequest, mockReply);

      expect(mockReply.status).toHaveBeenCalledWith(400);
      expect(mockReply.send).toHaveBeenCalledWith({ error: 'Need exactly 4 players to start' });
    });
  });

  describe('recordMatchResult', () => {
    test('should record match result successfully', async () => {
      const result = { message: 'Match result recorded successfully' };
      mockRequest.params = { tournamentId: '1', matchId: '1' };
      mockRequest.body = { winner_alias: 'Player1', player1_score: 5, player2_score: 3 };
      mockTournamentService.recordMatchResult.mockResolvedValue(result);

      await TournamentController.recordMatchResult(mockRequest, mockReply);

      expect(mockTournamentService.recordMatchResult).toHaveBeenCalledWith('1', '1', 'Player1', 5, 3);
      expect(mockReply.send).toHaveBeenCalledWith(result);
    });

    test('should handle recording errors', async () => {
      mockRequest.params = { tournamentId: '1', matchId: '1' };
      mockRequest.body = { winner_alias: '', player1_score: 5, player2_score: 3 };
      mockTournamentService.recordMatchResult.mockRejectedValue(new Error('Winner and scores are required'));

      await TournamentController.recordMatchResult(mockRequest, mockReply);

      expect(mockReply.status).toHaveBeenCalledWith(400);
      expect(mockReply.send).toHaveBeenCalledWith({ error: 'Winner and scores are required' });
    });
  });

  describe('getTournamentPlayers', () => {
    test('should get tournament players successfully', async () => {
      const players = [{ alias: 'Player1' }, { alias: 'Player2' }];
      mockRequest.params = { id: '1' };
      mockTournamentService.getTournamentPlayers.mockResolvedValue(players);

      await TournamentController.getTournamentPlayers(mockRequest, mockReply);

      expect(mockTournamentService.getTournamentPlayers).toHaveBeenCalledWith('1');
      expect(mockReply.send).toHaveBeenCalledWith({ players });
    });

    test('should handle service errors', async () => {
      mockRequest.params = { id: '1' };
      mockTournamentService.getTournamentPlayers.mockRejectedValue(new Error('Database error'));

      await TournamentController.getTournamentPlayers(mockRequest, mockReply);

      expect(mockReply.status).toHaveBeenCalledWith(500);
      expect(mockReply.send).toHaveBeenCalledWith({ error: 'Database error' });
    });
  });

  describe('getTournamentMatches', () => {
    test('should get tournament matches successfully', async () => {
      const matches = [
        { id: 1, round: 1, player1_alias: 'Player1', player2_alias: 'Player2' }
      ];
      mockRequest.params = { id: '1' };
      mockTournamentService.getTournamentMatches.mockResolvedValue(matches);

      await TournamentController.getTournamentMatches(mockRequest, mockReply);

      expect(mockTournamentService.getTournamentMatches).toHaveBeenCalledWith('1');
      expect(mockReply.send).toHaveBeenCalledWith({ matches });
    });

    test('should handle service errors', async () => {
      mockRequest.params = { id: '1' };
      mockTournamentService.getTournamentMatches.mockRejectedValue(new Error('Database error'));

      await TournamentController.getTournamentMatches(mockRequest, mockReply);

      expect(mockReply.status).toHaveBeenCalledWith(500);
      expect(mockReply.send).toHaveBeenCalledWith({ error: 'Database error' });
    });
  });
});