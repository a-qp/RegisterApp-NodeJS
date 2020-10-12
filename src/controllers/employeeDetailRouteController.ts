import e, { Request, Response } from "express";
import { Resources, ResourceKey } from "../resourceLookup";
import * as Helper from "./helpers/routeControllerHelper";
import * as EmployeeQuery from "./commands/employees/employeeQuery";
import { ViewNameLookup, QueryParameterLookup, ParameterLookup, RouteLookup } from "./lookups/routingLookup";
import * as EmployeeExistsQuery from "./commands/employees/activeEmployeeExistsQuery";
import * as EmployeeCreateCommand from "./commands/employees/employeeCreateCommand";
import * as EmployeeUpdateCommand from "./commands/employees/employeeCreateCommand";
import { CommandResponse, Employee, EmployeeType, EmployeeDetailPageResponse, ApiResponse, EmployeeSaveResponse, EmployeeSaveRequest, ActiveUser, PageResponse } from "./typeDefinitions";
import * as EmployeeHelper from "./commands/employees/helpers/employeeHelper";
import * as ValidateActiveUser from "./commands/activeUsers/validateActiveUserCommand";
import { EmployeeClassification } from "./commands/models/constants/entityTypes";


const processStartEmployeeDetailError = (res: Response, error: any): void => {
	let errorMessage: (string | undefined) = "";
	if ((error.status != null) && (error.status >= 500)) {
		errorMessage = error.message;
	}
	res.status((error.status || 500))
		.render(
				ViewNameLookup.EmployeeDetail,
				<EmployeeDetailPageResponse>{
					employee: <Employee>{
						id: "",
						lastName: "",
						active: false,
						firstName: "",
						employeeId: "",
						classification: EmployeeClassification.NotDefined,
						managerId: Resources.getString(ResourceKey.EMPTY_UUID)
					},
					isInitialEmployee: false,
					employeeTypes: employeeTypes(),
					errorMessage: (errorMessage || Resources.getString(ResourceKey.EMPLOYEES_UNABLE_TO_QUERY))
			});
};

const employeeTypes = (): EmployeeType[] => {
	const employeeTypes: EmployeeType[] = [];

	employeeTypes.push(<EmployeeType>{
		value: EmployeeClassification.NotDefined,
		label: "Not Selected"
	});
	employeeTypes.push(<EmployeeType>{
		value: EmployeeClassification.Cashier,
		label: "Cashier"
	});
	employeeTypes.push(<EmployeeType>{
		value: EmployeeClassification.ShiftManager,
		label: "Shift Manager"
	});
	employeeTypes.push(<EmployeeType>{
		value: EmployeeClassification.GeneralManager,
		label: "General Manager"
	});

	return employeeTypes;
};

export const start = async (req: Request, res: Response): Promise<void> => {
	let EmployeeExists: boolean;
	let isElevatedUser: boolean;
	return EmployeeExistsQuery.query()
		.then((EmployeeExistsCommandResponse: CommandResponse<boolean>): Promise<CommandResponse<ActiveUser>> => {
			EmployeeExists = (EmployeeExistsCommandResponse.data != null);
			if (EmployeeExists == false) {
				return Promise.resolve(
					<CommandResponse<ActiveUser>>{status: 200});
			}
		return ValidateActiveUser.execute((<Express.Session>req.session).id);
		}).then((activeUserCommandResponse: CommandResponse<ActiveUser>): void => {
			isElevatedUser = EmployeeHelper.isElevatedUser((<ActiveUser>activeUserCommandResponse.data).classification);
			if ((!isElevatedUser) && (EmployeeExists)) {
				return res.redirect(Helper.buildNoPermissionsRedirectUrl());
			}
			return res.render(
				ViewNameLookup.EmployeeDetail,
				<EmployeeDetailPageResponse>{
					employee: <Employee>{
						id: "",
						lastName: "",
						active: false,
						firstName: "",
						employeeId: "",
						classification: EmployeeClassification.NotDefined,
						managerId: Resources.getString(ResourceKey.EMPTY_UUID)
					},
					isInitialEmployee: !EmployeeExists,
					errorMessage: Resources.getString(req.query[QueryParameterLookup.ErrorCode])
				});
		}).catch((error: any): void => {
			return processStartEmployeeDetailError(error, res);
		});
};

