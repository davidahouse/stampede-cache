/* eslint-env mocha */
const expect = require("chai").expect;
const systemQueues = require("../lib/systemQueues");
const mockClient = require("./mockClient");

describe("System Queues", function() {
  beforeEach(() => {
    mockClient.reset();
    systemQueues.setClient(mockClient);
  });

  it("should be able to store system queues", async function() {
    await systemQueues.storeSystemQueues(["some-queue", "some-other-queue"]);
    expect(mockClient.getCache()["stampede-config-queues"]).to.include(
      "some-queue"
    );
  });

  it("should be able to fetch system queues", async function() {
    await systemQueues.storeSystemQueues(["some-queue", "some-other-queue"]);
    const queues = await systemQueues.fetchSystemQueues();
    expect(queues).to.include("some-queue");
    expect(queues).to.include("some-other-queue");
  });

  it("should be able to add a system queue", async function() {
    await systemQueues.storeSystemQueues(["some-queue", "some-other-queue"]);
    await systemQueues.addSystemQueue("some-third-queue");
    const queues = await systemQueues.fetchSystemQueues();
    expect(queues).to.include("some-queue");
    expect(queues).to.include("some-other-queue");
    expect(queues).to.include("some-third-queue");
  });

  it("should be able to remove a system queue", async function() {
    await systemQueues.storeSystemQueues(["some-queue", "some-other-queue"]);
    await systemQueues.removeSystemQueue("some-queue");
    const queues = await systemQueues.fetchSystemQueues();
    expect(queues).to.not.include("some-queue");
    expect(queues).to.include("some-other-queue");
  });
});
