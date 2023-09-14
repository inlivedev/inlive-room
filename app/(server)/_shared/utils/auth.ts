import {createAuth} from '@/(server)/_shared/auth/auth'

const authService = createAuth().createInstance()
export const getUserFromToken = authService.getUserFromToken
