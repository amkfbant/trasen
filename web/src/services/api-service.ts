// Use environment variable for API base URL, fallback to localhost for development.
const API_BASE_URL =
  typeof import.meta !== 'undefined' &&
  (import.meta as any).env &&
  (import.meta as any).env.VITE_API_BASE_URL
    ? (import.meta as any).env.VITE_API_BASE_URL
    : 'http://localhost:3000';

export class ApiService {
  private static async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `HTTP ${response.status}`);
    }

    return response.json();
  }

  // User API
  static async registerUser(username: string, password: string) {
    return this.request('/register', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });
  }

  static async loginUser(username: string, password: string) {
    return this.request('/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });
  }

  // Tournament API
  static async createTournament(name: string, maxPlayers: number = 4) {
    return this.request('/tournaments', {
      method: 'POST',
      body: JSON.stringify({ name, max_players: maxPlayers }),
    });
  }

  static async getTournaments() {
    return this.request('/tournaments');
  }

  static async getTournament(id: number) {
    return this.request(`/tournaments/${id}`);
  }

  static async joinTournament(id: number, alias: string) {
    return this.request(`/tournaments/${id}/join`, {
      method: 'POST',
      body: JSON.stringify({ alias }),
    });
  }

  static async getTournamentPlayers(id: number) {
    return this.request(`/tournaments/${id}/players`);
  }

  static async startTournament(id: number) {
    return this.request(`/tournaments/${id}/start`, {
      method: 'POST',
      body: JSON.stringify({}),
    });
  }

  static async getTournamentMatches(id: number) {
    return this.request(`/tournaments/${id}/matches`);
  }

  static async recordMatchResult(tournamentId: number, matchId: number, winnerAlias: string, player1Score: number, player2Score: number) {
    return this.request(`/tournaments/${tournamentId}/matches/${matchId}/result`, {
      method: 'POST',
      body: JSON.stringify({
        winner_alias: winnerAlias,
        player1_score: player1Score,
        player2_score: player2Score,
      }),
    });
  }
}