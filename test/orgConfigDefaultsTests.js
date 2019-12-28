/* eslint-env mocha */
const expect = require("chai").expect;
const orgConfigDefaults = require("../lib/orgConfigDefaults");
const mockClient = require("./mockClient");

describe("Org Config Defaults", function() {
  beforeEach(() => {
    mockClient.reset();
    orgConfigDefaults.setClient(mockClient);
  });

  it("should be able to set a default", async function() {
    await orgConfigDefaults.setDefault(
      "some-org",
      "some-default",
      "some-value"
    );
    expect(
      mockClient.getCache()["stampede-config-defaults-some-org"].defaults[
        "some-default"
      ]
    ).to.equal("some-value");
  });

  it("should be able to set defaults", async function() {
    await orgConfigDefaults.storeDefaults("some-org", {
      defaults: { "some-default": "some-value" }
    });
    expect(
      mockClient.getCache()["stampede-config-defaults-some-org"].defaults[
        "some-default"
      ]
    ).to.equal("some-value");
  });

  it("should be able to fetch defaults", async function() {
    await orgConfigDefaults.storeDefaults("some-org", {
      defaults: { "some-default": "some-value" }
    });
    const fetched = await orgConfigDefaults.fetchDefaults("some-org");
    expect(fetched.defaults["some-default"]).to.equal("some-value");
  });

  it("should be able to remove defaults", async function() {
    await orgConfigDefaults.storeDefaults("some-org", {
      defaults: { "some-default": "some-value" }
    });
    const fetched = await orgConfigDefaults.fetchDefaults("some-org");
    expect(fetched.defaults["some-default"]).to.equal("some-value");
    await orgConfigDefaults.removeDefaults("some-org");
    const fetchedAfterRemove = await orgConfigDefaults.fetchDefaults(
      "some-org"
    );
    expect(fetchedAfterRemove.defaults["some-default"]).to.be.an("undefined");
  });

  it("should be able to remove a single default", async function() {
    await orgConfigDefaults.storeDefaults("some-org", {
      defaults: {
        "some-default": "some-value",
        "some-other-default": "some-other-value"
      }
    });
    await orgConfigDefaults.removeDefault("some-org", "some-default");
    const fetched = await orgConfigDefaults.fetchDefaults("some-org");
    expect(fetched.defaults["some-default"]).to.be.an("undefined");
    expect(fetched.defaults["some-other-default"]).to.equal("some-other-value");
  });
});
