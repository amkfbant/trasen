import { ApiService } from '../services/api-service.js';
import { TournamentSessionService } from '../services/tournament-session-service.js';

export class TournamentFunctions {
  static async loadTournamentList(): Promise<void> {
    try {
      const data = await ApiService.getTournaments() as any;
      console.log('Tournament data:', data);
      const listDiv = document.getElementById('tournamentList')!;

      if (data.tournaments.length === 0) {
        listDiv.innerHTML = '<p class="muted">トーナメントがありません。</p>';
        return;
      }

      let html = '<div style="display: grid; gap: 15px;">';
      data.tournaments.forEach((tournament: any) => {
        console.log('Tournament:', tournament);
        const statusText = tournament.status === 'waiting' ? '募集中' :
                          tournament.status === 'in_progress' ? '進行中' :
                          tournament.status === 'completed' ? '完了' : tournament.status;

        const statusColor = tournament.status === 'waiting' ? '#28a745' :
                           tournament.status === 'in_progress' ? '#ffc107' :
                           tournament.status === 'completed' ? '#6c757d' : '#dc3545';

        const playerCount = tournament.player_count || 0;
        const maxPlayers = tournament.max_players || 0;

        html += `
          <div style="border: 2px solid ${statusColor}; padding: 15px; border-radius: 8px; background: #f8f9fa;">
            <h4>${tournament.name} (ID: ${tournament.id})</h4>
            <p><strong>参加者数:</strong> ${playerCount}/${maxPlayers}</p>
            <p><strong>状態:</strong> <span style="color: ${statusColor}; font-weight: bold;">${statusText}</span></p>
            <p><strong>作成日:</strong> ${new Date(tournament.created_at).toLocaleString()}</p>
          </div>
        `;
      });
      html += '</div>';

      listDiv.innerHTML = html;
    } catch (error) {
      console.error('Error loading tournament list:', error);
      document.getElementById('tournamentList')!.innerHTML =
        '<p style="color: red;">トーナメント一覧の読み込みに失敗しました。</p>';
    }
  }

  static async checkPlayers(): Promise<void> {
    const tournamentIdInput = document.getElementById('manageTournamentId') as HTMLInputElement;
    const tournamentId = parseInt(tournamentIdInput.value);

    if (!tournamentId) {
      alert('トーナメントIDを入力してください。');
      return;
    }

    try {
      const data = await ApiService.getTournamentPlayers(tournamentId) as any;
      const detailsDiv = document.getElementById('tournamentDetails')!;

      let html = `<h4>参加者一覧 (トーナメントID: ${tournamentId})</h4>`;
      if (data.players.length === 0) {
        html += '<p class="muted">参加者がいません。</p>';
      } else {
        html += '<ul>';
        data.players.forEach((player: any, index: number) => {
          console.log('Player data:', player);
          const alias = player.player_alias || player.alias || 'Unknown';
          html += `<li>${index + 1}. ${alias}</li>`;
        });
        html += '</ul>';
      }

      detailsDiv.innerHTML = html;
    } catch (error) {
      document.getElementById('tournamentDetails')!.innerHTML =
        '<p style="color: red;">参加者情報の取得に失敗しました。</p>';
    }
  }

