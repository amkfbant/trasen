import { UserManagementUI } from './user-management-ui.js';

export class UserManagementHandlers {
  private static readonly API_BASE_URL = 'http://localhost:3000';

  // Profile Management
  static async loadUserProfile(userId: string): Promise<void> {
    try {
      const response = await fetch(`${this.API_BASE_URL}/users/${userId}/profile`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to load profile');
      }

      const profileContent = document.getElementById('profileContent')!;
      profileContent.innerHTML = this.generateProfileDisplay(data.profile);
    } catch (error) {
      const profileContent = document.getElementById('profileContent')!;
      profileContent.innerHTML = `
        <div style="text-align: center; padding: 40px; color: #dc3545;">
          Error loading profile: ${error instanceof Error ? error.message : 'Unknown error'}
        </div>
      `;
    }
  }

  private static generateProfileDisplay(profile: any): string {
    const onlineStatus = profile.is_online ? '🟢 Online' : '🔴 Offline';
    const winRate = profile.total_games > 0 ? ((profile.wins / profile.total_games) * 100).toFixed(1) : '0.0';
    const joinDate = new Date(profile.created_at).toLocaleDateString();

    return `
      <div style="background: #f8f9fa; border-radius: 8px; padding: 30px; margin: 20px 0;">
        <div style="text-align: center; margin-bottom: 30px;">
          <div style="width: 100px; height: 100px; border-radius: 50%; background: #007bff; color: white; display: flex; align-items: center; justify-content: center; font-size: 36px; margin: 0 auto 20px;">
            ${(profile.display_name || profile.username).charAt(0).toUpperCase()}
          </div>
          <h3 style="margin: 0 0 10px 0;">${profile.display_name || profile.username}</h3>
          <div style="color: #666; margin-bottom: 10px;">@${profile.username}</div>
          <div style="font-size: 14px; color: #666;">${onlineStatus}</div>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 30px; margin-bottom: 30px;">
          <div>
            <h4 style="color: #007bff; margin-bottom: 15px;">📊 Statistics</h4>
            <div style="background: white; padding: 20px; border-radius: 8px; border: 1px solid #ddd;">
              <div style="margin-bottom: 10px;"><strong>Wins:</strong> ${profile.wins || 0}</div>
              <div style="margin-bottom: 10px;"><strong>Losses:</strong> ${profile.losses || 0}</div>
              <div style="margin-bottom: 10px;"><strong>Total Games:</strong> ${profile.total_games || 0}</div>
              <div style="margin-bottom: 10px;"><strong>Win Rate:</strong> ${winRate}%</div>
            </div>
          </div>

          <div>
            <h4 style="color: #007bff; margin-bottom: 15px;">ℹ️ Information</h4>
            <div style="background: white; padding: 20px; border-radius: 8px; border: 1px solid #ddd;">
              <div style="margin-bottom: 10px;"><strong>Email:</strong> ${profile.email || 'Not set'}</div>
              <div style="margin-bottom: 10px;"><strong>Member since:</strong> ${joinDate}</div>
              <div style="margin-bottom: 10px;"><strong>Bio:</strong> ${profile.bio || 'No bio set'}</div>
            </div>
          </div>
        </div>

        <div style="text-align: center;">
          <button onclick="openEditProfileModal()" style="padding: 10px 30px; background: #007bff; color: white; border: none; border-radius: 4px; font-size: 16px;">
            Edit Profile
          </button>
        </div>
      </div>
    `;
  }

  static setupEditProfileForm(): void {
    const form = document.getElementById('editProfileForm') as HTMLFormElement;
    if (form) {
      form.addEventListener('submit', async (e) => {
        e.preventDefault();
        await this.updateUserProfile();
      });
    }
  }

