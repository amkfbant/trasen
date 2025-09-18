import { ApiService } from '../services/api-service.js';

export class TournamentFunctions {
  static async loadTournamentList(): Promise<void> {
    try {
      const data = await ApiService.getTournaments() as any;
      const listDiv = document.getElementById('tournamentList')!;

      if (data.tournaments.length === 0) {
        listDiv.innerHTML = '<p class="muted">トーナメントがありません。</p>';
        return;
      }

      let html = '<div style="display: grid; gap: 15px;">';
      data.tournaments.forEach((tournament: any) => {
        const statusText = tournament.status === 'waiting' ? '募集中' :
                          tournament.status === 'in_progress' ? '進行中' :
                          tournament.status === 'completed' ? '完了' : tournament.status;

        const statusColor = tournament.status === 'waiting' ? '#28a745' :
                           tournament.status === 'in_progress' ? '#ffc107' :
                           tournament.status === 'completed' ? '#6c757d' : '#dc3545';

        html += `
          <div style="border: 2px solid ${statusColor}; padding: 15px; border-radius: 8px; background: #f8f9fa;">
            <h4>${tournament.name} (ID: ${tournament.id})</h4>
            <p><strong>参加者数:</strong> ${tournament.player_count}/${tournament.max_players}</p>
            <p><strong>状態:</strong> <span style="color: ${statusColor}; font-weight: bold;">${statusText}</span></p>
            <p><strong>作成日:</strong> ${new Date(tournament.created_at).toLocaleString()}</p>
          </div>
        `;
      });
      html += '</div>';

      listDiv.innerHTML = html;
    } catch (error) {
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
          html += `<li>${index + 1}. ${player.alias}</li>`;
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
      const tournamentData = await ApiService.getTournament(tournamentId) as any;
      const playersData = await ApiService.getTournamentPlayers(tournamentId) as any;
      const matchesData = await ApiService.getTournamentMatches(tournamentId) as any;

      const tournament = tournamentData.tournament;
      const players = playersData.players;
      const matches = matchesData.matches;

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

        const roundMatches: { [key: number]: any[] } = {};
        matches.forEach((match: any) => {
          if (!roundMatches[match.round]) {
            roundMatches[match.round] = [];
          }
          roundMatches[match.round].push(match);
        });

        const totalRounds = Math.log2(tournament.max_players);

        Object.keys(roundMatches).sort((a, b) => parseInt(a) - parseInt(b)).forEach((roundNum: string) => {
          const round = parseInt(roundNum);
          const roundName = round === totalRounds ? '決勝' :
                           round === totalRounds - 1 ? '準決勝' :
                           round === 1 ? '1回戦' :
                           `第${round}ラウンド`;

          html += `<h6>${roundName}</h6>`;

          roundMatches[round].forEach((match: any) => {
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
      detailsDiv.innerHTML = "<p style='color: red;'>エラーが発生しました。</p>";
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

    const formHtml = `
      <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; margin: 10px 0;">
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
}