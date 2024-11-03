import { test, expect } from "@playwright/test";

const WashingtonWiki = {
    title: "Washington (state)",
    content: `
Washington, officially the State of Washington,[3] is the northernmost state in the Pacific Northwest region of the United States. It is often referred to as Washington state[a] to distinguish it from the national capital,[4] both named for George Washington (the first U.S. president). Washington borders the Pacific Ocean to the west, Oregon to the south, Idaho to the east, and shares an international border with the Canadian province of British Columbia to the north. Olympia is the state capital, and the most populous city is Seattle.
Washington is the 18th-largest state, with an area of 71,362 square miles (184,830 km2), and the 13th-most populous state, with more than 7.8 million people.[5] The majority of Washington's residents live in the Seattle metropolitan area, the center of transportation, business, and industry on Puget Sound,[6][7] an inlet of the Pacific Ocean consisting of numerous islands, deep fjords and bays carved out by glaciers. The remainder of the state consists of deep temperate rainforests in the west; mountain ranges in the west, center, northeast, and far southeast; and a semi-arid basin region in the east, center, and south, given over to intensive agriculture. Washington is the second most populous state on the West Coast and in the Western United States, after California. Mount Rainier, an active stratovolcano, is the state's highest elevation at 14,411 feet (4,392 meters), and is the most topographically prominent mountain in the contiguous U.S.
Washington is a leading lumber producer, the largest producer of apples, hops, pears, blueberries, spearmint oil, and sweet cherries in the U.S., and ranks high in the production of apricots, asparagus, dry edible peas, grapes, lentils, peppermint oil, and potatoes.[8][9] Livestock, livestock products, and commercial fishing—particularly of salmon, halibut, and bottomfish—are also significant contributors to the state's economy.[10] Washington ranks second only to California in wine production. Manufacturing industries in Washington include aircraft, missiles, shipbuilding, and other transportation equipment, food processing, metals, and metal products, chemicals, and machinery.[11]
The state was formed from the western part of the Washington Territory, which was ceded by the British Empire in the Oregon Treaty of 1846. It was admitted to the Union as the 42nd state in 1889. One of the wealthiest and most socially liberal states in the country,[12] Washington consistently ranks among the top states for highest life expectancy and employment rates.[13] It was one of the first states (alongside Colorado) to legalize medicinal and recreational cannabis,[14] was among the first states to introduce same-sex marriage,[15] and was one of only four states to have provided legal abortions on request before Roe v. Wade in 1973.[16] Washington voters also approved a 2008 referendum on the legalization of physician-assisted suicide,[17] making it one of 10 states to have legalized the practice.[18] `,
};

test.beforeEach(async ({ page }) => {
    await page.goto("http://localhost:3000/");
});

test.describe("Quiz", () => {
    // Basic health check
    test("dashboard has title", async ({ page }) => {
        // Expect a title "to contain" a substring.
        await expect(page).toHaveTitle(/Noggin/);
    });

    // The main workflow
    test("can create a new quiz", async ({ page }) => {
        test.slow(); // This test is slow because it waits for the quiz to be created.
        // Click the get started link.
        await page.getByRole("button", { name: "Create Quiz" }).click();

        // Expects page to have a heading with the name of Create New Quiz.
        await expect(
            page.getByRole("heading", { name: "Create New Quiz" }),
        ).toBeVisible();

        // Fill in the form
        await page.getByLabel("Title").fill(WashingtonWiki.title);
        await page.getByLabel("Content").fill(WashingtonWiki.content);
        await page.getByLabel("Number of Questions").fill("3");

        // Submit the form
        await page.getByRole("button", { name: "Generate Quiz" }).click();

        // Wait for the quiz to be created
        await page.waitForURL("http://localhost:3000/quiz/view/1");

        // Expects page to have a heading with the name of the quiz.
        await expect(
            page.getByRole("heading", { name: WashingtonWiki.title }),
        ).toBeVisible();
    });
});
