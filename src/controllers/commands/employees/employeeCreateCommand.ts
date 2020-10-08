import Sequelize from "sequelize";
import * as Helper from "../helpers/helper";
import { EmployeeModel } from "../models/employeeModel";
import * as EmployeeRepository from "../models/employeeModel";
import { Resources, ResourceKey } from "../../../resourceLookup";
import * as DatabaseConnection from "../models/databaseConnection";
import { CommandResponse, Employee, EmployeeSaveRequest } from "../../typeDefinitions";

const validateSaveRequest = (
	saveEmployeeRequest: EmployeeSaveRequest
): CommandResponse<Employee> => {

	let errorMessage: string = "";

	if (Helper.isBlankString(saveEmployeeRequest.firstName) || Helper.isBlankString(saveEmployeeRequest.lastName) || Helper.isBlankString(saveEmployeeRequest.password)) {
		errorMessage = Resources.getString(ResourceKey.USER_NOT_FOUND); // fix resourcekey - might need individual codes
	} else if ((saveEmployeeRequest.isInitialEmployee)) {
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
	saveEmployeeRequest: EmployeeSaveRequest
): Promise<CommandResponse<Employee>> => {

	const validationResponse: CommandResponse<Employee> =
		validateSaveRequest(saveEmployeeRequest);
	if (validationResponse.status !== 200) {
		return Promise.reject(validationResponse);
	}

	const employeeToCreate: EmployeeModel = <EmployeeModel>{
		id: saveEmployeeRequest.id,
        active: saveEmployeeRequest.active,
        lastName: saveEmployeeRequest.lastName,
        firstName: saveEmployeeRequest.firstName,
        // password: saveEmployeeRequest.password, // password doesnt work
        managerId: saveEmployeeRequest.managerId,
        classification: saveEmployeeRequest.classification,
        // isInitialEmployee: saveEmployeeRequest.isInitialEmployee // needs initial employee (flag?)
	};

	let createTransaction: Sequelize.Transaction;

	return DatabaseConnection.createTransaction()
		.then((createdTransaction: Sequelize.Transaction): Promise<EmployeeModel | null> => {
			createTransaction = createdTransaction;

			return EmployeeRepository.queryByEmployeeId(
				saveEmployeeRequest.classification, // prob wrong
				createTransaction);
		}).then((queriedEmployee: (EmployeeModel | null)): Promise<EmployeeModel> => {
			if (queriedEmployee != null) {
				return Promise.reject(<CommandResponse<Employee>>{
					status: 409,
					message: Resources.getString(ResourceKey.PRODUCT_LOOKUP_CODE_CONFLICT) // fix code
				});
			}

			return EmployeeModel.create(
				employeeToCreate,
				<Sequelize.CreateOptions>{
					transaction: createTransaction
				});
		}).then((createdEmployee: EmployeeModel): CommandResponse<Employee> => {
			createTransaction.commit();

			return <CommandResponse<Employee>>{
				status: 201,
				data: <Employee>{
					id: createdEmployee.id,
					active: createdEmployee.active,
                    lastName: createdEmployee.lastName,
                    // password: createdEmployee.password,
                    firstName: createdEmployee.firstName,
                    managerId: createdEmployee.managerId,
                    classification: createdEmployee.classification,
                    // isInitialEmployee: createdEmployee.isInitialEmployee
					// createdOn: Helper.formatDate(createdEmployee.createdOn)
				}
			};
		}).catch((error: any): Promise<CommandResponse<Employee>> => {
			if (createTransaction != null) {
				createTransaction.rollback();
			}

			return Promise.reject(<CommandResponse<Employee>>{
				status: (error.status || 500),
				message: (error.message
					|| Resources.getString(ResourceKey.EMPLOYEE_UNABLE_TO_SAVE))
			});
		});
};
