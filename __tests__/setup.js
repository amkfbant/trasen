// テスト環境の設定
process.env.NODE_ENV = 'test';

// テスト用グローバルヘルパー
global.testHelpers = {
  // テスト用ユーザーデータ
  validUser: {
    username: 'testuser',
    password: 'testpassword123'
  },

  // 無効なリクエストデータ
  invalidUser: {
    username: '',
    password: ''
  },

  // レスポンス検証ヘルパー
  expectSuccessResponse: (response, expectedMessage) => {
    expect(response.statusCode).toBe(200);
    const body = JSON.parse(response.body);
    expect(body.message).toBe(expectedMessage);
    return body;
  },

  expectErrorResponse: (response, expectedStatus, expectedError) => {
    expect(response.statusCode).toBe(expectedStatus);
    const body = JSON.parse(response.body);
    expect(body.error).toBe(expectedError);
    return body;
  }
};