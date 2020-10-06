import { EmployeeClassification } from "../../models/constants/entityTypes";

export const hashString = (toHash: string): string => {
	return ""; // TODO: Look at https://nodejs.org/docs/latest-v12.x/api/crypto.html#crypto_crypto_createhash_algorithm_options as one option
};

export const isElevatedUser = (employeeClassification: EmployeeClassification): boolean => {
	return false; // TODO: Determine if an employee is an elevated user by their classification
};