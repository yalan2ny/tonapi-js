import { ta } from './utils/client';
import { vi, test, expect, afterEach, beforeEach } from 'vitest';
import { mockFetch } from './utils/mockFetch';

beforeEach(() => {
    vi.restoreAllMocks();
});

const createJsonResponse = (data: any, status = 200) => {
    return new Response(JSON.stringify(data), {
        status,
        headers: { 'Content-Type': 'application/json' }
    });
};

test('should return a successful response with JSON data', async () => {
    const mockData = { status: 'ok', uptime: 123456 };
    const fetchSpy = mockFetch(mockData);

    const result = await ta.utilities.status();
    expect(result).toEqual(mockData);
    expect(fetchSpy).toHaveBeenCalledWith(
        expect.stringContaining('/v2/status'),
        expect.any(Object)
    );
});

test('should handle an error response with a JSON message', async () => {
    const mockError = { error: 'Invalid request' };
    vi.spyOn(global, 'fetch').mockResolvedValueOnce(createJsonResponse(mockError, 400));

    await expect(ta.utilities.status()).rejects.toThrow('Invalid request');
});

test('should handle an error response with a string message', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValueOnce(createJsonResponse('Simple error message', 500));

    await expect(ta.utilities.status()).rejects.toThrow('Simple error message');
});

test('should include a cause in the error object', async () => {
    const mockError = { error: 'Invalid request' };
    vi.spyOn(global, 'fetch').mockResolvedValueOnce(createJsonResponse(mockError, 400));

    await expect(ta.utilities.status()).rejects.toMatchObject({
        message: 'Invalid request',
        cause: expect.any(Object)
    });
});

test('should handle an error response without JSON', async () => {
    const mockError = new Error('Network failure');
    vi.spyOn(global, 'fetch').mockRejectedValueOnce(mockError);

    await expect(ta.utilities.status()).rejects.toThrow('Network failure');
});

test('should handle an error response with invalid JSON', async () => {
    const response = new Response('Invalid JSON', {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
    });
    vi.spyOn(global, 'fetch').mockResolvedValueOnce(response);

    await expect(ta.utilities.status()).rejects.toThrow('Failed to parse error response');
});

test('should handle an unknown error type (object)', async () => {
    vi.spyOn(global, 'fetch').mockRejectedValueOnce({ message: 'Some unknown error' } as any);

    await expect(ta.utilities.status()).rejects.toThrow('Unknown error occurred');
});

test('should handle an unknown error type (string)', async () => {
    vi.spyOn(global, 'fetch').mockRejectedValueOnce('Some unknown error' as any);

    await expect(ta.utilities.status()).rejects.toThrow('Unknown error occurred');
});

test('should handle null as an error', async () => {
    vi.spyOn(global, 'fetch').mockRejectedValueOnce(null as any);

    await expect(ta.utilities.status()).rejects.toThrow('Unknown error occurred');
});

test('should handle undefined as an error', async () => {
    vi.spyOn(global, 'fetch').mockRejectedValueOnce(undefined as any);

    await expect(ta.utilities.status()).rejects.toThrow('Unknown error occurred');
});

test('should handle a JSON error response without an error field', async () => {
    const mockError = { message: 'Some error without error field' };
    vi.spyOn(global, 'fetch').mockResolvedValueOnce(createJsonResponse(mockError, 400));

    await expect(ta.utilities.status()).rejects.toThrow(
        `Wrong error response: {\"message\":\"Some error without error field\"}`
    );
});
