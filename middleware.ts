import { chain } from './app/_middlewares/chain';
import { withAuthMiddleware } from './app/_middlewares/auth';
import { withRoomMiddleware } from './app/_middlewares/room';

export default chain([withRoomMiddleware, withAuthMiddleware]);

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|images).*)'],
};
