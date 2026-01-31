/*TEST PLAN

https://www.agoda.com/

1. Membership Registration
2. Login & Logout
3. Logged In E2E tests (Hotels Reservation)
4. Language Select
5. Currency Select
6. Add a Hotel to Favourites

*/
const {test, expect} = require('@playwright/test');
const { fileURLToPath } = require('node:url');

test.only("Agoda - Membership Registration", async ({browser})=>
{
    const context = await browser.newContext()
    const page = await context.newPage()
    await page.goto("https://www.agoda.com/")//Open site
    const agodaLogo = page.locator(".cxsKGP")
    await expect(agodaLogo).toBeVisible()//Wait until the page is loaded by checking if the "Agoda" logo is loaded

    await page.getByRole("button", {name: "Create Account"}).click()//Click Create Account

    //Sign In/Login page contains an iframe, so we need to locate the iframe using frameLocator first
    const iframePage = page.frameLocator("iframe[title='Universal login']")
    await expect(iframePage.locator("h2.sc-fvtFIe")).toContainText("Sign in or create an account")//Check if the "Create Account/Login" screen is loaded


    //Go to InstAddr and login to retrieve the OTP
    const InstAddr = "https://m.kuku.lu/recv.php"
    const page2 = await page.context().newPage()
    await page2.goto(InstAddr)


    const email = "payink7@otona.uk"
    await expect(iframePage.locator("input[placeholder='id@email.com']")).toBeEnabled()
    await iframePage.locator("input[placeholder='id@email.com']").fill(email)
    await expect(iframePage.locator("button[data-cy='unified-email-continue-button']")).toBeEnabled()
    await iframePage.locator("button[data-cy='unified-email-continue-button']").click()

    const firstName = "Sativel"
    const lastName = "Nathan"
    await iframePage.locator("input[autocomplete='given-name']").fill(firstName)
    await iframePage.locator("input[autocomplete='family-name']").fill(lastName)
    await iframePage.getByRole("checkbox").click()
    await expect(iframePage.getByRole("checkbox")).not.toBeChecked()

    await page.pause()

    //const otpBox = page.locator("div.ad15b-mt-16").first()
    //await otpBox.fill()



});

