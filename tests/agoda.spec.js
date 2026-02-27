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

//test.use({ storageState: 'auth.json' });

test.only("Agoda - Membership Registration", async ({browser})=>
{
    const email = "manfewhug@pngk.uk"
    
    const context = await browser.newContext()
    const page = await context.newPage()
    await page.goto("https://www.agoda.com/")//Open site
    const agodaLogo = page.locator(".cxsKGP")
    await expect(agodaLogo).toBeVisible()//Wait until the page is loaded by checking if the "Agoda" logo is loaded

    await page.getByRole("button", {name: "Create Account"}).click()//Click Create Account
    const iframePage = page.frameLocator("iframe[title='Universal login']")//Sign In/Login page contains an iframe, so we need to locate the iframe using frameLocator first
    await expect(iframePage.locator("h2.sc-fvtFIe")).toContainText("Sign in or create an account")//Check if the "Create Account/Login" screen is loaded

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
    await expect(iframePage.locator("button[data-cy='profile-continue-button']")).toBeEnabled()
    await iframePage.locator("button[data-cy='profile-continue-button']").click()


    //Go to InstAddr and login to retrieve the OTP
    const InstAddr = "https://m.kuku.lu/recv.php"
    const InstAddr_AccountID = "254884629175"
    const InstAddr_Pasword = "wJVQ#:bu0FIAna"


    const page2 = await page.context().newPage()
    await page2.goto(InstAddr)

    //FRESH INSTADDR LOGIN
    
    await page2.getByText("Config").click()
    await page2.locator("a[data-icon='power']").click()
    await page2.locator("#link_loginform").click()
    await page2.locator("#user_number").fill(InstAddr_AccountID)
    await page2.locator("#user_password").fill(InstAddr_Pasword)
    await page2.locator("a[href*='checkLogin']").click()
    await page2.locator("#area-confirm-dialog-button-ok").click()
    await page2.getByText(email).click()
    await page2.locator("a[data-icon='mail']").click()
    let emailContent = await page2.locator("div[id*='area_mail_title_']").first().textContent()
    

    //INSTADDR WITH AUTH.JSON LOGIN (Remembers Credentials)
    /*
    await page2.locator("#search-basic").fill(email)
    await page2.press('#search-basic', 'Enter');
    let emailContent = await page2.locator("div[id*='area_mail_title_']").first().textContent()
    */


    console.log(emailContent)

    await context.storageState({ path: 'auth.json' });//Save login credentials of InstAddr?

    //RETRIEVE THE OTP FROM THE EMAIL HEADER
    const emailHeaderArr1 = emailContent.split("is")
    const otpStr = emailHeaderArr1[1].trim()
    const otp = parseInt(otpStr)

    let arrNums = otpStr.toString().split('').map(Number);
    console.log("arrNums: "+arrNums);

    console.log("OTP after trim:"+otp)
    console.log("OTP length:"+otpStr.length)

    await expect(iframePage.locator("div[data-cy='form-heading']")).toContainText("Sign in with OTP")

    await iframePage.locator("input[name='otp-0']").pressSequentially(otpStr[0], {delay:150})
    await iframePage.locator("input[name='otp-1']").pressSequentially(otpStr[1], {delay:150})
    await iframePage.locator("input[name='otp-2']").pressSequentially(otpStr[2], {delay:150})
    await iframePage.locator("input[name='otp-3']").pressSequentially(otpStr[3], {delay:150})
    await iframePage.locator("input[name='otp-4']").pressSequentially(otpStr[4], {delay:150})
    await iframePage.locator("input[name='otp-5']").pressSequentially(otpStr[5], {delay:150})

    await iframePage.locator("button[data-cy='unified-auth-otp-continue-button']").click()

    await page.pause()
    
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


//CODEGEN CODE
/*
import { test, expect } from '@playwright/test';

test('test', async ({ page }) => {
  await page.goto('https://m.kuku.lu/recv.php');
  await page.getByRole('img').nth(3).click();
  await page.getByRole('button', { name: 'Account' }).click();
  await page.getByRole('button', { name: 'Sign in to another account' }).click();
  await page.getByRole('textbox', { name: 'AccountID' }).click();
  await page.getByRole('textbox', { name: 'AccountID' }).fill('254884629175');
  await page.getByRole('textbox', { name: 'Password' }).click();
  await page.getByRole('textbox', { name: 'Password' }).fill('wJVQ#:bu0FIAna');
  await page.getByRole('button', { name: 'Login' }).click();
  await page.getByRole('button', { name: 'Yes' }).click();
  await page.getByRole('link').filter({ hasText: /^$/ }).nth(4).click();
  await page.getByRole('button', { name: 'Your email OTP for Agoda is 327563 14:16 (20day) | Agoda <no-reply@account.' }).click();
  await page.locator('iframe[name="area_maildata_iframe_42604354"]').contentFrame().getByRole('cell', { name: 'Hi, your Agoda OTP is 327563. It\'s valid for 10 minutes.', exact: true }).click();
});

*/