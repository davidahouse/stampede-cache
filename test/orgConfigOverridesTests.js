/* eslint-env mocha */
const expect = require("chai").expect;
const orgConfigOverrides = require("../lib/orgConfigOverrides");
const mockClient = require("./mockClient");

describe("Org Config Overrides", function() {
  beforeEach(() => {
    mockClient.reset();
    orgConfigOverrides.setClient(mockClient);
  });

  it("should be able to set a override", async function() {
    await orgConfigOverrides.setOverride(
      "some-org",
      "some-override",
      "some-value"
    );
    expect(
      mockClient.getCache()["stampede-config-overrides-some-org"].overrides[
        "some-override"
      ]
    ).to.equal("some-value");
  });

  it("should be able to set Overrides", async function() {
    await orgConfigOverrides.storeOverrides("some-org", {
      overrides: { "some-override": "some-value" }
    });
    expect(
      mockClient.getCache()["stampede-config-overrides-some-org"].overrides[
        "some-override"
      ]
    ).to.equal("some-value");
  });

  it("should be able to fetch Overrides", async function() {
    await orgConfigOverrides.storeOverrides("some-org", {
      overrides: { "some-override": "some-value" }
    });
    const fetched = await orgConfigOverrides.fetchOverrides("some-org");
    expect(fetched.overrides["some-override"]).to.equal("some-value");
  });

  it("should be able to remove Overrides", async function() {
    await orgConfigOverrides.storeOverrides("some-org", {
      overrides: { "some-override": "some-value" }
    });
    const fetched = await orgConfigOverrides.fetchOverrides("some-org");
    expect(fetched.overrides["some-override"]).to.equal("some-value");
    await orgConfigOverrides.removeOverrides("some-org");
    const fetchedAfterRemove = await orgConfigOverrides.fetchOverrides(
      "some-org"
    );
    expect(fetchedAfterRemove.overrides["some-override"]).to.be.an("undefined");
  });

  it("should be able to remove a single override", async function() {
    await orgConfigOverrides.storeOverrides("some-org", {
      overrides: {
        "some-override": "some-value",
        "some-other-override": "some-other-value"
      }
    });
    await orgConfigOverrides.removeOverride("some-org", "some-override");
    const fetched = await orgConfigOverrides.fetchOverrides("some-org");
    expect(fetched.overrides["some-override"]).to.be.an("undefined");
    expect(fetched.overrides["some-other-override"]).to.equal(
      "some-other-value"
    );
  });
});
