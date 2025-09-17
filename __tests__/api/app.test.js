const { mockDatabase } = require('./database.mock');

// データベースをモック化（app.jsの読み込み前に実行）
const testDb = mockDatabase();

// アプリケーションの読み込み（相対パス調整）
const app = require('../../api/app');

describe('ft_transcendence API テスト', () => {
  // 各テスト後にアプリケーションをクローズ
  afterAll(async () => {
    await app.close();
    testDb.close();
  });

  // 各テスト前にデータベースをクリア
  beforeEach(async () => {
    await new Promise((resolve) => {
      testDb.serialize(() => {
        testDb.run('DELETE FROM users', resolve);
      });
    });
  });

  describe('GET /', () => {
    test('ヘルスチェックが正常に動作する', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/'
      });

      global.testHelpers.expectSuccessResponse(
        response,
        'ft_transcendence API is running!'
      );
    });
  });

  describe('POST /register', () => {
    test('有効なユーザーデータで登録が成功する', async () => {
      const userData = {
        username: 'testuser1',
        password: 'password123'
      };

      const response = await app.inject({
        method: 'POST',
        url: '/register',
        payload: userData
      });

      const body = global.testHelpers.expectSuccessResponse(
        response,
        'User registered successfully'
      );

      expect(body.user).toHaveProperty('id');
      expect(body.user).toHaveProperty('username', userData.username);
      expect(body.user).not.toHaveProperty('password'); // パスワードは返されない
      expect(body.user).toHaveProperty('created_at');
    });

    test('ユーザー名が空の場合はエラーを返す', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/register',
        payload: {
          username: '',
          password: 'password123'
        }
      });

      global.testHelpers.expectErrorResponse(
        response,
        400,
        'Username and password are required'
      );
    });

    test('パスワードが空の場合はエラーを返す', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/register',
        payload: {
          username: 'testuser2',
          password: ''
        }
      });

      global.testHelpers.expectErrorResponse(
        response,
        400,
        'Username and password are required'
      );
    });

    test('同じユーザー名で重複登録するとエラーを返す', async () => {
      const userData = {
        username: 'duplicateuser',
        password: 'password123'
      };

      // 最初の登録
      await app.inject({
        method: 'POST',
        url: '/register',
        payload: userData
      });

      // 重複登録の試行
      const response = await app.inject({
        method: 'POST',
        url: '/register',
        payload: userData
      });

      global.testHelpers.expectErrorResponse(
        response,
        400,
        'Username already exists'
      );
    });

    test('パスワードが適切にハッシュ化されている', async () => {
      const userData = {
        username: 'hashtest',
        password: 'plainpassword'
      };

      await app.inject({
        method: 'POST',
        url: '/register',
        payload: userData
      });

      // データベースから直接ユーザー情報を確認
      const user = await new Promise((resolve, reject) => {
        testDb.get(
          'SELECT * FROM users WHERE username = ?',
          [userData.username],
          (err, row) => {
            if (err) reject(err);
            else resolve(row);
          }
        );
      });

      expect(user.password).not.toBe(userData.password); // 平文パスワードではない
      expect(user.password).toMatch(/^\$2[ab]\$\d{2}\$[./A-Za-z0-9]{53}$/); // bcryptハッシュの形式
    });
  });

  describe('POST /login', () => {
    const loginUser = {
      username: 'loginuser',
      password: 'loginpassword'
    };

    // テスト用ユーザーを事前に登録
    beforeEach(async () => {
      await app.inject({
        method: 'POST',
        url: '/register',
        payload: loginUser
      });
    });

    test('正しい認証情報でログインが成功する', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/login',
        payload: loginUser
      });

      const body = global.testHelpers.expectSuccessResponse(
        response,
        'Login successful'
      );

      expect(body.user).toHaveProperty('username', loginUser.username);
      expect(body.user).not.toHaveProperty('password'); // パスワードは返されない
      expect(body).toHaveProperty('token'); // JWTトークンが含まれる
      expect(typeof body.token).toBe('string');
      expect(body.token.split('.')).toHaveLength(3); // JWT形式（3つの部分）
    });

    test('存在しないユーザー名でログインするとエラーを返す', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/login',
        payload: {
          username: 'nonexistentuser',
          password: 'password123'
        }
      });

      global.testHelpers.expectErrorResponse(
        response,
        401,
        'Invalid username or password'
      );
    });

    test('間違ったパスワードでログインするとエラーを返す', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/login',
        payload: {
          username: loginUser.username,
          password: 'wrongpassword'
        }
      });

      global.testHelpers.expectErrorResponse(
        response,
        401,
        'Invalid username or password'
      );
    });

    test('ユーザー名が空の場合はエラーを返す', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/login',
        payload: {
          username: '',
          password: 'password123'
        }
      });

      global.testHelpers.expectErrorResponse(
        response,
        400,
        'Username and password are required'
      );
    });

    test('パスワードが空の場合はエラーを返す', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/login',
        payload: {
          username: loginUser.username,
          password: ''
        }
      });

      global.testHelpers.expectErrorResponse(
        response,
        400,
        'Username and password are required'
      );
    });

    test('JWTトークンに正しいペイロードが含まれている', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/login',
        payload: loginUser
      });

      const body = JSON.parse(response.body);
      const jwt = require('jsonwebtoken');

      // トークンをデコード（検証なし）
      const decoded = jwt.decode(body.token);
      expect(decoded).toHaveProperty('userId');
      expect(decoded).toHaveProperty('username', loginUser.username);
      expect(decoded).toHaveProperty('exp'); // 有効期限
    });
  });
});