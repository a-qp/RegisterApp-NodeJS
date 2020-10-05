document.addEventListener("DOMContentLoaded", () => {
	// TODO: Anything you want to do when the page is loaded?
});

function validateForm() {
    var employeeID = document.getElementById("enterID").value;
    var password = document.getElementById("enterPassword").value;
    if (employeeID == "" || password == "") {
        alert("Check that all fields are filled out");
        return false;
    }
    if (!isNaN(employeeID)) {
        alert("Check that employeeID contains only numbers");
        return false;
    }
	return true;
}

