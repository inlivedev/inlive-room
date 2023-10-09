import { chain } from './app/_shared/middlewares/chain';
import { withAuthMiddleware } from './app/_shared/middlewares/auth';
import { withRoomMiddleware } from './app/_shared/middlewares/room';

export default chain([withRoomMiddleware, withAuthMiddleware]);

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|images).*)'],
};
