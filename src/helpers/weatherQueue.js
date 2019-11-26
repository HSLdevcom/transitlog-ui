import PQueue from "p-queue";

const queue = new PQueue({
  concurrency: 2,
  timeout: 10000,
  throwOnTimeout: true,
  autoStart: true,
  carryoverConcurrencyCount: true,
  intervalCap: 2,
  interval: 1000,
});

export default queue;
