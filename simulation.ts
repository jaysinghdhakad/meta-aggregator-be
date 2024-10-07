import axios from "axios";
import { ITransactionData } from "./types";
import { getApprovalData } from "./utils";
import BigNumber from "bignumber.js";
import 'dotenv/config'

export const checkExecutionNotReverted = async (transactionData: ITransactionData[], chainId: number) : Promise<{status: boolean, gas: number}> => {
    try {

        console.log("transactionData", transactionData)

        const response = (
            await axios.post(
                `https://api.tenderly.co/api/v1/account/${process.env.TENDERLY_ACCOUNT_SLUG}/project/${process.env.TENDERLY_PROJECT_SLUG}/simulate-bundle`,
                // the transaction
                {
                    simulations: transactionData.map((transaction) => ({
                        network_id: chainId, // network to simulate on
                        save: true,
                        save_if_fails: true,
                        simulation_type: 'quick',
                        estimate_gas: true,
                        ...transaction,
                    })),
                },
                {
                    headers: {
                        'X-Access-Key': process.env.TENDERLY_ACCESS_KEY,
                    },
                }
            )
        ).data

        console.log("response Simulation", response)
        const status = response.simulation_results[transactionData.length - 1].transaction.status
        const gas = response.simulation_results[transactionData.length - 1].transaction.gas
        return { status: status, gas: gas }
    } catch (err) {
        return { status: false, gas: 0 }
    }
}



export async function generateSimulationData(
    chainId: number,
    amount: string,
    tokenAddress: string,
    userAddress: string,
    swapContractAddress: string,
    swapData: string,
    isEth: boolean
): Promise<ITransactionData[]> {
    const simulationData: ITransactionData[] = [];

    if (!isEth) {
        // Add approval transaction for non-ETH tokens
        const approvalData = getApprovalData(chainId, amount, tokenAddress, swapContractAddress);
        simulationData.push({
            from: userAddress,
            to: tokenAddress,
            input: approvalData,
            value: 0
        });
    }

    // Add swap transaction
    simulationData.push({
        from: userAddress,
        to: swapContractAddress,
        value: isEth ? BigNumber(amount).toNumber() : 0,
        input: swapData,
    });

    return simulationData;
}