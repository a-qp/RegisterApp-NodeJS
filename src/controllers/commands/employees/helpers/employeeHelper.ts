import { EmployeeClassification } from "../../models/constants/entityTypes";
import * as crypto from "crypto";

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
