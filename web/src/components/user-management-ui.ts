export class UserManagementUI {
  static generateProfilePageHTML(userId: string): string {
    return `
      <nav class="user-nav">
        <a href="#/">Home</a> |
        <a href="#/profile">Profile</a> |
        <a href="#/search">Search Users</a> |
        <a href="#/friends">Friends</a> |
        <a href="#/match-history">Match History</a> |
        <a href="#/game">Game</a> |
        <a href="#/tournament">Tournament</a>
      </nav>
      <div class="user-content-container">
        <h2>👤 User Profile</h2>
        <div id="profileContent">
          <div class="user-loading">
            <div>Loading profile...</div>
          </div>
        </div>

        <!-- Edit Profile Modal (Hidden by default) -->
        <div id="editProfileModal" class="modal-overlay">
          <div class="modal-content">
            <h3 class="modal-title">Edit Profile</h3>
            <form id="editProfileForm">
              <div class="form-group">
                <label for="displayName">Display Name:</label>
                <input type="text" id="displayName" name="display_name" class="form-input">
              </div>
              <div class="form-group">
                <label for="email">Email:</label>
                <input type="email" id="email" name="email" class="form-input">
              </div>
              <div class="form-group">
                <label for="bio">Bio:</label>
                <textarea id="bio" name="bio" rows="3" class="form-textarea"></textarea>
              </div>
              <div class="modal-actions">
                <button type="button" onclick="closeEditProfileModal()" class="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" class="btn btn-primary">
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
      <nav class="user-nav">
        <a href="#/">Home</a> |
        <a href="#/profile">Profile</a> |
        <a href="#/search">Search Users</a> |
        <a href="#/friends">Friends</a> |
        <a href="#/match-history">Match History</a> |
        <a href="#/game">Game</a> |
        <a href="#/tournament">Tournament</a>
      </nav>
      <div class="user-content-container">
        <h2>🔍 Search Users</h2>

        <div class="search-form">
          <form id="searchForm">
            <div class="search-input-group">
              <div class="search-input-container">
                <label for="searchQuery">Search by username, display name, or email:</label>
                <input type="text" id="searchQuery" placeholder="Enter at least 2 characters..." class="search-input">
              </div>
              <button type="submit" class="btn btn-primary">
                Search
              </button>
            </div>
          </form>
        </div>

        <div id="searchResults">
          <div class="empty-state">
            Enter a search query to find users
          </div>
        </div>
      </div>
    `;
  }

  static generateFriendsPageHTML(): string {
    return `
      <nav class="user-nav">
        <a href="#/">Home</a> |
        <a href="#/profile">Profile</a> |
        <a href="#/search">Search Users</a> |
        <a href="#/friends">Friends</a> |
        <a href="#/match-history">Match History</a> |
        <a href="#/game">Game</a> |
        <a href="#/tournament">Tournament</a>
      </nav>
      <div class="user-content-container">
        <h2>👥 Friends</h2>

        <div class="mb-30">
          <div class="btn-row">
            <button onclick="showFriendsList()" id="friendsListBtn" class="btn btn-primary">
              Friends List
            </button>
            <button onclick="showFriendRequests()" id="friendRequestsBtn" class="btn btn-secondary">
              Friend Requests
            </button>
          </div>
        </div>

        <div id="friendsContent">
          <div class="user-loading">
            <div>Loading friends...</div>
          </div>
        </div>
      </div>
    `;
  }

  static generateMatchHistoryPageHTML(): string {
    return `
      <nav class="user-nav">
        <a href="#/">Home</a> |
        <a href="#/profile">Profile</a> |
        <a href="#/search">Search Users</a> |
        <a href="#/friends">Friends</a> |
        <a href="#/match-history">Match History</a> |
        <a href="#/game">Game</a> |
        <a href="#/tournament">Tournament</a>
      </nav>
      <div class="user-content-wide">
        <h2>📊 Match History & Statistics</h2>

        <div class="mb-30">
          <div class="btn-row">
            <button onclick="showMatchHistory()" id="matchHistoryBtn" class="btn btn-primary">
              Match History
            </button>
            <button onclick="showStatistics()" id="statisticsBtn" class="btn btn-secondary">
              Statistics
            </button>
          </div>
        </div>

        <div id="historyStatsContent">
          <div class="user-loading">
            <div>Loading match history...</div>
          </div>
        </div>
      </div>
    `;
  }

  static generateUserCard(user: any, showActions: boolean = true): string {
    const onlineStatus = user.is_online ? '🟢 Online' : '🔴 Offline';
    const winRate = user.total_games > 0 ? ((user.wins / user.total_games) * 100).toFixed(1) : '0.0';
    const statusClass = user.is_online ? 'status-online' : 'status-offline';

    return `
      <div class="user-card">
        <div class="card-content">
          <div class="card-main">
            <h4 class="card-title">
              ${user.display_name || user.username}
              ${user.username !== (user.display_name || user.username) ? `(@${user.username})` : ''}
            </h4>
            <div class="card-status ${statusClass}">
              ${onlineStatus}
            </div>
            ${user.bio ? `<div class="card-bio">${user.bio}</div>` : ''}
            <div class="card-stats">
              <strong>Stats:</strong> ${user.wins || 0}W / ${user.losses || 0}L / ${user.total_games || 0} games (${winRate}% win rate)
            </div>
          </div>
          ${showActions ? `
            <div class="card-actions">
              <button data-user-id="${user.id}" class="btn btn-success btn-small send-friend-request-btn">
                Add Friend
              </button>
              <button data-user-id="${user.id}" class="btn btn-primary btn-small view-user-profile-btn">
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
    const statusClass = friend.is_online ? 'status-online' : 'status-offline';

    return `
      <div class="user-card">
        <div class="card-content">
          <div class="card-main">
            <h4 class="card-title">
              ${friend.display_name || friend.username}
              ${friend.username !== (friend.display_name || friend.username) ? `(@${friend.username})` : ''}
            </h4>
            <div class="friend-since ${statusClass}">
              ${onlineStatus} • Friends since ${friendSince}
            </div>
          </div>
          <div class="card-actions">
            <button data-user-id="${friend.id}" class="btn btn-warning btn-small challenge-to-game-btn">
              Challenge
            </button>
            <button data-user-id="${friend.id}" class="btn btn-primary btn-small view-user-profile-btn">
              Profile
            </button>
          </div>
        </div>
      </div>
    `;
  }

  static generateFriendRequestCard(request: any): string {
    const onlineStatus = request.is_online ? '🟢 Online' : '🔴 Offline';
    const requestDate = new Date(request.created_at).toLocaleDateString();
    const statusClass = request.is_online ? 'status-online' : 'status-offline';

    return `
      <div class="user-card">
        <div class="card-content">
          <div class="card-main">
            <h4 class="card-title">
              ${request.display_name || request.username}
              ${request.username !== (request.display_name || request.username) ? `(@${request.username})` : ''}
            </h4>
            <div class="friend-request-info ${statusClass}">
              ${onlineStatus} • Requested on ${requestDate}
            </div>
          </div>
          <div class="card-actions">
            <button data-request-id="${request.id}" class="btn btn-success btn-small accept-friend-request-btn">
              Accept
            </button>
            <button data-user-id="${request.user_id}" class="btn btn-primary btn-small view-user-profile-btn">
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
    const resultClass = isWinner ? 'match-result win' : 'match-result loss';
    const resultText = isWinner ? 'WIN' : 'LOSS';

    const opponent = match.player1_id === getCurrentUserId()
      ? { name: match.player2_display_name || match.player2_username, score: match.player2_score }
      : { name: match.player1_display_name || match.player1_username, score: match.player1_score };

    const userScore = match.player1_id === getCurrentUserId() ? match.player1_score : match.player2_score;

    return `
      <div class="match-entry">
        <div class="match-content">
          <div>
            <div class="${resultClass}">${resultText}</div>
            <div class="match-opponent">vs ${opponent.name}</div>
            <div class="match-date">${matchDate}</div>
          </div>
          <div class="match-score">
            <div class="match-score-text">${userScore} - ${opponent.score}</div>
            <div class="match-type">${match.game_type ? match.game_type : 'Unknown'}</div>
            ${match.tournament_name ? `<div class="match-tournament">🏆 ${match.tournament_name}</div>` : ''}
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