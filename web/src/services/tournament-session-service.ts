export class TournamentSessionService {
  private static API_BASE_URL = 'http://localhost:3000';

  // トーナメント参加（トークン生成）
  static async joinTournament(tournamentId: number, alias: string): Promise<any> {
    try {
      const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
      
      const response = await fetch(`${this.API_BASE_URL}/tournaments/join`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(currentUser.token && { 'Authorization': `Bearer ${currentUser.token}` })
        },
        body: JSON.stringify({
          tournamentId,
          alias
        })
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to join tournament');
      }

      // トークンをセッションストレージに保存
      sessionStorage.setItem('tournament_token', data.session.token);
      sessionStorage.setItem('tournament_session', JSON.stringify(data.session));

      return data.session;
    } catch (error) {
      console.error('Error joining tournament:', error);
      throw error;
    }
  }

  // トークン検証
  static async validateToken(token: string): Promise<any> {
    try {
      const response = await fetch(`${this.API_BASE_URL}/tournaments/validate-token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ token })
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Token validation failed');
      }

      return data.session;
    } catch (error) {
      console.error('Error validating token:', error);
      throw error;
    }
  }

  // 現在のトーナメントセッション取得
  static getCurrentSession(): any {
    const sessionData = sessionStorage.getItem('tournament_session');
    return sessionData ? JSON.parse(sessionData) : null;
  }

  // 現在のトークン取得
  static getCurrentToken(): string | null {
    return sessionStorage.getItem('tournament_token');
  }

  // セッション削除
  static clearSession(): void {
    sessionStorage.removeItem('tournament_token');
    sessionStorage.removeItem('tournament_session');
  }

  // トーナメント参加者一覧取得
  static async getTournamentPlayers(tournamentId: number): Promise<any[]> {
    try {
      console.log('Fetching tournament players for tournament:', tournamentId);
      const response = await fetch(`${this.API_BASE_URL}/tournaments/${tournamentId}/players`);
      const data = await response.json();
      console.log('Tournament players response:', data);
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to get tournament players');
      }

      return data.players || [];
    } catch (error) {
      console.error('Error getting tournament players:', error);
      throw error;
    }
  }

  // 試合記録（トークン方式）
  static async recordMatch(matchData: {
    player1_alias: string;
    player2_alias: string;
    winner_alias: string;
    player1_score: number;
    player2_score: number;
    tournament_id: number;
  }): Promise<any> {
    try {
      const token = this.getCurrentToken();
      if (!token) {
        throw new Error('No tournament session found');
      }

      // トークンからセッション情報を取得
      const sessionInfo = await this.validateToken(token);
      
      // トークンハッシュを生成（サーバー側で使用）
      const tokenHash = await this.generateTokenHash(token);

      const response = await fetch(`${this.API_BASE_URL}/matches/record`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...matchData,
          session_token_hash: tokenHash,
          player1_id: sessionInfo.userId,
          player2_id: null, // 対戦相手のID（必要に応じて）
          ...(matchData.winner_alias && matchData.winner_alias === sessionInfo.alias
            ? { winner_id: sessionInfo.userId }
            : {})
        })
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to record match');
      }

      return data;
    } catch (error) {
      console.error('Error recording match:', error);
      throw error;
    }
  }

  // トークンハッシュ生成（簡易版）
  private static async generateTokenHash(token: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(token);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  // セッション有効性チェック
  static isSessionValid(): boolean {
    const session = this.getCurrentSession();
    if (!session) return false;

    const now = new Date();
    const expiresAt = new Date(session.expiresAt);
    
    return now < expiresAt;
  }

  // セッション期限切れチェック
  static isSessionExpired(): boolean {
    return !this.isSessionValid();
  }
}
