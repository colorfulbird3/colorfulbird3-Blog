import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const payload = await req.json();
    const code = typeof payload.code === 'string' ? payload.code : '';
    const clientId = typeof payload.client_id === 'string' ? payload.client_id : '';
    const clientSecret = process.env.GITHUB_OAUTH_CLIENT_SECRET
      || (typeof payload.client_secret === 'string' ? payload.client_secret : '');

    if (!code || !clientId || !clientSecret) {
      return NextResponse.json(
        {
          error: 'oauth_config_missing',
          error_description: 'GitHub OAuth 配置不完整，请检查 Client ID 和 Client Secret。',
        },
        { status: 400 }
      );
    }

    const githubRes = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        code,
        client_id: clientId,
        client_secret: clientSecret,
      }),
    });

    const data = await githubRes.json();
    return NextResponse.json(data, { status: githubRes.ok ? 200 : githubRes.status });
  } catch (error) {
    console.error('GitHub OAuth proxy failed:', error);
    return NextResponse.json(
      {
        error: 'oauth_proxy_failed',
        error_description: 'OAuth 代理暂时无法连接 GitHub，请稍后重试。',
      },
      { status: 502 }
    );
  }
}
