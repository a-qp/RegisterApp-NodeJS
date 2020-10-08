import { Request, Response } from "express";
import { Resources, ResourceKey } from "../resourceLookup";
import * as EmployeeQuery from "./commands/employees/employeeQuery";
import { ViewNameLookup, ParameterLookup, RouteLookup } from "./lookups/routingLookup";
import * as EmployeeExistsQuery from "./commands/employees/activeEmployeeExistsQuery";
import * as EmployeeCreateCommand from "./commands/employees/employeeCreateCommand";
import * as EmployeeUpdateCommand from "./commands/employees/employeeCreateCommand";
import { CommandResponse, Employee, EmployeeDetailPageResponse, ApiResponse, EmployeeSaveResponse, EmployeeSaveRequest, ActiveUser, PageResponse } from "./typeDefinitions";
import * as EmployeeHelper from "./commands/employees/helpers/employeeHelper";
import * as ValidateActiveUser from "./commands/activeUsers/validateActiveUserCommand";


const processStartEmployeeDetailError = (res: Response, error: any): void => {
	let errorMessage: (string | undefined) = "";
	if ((error.status != null) && (error.status >= 500)) {
		errorMessage = error.message;
	}
	res.status((error.status || 500))
		.render(
			ViewNameLookup.EmployeeDetail,
			<EmployeeDetailPageResponse>{
				employee: <Employee>{ // fix
					id: "",
					active: false,
					lastName: "",
					// password: "",
					firstName: "",
					managerId: "",
					classification: 0,
					// isInitialEmployee: false
				},
				errorMessage: errorMessage
			});
};


export const start = async (req: Request, res: Response): Promise<void> => {
	let EmployeeExists: boolean;
	return EmployeeExistsQuery.query()
		.then((EmployeeExistsCommandResponse: CommandResponse<boolean>): Promise<CommandResponse<ActiveUser>> => {
			EmployeeExists = (EmployeeExistsCommandResponse.data != null);
			if (EmployeeExistsCommandResponse.data != null) {
				return Promise.resolve(

					<CommandResponse<ActiveUser>>{status: 200});
			}
				return ValidateActiveUser.execute((<Express.Session>req.session).id);
		}).then((activeUserCommandResponse: CommandResponse<ActiveUser>): void => {
			if (EmployeeHelper.isElevatedUser((<ActiveUser>activeUserCommandResponse.data).classification) || (EmployeeExists)) {
				return res.redirect(ViewNameLookup.EmployeeDetail);
			}
			else if (!EmployeeHelper.isElevatedUser((<ActiveUser>activeUserCommandResponse.data).classification)) {
				return res.redirect(ViewNameLookup.SignIn);
			}
			return res.redirect(ViewNameLookup.MainMenu);
		}).catch((error: any): void => {
				return res.render(ViewNameLookup.SignIn,
					<PageResponse>{
						errorMessage: (error.message || Resources.getString(ResourceKey.EMPLOYEES_UNABLE_TO_QUERY))
					});
			});
};

const saveEmployee = async (
	req: Request,
	res: Response,
	performSave: (employeeSaveRequest: EmployeeSaveRequest) => Promise<CommandResponse<Employee>>
): Promise<void> => {

	return performSave(req.body)
		.then((createEmployeeCommandResponse: CommandResponse<Employee>): void => {
			res.status(createEmployeeCommandResponse.status)
				.send(<EmployeeSaveResponse>{
					employee: <Employee>createEmployeeCommandResponse.data
				});
		}).catch((error: any): void => {
			res.status(error.status || 500)
				.send(<ApiResponse>{
					errorMessage: (error.message
						|| Resources.getString(ResourceKey.EMPLOYEE_UNABLE_TO_SAVE))
				});
		});
};


export const createEmployee = async (req: Request, res: Response): Promise<void> => {
	let EmployeeExists: boolean;
	return EmployeeExistsQuery.query()
		.then((EmployeeExistsCommandResponse: CommandResponse<boolean>): Promise<CommandResponse<ActiveUser>> => {
			EmployeeExists = (EmployeeExistsCommandResponse.data != null);
			if (EmployeeExistsCommandResponse.data != null) {
				return Promise.resolve(

					<CommandResponse<ActiveUser>>{status: 200});
			}
				return ValidateActiveUser.execute((<Express.Session>req.session).id);
		}).then((activeUserCommandResponse: CommandResponse<ActiveUser>): void => {
			if (!EmployeeHelper.isElevatedUser((<ActiveUser>activeUserCommandResponse.data).classification) || (EmployeeExists)) {
				res.status(activeUserCommandResponse.status)
				.send(<ApiResponse>{
					redirectUrl: RouteLookup.MainMenu
				});
				return res.redirect(ViewNameLookup.MainMenu);
			}
			else if (<CommandResponse<ActiveUser>>{status: 200}) { // fix active user (fixed?)
				res.status(activeUserCommandResponse.status)
				.send(<ApiResponse>{
					redirectUrl: RouteLookup.SignIn
				});
				return res.redirect(ViewNameLookup.SignIn);
			}
			saveEmployee(req, res, EmployeeCreateCommand.execute); // does this return?
		}).catch((error: any): void => {
				return res.render(ViewNameLookup.SignIn,
					<PageResponse>{
						errorMessage: (error.message || Resources.getString(ResourceKey.EMPLOYEES_UNABLE_TO_QUERY))
					});
			});
};

export const updateEmployee = async (req: Request, res: Response): Promise<void> => {
	let EmployeeExists: boolean;
	return EmployeeExistsQuery.query()
		.then((EmployeeExistsCommandResponse: CommandResponse<boolean>): Promise<CommandResponse<ActiveUser>> => {
			EmployeeExists = (EmployeeExistsCommandResponse.data != null);
			if (EmployeeExistsCommandResponse.data != null) {
				return Promise.resolve(

					<CommandResponse<ActiveUser>>{status: 200});
			}
				return ValidateActiveUser.execute((<Express.Session>req.session).id);
		}).then((activeUserCommandResponse: CommandResponse<ActiveUser>): void => {
			if (<CommandResponse<ActiveUser>>{status: 200}) { // fix active user
				res.status(activeUserCommandResponse.status)
				.send(<ApiResponse>{
					redirectUrl: RouteLookup.SignIn
				});
				return res.redirect(ViewNameLookup.SignIn);
			}
			else if (!EmployeeHelper.isElevatedUser((<ActiveUser>activeUserCommandResponse.data).classification)) {
				res.status(activeUserCommandResponse.status)
				.send(<ApiResponse>{
					redirectUrl: RouteLookup.MainMenu
				});
				return res.redirect(ViewNameLookup.MainMenu);
			}
			saveEmployee(req, res, EmployeeUpdateCommand.execute); // does this return?
		}).catch((error: any): void => {
				return res.render(ViewNameLookup.SignIn,
					<PageResponse>{
						errorMessage: (error.message || Resources.getString(ResourceKey.EMPLOYEES_UNABLE_TO_QUERY))
					});
			});
};
