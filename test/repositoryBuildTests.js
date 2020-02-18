/* eslint-env mocha */
const expect = require("chai").expect;
const repositoryBuilds = require("../lib/repositoryBuilds");
const mockClient = require("./mockClient");

describe("Repository builds", function() {
  beforeEach(() => {
    mockClient.reset();
    repositoryBuilds.setClient(mockClient);
  });

  it("should be able to add a build", async function() {
    await repositoryBuilds.updateRepositoryBuild("some-org", "some-repo", {
      id: "some-build"
    });
    expect(
      mockClient.getCache()["stampede-some-org-some-repo-repositoryBuilds"]
    ).to.include("some-build");
  });

  it("should be able to remove a build", async function() {
    await repositoryBuilds.updateRepositoryBuild("some-org", "some-repo", {
      id: "some-build"
    });
    await repositoryBuilds.removeRepositoryBuild(
      "some-org",
      "some-repo",
      "some-build"
    );
    expect(
      mockClient.getCache()["stampede-some-org-some-repo-repositoryBuilds"]
    ).to.not.include("some-build");
  });

  it("should be able to retrieve a single build", async function() {
    await repositoryBuilds.updateRepositoryBuild("some-org", "some-repo", {
      id: "some-build"
    });
    const info = await repositoryBuilds.fetchRepositoryBuild(
      "some-org",
      "some-repo",
      "some-build"
    );
    expect(info.id).to.equal("some-build");
  });

  it("should be able to update a build", async function() {
    await repositoryBuilds.updateRepositoryBuild("some-org", "some-repo", {
      id: "some-build"
    });
    const info = await repositoryBuilds.fetchRepositoryBuild(
      "some-org",
      "some-repo",
      "some-build"
    );
    expect(info.lastUpdated).to.be.undefined;
    await repositoryBuilds.updateRepositoryBuild("some-org", "some-repo", {
      id: "some-build",
      lastUpdated: "now"
    });
    const updatedinfo = await repositoryBuilds.fetchRepositoryBuild(
      "some-org",
      "some-repo",
      "some-build"
    );
    expect(updatedinfo.lastUpdated).to.equal("now");
  });

  // it("should be able to store system queues", async function() {
  //   await systemQueues.storeSystemQueues(["some-queue", "some-other-queue"]);
  //   expect(mockClient.getCache()["stampede-config-queues"]).to.include(
  //     "some-queue"
  //   );
  // });

  // it("should be able to fetch system queues", async function() {
  //   await systemQueues.storeSystemQueues(["some-queue", "some-other-queue"]);
  //   const queues = await systemQueues.fetchSystemQueues();
  //   expect(queues).to.include("some-queue");
  //   expect(queues).to.include("some-other-queue");
  // });

  // it("should be able to add a system queue", async function() {
  //   await systemQueues.storeSystemQueues(["some-queue", "some-other-queue"]);
  //   await systemQueues.addSystemQueue("some-third-queue");
  //   const queues = await systemQueues.fetchSystemQueues();
  //   expect(queues).to.include("some-queue");
  //   expect(queues).to.include("some-other-queue");
  //   expect(queues).to.include("some-third-queue");
  // });

  // it("should be able to remove a system queue", async function() {
  //   await systemQueues.storeSystemQueues(["some-queue", "some-other-queue"]);
  //   await systemQueues.removeSystemQueue("some-queue");
  //   const queues = await systemQueues.fetchSystemQueues();
  //   expect(queues).to.not.include("some-queue");
  //   expect(queues).to.include("some-other-queue");
  // });
});
