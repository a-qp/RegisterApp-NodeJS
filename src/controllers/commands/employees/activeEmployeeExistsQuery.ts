import * as EmployeeRepository from "../models/employeeModel";
import { EmployeeModel } from "../models/employeeModel";
import { CommandResponse } from "../../typeDefinitions";
import { Resources, ResourceKey } from "../../../resourceLookup";

export const query = async(): Promise<CommandResponse<boolean>> => {
	return EmployeeRepository.queryActiveExists()
		.then((queriedEmployee: (EmployeeModel | null)): CommandResponse<boolean> => {
			if (queriedEmployee == null) {
				return <CommandResponse<boolean>>{
					status: 404,
					message: Resources.getString(ResourceKey.EMPLOYEE_NOT_FOUND)
				};
            }
            return <CommandResponse<boolean>>{
                data: true,
                status: 200
            };
		});
};