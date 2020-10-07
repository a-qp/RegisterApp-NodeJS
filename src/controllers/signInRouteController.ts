import { Request, Response } from "express";
import { Resources, ResourceKey } from "../resourceLookup";
import * as ActiveEmployeeExistsQuery from "./commands/employees/activeEmployeeExistsQuery";
import * as EmployeeSignIn from "./commands/employees/employeeSignInCommand";
import * as ClearActiveUser from "./commands/activeUsers/clearActiveUserCommand";
import { PageResponse, CommandResponse, ApiResponse, SignInPageResponse, Employee } from "./typeDefinitions";
import { ViewNameLookup, RouteLookup, QueryParameterLookup, ParameterLookup } from "./lookups/routingLookup";

export const start = async (req: Request, res: Response): Promise<void> => {
	return ActiveEmployeeExistsQuery.query()
		.then((activeEmployeeExistsCommandResponse: CommandResponse<boolean>): void => {
			if (activeEmployeeExistsCommandResponse.data == null) {
				return res.redirect(ViewNameLookup.EmployeeDetail);
			}
			return res.render(
				ViewNameLookup.SignIn,
				<SignInPageResponse>{
					employeeId: req.query[ParameterLookup.EmployeeId],
					errorMessage: Resources.getString(
						req.query[QueryParameterLookup.ErrorCode])
				});
			}).catch((error: any): void => {
				return res.render(ViewNameLookup.SignIn,
					<PageResponse>{
						errorMessage: (error.message || Resources.getString(ResourceKey.EMPLOYEES_UNABLE_TO_QUERY))
					});
			});
};

export const signIn = async (req: Request, res: Response): Promise<void> => {
	//  Use the credentials provided in the request body (req.body)
	//  and the "id" property of the (Express.Session)req.session variable
	//  to sign in the user
	return EmployeeSignIn.execute(req.body, req.session)
		.then((): void => {
			return res.redirect(RouteLookup.MainMenu);
		}).catch((error: any): void => {
			console.error("An error occured signing in. " + error.message);
			return res.redirect(RouteLookup.SignIn + "?" + QueryParameterLookup.ErrorCode + "=" + ResourceKey.USER_UNABLE_TO_SIGN_IN);
		});
};

export const clearActiveUser = async (req: Request, res: Response): Promise<void> => {
	// Sign out the user associated with req.session.id
	return ClearActiveUser.execute((<Express.Session>req.session).id)
		.then((clearResponse: CommandResponse<void>): void => {
			res.status(clearResponse.status).send(<ApiResponse>{ redirectUrl: RouteLookup.SignIn });
		}).catch((error: any): void => {
			res.status(error.status || 500)
				.send(<ApiResponse>{
					errorMessage: error.message,
					redirectUrl: RouteLookup.SignIn
				});
		});
};