  private static async updateUserProfile(): Promise<void> {
    const userId = this.getCurrentUserId();
    if (!userId) return;

    const form = document.getElementById('editProfileForm') as HTMLFormElement;
    const profileData: any = {};

    // Get form values manually for TypeScript compatibility
    const displayName = (form.elements.namedItem('display_name') as HTMLInputElement)?.value?.trim();
    const email = (form.elements.namedItem('email') as HTMLInputElement)?.value?.trim();
    const bio = (form.elements.namedItem('bio') as HTMLTextAreaElement)?.value?.trim();

    // Only include fields that have values
    if (displayName) profileData.display_name = displayName;
    if (email) profileData.email = email;
    if (bio) profileData.bio = bio;

    try {
      const response = await fetch(`${this.API_BASE_URL}/users/${userId}/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(profileData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update profile');
      }

      // Close modal and reload profile
      this.closeEditProfileModal();
      await this.loadUserProfile(userId.toString());
      this.showMessage('Profile updated successfully!', 'success');
    } catch (error) {
      this.showMessage(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`, 'error');
    }
  }

  // User Search
  static setupSearchForm(): void {
    const form = document.getElementById('searchForm') as HTMLFormElement;
    if (form) {
      form.addEventListener('submit', async (e) => {
        e.preventDefault();
        await this.searchUsers();
      });
    }
  }

  private static async searchUsers(): Promise<void> {
    const queryInput = document.getElementById('searchQuery') as HTMLInputElement;
    const query = queryInput.value.trim();

    if (query.length < 2) {
      this.showMessage('Search query must be at least 2 characters long', 'error');
      return;
    }

    const resultsContainer = document.getElementById('searchResults')!;
    resultsContainer.innerHTML = '<div style="text-align: center; padding: 20px;">Searching...</div>';

    try {
      const response = await fetch(`${this.API_BASE_URL}/users/search?q=${encodeURIComponent(query)}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Search failed');
      }

      if (data.users.length === 0) {
        resultsContainer.innerHTML = '<div style="text-align: center; padding: 40px; color: #666;">No users found</div>';
        return;
      }

      resultsContainer.innerHTML = `
        <h3>Search Results (${data.users.length} found)</h3>
        ${data.users.map((user: any) => UserManagementUI.generateUserCard(user)).join('')}
      `;
    } catch (error) {
      resultsContainer.innerHTML = `
        <div style="text-align: center; padding: 40px; color: #dc3545;">
          Error: ${error instanceof Error ? error.message : 'Unknown error'}
        </div>
      `;
    }
  }

  // Friends Management
  static async loadFriends(): Promise<void> {
    const userId = this.getCurrentUserId();
    if (!userId) return;

    const contentContainer = document.getElementById('friendsContent')!;
    contentContainer.innerHTML = '<div style="text-align: center; padding: 20px;">Loading friends...</div>';

    try {
      const response = await fetch(`${this.API_BASE_URL}/users/${userId}/friends`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to load friends');
      }

      if (data.friends.length === 0) {
        contentContainer.innerHTML = '<div style="text-align: center; padding: 40px; color: #666;">No friends yet. Start by searching for users!</div>';
        return;
      }

      contentContainer.innerHTML = `
        <h3>Your Friends (${data.friends.length})</h3>
        ${data.friends.map((friend: any) => UserManagementUI.generateFriendCard(friend)).join('')}
      `;
    } catch (error) {
      contentContainer.innerHTML = `
        <div style="text-align: center; padding: 40px; color: #dc3545;">
          Error: ${error instanceof Error ? error.message : 'Unknown error'}
        </div>
      `;
    }
  }

  static async sendFriendRequest(friendId: number): Promise<void> {
    const userId = this.getCurrentUserId();
    if (!userId) return;

    try {
      const response = await fetch(`${this.API_BASE_URL}/users/${userId}/friend-requests`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ friendId })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send friend request');
      }

      this.showMessage('Friend request sent!', 'success');
    } catch (error) {
      this.showMessage(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`, 'error');
    }
  }

