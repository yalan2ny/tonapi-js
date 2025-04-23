import { TonApiClient } from '@ton-api/client';

const baseUrl = 'https://tonapi.io';

export const taWithApiKey = new TonApiClient({
    baseUrl,
    apiKey: 'TEST_API_KEY'
});

export const ta = new TonApiClient({
    baseUrl
});