export const start2 = async (req: Request, res: Response): Promise<void> => {
	let isElevatedUser: boolean;
	return ValidateActiveUser.execute((<Express.Session>req.session).id)
		.then((activeUserCommandResponse: CommandResponse<ActiveUser>): Promise<CommandResponse<Employee>> => {
			isElevatedUser = EmployeeHelper.isElevatedUser((<ActiveUser>activeUserCommandResponse.data).classification);
			if (!isElevatedUser) {
				return Promise.reject(<CommandResponse<Employee>>{
					message: Resources.getString(ResourceKey.USER_NO_PERMISSIONS),
					status: 403
				});
			}
			// Query employee details for the employee ID path variable
			return EmployeeQuery.queryById(req.params[ParameterLookup.EmployeeId]);
		}).then((employeeRes: CommandResponse<Employee>): void => {
			return res.render(
				ViewNameLookup.EmployeeDetail,
				<EmployeeDetailPageResponse>{
					employee: employeeRes.data,
					isInitialEmployee: false,
					employeeTypes: employeeTypes(),
					errorMessage: Resources.getString(req.query[QueryParameterLookup.ErrorCode])
				});
		}).catch((error: any): void => {
			return processStartEmployeeDetailError(error, res);
		});
};


const saveEmployee = async (
	req: Request,
	res: Response,
	performSave: (employeeSaveRequest: EmployeeSaveRequest, isInitialEmployee: boolean) => Promise<CommandResponse<Employee>>
): Promise<void> => {
	if (Helper.handleInvalidApiSession(req, res)) {
		return;
	}

	let EmployeeExists: boolean;
	let isElevatedUser: boolean;
	return EmployeeExistsQuery.query()
		.then((EmployeeExistsCommandResponse: CommandResponse<boolean>): Promise<CommandResponse<ActiveUser>> => {
			EmployeeExists = (EmployeeExistsCommandResponse.data != null);
			if (EmployeeExists == false) {
				return Promise.resolve(
					<CommandResponse<ActiveUser>>{status: 200});
			}
			return ValidateActiveUser.execute((<Express.Session>req.session).id);
		}).then((activeUserCommandResponse: CommandResponse<ActiveUser>): Promise<CommandResponse<Employee>> => {
			isElevatedUser = EmployeeHelper.isElevatedUser((<ActiveUser>activeUserCommandResponse.data).classification);
			if ((!isElevatedUser) && (EmployeeExists)) {
				return Promise.reject(<CommandResponse<boolean>>{
					status: 403,
					message: Resources.getString(ResourceKey.USER_NO_PERMISSIONS)
				});
			}
			return performSave(req.body, !EmployeeExists);
		}).then((saveCommandResponse: CommandResponse<Employee>): void => {
			const saveRes: EmployeeSaveResponse = <EmployeeSaveResponse>{
				employee: <Employee>saveCommandResponse.data
			};

			if (!EmployeeExists) {
				saveRes.redirectUrl = (RouteLookup.SignIn
					+ "?" + QueryParameterLookup.EmployeeId
					+ "=" + (<Employee>saveCommandResponse.data).employeeId);
			}

			res.status(saveCommandResponse.status).send(saveRes);
		}).catch((error: any): void => {
			return Helper.processApiError(
				error,
				res,
				<Helper.ApiErrorHints>{
					defaultErrorMessage: Resources.getString(
						ResourceKey.EMPLOYEE_UNABLE_TO_SAVE)
				});
		});
};


export const createEmployee = async (req: Request, res: Response): Promise<void> => {
	return saveEmployee(req, res, EmployeeCreateCommand.execute);
};

export const updateEmployee = async (req: Request, res: Response): Promise<void> => {
	return saveEmployee(req, res, EmployeeUpdateCommand.execute);
};