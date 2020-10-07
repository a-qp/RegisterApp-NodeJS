document.addEventListener("DOMContentLoaded", () => {
	
});

function validateForm() {
    const employeeID = getEmployeeID().value;
    const password = getPassword().value;
    if (employeeID.trim() == "" || password.trim() == "") {
        alert("Please make sure all fields are filled out");
        return false;
    }
    if (isNaN(employeeID) || employeeID < 1) {
        alert("Please make sure you have provided a valid employee ID");
        return false;
    }
	return true;
}

function getEmployeeID() {
    return document.getElementById("enterID");
}

function getPassword() {
    return document.getElementById("enterPassword");
}