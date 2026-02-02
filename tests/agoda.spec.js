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
    const InstAddr_AccountID = "254884629175"
    const InstAddr_Pasword = "wJVQ#:bu0FIAna"
    const email = "oakantday@digdig.org"
    //const email = "payink7@otona.uk"


    const page2 = await page.context().newPage()
    await page2.goto(InstAddr)

    await page2.getByText("Config").click()
    await page2.locator("a[data-icon='power']").click()
    await page2.locator("#link_loginform").click()
    await page2.locator("#user_number").fill(InstAddr_AccountID)
    await page2.locator("#user_password").fill(InstAddr_Pasword)
    await page2.locator("a[href*='checkLogin']").click()
    await page2.locator("#area-confirm-dialog-button-ok").click()

    await page2.getByText(email).click()
    await page2.locator("a[data-icon='mail']").click()
    await page2.locator("a[id*='link_maildata']").first().click()

    const otpEmailHeader = await page2.locator("div.full").textContent()
    const emailHeaderArr = otpEmailHeader.split("")
    const otp = emailHeaderArr[-1]
    console.log("OTP: " + otp)
    
    await page2.pause()
    


    await expect(iframePage.locator("input[placeholder='id@email.com']")).toBeEnabled()
    await iframePage.locator("input[placeholder='id@email.com']").fill(email)
    await expect(iframePage.locator("button[data-cy='unified-email-continue-button']")).toBeEnabled()
    await iframePage.locator("button[data-cy='unified-email-continue-button']").click()

    /*
    const firstName = "Sativel"
    const lastName = "Nathan"
    await iframePage.locator("input[autocomplete='given-name']").fill(firstName)
    await iframePage.locator("input[autocomplete='family-name']").fill(lastName)
    await iframePage.getByRole("checkbox").click()
    await expect(iframePage.getByRole("checkbox")).not.toBeChecked()
    await expect(iframePage.locator("button[data-cy='profile-continue-button']")).toBeEnabled()
    await iframePage.locator("button[data-cy='profile-continue-button']").click()
    */

    await expect(iframePage.locator("div[data-cy='form-heading']")).toContainText("Sign in with OTP")
    await iframePage.locator("input[name='otp-0']").pressSequentially("123")//This works
    await page.pause()

    //const otpBox = page.locator("div.ad15b-mt-16").first()
    //await otpBox.fill()



});


//TODO: WORKS, BUT SOME LINES SHOULD BE OPTIMIZED TO BE MORE GENERIC SO IT CAN WORK REGARDLESS OF SEARCH CRITERIA
test("Agoda - Language & Currency Select", async({browser, page})=>
{
    await page.goto("https://www.agoda.com/")//Open site
    const agodaLogo = page.locator(".cxsKGP")
    await expect(agodaLogo).toBeVisible()//Wait until the page is loaded by checking if the "Agoda" logo is loaded

    /*Language Select*/
    const languageCode = "jp"//Use Inspector to check for the lang variable for the country code
    const homepageHeaderText = "もっとおトクに世界を旅しよう"//Check the Homepage header text for the value

    await page.locator(".Flag__StyledCdnIcon-sc-nifs7d-0").click()
    await page.locator(`p[lang='${languageCode}']`).click()
    await expect(page.locator("h1[data-selenium='hero-banner-h1']")).toHaveText(homepageHeaderText)


    /*Currency Select*/
    const currencyCode = "JPY" 
    const currencyIcon = "¥"

    await page.locator("div[data-selenium*='currency-container']").click()
    await page.locator(`div[data-value='${currencyCode}']`).first().click()
    await expect(page.locator("h1[data-selenium='hero-banner-h1']")).toBeVisible()


    await page.locator("#textInput").pressSequentially("バンコク", {delay: 500})

    await page.getByRole('option', { name: 'バンコク, タイ' }).first().click();//TODO: Update this to be more generic
    //await page.locator("ul li.Suggestion").first().click()

    await page.locator("#full-tab-2").click()//I'm flexible tab
    await page.locator("button[data-testid='flexible-dates-select-button']").click()
    

    const context = await browser.newContext()
    const [page2] = await Promise.all //Promise.all() returns an array, that's why we use [] on page2
    ([
        page.waitForEvent("popup"),//"Listener" that watches for a new tab/window
        page.locator("button[data-element-name='search-button']").click()//Clicks the page that opens the new window/tab
    ])
    
    
    //await expect(page.locator("#price-filter-group").first()).toBeVisible()
    await expect(page2.locator("span.PropertyCardPrice__Currency").nth(1)).toContainText(currencyIcon)
    await page2.pause()

});
