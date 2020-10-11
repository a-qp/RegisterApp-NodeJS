document.addEventListener("DOMContentLoaded", () => {

    document.getElementById("saveButton").addEventListener("click", saveActionClick);
});


function saveActionClick(event) {
	if (!validateSave()) {
		return;
	}

	const saveActionElement = event.target;
	saveActionElement.disabled = true;

	const employeeId = getEmployeeId();

	const employeeLastName = getEmployeeLastName();
	const employeeFirstName = getEmployeeFirstName();
	const employeePassword = getEmployeePassword();
	const employeeClassification = getEmployeeClassification();

	const employeeIdIsDefined = ((employeeId != null) && (employeeId.trim() !== ""));
	const saveActionUrl = ("/api/employeeDetail/"
		+ (employeeIdIsDefined ? employeeId : ""));
	const saveEmployeeRequest = { // change to employee details
		id: employeeId,
		// managerId: employeeManagerId,
        lastName: employeeLastName,
        firstName: employeeFirstName,
        password: employeePassword,
        classification: employeeClassification
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
	if((Password == null) || (LastName.trim() === "")) {
		displayError("Please provide a valid password.");
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

function setEmployeeLastName(lastName) {
	getEmployeeFirstNameElement().value = lastName;
}

function getEmployeeLastNameElement() {
    return document.getElementById("lastname");
}

function getEmployeePassword() {
    return getEmployeePasswordElement().value;
}

function setEmployeePassword(password) {
	getEmployeePasswordElement().value = password;
}

function getEmployeePasswordElement() {
    return document.getElementById("password");
}

function getEmployeeManagerId() {
    return getEmployeeManagerIdElement().value;
}

function setEmployeeManagerId(managerId) {
	getEmployeeManagerIdElement().value = managerId;
}

function getEmployeeManagerIdElement() {
    return document.getElementById("employeerecordid");
}

function getEmployeeClassification() {
    return getEmployeeClassificationElement().value;
}

function setEmployeeClassification(classification) {
	getEmployeeClassificationElement().value = classification;
}

function getEmployeeClassificationElement() {
    return document.getElementById("employeetype");
}