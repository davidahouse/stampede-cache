/* eslint-env mocha */
const expect = require("chai").expect;
const admin = require("../lib/admin");
const mockClient = require("./mockClient");

describe("Admin", function() {
  beforeEach(() => {
    mockClient.reset();
    admin.setClient(mockClient);
  });

  it("should be able to store a session and retrieve it", async function() {
    await admin.storeSession("123", { details: "some-details" }, 60 * 60);
    const details = await admin.fetchSession("123");
    expect(details.details).to.equal("some-details");
  });
});
