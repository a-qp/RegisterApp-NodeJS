document.addEventListener("DOMContentLoaded", () => {
	getStartTransactionActionElement().addEventListener("click", () => displayError("Functionality has not yet been implemented."));

	getViewProductsActionElement().addEventListener("click", () => window.location.assign("/productListing"));

	getCreateEmployeeActionElement().addEventListener("click", () => window.location.assign("/employeeDetail"));

	getProductSalesReportActionElement().addEventListener("click", () => displayError("Functionality has not yet been implemented."));

    getCashierSalesReportActionElement().addEventListener("click", () => displayError("Functionality has not yet been implemented."));
    
    getsignOutImageElement().addEventListener("click", () => window.location.assign("/"));
});

function getStartTransactionActionElement() {
	return document.getElementById("startTransactionButton");
}

function getViewProductsActionElement() {
	return document.getElementById("viewProductsButton");
}

function getCreateEmployeeActionElement() {
	return document.getElementById("createEmployeeButton");
}

function getProductSalesReportActionElement() {
	return document.getElementById("productSalesReportButton");
}

function getCashierSalesReportActionElement() {
	return document.getElementById("cashierSalesReportButton");
}

function getsignOutImageElement() {
	return document.getElementById("signOutImage");
}