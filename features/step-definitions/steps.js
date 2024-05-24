const { Given, When, Then } = require('@wdio/cucumber-framework');
// variables
let urlToWebsite = 'https://weathershopper.pythonanywhere.com/'
let websiteTitle = ''
let productButton = ''
let temperature = ''
let temperatureValue = ''
let productsPageTitle = ''
let productsName = ''
let productsPrice = ''
let splittedPrices = ''
let productsPriceWithoutUnit = []
let leastPrice = 0
let index = 0
let productsPriceArrayElement = ''
let productsNameArray = []
let productsPriceArray = []
let productNameElement = ''
let sumOfPrices = 0
let finalPriceElement = ''
let paymentButton = ''
let iframeSection = ''
// locators
const websiteTitleLocator = 'h2'
const moisturizerButtonLocator = '//a[@href="/moisturizer"]'
const sunscreenButtonLocator = '//a[@href="/sunscreen"]'
const temperatureLocator = '#temperature'
const productsPageTitleLocator = 'h2'
// productsName = await $$(`//*[contains(text(),'${text}') or contains(text(),'${text.toLowerCase()}')]`)
// const productsNameLocator = (`//*[contains(text(),'${text}') or contains(text(),'${text.toLowerCase()}')]`)
// const productsPriceLocator =(`//*[contains(text(),'${text}') or contains(text(),'${text.toLowerCase()}')]/following-sibling::p`)
const cartLocator = '#cart'
const totalPriceLocator = '#total'
const paymentButtonLocator = 'button=Pay with Card'
const iframeLocator = 'iframe[name="stripe_checkout_app"]'
const emailLocator = "//input[@placeholder='Email']"
const cardNumberLocator = "//input[@placeholder='Card number']"
const expiryDateLocator = "//input[@placeholder='MM / YY']"
const cvcLocator = "//input[@placeholder='CVC']"
const billingZipLocator = "//input[@placeholder='ZIP Code']"
const submitButton = '#submitButton'
const successMessageLocator = 'h2'


// function getProductType(productType){
//     const getOsdds= `//a[@href="/${productType}"]`
// }
// await getProductType("sunscreen").getText()

// function 1
async function visitWebsite(url) {
    await browser.url(url)
    websiteTitle = $(websiteTitleLocator)
    await expect(websiteTitle).toHaveText('Current temperature')
}
// function 2
// rename functions
async function clickOnButtons(productButtonLocator){
    productButton = $(productButtonLocator) //remove await
    await productButton.waitForDisplayed() //waitfordisplayed 
    await productButton.click()
}

// funtion 3
async function getTemperature(temperatureLocator){
    temperature = await $(temperatureLocator).getText()
}

// function 4
async function getTemperatureValueOnly(temperature){
    temperatureValue = temperature.match(/(\d+)/);
    if (temperatureValue) {
        temperatureValue = temperatureValue[0];
    }
} // use on variable

// function 5
async function clickRelevantArticle(lowerTemperature, higherTemperature, temperatureValue){
    if(temperatureValue < lowerTemperature){
        await clickOnButtons(moisturizerButtonLocator)
        await checkProductsPage('Moisturizers')
        await getProductsListAndPrices('Almond') 
        await getProductsListAndPrices('Aloe')
    }
    else if(temperatureValue > higherTemperature){
        await clickOnButtons(sunscreenButtonLocator)
        await checkProductsPage('Sunscreens')
        await getProductsListAndPrices('SPF-30')
        await getProductsListAndPrices('SPF-50')
    }
}

// function 6
async function checkProductsPage(textOfSelectedProduct) {
    productsPageTitle = $(productsPageTitleLocator)
    await expect(productsPageTitle).toHaveText(textOfSelectedProduct)
}

// function 7 
async function getProductsListAndPrices(text){
    productsName = await $$(`//*[contains(text(),'${text}') or contains(text(),'${text.toLowerCase()}')]`)
    for(let i=0; i<productsName.length; i++){
        productsNameArray.push(await productsName[i].getText())
    }
    //,ale it generic
    productsPrice = await $$(`//*[contains(text(),'${text}') or contains(text(),'${text.toLowerCase()}')]/following-sibling::p`)
    for(let i=0; i<productsPrice.length; i++){
        productsPriceArray.push(await productsPrice[i].getText())
    }

    for(let j=0; j<productsPriceArray.length; j++){
        productsPriceArrayElement = productsPriceArray[j]
        splittedPrices = productsPriceArrayElement.split(' ')
        productsPriceWithoutUnit.push(splittedPrices[splittedPrices.length-1])
    }

    leastPrice = parseInt(productsPriceWithoutUnit[0])
    for(let i=1; i<productsPriceWithoutUnit.length; i++){
        if(parseInt(productsPriceWithoutUnit[i]) < leastPrice){
            leastPrice = productsPriceWithoutUnit[i]
            index = i
        }
    }
    await calculateTotalPrice()
    //console.log(await productsNameArray[index], leastPrice, 'POLO', sumOfPrices)
    await clickProductsButton()
    productsNameArray = []
    productsPriceArray = []
    productsPriceWithoutUnit = []
    productsNameArray = []
    index = 0
}

