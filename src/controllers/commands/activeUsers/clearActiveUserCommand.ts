import Sequelize from "sequelize";
import { ActiveUserModel } from "../models/activeUserModel";
import { Resources, ResourceKey } from "../../../resourceLookup";
import * as ActiveUserRepository from "../models/activeUserModel";
import { CommandResponse } from "../../typeDefinitions";
import * as DatabaseConnection from "../models/databaseConnection";

// based off productDeleteCommand.ts code
export const execute = async (sessionKey: string): Promise<CommandResponse<void>> => {
    let deleteTransaction: Sequelize.Transaction;

    return DatabaseConnection.createTransaction()
        .then((createdTransaction: Sequelize.Transaction): Promise<ActiveUserModel | null> => {
            deleteTransaction = createdTransaction;
            return ActiveUserRepository.queryBySessionKey(sessionKey, deleteTransaction);
        }).then((queriedActiveUser: (ActiveUserModel | null)): Promise<void> => {
			if (queriedActiveUser == null) {
				return Promise.resolve();
			}

			return queriedActiveUser.destroy(
				<Sequelize.InstanceDestroyOptions>{
					transaction: deleteTransaction
				});
		}).then((): CommandResponse<void> => {
			deleteTransaction.commit();

			return <CommandResponse<void>>{ status: 204 };
		}).catch((error: any): CommandResponse<void> => {
			if (deleteTransaction != null) {
				deleteTransaction.rollback();
			}

			return <CommandResponse<void>>{
				status: 500,
				message: error.message
			};
        });
};