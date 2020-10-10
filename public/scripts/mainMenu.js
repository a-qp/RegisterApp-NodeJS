document.addEventListener("DOMContentLoaded", () => {
	getStartTransactionButton().addEventListener("click", () => displayError("Functionality has not yet been implemented."));

	getViewProductsButton().addEventListener("click", () => window.location.assign("/productListing"));

	getCreateEmployeeButton().addEventListener("click", () => window.location.assign("/employeeDetail"));

	getProductSalesReportButton().addEventListener("click", () => displayError("Functionality has not yet been implemented."));

    getCashierSalesReportButton().addEventListener("click", () => displayError("Functionality has not yet been implemented."));    
});

function getStartTransactionButton() 
{
	return document.getElementById("startTransactionButton");
}

function getViewProductsButton() 
{
	return document.getElementById("viewProductsButton");
}

function getCreateEmployeeButton() 
{
	return document.getElementById("createEmployeeButton");
}

function getProductSalesReportButton() 
{
	return document.getElementById("productSalesReportButton");
}

function getCashierSalesReportButton() 
{
	return document.getElementById("cashierSalesReportButton");
}