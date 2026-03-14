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


const user = 
{
    loginEmail: "sativel@hotmail.com",
    loginPassword: "Newpassword2",
    userName: "Sativel N.",
    firstName: "Sativel",
    lastName: "Nathan",
    InstAddrURL: "https://m.kuku.lu/recv.php",
    InstAddr_AccountID: "254884629175",
    InstAddr_Password: "wJVQ#:bu0FIAna"

}

test("Agoda - Login - Created Account with successful first-time Login", async ({page})=>
{
    await page.goto("https://www.agoda.com/")
    const agodaLogo = page.locator(".cxsKGP")
    await expect(agodaLogo).toBeVisible()

    await page.getByRole("button", {name: "Sign in"}).click()
    const iframePage = page.frameLocator("iframe[title='Universal login']")
    await iframePage.getByPlaceholder("id@email.com").fill(user.loginEmail)
    await iframePage.getByRole("button", {name: "Continue"}).click()
    await iframePage.getByRole("button", {name: "Use Password"}).click()
    await iframePage.locator("#password").fill(user.loginPassword)
    await iframePage.getByRole("button", {name: "Sign in", exact: true}).click()

    await expect(page.locator("span[data-element-name='user-name'] p")).toContainText(user.userName)

    await page.pause()
});


//test.use({ storageState: 'auth.json' });
//TODO: It works up until the part where we need to click "Not Now" to refuse passkey setup. But this code can be improved I think
test.only("Agoda - Membership Registration", async ({browser})=>
{
    //CREATE A FRESH EMAIL ADDRESS
    const context1 = await browser.newContext()
    const page1 = await context1.newPage()
    await page1.goto(user.InstAddrURL)
    await page1.getByText("Config").click()
    await page1.locator("a[data-icon='power']").click()
    await page1.locator("#link_loginform").click()
    await page1.locator("#user_number").fill(user.InstAddr_AccountID)
    await page1.locator("#user_password").fill(user.InstAddr_Password)
    await page1.locator("a[href*='checkLogin']").click()
    await page1.locator("#area-confirm-dialog-button-ok").click()
    await page1.locator("#link_addMailAddrByOnetime").click()
    const freshEmail = await page1.locator("div.noticebox u b").first().textContent()
    console.log("freshEmail: "+ freshEmail)


    //GO TO AGODA AND START THE MEMBERSHIP REGISTRATION PROCESS
    const context2 = await browser.newContext()
    const page2 = await context2.newPage()
    await page2.goto("https://www.agoda.com/")
    const agodaLogo = page2.locator(".cxsKGP")
    await expect(agodaLogo).toBeVisible()

    await page2.getByRole("button", {name: "Create Account"}).click()
    const iframePage = page2.frameLocator("iframe[title='Universal login']")//Sign In/Login page contains an iframe, so we need to locate the iframe using frameLocator first
    await expect(iframePage.locator("h2.sc-fvtFIe")).toContainText("Sign in or create an account")

    await expect(iframePage.locator("input[placeholder='id@email.com']")).toBeEnabled()
    await iframePage.locator("input[placeholder='id@email.com']").fill(freshEmail)
    await expect(iframePage.locator("button[data-cy='unified-email-continue-button']")).toBeEnabled()
    await iframePage.locator("button[data-cy='unified-email-continue-button']").click()

    await iframePage.locator("input[autocomplete='given-name']").fill(user.firstName)
    await iframePage.locator("input[autocomplete='family-name']").fill(user.lastName)
    await iframePage.getByRole("checkbox").click()
    await expect(iframePage.getByRole("checkbox")).not.toBeChecked()
    await expect(iframePage.locator("button[data-cy='profile-continue-button']")).toBeEnabled()
    await iframePage.locator("button[data-cy='profile-continue-button']").click()

    //GET THE EMAIL FROM INSTADDR
    const context3 = await browser.newContext()
    const page3 = await context3.newPage()
    await page3.goto(user.InstAddrURL)
    await page3.getByText("Config").click()
    await page3.locator("a[data-icon='power']").click()
    await page3.locator("#link_loginform").click()
    await page3.locator("#user_number").fill(user.InstAddr_AccountID)
    await page3.locator("#user_password").fill(user.InstAddr_Password)
    await page3.locator("a[href*='checkLogin']").click()
    await page3.locator("#area-confirm-dialog-button-ok").click()
    await page3.getByText(freshEmail).click()
    await page3.locator("a[data-icon='mail']").click()
    let emailContent = await page3.locator("div[id*='area_mail_title_']").first().textContent()
    

    
    /*
    //INSTADDR WITH AUTH.JSON LOGIN (Remembers Credentials)
    await page2.locator("#search-basic").fill(email)
    await page2.press('#search-basic', 'Enter');
    let emailContent = await page2.locator("div[id*='area_mail_title_']").first().textContent()
    await context.storageState({ path: 'auth.json' });//Save login credentials of InstAddr?
    */


    //RETRIEVE THE OTP FROM THE EMAIL HEADER
    const emailHeaderArr1 = emailContent.split("is")
    const otpStr = emailHeaderArr1[1].trim()
    const otp = parseInt(otpStr)
    let arrNums = otpStr.toString().split('').map(Number);

    await expect(iframePage.locator("div[data-cy='form-heading']")).toContainText("Sign in with OTP")
    await iframePage.locator("input[name='otp-0']").pressSequentially(otpStr[0], {delay:150})
    await iframePage.locator("input[name='otp-1']").pressSequentially(otpStr[1], {delay:150})
    await iframePage.locator("input[name='otp-2']").pressSequentially(otpStr[2], {delay:150})
    await iframePage.locator("input[name='otp-3']").pressSequentially(otpStr[3], {delay:150})
    await iframePage.locator("input[name='otp-4']").pressSequentially(otpStr[4], {delay:150})
    await iframePage.locator("input[name='otp-5']").pressSequentially(otpStr[5], {delay:150})
    await iframePage.locator("button[data-cy='unified-auth-otp-continue-button']").click()

    await page2.pause()
    
    
    
});


//TODO: WORKS, BUT SOME LINES SHOULD BE OPTIMIZED TO BE MORE GENERIC SO IT CAN WORK REGARDLESS OF SEARCH CRITERIA
test("Agoda - Language & Currency Select", async({browser, page})=>
{

    /*Language Select*/
    const languageCode = "jp"//Use Inspector to check for the lang variable for the country code
    const homepageHeaderText = "もっとおトクに世界を旅しよう"//Check the Homepage header text for the value

    await page.goto("https://www.agoda.com/")
    const agodaLogo = page.locator(".cxsKGP")
    await expect(agodaLogo).toBeVisible()

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

    await page.locator("#full-tab-2").click()//I'm flexible tab
    await page.locator("button[data-testid='flexible-dates-select-button']").click()
    

    const context = await browser.newContext()
    const [page2] = await Promise.all //Promise.all() returns an array, that's why we use [] on page2
    ([
        page.waitForEvent("popup"),//"Listener" that watches for a new tab/window
        page.locator("button[data-element-name='search-button']").click()//Clicks the page that opens the new window/tab
    ])
    
    
    await expect(page2.locator("span.PropertyCardPrice__Currency").nth(1)).toContainText(currencyIcon)
    await page2.pause()

});