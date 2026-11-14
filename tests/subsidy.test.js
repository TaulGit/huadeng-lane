import test from 'node:test';
import assert from 'node:assert/strict';
import { claimSubsidy } from '../src/subsidy.js';

const item = { id: 8, targetType: 'lane_subsidy', targetAmount: 120, adWatchCount: 1 };
const order = { ...item, adOrderId: 'a1' };
function platform(exchange) {
  return { exchange: { listItems: async () => ({ items: [item] }), exchange } };
}

test('a completed ad persists one reward even if delivery repeats', async () => {
  const state = { day: 2, cash: 400 };
  let writes = 0;
  const sdk = platform(async ({ via, deliver }) => {
    assert.equal(via, 'ad');
    await deliver(order);
    await deliver(order);
  });
  await claimSubsidy(sdk, state, async next => {
    writes++;
    assert.equal(next.cash, 520);
  });
  assert.equal(writes, 1);
  assert.equal(state.cash, 520);
  await assert.rejects(claimSubsidy(sdk, state, async () => {}), /今天/);
});
test('cancellation and failed storage both preserve the original balance', async () => {
  const state = { day: 1, cash: 400 };
  const cancelled = platform(async () => { throw new Error('cancelled'); });
  await assert.rejects(claimSubsidy(cancelled, state, assert.fail), /cancelled/);
  const completed = platform(async ({ deliver }) => deliver(order));
  await assert.rejects(claimSubsidy(completed, state, async () => { throw new Error('offline'); }), /offline/);
  assert.deepEqual(state, { day: 1, cash: 400 });
});
