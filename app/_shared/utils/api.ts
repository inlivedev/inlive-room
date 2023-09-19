import { createFetcher } from "@/(server)/_shared/fetcher/fetcher";

const InternalAPI = process.env.BASE_API

export const InternalAPIFetcher = createFetcher().createInstance(InternalAPI|| "localhost:3000")