// function 8
    async function clickProductsButton(){
    productNameElement = await productsNameArray[index]
    let articlesButton = `//button[@onclick="addToCart('${productNameElement}',${leastPrice})"]`
        await $(articlesButton).waitForDisplayed()
        await $(articlesButton).click()
    }

// function 9
    async function clickTheCart(){
        await $(cartLocator).click()
    }

// function 10
     async function calculateTotalPrice(){
        sumOfPrices = sumOfPrices + parseInt(leastPrice)
     }

// function 11
     async function verifyTotalPrice(){
        finalPriceElement = await $(totalPriceLocator)
        await expect(finalPriceElement).toHaveTextContaining(`${sumOfPrices}`)
     }

// function 12
     async function clickToPay (){
        paymentButton = $(paymentButtonLocator)
        await paymentButton.waitForDisplayed({ timeout: 20000 })
        await paymentButton.click()
     }

// function 13
     async function enterIframe(){
        iframeSection = await $(iframeLocator);
        await iframeSection.waitForDisplayed({ timeout: 30000 }); // Increase timeout if necessary
        await browser.switchToFrame(iframeSection);
     }

// function 14
     async function enterCredentials(){
        await enterEachCredential(emailLocator, 'nothing@gmail.com')
        await enterEachCredential(cardNumberLocator, '378282246310005')
        await enterEachCredential(expiryDateLocator, '0530')
        await enterEachCredential(cvcLocator, '1234')
        await enterEachCredential(billingZipLocator, '12345')  
     }

// function 15
     async function enterEachCredential(credentialLocator, credentialValue){
        const getCredential = $(credentialLocator)
        await getCredential.waitForDisplayed({ timeout: 30000 })
        for(const char of credentialValue){
            await getCredential.addValue(char)
        }
    //    await browser.pause(2000)
     }

     // function 16
    async function placeOrder(){
        await $(submitButton).click()
        await browser.pause(4000)
    }

    // function 17
    async function exitIframe(){
        await browser.switchToParentFrame();
    }

    // function 18
    async function verifySuccessfulOrder(successText){
        successMessage = $(successMessageLocator);
        await successMessage.waitForDisplayed()
        await expect(successMessage).toHaveText(successText)
    }
Given('user opens the URL', async()=>{
    await visitWebsite(urlToWebsite)
})

When('user chooses the products', async()=>{
    await getTemperature(temperatureLocator)
    await getTemperatureValueOnly(temperature)
    await clickRelevantArticle(19, 34, temperatureValue)
    await clickTheCart()
    await verifyTotalPrice()
    await clickToPay()
    await enterIframe()
    await enterCredentials()
})
Then('user places order successfully', async()=>{
    await placeOrder()
    await exitIframe()
    await verifySuccessfulOrder('PAYMENT SUCCESS')
})










































// let arr1 = []
// let arr2 = []
// let lowerCaseElement = []
// let upperCaseElement = []
// Given('The user navigates to the Weather Shopper website', async() =>{
//     await browser.url('https://weathershopper.pythonanywhere.com/sunscreen')
//     await browser.pause(5000)
//     let arr = [] 
//     let lowerCase = 'spf-30'
//     let upperCase = 'SPF-30'
// //    let temp = await $$("//*[contains(text(),'spf-30') or contains(text(),'SPF-30')]")
//     let temp = await $$(`//*[contains(text(),'${lowerCase}') or contains(text(),'${upperCase}')]`)
//      for(let i=0; i<temp.length; i++){
//         arr.push(await temp[i].getText())
//      }
//      console.log(arr)
// })

//Then('I should see the following products:', async(dataTable) => {
//     const products = dataTable.hashes();

//     for (const product of products) {
//         const lowerCaseLocator = `//*[contains(text(),'${product.lowerCase}')]`;
//         const upperCaseLocator = `//*[contains(text(),'${product.upperCase}')]`;

//          lowerCaseElement = await $$(lowerCaseLocator);
//         upperCaseElement = await $$(upperCaseLocator);
//     }
//         for(let i=0; i<lowerCaseElement.length; i++){
//             arr1.push(await lowerCaseElement[i].getText())
//         }
//         for(let i=0; i<upperCaseElement.length; i++){
//             arr2.push(await upperCaseElement[i].getText())
//         }
// console.log(arr1, 'PPP')
// console.log(arr2, 'QQQ')
        // expect(await lowerCaseElement.isExisting()).to.be.true;
        // expect(await upperCaseElement.isExisting()).to.be.true;

        // console.log(`Found ${product.lowerCase} and ${product.upperCase} on the ${this.currentPage} page`);
    
//})

// (`//*[contains(text(),'${lowerCase}' or contains(text(),'${upperCase}')]`)