  static async loadTournamentDetails(): Promise<void> {
    const tournamentIdInput = document.getElementById('manageTournamentId') as HTMLInputElement;
    const tournamentId = parseInt(tournamentIdInput.value);

    if (!tournamentId) {
      alert('トーナメントIDを入力してください。');
      return;
    }

    const detailsDiv = document.getElementById('tournamentDetails')!;

    try {
      console.log('Loading tournament details for ID:', tournamentId);
      
      const tournamentData = await ApiService.getTournament(tournamentId) as any;
      console.log('Tournament data:', tournamentData);
      
      const playersData = await ApiService.getTournamentPlayers(tournamentId) as any;
      console.log('Players data:', playersData);
      
      const matchesData = await ApiService.getTournamentMatches(tournamentId) as any;
      console.log('Matches data:', matchesData);

      const tournament = tournamentData.tournament;
      const players = playersData.players || [];
      const matches = matchesData.matches || [];

      let html = `
        <h4>トーナメント: ${tournament.name}</h4>
        <p><strong>状態:</strong> ${tournament.status} | <strong>参加者数:</strong> ${players.length}/${tournament.max_players}</p>
      `;

      if (tournament.status === 'waiting') {
        if (players.length === tournament.max_players) {
          html += `
            <button onclick="window.tournamentFunctions.startTournament(${tournamentId})"
                    style="padding: 10px 20px; background: #28a745; color: white; border: none; border-radius: 5px; margin: 10px 0;">
              トーナメント開始
            </button>
          `;
        } else {
          html += `<p style='color: orange;'>${tournament.max_players}人の参加者が必要です。現在: ${players.length}人</p>`;
        }
      } else if (tournament.status === 'in_progress') {
        html += "<h5>試合状況</h5>";
        
        console.log('Tournament status: in_progress');
        console.log('Tournament max_players:', tournament.max_players);
        console.log('Matches data:', matches);

        const roundMatches: { [key: number]: any[] } = {};
        matches.forEach((match: any) => {
          console.log('Processing match:', match);
          if (!roundMatches[match.round]) {
            roundMatches[match.round] = [];
          }
          roundMatches[match.round].push(match);
        });

        console.log('RoundMatches grouped:', roundMatches);
        const totalRounds = Math.log2(tournament.max_players);
        console.log('Total rounds calculated:', totalRounds);

        Object.keys(roundMatches).sort((a, b) => parseInt(a) - parseInt(b)).forEach((roundNum: string) => {
          const round = parseInt(roundNum);
          console.log('Processing round:', round);
          
          // 2人トーナメントの場合は特別処理
          let roundName;
          if (tournament.max_players === 2) {
            roundName = '決勝';
          } else {
            roundName = round === totalRounds ? '決勝' :
                       round === totalRounds - 1 ? '準決勝' :
                       round === 1 ? '1回戦' :
                       `第${round}ラウンド`;
          }

          console.log('Round name:', roundName);
          html += `<h6>${roundName}</h6>`;

          console.log('Matches in round', round, ':', roundMatches[round]);
          roundMatches[round].forEach((match: any) => {
            console.log('Rendering match:', match);
            const isLastRound = round === totalRounds;
            html += `
              <div style="border: 1px solid #ccc; padding: 10px; margin: 5px 0; border-radius: 5px;">
                <strong>試合${match.match_number}:</strong> ${match.player1_alias} vs ${match.player2_alias}
                ${match.status === 'completed'
                  ? isLastRound
                    ? `<br><span style="color: gold;">🏆 優勝: ${match.winner_alias} (${match.player1_score}-${match.player2_score})</span>`
                    : `<br><span style="color: green;">結果: ${match.winner_alias} 勝利 (${match.player1_score}-${match.player2_score})</span>`
                  : `<br>
                     <button onclick="window.tournamentFunctions.startTournamentMatch(${tournamentId}, ${match.id}, '${match.player1_alias}', '${match.player2_alias}')"
                             style="padding: 5px 10px; margin: 5px 5px 5px 0; background: #007bff; color: white; border: none; border-radius: 3px;">
                       🎮 ゲーム開始
                     </button>
                     <button onclick="window.tournamentFunctions.showResultForm(${match.id}, '${match.player1_alias}', '${match.player2_alias}')"
                             style="padding: 5px 10px; margin: 5px 0;">
                       📝 手動入力
                     </button>`
                }
              </div>
            `;
          });
        });
      } else if (tournament.status === 'completed') {
        const totalRounds = Math.log2(tournament.max_players);
        const finalMatch = matches.find((m: any) => m.round === totalRounds && m.status === 'completed');
        html += `<h5 style="color: gold;">🏆 トーナメント完了！</h5>`;
        html += `<p><strong>優勝者:</strong> ${finalMatch?.winner_alias}</p>`;
      }

      detailsDiv.innerHTML = html;
    } catch (error) {
      console.error('Error loading tournament details:', error);
      detailsDiv.innerHTML = `
        <div style='color: red; padding: 15px; border: 1px solid #dc3545; border-radius: 5px; background: #f8d7da;'>
          <h5>エラーが発生しました</h5>
          <p><strong>エラー詳細:</strong> ${error instanceof Error ? error.message : 'Unknown error'}</p>
          <p style="font-size: 12px; color: #666;">コンソールで詳細なエラー情報を確認してください。</p>
        </div>
      `;
    }
  }

