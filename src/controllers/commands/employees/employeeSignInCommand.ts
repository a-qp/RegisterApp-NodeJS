import Sequelize from "sequelize";
import * as Helper from "../helpers/helper";
import * as EmployeeHelper from "./helpers/employeeHelper";
import { EmployeeModel } from "../models/employeeModel";
import { ActiveUserModel } from "../models/activeUserModel";
import * as ActiveUserRepository from "../models/activeUserModel";
import * as EmployeeRepository from "../models/employeeModel";
import * as DatabaseConnection from "../models/databaseConnection";
import { Resources, ResourceKey } from "../../../resourceLookup";
import { CommandResponse, SignInRequest, ActiveUser } from "../../typeDefinitions";
import sequelize from "sequelize";

//  Checks to see if the user and pass are properly filled in
const validateRequest = (signInReq: SignInRequest): CommandResponse<ActiveUser> => {
    if (Helper.isBlankString(signInReq.employeeId) || Helper.isBlankString(signInReq.password) || isNaN(Number(signInReq.employeeId))) {
        return <CommandResponse<ActiveUser>>{
            status: 422,
            message: Resources.getString(ResourceKey.USER_SIGN_IN_CREDENTIALS_INVALID)
        };
    }

    return <CommandResponse<ActiveUser>>{
        status: 200
    };
};
//  based off productCreateCommand.ts
const updateActiveUser = async (activeUser: ActiveUserModel): Promise<CommandResponse<ActiveUserModel>> => {
    let updateTransaction: Sequelize.Transaction;
    return DatabaseConnection.createTransaction()
        .then((madeTransaction: Sequelize.Transaction): Promise<ActiveUserModel | null> => {
            updateTransaction = madeTransaction;

            return ActiveUserRepository.queryByEmployeeId(activeUser.employeeId, updateTransaction);
        }).then((queryActiveUser: (ActiveUserModel | null)): Promise<ActiveUserModel> => {
            if (queryActiveUser != null) {
                return queryActiveUser.update(<Object>{ sessionKey: activeUser.sessionKey }, <Sequelize.InstanceUpdateOptions>{ transaction: updateTransaction });
            }
            else {
                return ActiveUserModel.create(activeUser, <Sequelize.CreateOptions>{ transaction: updateTransaction });
            }
        }).then((activeUser: ActiveUserModel): CommandResponse<ActiveUserModel> => {
			updateTransaction.commit();

			return <CommandResponse<ActiveUserModel>>{
				status: 200,
				data: activeUser
			};
		}).catch((error: any): Promise<CommandResponse<ActiveUserModel>> => {
			updateTransaction.rollback();

			return Promise.reject(<CommandResponse<ActiveUserModel>>{
				status: 500,
				message: error.message
			});
		});
};



export const execute = async (signInRequest: SignInRequest, session?: Express.Session): Promise<CommandResponse<ActiveUser>> => {
    if (session == null) {
        return Promise.reject(<CommandResponse<ActiveUser>>{
            status: 500,
            message: Resources.getString(ResourceKey.USER_SESSION_NOT_FOUND)
        });
    }

    const valid: CommandResponse<ActiveUser> = validateRequest(signInRequest);
    if (valid.status != 200) {
        return Promise.reject(valid);
    }

    return EmployeeRepository.queryByEmployeeId(Number(signInRequest.employeeId))
        .then((queryEmployee: (EmployeeModel | null)): Promise<CommandResponse<ActiveUserModel>> => {
           // const password: boolean = (EmployeeHelper.hashString(signInRequest.password) !== (queryEmployee.password.toString()));
           // console.log(EmployeeHelper.hashString(signInRequest.password));
           // console.log("value of bool is " + String(password));
           // console.log(queryEmployee.password.toString());
            if ((queryEmployee) == null || signInRequest.password !== queryEmployee.password.toString()) {
                return Promise.reject(<CommandResponse<ActiveUser>>{
                    status: 401,
                    message: Resources.getString(ResourceKey.USER_SIGN_IN_CREDENTIALS_INVALID)
                });
            }

            return updateActiveUser(<ActiveUserModel>{
                employeeId: queryEmployee.id,
                sessionKey: (<Express.Session>session).id,
                classification: queryEmployee.classification,
                name: (queryEmployee.firstName + " " + queryEmployee.lastName)
            });

        }).then((activeUserCommandResponse: CommandResponse<ActiveUserModel>): CommandResponse<ActiveUser> => {
			return <CommandResponse<ActiveUser>>{
				status: 200,
				data: <ActiveUser>{
					id: (<ActiveUserModel>activeUserCommandResponse.data).id,
					name: (<ActiveUserModel>activeUserCommandResponse.data).name,
					employeeId: (<ActiveUserModel>activeUserCommandResponse.data).employeeId,
					classification: (<ActiveUserModel>activeUserCommandResponse.data).classification
				}
			};
		});
};
