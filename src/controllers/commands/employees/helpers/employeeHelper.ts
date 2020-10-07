import * as crypto from "crypto";
import { Employee } from "../../../typeDefinitions";
import { EmployeeModel } from "../../models/employeeModel";
import { EmployeeClassification } from "../../models/constants/entityTypes";

export const hashString = (toHash: string): string => {
const hash = crypto.createHash("sha256");
hash.update(toHash);
return hash.digest("hex"); // TODO: Look at https://nodejs.org/docs/latest-v12.x/api/crypto.html#crypto_crypto_createhash_algorithm_options as one option
};

export const isElevatedUser = (employeeClassification: EmployeeClassification): boolean => {
if (EmployeeClassification.NotDefined) {
return false; // TODO: Determine if an employee is an elevated user by their classification
}
else
return true;
};

export const makeEmployeeId = (id: number): string => {
    let stringId: string = id.toString();
    if (id <= 99999) {
       stringId = ("0000" + id).slice(-5);
    }
    return stringId;
};

export const mapEmployeeData = (queriedEmployee: EmployeeModel): Employee => {
	return <Employee>{
		id: queriedEmployee.id,
		active: queriedEmployee.active,
		lastName: queriedEmployee.lastName,
		createdOn: queriedEmployee.createdOn,
		firstName: queriedEmployee.firstName,
		managerId: queriedEmployee.managerId,
		employeeId: makeEmployeeId(queriedEmployee.employeeId),
		classification: <EmployeeClassification>queriedEmployee.classification
	};
};