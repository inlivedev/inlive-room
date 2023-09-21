import { InliveApiFetcher } from '@/_shared/utils/fetcher';
import { createAuth } from '@/(server)/_shared/auth/auth';

const authService = createAuth(InliveApiFetcher).createInstance();
export const getCurrentAuthenticated = authService.getCurrentAuthenticated;
export const authorize = authService.authorize;
export const authenticate = authService.authenticate;
