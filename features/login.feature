Feature: Test end-to-end weathershopper website
@current
Scenario: user shops from the website
	Given user opens the URL
	When user chooses the products
	Then user places order successfully