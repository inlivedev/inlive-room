import { chain } from './middlewares/chain';
import { withAuthMiddleware } from './middlewares/auth';
import { withRoomMiddleware } from './middlewares/room';

export default chain([withRoomMiddleware, withAuthMiddleware]);

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
