import { getBlockchainBlockTransactions } from './__mock__/services';
import { ta } from './utils/client';

global.fetch = () => Promise.resolve(new Response(getBlockchainBlockTransactions));

describe.skip('Memory leak test', () => {
    const iterations = 500000;

    if (global.gc) {
        global.gc();
    } else {
        console.warn('Run test with flag --expose-gc');
    }

    test('Memory leak test for raw fetch', async () => {
        const initialMemory = process.memoryUsage().heapUsed;
        let memoryUsageSamples: number[] = [];

        ta.utilities.status();
        // .then(data => {
        //     console.log(data);
        // });

        for (let i = 0; i < iterations; i++) {
            await ta.blockchain.getBlockchainBlockTransactions('(-1,8000000000000000,4234234)');

            // 🔍 Log memory usage every 1,000,000 iterations
            if (i % 50000 === 0) {
                const currentMemory = process.memoryUsage().heapUsed;
                console.log(`Iteration ${i}, memory: ${currentMemory / 1024 / 1024} MB`);
                memoryUsageSamples.push(currentMemory);
            }
        }

        if (global.gc) global.gc();

        await new Promise(resolve => setTimeout(resolve, 5000)); // Wait for GC to work

        const finalMemory = process.memoryUsage().heapUsed;
        console.log(`Memory before: ${initialMemory}, Memory after: ${finalMemory}`);

        console.log(
            'Memory samples during execution:',
            memoryUsageSamples.map(m => m / 1024 / 1024)
        );

        expect((finalMemory - initialMemory) / 1024 / 1024).toBeLessThan(15); // Memory growth should not be significant (15MB)
    }, 1000000);
});
