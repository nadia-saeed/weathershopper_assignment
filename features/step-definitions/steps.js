const { Given, When, Then } = require('@wdio/cucumber-framework');

// variables
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
const websiteTitleLocator = 'h2';
const moisturizerButtonLocator = '//a[@href="/moisturizer"]';
const sunscreenButtonLocator = '//a[@href="/sunscreen"]';
const temperatureLocator = '#temperature';
const productsPageTitleLocator = 'h2';
const cartLocator = '#cart';
const totalPriceLocator = '#total';
const paymentButtonLocator = 'button=Pay with Card';
const iframeLocator = 'iframe[name="stripe_checkout_app"]';
const emailLocator = "//input[@placeholder='Email']";
const cardNumberLocator = "//input[@placeholder='Card number']";
const expiryDateLocator = "//input[@placeholder='MM / YY']";
const cvcLocator = "//input[@placeholder='CVC']";
const billingZipLocator = "//input[@placeholder='ZIP Code']";
const submitButton = '#submitButton';
const successMessageLocator = 'h2';

// function 1
async function visitWebsite(url) {
    await browser.url(url);
    websiteTitle = $(websiteTitleLocator);
    await expect(websiteTitle).toHaveText('Current temperature');
};

// function 2
async function clickOnButtons(productButtonLocator){
    productButton = $(productButtonLocator);
    await productButton.waitForDisplayed();
    await productButton.click();
};

// function 3
async function getTemperature(temperatureLocator){
    temperature = await $(temperatureLocator).getText();
};

// function 4
async function getTemperatureValueOnly(temperature){
    temperatureValue = temperature.match(/(\d+)/);
    if (temperatureValue) {
        temperatureValue = temperatureValue[0];
    };
};

// function 5
async function clickRelevantArticle(lowerTemperature, higherTemperature, temperatureValue){
    if(temperatureValue < lowerTemperature){
        await clickOnButtons(moisturizerButtonLocator);
        await checkProductsPage('Moisturizers');
        await getProductsListAndPrices('Almond'); 
        await getProductsListAndPrices('Aloe');
    }
    else if(temperatureValue > higherTemperature){
        await clickOnButtons(sunscreenButtonLocator);
        await checkProductsPage('Sunscreens');
        await getProductsListAndPrices('SPF-30');
        await getProductsListAndPrices('SPF-50');
    };
};

// function 6
async function checkProductsPage(textOfSelectedProduct) {
    productsPageTitle = $(productsPageTitleLocator);
    await expect(productsPageTitle).toHaveText(textOfSelectedProduct);
}

// function 7
async function getProductNames(text){
    return $$(`//*[contains(text(),'${text}') or contains(text(),'${text.toLowerCase()}')]`);
};

// function 8
async function getProductPrices(text){
    return $$(`//*[contains(text(),'${text}') or contains(text(),'${text.toLowerCase()}')]/following-sibling::p`);
};

// function 9
async function getProductsListAndPrices(text){
    productsName = await getProductNames(text);
    productsPrice = await getProductPrices(text);

    for(let i=0; i<productsName.length; i++){
        productsNameArray.push(await productsName[i].getText());
    };
    
    for(let i=0; i<productsPrice.length; i++){
        productsPriceArray.push(await productsPrice[i].getText());
    };

    for(let j=0; j<productsPriceArray.length; j++){
        productsPriceArrayElement = productsPriceArray[j];
        splittedPrices = productsPriceArrayElement.split(' ');
        productsPriceWithoutUnit.push(splittedPrices[splittedPrices.length-1]);
    };

    leastPrice = parseInt(productsPriceWithoutUnit[0]);
        for(let i=1; i<productsPriceWithoutUnit.length; i++){
            if(parseInt(productsPriceWithoutUnit[i]) < leastPrice){
                leastPrice = productsPriceWithoutUnit[i];
                index = i;
        };
    };
    await calculateTotalPrice();
    await clickProductsButton();
        productsNameArray = [];
        productsPriceArray = [];
        productsPriceWithoutUnit = [];
        productsNameArray = [];
        index = 0;
};

// function 10
async function clickProductsButton(){
    productNameElement = productsNameArray[index];
    let articlesButton = `//button[@onclick="addToCart('${productNameElement}',${leastPrice})"]`;
        await $(articlesButton).waitForDisplayed();
        await $(articlesButton).click();
};

// function 11
async function clickTheCart(){
    await $(cartLocator).click();
};

// function 12
async function calculateTotalPrice(){
    sumOfPrices = sumOfPrices + parseInt(leastPrice);
};

// function 13
async function verifyTotalPrice(){
    finalPriceElement =  $(totalPriceLocator);
    await expect(finalPriceElement).toHaveTextContaining(`${sumOfPrices}`);
};

// function 14
async function clickToPay (){
    paymentButton = $(paymentButtonLocator);
    await paymentButton.waitForDisplayed({ timeout: 20000 });
    await paymentButton.click();
};

// function 15
     async function enterIframe(){
        iframeSection =  await $(iframeLocator); // it wasn't working without this await
        await iframeSection.waitForDisplayed({ timeout: 30000 });
        await browser.switchToFrame(iframeSection);
};

// function 16
     async function enterCredentials(){
        await enterEachCredential(emailLocator, 'nothing@gmail.com');
        await enterEachCredential(cardNumberLocator, '378282246310005');
        await enterEachCredential(expiryDateLocator, '0530');
        await enterEachCredential(cvcLocator, '1234');
        await enterEachCredential(billingZipLocator, '12345');
};

// function 17
     async function enterEachCredential(credentialLocator, credentialValue){
        const getCredential = $(credentialLocator);
        await getCredential.waitForDisplayed({ timeout: 30000 });
        for(const char of credentialValue){
            await getCredential.addValue(char);
        };
};

// function 18
    async function placeOrder(){
        await $(submitButton).click();
};

// function 19
    async function exitIframe(){
        await browser.switchToParentFrame();
};

// function 20
    async function verifySuccessfulOrder(successText){
        successMessage = $(successMessageLocator);
        await successMessage.waitForDisplayed();
        await expect(successMessage).toHaveText(successText);
};

Given('user opens the URL', async()=>{
    await visitWebsite('https://weathershopper.pythonanywhere.com/');
});

When('user chooses the products', async()=>{
    await getTemperature(temperatureLocator);
    await getTemperatureValueOnly(temperature);
    await clickRelevantArticle(19, 34, temperatureValue);
    await clickTheCart();
    await verifyTotalPrice();
    await clickToPay();
    await enterIframe();
    await enterCredentials();
});

Then('user places order successfully', async()=>{
    await placeOrder();
    await exitIframe();
    await verifySuccessfulOrder('PAYMENT SUCCESS');
});