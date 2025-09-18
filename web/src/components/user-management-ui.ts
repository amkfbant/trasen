export class UserManagementUI {
  static generateProfilePageHTML(userId: string): string {
    return `
      <nav>
        <a href="#/">Home</a> |
        <a href="#/profile">Profile</a> |
        <a href="#/search">Search Users</a> |
        <a href="#/friends">Friends</a> |
        <a href="#/match-history">Match History</a> |
        <a href="#/game">Game</a> |
        <a href="#/tournament">Tournament</a>
      </nav>
      <div style="max-width: 800px; margin: 0 auto; padding: 20px;">
        <h2>👤 User Profile</h2>
        <div id="profileContent">
          <div style="text-align: center; padding: 40px;">
            <div style="color: #666;">Loading profile...</div>
          </div>
        </div>

        <!-- Edit Profile Modal (Hidden by default) -->
        <div id="editProfileModal" style="display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); z-index: 1000;">
          <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); background: white; padding: 30px; border-radius: 8px; width: 90%; max-width: 500px;">
            <h3>Edit Profile</h3>
            <form id="editProfileForm">
              <div style="margin: 15px 0;">
                <label for="displayName">Display Name:</label><br>
                <input type="text" id="displayName" name="display_name" style="padding: 8px; width: 100%; margin-top: 5px; border: 1px solid #ddd; border-radius: 4px;">
              </div>
              <div style="margin: 15px 0;">
                <label for="email">Email:</label><br>
                <input type="email" id="email" name="email" style="padding: 8px; width: 100%; margin-top: 5px; border: 1px solid #ddd; border-radius: 4px;">
              </div>
              <div style="margin: 15px 0;">
                <label for="bio">Bio:</label><br>
                <textarea id="bio" name="bio" rows="3" style="padding: 8px; width: 100%; margin-top: 5px; border: 1px solid #ddd; border-radius: 4px; resize: vertical;"></textarea>
              </div>
              <div style="margin: 20px 0; text-align: right;">
                <button type="button" onclick="closeEditProfileModal()" style="padding: 10px 20px; margin-right: 10px; background: #6c757d; color: white; border: none; border-radius: 4px;">
                  Cancel
                </button>
                <button type="submit" style="padding: 10px 20px; background: #007bff; color: white; border: none; border-radius: 4px;">
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    `;
  }

  static generateSearchPageHTML(): string {
    return `
      <nav>
        <a href="#/">Home</a> |
        <a href="#/profile">Profile</a> |
        <a href="#/search">Search Users</a> |
        <a href="#/friends">Friends</a> |
        <a href="#/match-history">Match History</a> |
        <a href="#/game">Game</a> |
        <a href="#/tournament">Tournament</a>
      </nav>
      <div style="max-width: 800px; margin: 0 auto; padding: 20px;">
        <h2>🔍 Search Users</h2>

        <div style="margin-bottom: 30px;">
          <form id="searchForm">
            <div style="display: flex; gap: 10px; align-items: end;">
              <div style="flex: 1;">
                <label for="searchQuery">Search by username, display name, or email:</label><br>
                <input type="text" id="searchQuery" placeholder="Enter at least 2 characters..."
                       style="padding: 10px; width: 100%; margin-top: 5px; border: 1px solid #ddd; border-radius: 4px;">
              </div>
              <button type="submit" style="padding: 10px 20px; background: #007bff; color: white; border: none; border-radius: 4px;">
                Search
              </button>
            </div>
          </form>
        </div>

        <div id="searchResults">
          <div style="text-align: center; padding: 40px; color: #666;">
            Enter a search query to find users
          </div>
        </div>
      </div>
    `;
  }

  static generateFriendsPageHTML(): string {
    return `
      <nav>
        <a href="#/">Home</a> |
        <a href="#/profile">Profile</a> |
        <a href="#/search">Search Users</a> |
        <a href="#/friends">Friends</a> |
        <a href="#/match-history">Match History</a> |
        <a href="#/game">Game</a> |
        <a href="#/tournament">Tournament</a>
      </nav>
      <div style="max-width: 800px; margin: 0 auto; padding: 20px;">
        <h2>👥 Friends</h2>

        <div style="margin-bottom: 30px;">
          <div style="display: flex; gap: 20px; margin-bottom: 20px;">
            <button onclick="showFriendsList()" id="friendsListBtn" style="padding: 10px 20px; background: #007bff; color: white; border: none; border-radius: 4px;">
              Friends List
            </button>
            <button onclick="showFriendRequests()" id="friendRequestsBtn" style="padding: 10px 20px; background: #6c757d; color: white; border: none; border-radius: 4px;">
              Friend Requests
            </button>
          </div>
        </div>

        <div id="friendsContent">
          <div style="text-align: center; padding: 40px;">
            <div style="color: #666;">Loading friends...</div>
          </div>
        </div>
      </div>
    `;
  }

  static generateMatchHistoryPageHTML(): string {
    return `
      <nav>
        <a href="#/">Home</a> |
        <a href="#/profile">Profile</a> |
        <a href="#/search">Search Users</a> |
        <a href="#/friends">Friends</a> |
        <a href="#/match-history">Match History</a> |
        <a href="#/game">Game</a> |
        <a href="#/tournament">Tournament</a>
      </nav>
      <div style="max-width: 1000px; margin: 0 auto; padding: 20px;">
        <h2>📊 Match History & Statistics</h2>

        <div style="margin-bottom: 30px;">
          <div style="display: flex; gap: 20px; margin-bottom: 20px;">
            <button onclick="showMatchHistory()" id="matchHistoryBtn" style="padding: 10px 20px; background: #007bff; color: white; border: none; border-radius: 4px;">
              Match History
            </button>
            <button onclick="showStatistics()" id="statisticsBtn" style="padding: 10px 20px; background: #6c757d; color: white; border: none; border-radius: 4px;">
              Statistics
            </button>
          </div>
        </div>

        <div id="historyStatsContent">
          <div style="text-align: center; padding: 40px;">
            <div style="color: #666;">Loading match history...</div>
          </div>
        </div>
      </div>
    `;
  }

  static generateUserCard(user: any, showActions: boolean = true): string {
    const onlineStatus = user.is_online ? '🟢 Online' : '🔴 Offline';
    const winRate = user.total_games > 0 ? ((user.wins / user.total_games) * 100).toFixed(1) : '0.0';

    return `
      <div style="border: 1px solid #ddd; border-radius: 8px; padding: 20px; margin: 10px 0; background: #f8f9fa;">
        <div style="display: flex; justify-content: space-between; align-items: start;">
          <div style="flex: 1;">
            <h4 style="margin: 0 0 10px 0; color: #007bff;">
              ${user.display_name || user.username}
              ${user.username !== (user.display_name || user.username) ? `(@${user.username})` : ''}
            </h4>
            <div style="margin: 5px 0; font-size: 14px; color: #666;">
              ${onlineStatus}
            </div>
            ${user.bio ? `<div style="margin: 10px 0; font-style: italic;">${user.bio}</div>` : ''}
            <div style="margin: 10px 0; font-size: 14px;">
              <strong>Stats:</strong> ${user.wins || 0}W / ${user.losses || 0}L / ${user.total_games || 0} games (${winRate}% win rate)
            </div>
          </div>
          ${showActions ? `
            <div style="display: flex; flex-direction: column; gap: 5px; margin-left: 20px;">
              <button onclick="sendFriendRequest(${user.id})" style="padding: 5px 10px; background: #28a745; color: white; border: none; border-radius: 4px; font-size: 12px;">
                Add Friend
              </button>
              <button onclick="viewUserProfile(${user.id})" style="padding: 5px 10px; background: #007bff; color: white; border: none; border-radius: 4px; font-size: 12px;">
                View Profile
              </button>
            </div>
          ` : ''}
        </div>
      </div>
    `;
  }

  static generateFriendCard(friend: any): string {
    const onlineStatus = friend.is_online ? '🟢 Online' : '🔴 Offline';
    const friendSince = new Date(friend.friend_since).toLocaleDateString();

    return `
      <div style="border: 1px solid #ddd; border-radius: 8px; padding: 20px; margin: 10px 0; background: #f8f9fa;">
        <div style="display: flex; justify-content: space-between; align-items: start;">
          <div style="flex: 1;">
            <h4 style="margin: 0 0 10px 0; color: #007bff;">
              ${friend.display_name || friend.username}
              ${friend.username !== (friend.display_name || friend.username) ? `(@${friend.username})` : ''}
            </h4>
            <div style="margin: 5px 0; font-size: 14px; color: #666;">
              ${onlineStatus} • Friends since ${friendSince}
            </div>
          </div>
          <div style="display: flex; flex-direction: column; gap: 5px; margin-left: 20px;">
            <button onclick="challengeToGame(${friend.id})" style="padding: 5px 10px; background: #ffc107; color: black; border: none; border-radius: 4px; font-size: 12px;">
              Challenge
            </button>
            <button onclick="viewUserProfile(${friend.id})" style="padding: 5px 10px; background: #007bff; color: white; border: none; border-radius: 4px; font-size: 12px;">
              Profile
            </button>
          </div>
        </div>
      </div>
    `;
  }

  static generateMatchHistoryEntry(match: any): string {
    const matchDate = new Date(match.played_at).toLocaleDateString();
    const isWinner = match.winner_id === getCurrentUserId();
    const resultClass = isWinner ? 'color: #28a745; font-weight: bold;' : 'color: #dc3545;';
    const resultText = isWinner ? 'WIN' : 'LOSS';

    const opponent = match.player1_id === getCurrentUserId()
      ? { name: match.player2_display_name || match.player2_username, score: match.player2_score }
      : { name: match.player1_display_name || match.player1_username, score: match.player1_score };

    const userScore = match.player1_id === getCurrentUserId() ? match.player1_score : match.player2_score;

    return `
      <div style="border: 1px solid #ddd; border-radius: 8px; padding: 15px; margin: 10px 0; background: #f8f9fa;">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <div>
            <div style="${resultClass}">${resultText}</div>
            <div style="font-size: 14px; color: #666; margin-top: 5px;">vs ${opponent.name}</div>
            <div style="font-size: 12px; color: #999; margin-top: 5px;">${matchDate}</div>
          </div>
          <div style="text-align: right;">
            <div style="font-size: 18px; font-weight: bold;">${userScore} - ${opponent.score}</div>
            <div style="font-size: 12px; color: #666; margin-top: 5px;">${match.game_type}</div>
            ${match.tournament_name ? `<div style="font-size: 12px; color: #007bff; margin-top: 2px;">🏆 ${match.tournament_name}</div>` : ''}
          </div>
        </div>
      </div>
    `;
  }
}

// Helper function to get current user ID (will be set after login)
function getCurrentUserId(): number {
  const userStr = localStorage.getItem('currentUser');
  if (userStr) {
    try {
      const user = JSON.parse(userStr);
      return user.id;
    } catch (e) {
      return 0;
    }
  }
  return 0;
}