import { NextResponse, type NextRequest } from 'next/server';

const authMiddleware = (request: NextRequest) => {
  const response = NextResponse.next();
  const token = request.cookies.get('token')?.value || '';

  if (token) {
    // We need to set another token cookie to pass the token to the server component
    response.cookies.set('accessToken', token);
    response.cookies.delete('token');
  }

  return response;
};

export function middleware(request: NextRequest) {
  const response = authMiddleware(request);
  return response;
}
