import { Address } from '@ton/core';
import { ta } from './utils/client';
import { getChartRates, getRates } from './__mock__/services';
import { mockFetch } from './utils/mockFetch';
import { test, expect, afterEach, vi } from 'vitest';

afterEach(() => {
    vi.restoreAllMocks();
});

test('getChartRates, should correct parse array in pair', async () => {
    mockFetch(getChartRates);

    const addressString = 'EQCxE6mUtQJKFnGfaROTKOt1lZbDiiX1kCixRv7Nw2Id_sDs';
    const addressObject = Address.parse(addressString);
    const points = await ta.rates
        .getChartRates({
            token: addressObject,
            currency: 'rub'
        })
        .then(res => res.points);

    expect(points).toBeDefined();
    expect(Array.isArray(points)).toBe(true);

    expect(points.length).toBeGreaterThan(0);

    points.forEach(point => {
        expect(Array.isArray(point)).toBe(true);
        expect(point.length).toBe(2);

        const [timestamp, value] = point;

        expect(typeof timestamp).toBe('number');
        expect(timestamp).toBeGreaterThan(0);

        expect(typeof value).toBe('number');
    });
});

test('getRates, additionalProperties should be not convert to camelCase', async () => {
    mockFetch(getRates);

    const res = await ta.rates.getRates({
        tokens: ['TON,TOKEN_WITH_UNDERSCORE'],
        currencies: ['USD', 'EUR']
    });

    expect(res).toBeDefined();
    expect(res.rates).toBeDefined();
    expect(res.rates['TON']).toBeDefined();
    expect(res.rates['TOKEN_WITH_UNDERSCORE']).toBeDefined();
});

test('getRates, explode in params should be matter', async () => {
    const fetchSpy = mockFetch(getRates);
    // const fetchSpy = vi.spyOn(global, 'fetch').mockResolvedValueOnce(
    //     new Response(JSON.stringify(getRates), {
    //         status: 200,
    //         headers: { 'Content-Type': 'application/json' }
    //     })
    // );

    await ta.rates.getRates({
        tokens: ['TON', 'EQCxE6mUtQJKFnGfaROTKOt1lZbDiiX1kCixRv7Nw2Id_sDs'],
        currencies: ['USD', 'EUR']
    });

    expect(fetchSpy).toHaveBeenCalledTimes(1);
    const url = fetchSpy.mock.calls[0][0] as string;
    const searchParams = new URL(url).searchParams;

    expect(searchParams.get('tokens')).toBe('TON,EQCxE6mUtQJKFnGfaROTKOt1lZbDiiX1kCixRv7Nw2Id_sDs');
    expect(searchParams.get('currencies')).toBe('USD,EUR');
});
