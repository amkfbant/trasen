import { ApiService } from '../services/api-service.js';

export class FormHandlers {
  static setupRegisterForm(): void {
    const form = document.getElementById('registerForm') as HTMLFormElement;
    if (!form) return;

    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      const formData = new FormData(form);
      const username = formData.get('username') as string;
      const password = formData.get('password') as string;

      const messageDiv = document.getElementById('message')!;

      try {
        await ApiService.registerUser(username, password);
        messageDiv.innerHTML = '<p style="color: green;">Registration successful!</p>';
        form.reset();
      } catch (error) {
        messageDiv.innerHTML = `<p style="color: red;">Error: ${error instanceof Error ? error.message : 'Unknown error'}</p>`;
      }
    });
  }

  static setupLoginForm(): void {
    const form = document.getElementById('loginForm') as HTMLFormElement;
    if (!form) return;

    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      const formData = new FormData(form);
      const username = formData.get('username') as string;
      const password = formData.get('password') as string;

      const messageDiv = document.getElementById('loginMessage')!;

      try {
        const result = await ApiService.loginUser(username, password) as { user: any; token?: string };
        messageDiv.innerHTML = '<p style="color: green;">Login successful!</p>';
        localStorage.setItem('currentUser', JSON.stringify(result.user));
        if (result.token) {
          localStorage.setItem('authToken', result.token);
        }
        form.reset();

        // Redirect to profile page
        setTimeout(() => {
          window.location.hash = '#/profile';
        }, 1000);
      } catch (error) {
        messageDiv.innerHTML = `<p style="color: red;">Error: ${error instanceof Error ? error.message : 'Unknown error'}</p>`;
      }
    });
  }

  static setupCreateTournamentForm(): void {
    const form = document.getElementById('createTournamentForm') as HTMLFormElement;
    if (!form) return;

    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      const formData = new FormData(form);
      const name = formData.get('name') as string;
      const maxPlayers = parseInt(formData.get('max_players') as string);

      try {
        const result = await ApiService.createTournament(name, maxPlayers) as { tournament: { id: number } };
        alert(`Tournament created! Tournament ID: ${result.tournament.id}`);
        form.reset();
        if ('loadTournamentList' in window && typeof (window as any).loadTournamentList === 'function') {
          (window as any).loadTournamentList();
        }
      } catch (error) {
        alert(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    });
  }

  static setupJoinTournamentForm(): void {
    const form = document.getElementById('joinTournamentForm') as HTMLFormElement;
    if (!form) return;

    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      const formData = new FormData(form);
      const tournamentId = parseInt(formData.get('tournamentId') as string);
      const alias = formData.get('alias') as string;

      try {
        await ApiService.joinTournament(tournamentId, alias);
        alert('Successfully joined tournament!');
        form.reset();
        if ('loadTournamentList' in window && typeof (window as any).loadTournamentList === 'function') {
          (window as any).loadTournamentList();
        }
      } catch (error) {
        alert(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    });
  }
}