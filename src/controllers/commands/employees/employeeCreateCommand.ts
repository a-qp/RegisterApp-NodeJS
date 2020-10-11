import Sequelize from "sequelize";
import * as Helper from "../helpers/helper";
import { EmployeeModel } from "../models/employeeModel";
import * as EmployeeHelper from "./helpers/employeeHelper";
import * as EmployeeRepository from "../models/employeeModel";
import { Resources, ResourceKey } from "../../../resourceLookup";
import * as DatabaseConnection from "../models/databaseConnection";
import { CommandResponse, Employee, EmployeeSaveRequest } from "../../typeDefinitions";
import { EmployeeClassification } from "../models/constants/entityTypes";

const validateSaveRequest = (
	saveEmployeeRequest: EmployeeSaveRequest
): CommandResponse<Employee> => {

	let errorMessage: string = "";

	if (Helper.isBlankString(saveEmployeeRequest.firstName)) {
		errorMessage = Resources.getString(ResourceKey.EMPLOYEE_FIRST_NAME_INVALID);
	}
	else if (Helper.isBlankString(saveEmployeeRequest.lastName)) {
		errorMessage = Resources.getString(ResourceKey.EMPLOYEE_LAST_NAME_INVALID);
	}
	else if (Helper.isBlankString(saveEmployeeRequest.password)) {
		errorMessage = Resources.getString(ResourceKey.EMPLOYEE_PASSWORD_INVALID);
	}
	else if ((isNaN(saveEmployeeRequest.classification) && (saveEmployeeRequest.classification != null)
		|| !(saveEmployeeRequest.classification in EmployeeClassification))) {

		errorMessage = Resources.getString(ResourceKey.EMPLOYEE_TYPE_INVALID);
	}
	else if ((saveEmployeeRequest.managerId != null)
		&& !Helper.isValidUUID(saveEmployeeRequest.managerId)) {

		errorMessage = Resources.getString(ResourceKey.EMPLOYEE_MANAGER_ID_INVALID);
	}
	else if ((saveEmployeeRequest.isInitialEmployee)) {
		saveEmployeeRequest.classification = 701;
    }

	return ((errorMessage === "")
		? <CommandResponse<Employee>>{ status: 200 }
		: <CommandResponse<Employee>>{
			status: 422,
			message: errorMessage
		});
};

export const execute = async (
	saveEmployeeRequest: EmployeeSaveRequest,
): Promise<CommandResponse<Employee>> => {

	const validationResponse: CommandResponse<Employee> =
		validateSaveRequest(saveEmployeeRequest);
	if (validationResponse.status !== 200) {
		return Promise.reject(validationResponse);
	}

	const employeeToCreate: EmployeeModel = <EmployeeModel>{
		active: true,
		lastName: saveEmployeeRequest.lastName,
		firstName: saveEmployeeRequest.firstName,
		managerId: saveEmployeeRequest.managerId,
		classification: saveEmployeeRequest.classification,
		password: Buffer.from(
			saveEmployeeRequest.password)
	};

	return EmployeeModel.create(employeeToCreate)
		.then((createdEmployee: EmployeeModel): CommandResponse<Employee> => {
			return <CommandResponse<Employee>>{
				status: 201,
				data: EmployeeHelper.mapEmployeeData(createdEmployee)
			};
		});
};
