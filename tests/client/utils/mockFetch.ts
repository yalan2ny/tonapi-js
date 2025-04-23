import { vi } from 'vitest';
import { JSONStringify } from './jsonbig';

export const mockFetch = (data: any, status = 200) => {
    return vi.spyOn(global, 'fetch').mockResolvedValueOnce(
        new Response(JSONStringify(data), {
            status,
            headers: { 'Content-Type': 'application/json' }
        })
    );
};
