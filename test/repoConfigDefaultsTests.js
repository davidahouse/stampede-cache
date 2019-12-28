/* eslint-env mocha */
const expect = require("chai").expect;
const repoConfigDefaults = require("../lib/repoConfigDefaults");
const mockClient = require("./mockClient");

describe("Repo Config Defaults", function() {
  beforeEach(() => {
    mockClient.reset();
    repoConfigDefaults.setClient(mockClient);
  });

  it("should be able to set a default", async function() {
    await repoConfigDefaults.setDefault(
      "some-org",
      "some-repo",
      "some-default",
      "some-value"
    );
    expect(
      mockClient.getCache()["stampede-config-defaults-some-org-some-repo"]
        .defaults["some-default"]
    ).to.equal("some-value");
  });

  it("should be able to set defaults", async function() {
    await repoConfigDefaults.storeDefaults("some-org", "some-repo", {
      defaults: { "some-default": "some-value" }
    });
    expect(
      mockClient.getCache()["stampede-config-defaults-some-org-some-repo"]
        .defaults["some-default"]
    ).to.equal("some-value");
  });

  it("should be able to fetch defaults", async function() {
    await repoConfigDefaults.storeDefaults("some-org", "some-repo", {
      defaults: { "some-default": "some-value" }
    });
    const fetched = await repoConfigDefaults.fetchDefaults(
      "some-org",
      "some-repo"
    );
    expect(fetched.defaults["some-default"]).to.equal("some-value");
  });

  it("should be able to remove defaults", async function() {
    await repoConfigDefaults.storeDefaults("some-org", "some-repo", {
      defaults: { "some-default": "some-value" }
    });
    const fetched = await repoConfigDefaults.fetchDefaults(
      "some-org",
      "some-repo"
    );
    expect(fetched.defaults["some-default"]).to.equal("some-value");
    await repoConfigDefaults.removeDefaults("some-org", "some-repo");
    const fetchedAfterRemove = await repoConfigDefaults.fetchDefaults(
      "some-org",
      "some-repo"
    );
    expect(fetchedAfterRemove.defaults["some-default"]).to.be.an("undefined");
  });

  it("should be able to remove a single default", async function() {
    await repoConfigDefaults.storeDefaults("some-org", "some-repo", {
      defaults: {
        "some-default": "some-value",
        "some-other-default": "some-other-value"
      }
    });
    await repoConfigDefaults.removeDefault(
      "some-org",
      "some-repo",
      "some-default"
    );
    const fetched = await repoConfigDefaults.fetchDefaults(
      "some-org",
      "some-repo"
    );
    expect(fetched.defaults["some-default"]).to.be.an("undefined");
    expect(fetched.defaults["some-other-default"]).to.equal("some-other-value");
  });
});
