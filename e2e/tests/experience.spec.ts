import { expect, test } from "@playwright/test";

test.describe("3D intro bundle @smoke", () => {
  test("index and licenses are served", async ({ request }) => {
    const index = await request.get("/experience/index.html");
    expect(index.ok()).toBeTruthy();
    expect(await index.text()).toContain("<script");

    const licenses = await request.get("/experience/licenses.txt");
    expect(licenses.ok()).toBeTruthy();
    expect(await licenses.text()).toMatch(/MIT/);
  });
});