  // Match History
  static async loadMatchHistory(): Promise<void> {
    const userId = this.getCurrentUserId();
    if (!userId) return;

    const contentContainer = document.getElementById('historyStatsContent')!;
    contentContainer.innerHTML = '<div style="text-align: center; padding: 20px;">Loading match history...</div>';

    try {
      const response = await fetch(`${this.API_BASE_URL}/users/${userId}/match-history?limit=20`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to load match history');
      }

      if (data.match_history.length === 0) {
        contentContainer.innerHTML = '<div style="text-align: center; padding: 40px; color: #666;">No matches played yet. Start playing some games!</div>';
        return;
      }

      contentContainer.innerHTML = `
        <h3>Recent Matches (${data.match_history.length})</h3>
        ${data.match_history.map((match: any) => UserManagementUI.generateMatchHistoryEntry(match)).join('')}
      `;
    } catch (error) {
      contentContainer.innerHTML = `
        <div style="text-align: center; padding: 40px; color: #dc3545;">
          Error: ${error instanceof Error ? error.message : 'Unknown error'}
        </div>
      `;
    }
  }

  // Statistics
  static async loadStatistics(): Promise<void> {
    const userId = this.getCurrentUserId();
    if (!userId) return;

    const contentContainer = document.getElementById('historyStatsContent')!;
    contentContainer.innerHTML = '<div style="text-align: center; padding: 20px;">Loading statistics...</div>';

    try {
      const response = await fetch(`${this.API_BASE_URL}/users/${userId}/stats`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to load statistics');
      }

      contentContainer.innerHTML = this.generateStatisticsDisplay(data.stats);
    } catch (error) {
      contentContainer.innerHTML = `
        <div style="text-align: center; padding: 40px; color: #dc3545;">
          Error: ${error instanceof Error ? error.message : 'Unknown error'}
        </div>
      `;
    }
  }

