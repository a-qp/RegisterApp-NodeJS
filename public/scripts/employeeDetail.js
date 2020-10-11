document.addEventListener("DOMContentLoaded", () => {

    document.getElementById("save").addEventListener("click", validate);

});

function validate(){
    if((document.getElementById("firstname").length != 0) && (document.getElementById("lastname").length != 0) && (document.getElementById("password").length != 0)) {
        save();
        displayError("Invalid Form");
    }
}

function saveActionClick(event) {
	if (!validateSave()) {
		return;
	}

	const saveActionElement = event.target;
	saveActionElement.disabled = true;

	const employeeId = getProductId();
	const employeeIdIsDefined = ((productId != null) && (employeeId.trim() !== ""));
	const saveActionUrl = ("/api/employeeDetail/"
		+ (employeeIdIsDefined ? employeeId : ""));
	const saveEmployeeRequest = { // change to employee details
		id: employeeId,
        lastName: employeeLastName,
        firstName: employeeFirstName,
        password: employeePassword
	};

	if (employeeIdIsDefined) {
		ajaxPut(saveActionUrl, saveEmployeeRequest, (callbackResponse) => {
			saveActionElement.disabled = false;

			if (isSuccessResponse(callbackResponse)) {
				displayEmployeeSavedAlertModel(); // change
			}
		});
	} else {
		ajaxPost(saveActionUrl, saveEmployeeRequest, (callbackResponse) => {
			saveActionElement.disabled = false;

			if (isSuccessResponse(callbackResponse)) {
				displayEmployeeSavedAlertModel();

				if ((callbackResponse.data != null)
					&& (callbackResponse.data.employee != null)
					&& (callbackResponse.data.employee.id.trim() !== "")) {

					document.getElementById("deleteActionContainer").classList.remove("hidden");

					setEmployeeId(callbackResponse.data.employee.id.trim());
				}
			}
		});
	}
};

function validateSave() {
    const FirstName = getEmployeeFirstName();
    const LastName = getEmployeeLastName();
	if ((FirstName == null) || (FirstName.trim() === "")) {
		displayError("Please provide a valid first name.");
		return false;
    }
    if ((LastName == null) || (LastName.trim() === "")) {
		displayError("Please provide a valid last name.");
		return false;
	}

	return true;
}

function getSaveActionElement() {
	return document.getElementById("saveButton");
}

function getSavedAlertModalElement() {
	return document.getElementById("employeeSavedAlertModal"); 
}

function getDeleteActionElement() {
	return document.getElementById("deleteButton"); // prob unnecessary
}

function getEmployeeId() {
	return getEmployeeIdElement().value;
}
function setEmployeeId(employeeId) {
	getEmployeeIdElement().value = employeeId;
}
function getEmployeeIdElement() {
	return document.getElementById("employeeId");
}

function getEmployeeFirstName() {
    return getEmployeeFirstNameElement().value;
}

function setEmployeeFirstName(firstName) {
	getEmployeeFirstNameElement().value = firstName;
}

function getEmployeeFirstNameElement() {
    return document.getElementById("firstname");
}

function getEmployeeLastName() {
    return getEmployeeLastNameElement().value;
}

function setEmployeeFirstName(lastName) {
	getEmployeeFirstNameElement().value = lastName;
}

function getEmployeeLastNameElement() {
    return document.getElementById("lastname");
}

function getProductLookupCode() {
	return getProductLookupCodeElement().value; // prob unnecessary
}
function getProductLookupCodeElement() {
	return document.getElementById("productLookupCode"); // prob unnecessary
}

function getProductCount() {
	return Number(getProductCountElement().value); // prob unnecessary
}
function getProductCountElement() {
	return document.getElementById("productCount"); // prob unnecessary
}