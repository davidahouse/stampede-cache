/* eslint-env mocha */
const expect = require("chai").expect;
const repoConfigOverrides = require("../lib/repoConfigOverrides");
const mockClient = require("./mockClient");

describe("Repo Config Overrides", function() {
  beforeEach(() => {
    mockClient.reset();
    repoConfigOverrides.setClient(mockClient);
  });

  it("should be able to set a override", async function() {
    await repoConfigOverrides.setOverride(
      "some-org",
      "some-repo",
      "some-override",
      "some-value"
    );
    expect(
      mockClient.getCache()["stampede-config-overrides-some-org-some-repo"]
        .overrides["some-override"]
    ).to.equal("some-value");
  });

  it("should be able to set Overrides", async function() {
    await repoConfigOverrides.storeOverrides("some-org", "some-repo", {
      overrides: { "some-override": "some-value" }
    });
    expect(
      mockClient.getCache()["stampede-config-overrides-some-org-some-repo"]
        .overrides["some-override"]
    ).to.equal("some-value");
  });

  it("should be able to fetch Overrides", async function() {
    await repoConfigOverrides.storeOverrides("some-org", "some-repo", {
      overrides: { "some-override": "some-value" }
    });
    const fetched = await repoConfigOverrides.fetchOverrides(
      "some-org",
      "some-repo"
    );
    expect(fetched.overrides["some-override"]).to.equal("some-value");
  });

  it("should be able to remove Overrides", async function() {
    await repoConfigOverrides.storeOverrides("some-org", "some-repo", {
      overrides: { "some-override": "some-value" }
    });
    const fetched = await repoConfigOverrides.fetchOverrides(
      "some-org",
      "some-repo"
    );
    expect(fetched.overrides["some-override"]).to.equal("some-value");
    await repoConfigOverrides.removeOverrides("some-org", "some-repo");
    const fetchedAfterRemove = await repoConfigOverrides.fetchOverrides(
      "some-org",
      "some-repo"
    );
    expect(fetchedAfterRemove.overrides["some-override"]).to.be.an("undefined");
  });

  it("should be able to remove a single override", async function() {
    await repoConfigOverrides.storeOverrides("some-org", "some-repo", {
      overrides: {
        "some-override": "some-value",
        "some-other-override": "some-other-value"
      }
    });
    await repoConfigOverrides.removeOverride(
      "some-org",
      "some-repo",
      "some-override"
    );
    const fetched = await repoConfigOverrides.fetchOverrides(
      "some-org",
      "some-repo"
    );
    expect(fetched.overrides["some-override"]).to.be.an("undefined");
    expect(fetched.overrides["some-other-override"]).to.equal(
      "some-other-value"
    );
  });
});