  private static generateStatisticsDisplay(stats: any): string {
    const winRate = stats.overall.total_games > 0 ? stats.overall.win_rate : 0;

    return `
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px; margin-bottom: 30px;">
        <!-- Overall Stats -->
        <div style="background: #f8f9fa; border-radius: 8px; padding: 20px; border: 1px solid #ddd;">
          <h4 style="color: #007bff; margin-bottom: 15px;">📊 Overall Statistics</h4>
          <div style="margin-bottom: 10px;"><strong>Total Games:</strong> ${stats.overall.total_games}</div>
          <div style="margin-bottom: 10px;"><strong>Wins:</strong> ${stats.overall.wins}</div>
          <div style="margin-bottom: 10px;"><strong>Losses:</strong> ${stats.overall.losses}</div>
          <div style="margin-bottom: 10px;"><strong>Win Rate:</strong> ${winRate}%</div>
        </div>

        <!-- Recent Performance -->
        <div style="background: #f8f9fa; border-radius: 8px; padding: 20px; border: 1px solid #ddd;">
          <h4 style="color: #007bff; margin-bottom: 15px;">🔥 Recent Performance (Last 10 games)</h4>
          <div style="display: flex; gap: 5px; flex-wrap: wrap;">
            ${stats.recent_performance.map((match: any) =>
              `<span style="width: 30px; height: 30px; border-radius: 50%; background: ${match.won ? '#28a745' : '#dc3545'}; color: white; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: bold;">
                ${match.won ? 'W' : 'L'}
              </span>`
            ).join('')}
          </div>
          ${stats.recent_performance.length === 0 ? '<div style="color: #666;">No recent matches</div>' : ''}
        </div>
      </div>

      <!-- Game Type Stats -->
      ${stats.by_game_type.length > 0 ? `
        <div style="background: #f8f9fa; border-radius: 8px; padding: 20px; border: 1px solid #ddd; margin-bottom: 20px;">
          <h4 style="color: #007bff; margin-bottom: 15px;">🎮 Statistics by Game Type</h4>
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px;">
            ${stats.by_game_type.map((gameType: any) => {
              const gameWinRate = gameType.games_played > 0 ? ((gameType.wins / gameType.games_played) * 100).toFixed(1) : '0.0';
              return `
                <div style="background: white; padding: 15px; border-radius: 6px; border: 1px solid #ddd;">
                  <h5 style="margin: 0 0 10px 0; text-transform: capitalize;">${gameType.game_type}</h5>
                  <div style="font-size: 14px;">
                    <div>Games: ${gameType.games_played}</div>
                    <div>W/L: ${gameType.wins}/${gameType.losses}</div>
                    <div>Win Rate: ${gameWinRate}%</div>
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        </div>
      ` : ''}
    `;
  }

  // Utility Methods
  private static getCurrentUserId(): number {
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

  private static showMessage(message: string, type: 'success' | 'error'): void {
    // Create a temporary message element
    const messageEl = document.createElement('div');
    messageEl.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      padding: 15px 20px;
      border-radius: 4px;
      color: white;
      font-weight: bold;
      z-index: 1001;
      background: ${type === 'success' ? '#28a745' : '#dc3545'};
    `;
    messageEl.textContent = message;

    document.body.appendChild(messageEl);

    // Remove after 3 seconds
    setTimeout(() => {
      document.body.removeChild(messageEl);
    }, 3000);
  }

  static openEditProfileModal(): void {
    // Pre-populate form with current data
    const userId = this.getCurrentUserId();
    if (userId) {
      this.populateEditForm(userId);
    }
    const modal = document.getElementById('editProfileModal')!;
    modal.style.display = 'block';
  }

  static closeEditProfileModal(): void {
    const modal = document.getElementById('editProfileModal')!;
    modal.style.display = 'none';
  }

  private static async populateEditForm(userId: number): Promise<void> {
    try {
      const response = await fetch(`${this.API_BASE_URL}/users/${userId}/profile`);
      const data = await response.json();

      if (response.ok) {
        const profile = data.profile;
        (document.getElementById('displayName') as HTMLInputElement).value = profile.display_name || '';
        (document.getElementById('email') as HTMLInputElement).value = profile.email || '';
        (document.getElementById('bio') as HTMLTextAreaElement).value = profile.bio || '';
      }
    } catch (error) {
      console.error('Failed to populate edit form:', error);
    }
  }
}

// Make functions globally available for onclick handlers
(window as any).openEditProfileModal = () => UserManagementHandlers.openEditProfileModal();
(window as any).closeEditProfileModal = () => UserManagementHandlers.closeEditProfileModal();
(window as any).sendFriendRequest = (friendId: number) => UserManagementHandlers.sendFriendRequest(friendId);
(window as any).viewUserProfile = (userId: number) => window.location.hash = `#/profile/${userId}`;
(window as any).challengeToGame = (userId: number) => console.log(`Challenge user ${userId} to game - not implemented yet`);
(window as any).showFriendsList = () => {
  document.getElementById('friendsListBtn')!.style.background = '#007bff';
  document.getElementById('friendRequestsBtn')!.style.background = '#6c757d';
  UserManagementHandlers.loadFriends();
};
(window as any).showFriendRequests = () => {
  document.getElementById('friendRequestsBtn')!.style.background = '#007bff';
  document.getElementById('friendsListBtn')!.style.background = '#6c757d';
  // TODO: Implement friend requests display
  document.getElementById('friendsContent')!.innerHTML = '<div style="text-align: center; padding: 40px; color: #666;">Friend requests feature coming soon!</div>';
};
(window as any).showMatchHistory = () => {
  document.getElementById('matchHistoryBtn')!.style.background = '#007bff';
  document.getElementById('statisticsBtn')!.style.background = '#6c757d';
  UserManagementHandlers.loadMatchHistory();
};
(window as any).showStatistics = () => {
  document.getElementById('statisticsBtn')!.style.background = '#007bff';
  document.getElementById('matchHistoryBtn')!.style.background = '#6c757d';
  UserManagementHandlers.loadStatistics();
};