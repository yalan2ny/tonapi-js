import { Address, Tuple, TupleItem } from '@ton/core';
import { execGetMethodForBlockchainAccount } from './__mock__/tuple';
import { ta } from './utils/client';
import { mockFetch } from './utils/mockFetch';
import { test, expect, afterEach, vi } from 'vitest';

afterEach(() => {
    vi.restoreAllMocks();
});

function guardTuple(item: TupleItem): item is Tuple {
    return item.type === 'tuple';
}

test('Tuple test', async () => {
    mockFetch(execGetMethodForBlockchainAccount);

    const addressString = 'Ef_X4pRKtgXOXYMOXNgXNRdlhkNKJ9bTKMfqvj6HDIiQG98F';
    const addressObject = Address.parse(addressString);
    const res = await ta.blockchain.execGetMethodForBlockchainAccount(
        addressObject,
        'list_nominators'
    );
    const highLevelTuple = res.stack[0];

    expect(res).toBeDefined();
    expect(res.success).toBeDefined();
    expect(highLevelTuple).toBeDefined();
    expect(highLevelTuple.type).toBeDefined();
    expect(highLevelTuple.type).toBe('tuple');

    if (guardTuple(highLevelTuple)) {
        expect(highLevelTuple.items).toBeDefined();

        const secondLevelTupleFirst = highLevelTuple.items[0];
        expect(secondLevelTupleFirst).toBeDefined();
        expect(secondLevelTupleFirst.type).toBeDefined();
        expect(secondLevelTupleFirst.type).toBe('tuple');

        if (guardTuple(secondLevelTupleFirst)) {
            expect(secondLevelTupleFirst.items).toBeDefined();
        } else {
            throw new Error('Second Tuple guard failed');
        }
    } else {
        throw new Error('First Tuple guard failed');
    }
});