  static async startTournament(tournamentId: number): Promise<void> {
    try {
      const data = await ApiService.startTournament(tournamentId);
      alert(`✅ Tournament started successfully!`);
      this.loadTournamentDetails();
    } catch (error) {
      alert(`❌ ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  static showResultForm(matchId: number, player1: string, player2: string): void {
    const detailsDiv = document.getElementById("tournamentDetails") as HTMLDivElement;

    // 既存の結果入力フォームを削除
    const existingForm = detailsDiv.querySelector(`#resultForm-${matchId}`);
    if (existingForm) {
      existingForm.closest('div')?.remove();
      return; // 既にフォームが表示されている場合は何もしない
    }

    const formHtml = `
      <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; margin: 10px 0;" id="resultFormContainer-${matchId}">
        <h6>試合結果入力: ${player1} vs ${player2}</h6>
        <form id="resultForm-${matchId}">
          <div style="margin: 10px 0;">
            <label>勝者:</label>
            <select name="winner" required style="padding: 5px; margin: 0 10px;">
              <option value="">選択してください</option>
              <option value="${player1}">${player1}</option>
              <option value="${player2}">${player2}</option>
            </select>
          </div>
          <div style="margin: 10px 0;">
            <label>${player1}のスコア:</label>
            <input type="number" name="player1_score" min="0" required style="padding: 5px; width: 60px; margin: 0 10px;">
            <label>${player2}のスコア:</label>
            <input type="number" name="player2_score" min="0" required style="padding: 5px; width: 60px; margin: 0 10px;">
          </div>
          <button type="button" onclick="window.tournamentFunctions.submitResult(${matchId})" style="padding: 8px 15px; background: #007bff; color: white; border: none; border-radius: 4px; margin-right: 10px;">
            結果を記録
          </button>
          <button type="button" onclick="window.tournamentFunctions.loadTournamentDetails()" style="padding: 8px 15px; background: #6c757d; color: white; border: none; border-radius: 4px;">
            キャンセル
          </button>
        </form>
      </div>
    `;

    detailsDiv.innerHTML += formHtml;
  }

  static async submitResult(matchId: number): Promise<void> {
    const form = document.getElementById(`resultForm-${matchId}`) as HTMLFormElement;
    const formData = new FormData(form);

    const tournamentId = (document.getElementById("manageTournamentId") as HTMLInputElement).value;

    try {
      await ApiService.recordMatchResult(
        parseInt(tournamentId),
        matchId,
        formData.get("winner") as string,
        parseInt(formData.get("player1_score") as string),
        parseInt(formData.get("player2_score") as string)
      );
      alert(`✅ Result recorded successfully!`);
      this.loadTournamentDetails();
    } catch (error) {
      alert(`❌ ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  static startTournamentMatch(tournamentId: number, matchId: number, player1: string, player2: string): void {
    const params = new URLSearchParams({
      tournamentId: tournamentId.toString(),
      matchId: matchId.toString(),
      player1: player1,
      player2: player2
    });
    window.location.hash = `/tournament-match?${params.toString()}`;
  }

  // トークン方式でのトーナメント参加
  static async joinTournamentWithToken(tournamentId: number, alias: string): Promise<void> {
    try {
      console.log('Joining tournament:', { tournamentId, alias });
      const session = await TournamentSessionService.joinTournament(tournamentId, alias);
      console.log('Tournament session created:', session);
      
      // セッション情報を表示
      this.showSessionInfo(session);
      
      // トーナメント参加者一覧を更新
      await this.loadTournamentPlayers(tournamentId);
      
      alert(`✅ トーナメントに参加しました！\nエイリアス: ${alias}\nトークン有効期限: ${new Date(session.expiresAt).toLocaleString()}`);
      
    } catch (error) {
      console.error('Error joining tournament:', error);
      let errorMessage = 'Unknown error';
      
      if (error instanceof Error) {
        errorMessage = error.message;
        
        // 特定のエラーメッセージを日本語に翻訳
        if (errorMessage.includes('Alias already taken')) {
          errorMessage = 'このエイリアスは既に使用されています。別のエイリアスを入力してください。';
        } else if (errorMessage.includes('Tournament not found')) {
          errorMessage = 'トーナメントが見つかりません。';
        } else if (errorMessage.includes('Tournament is full')) {
          errorMessage = 'トーナメントが満員です。参加者数を確認してください。';
        } else if (errorMessage.includes('Tournament already started')) {
          errorMessage = 'トーナメントは既に開始されています。';
        }
      }
      
      alert(`❌ トーナメント参加に失敗しました: ${errorMessage}`);
    }
  }

  // セッション情報表示
  static showSessionInfo(session: any): void {
    const sessionInfoDiv = document.getElementById('sessionInfo');
    if (!sessionInfoDiv) return;

    const isLoggedIn = localStorage.getItem('currentUser');
    const userInfo = isLoggedIn ? JSON.parse(isLoggedIn) : null;

    sessionInfoDiv.innerHTML = `
      <div style="padding: 15px; background: #e8f5e8; border: 2px solid #28a745; border-radius: 8px; margin: 10px 0;">
        <h4>🎮 トーナメントセッション情報</h4>
        <p><strong>エイリアス:</strong> ${session.alias}</p>
        <p><strong>トーナメントID:</strong> ${session.tournamentId}</p>
        ${session.userId ? `<p><strong>ユーザーID:</strong> ${session.userId}</p>` : '<p><strong>参加方式:</strong> 匿名参加</p>'}
        <p><strong>有効期限:</strong> ${new Date(session.expiresAt).toLocaleString()}</p>
        <p><strong>トークン:</strong> <code style="font-size: 12px; word-break: break-all;">${session.token.substring(0, 50)}...</code></p>
        <button onclick="window.tournamentFunctions.clearSession()" style="padding: 5px 10px; background: #dc3545; color: white; border: none; border-radius: 4px; margin-top: 10px;">
          セッション終了
        </button>
      </div>
    `;
  }

  // セッションクリア
  static clearSession(): void {
    TournamentSessionService.clearSession();
    const sessionInfoDiv = document.getElementById('sessionInfo');
    if (sessionInfoDiv) {
      sessionInfoDiv.innerHTML = '';
    }
    alert('セッションを終了しました。');
  }

  // トーナメント参加者一覧取得
  static async loadTournamentPlayers(tournamentId: number): Promise<void> {
    try {
      console.log('Loading tournament players for tournament:', tournamentId);
      const players = await TournamentSessionService.getTournamentPlayers(tournamentId);
      console.log('Tournament players:', players);
      const playersDiv = document.getElementById('tournamentPlayers');
      if (!playersDiv) return;

      let html = '<h4>参加者一覧</h4><div style="display: grid; gap: 10px;">';
      
      if (players && players.length > 0) {
        players.forEach((player: any) => {
          console.log('Player data:', player);
          const isOnline = player.is_online ? '🟢 オンライン' : '🔴 オフライン';
          const userInfo = player.username ? `@${player.username}` : '匿名プレイヤー';
          
          html += `
            <div style="padding: 10px; border: 1px solid #ddd; border-radius: 4px; background: #f8f9fa;">
              <strong>${player.player_alias || player.alias || 'Unknown'}</strong>
              <span style="color: #666; font-size: 12px;">${userInfo}</span>
              <span style="float: right; font-size: 12px;">${isOnline}</span>
            </div>
          `;
        });
      } else {
        html += '<p style="color: #666;">参加者がいません。</p>';
      }
      
      html += '</div>';
      playersDiv.innerHTML = html;
      
    } catch (error) {
      console.error('Error loading tournament players:', error);
      const playersDiv = document.getElementById('tournamentPlayers');
      if (playersDiv) {
        playersDiv.innerHTML = '<p style="color: red;">参加者一覧の読み込みに失敗しました。</p>';
      }
    }
  }

  // 試合記録（トークン方式）
  static async recordMatchWithToken(matchData: {
    player1_alias: string;
    player2_alias: string;
    winner_alias: string;
    player1_score: number;
    player2_score: number;
    tournament_id: number;
  }): Promise<void> {
    try {
      const result = await TournamentSessionService.recordMatch(matchData);
      console.log('Match recorded successfully:', result);
      alert('✅ 試合結果を記録しました！');
    } catch (error) {
      console.error('Error recording match:', error);
      alert(`❌ 試合記録に失敗しました: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}