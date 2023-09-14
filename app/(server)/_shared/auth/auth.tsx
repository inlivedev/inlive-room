import { createFetcher, FetcherResponse } from "../fetcher/fetcher";


const INLIVE_AUTH_ORIGIN = process.env.INLIVE_AUTH_ORIGIN
const INLIVE_AUTH_VERSION = process.env.INLIVE_AUTH_VERSION

export interface AuthResp {
    code: number;
    data: UserData;
    message: string;
    meta: string;
}

export interface UserData {
    email: string;
    id: number;
    login_type: number;
    name: string;
    picture_url: string;
    role_id: number;
    username: string;
}

export const createAuth = (APIUrl?: string, Version?: string) => {
    const Auth = class {
        _APIUrl = INLIVE_AUTH_ORIGIN
        _Version = INLIVE_AUTH_VERSION
        _Fetcher = createFetcher().createInstance((this._APIUrl + "/" + this._Version))

        constructor() {
            if (APIUrl != undefined) {
                this._APIUrl = APIUrl
            }
            if (Version != undefined) {
                this._Version = Version
            }
            this._Fetcher = createFetcher().createInstance((this._APIUrl + "/" + this._Version))
        }

        getUserFromToken = async (token: string) => {
            const response = await this._Fetcher.get("auth/current", {
                headers: {
                    "authorization": `bearer${token}`
                }
            })

            if (!isFetcherResponse(response)) {
                throw new Error("Failed to decode json data from request")
            }

            if (response.code > 299) {
                throw new Error(`Error got response code : ${response.code}, message : ${response.body?.message}`)
            }

            if (isAuthResp(response.body)) {
                return response.body.data as UserData
            }
        }
    }

    return {
        createInstance: () => {
            const authService = new Auth()

            return {
                getUserFromToken: authService.getUserFromToken
            }
        }
    }
}

function isFetcherResponse(response: any): response is FetcherResponse {
    if (typeof response.code == 'number' && typeof response.ok == "boolean") { return true }
    return false
}

function isAuthResp(body: any): body is AuthResp {
    if (typeof body.code == 'number' && typeof body.data == "object" && typeof body.message == "string" && typeof body.meta == "string") { return true }
    return false
}

