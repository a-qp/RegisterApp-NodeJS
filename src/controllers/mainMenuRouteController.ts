import { Request, Response } from "express";
import { Resources } from "../resourceLookup";
import * as Helper from "./helpers/routeControllerHelper";
import { ViewNameLookup, QueryParameterLookup } from "./lookups/routingLookup";
import * as ValidateActiveUser from "./commands/activeUsers/validateActiveUserCommand";
import { PageResponse, CommandResponse, ActiveUser, MainMenuPageResponse } from "./typeDefinitions";
import { ActiveUserFieldName } from "./commands/models/constants/databaseNames";

export const start = async (req: Request, res: Response): Promise<void> => {
	if (Helper.handleInvalidSession(req, res)) {
		return;
	}

	return ValidateActiveUser.execute((<Express.Session>req.session).id)
		.then((activeUserCommandResponse: CommandResponse<ActiveUser>): void => {
			// TODO: Examine the ActiveUser classification if you want this information
			const isElevatedUser: boolean = true;
			// This recommends to Firefox that it refresh the page every time
			//  it is accessed
			res.setHeader(
				"Cache-Control",
				"no-cache, max-age=0, must-revalidate, no-store");

			return res.render(
				ViewNameLookup.MainMenu,
				<MainMenuPageResponse>{
					isElevatedUser: isElevatedUser,
					errorMessage: Resources.getString(req.query[QueryParameterLookup.ErrorCode])
				});
		}).catch((error: any): void => {
			if (!Helper.processStartError(error, res)) {
				res.setHeader(
					"Cache-Control",
					"no-cache, max-age=0, must-revalidate, no-store");

				return res.render(
					ViewNameLookup.MainMenu,
					<PageResponse>{ errorMessage: error.message });
			}
		});
};