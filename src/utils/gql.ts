import { getGrid } from './grid';
// import type { Networks } from 'tfgrid-gql';
// const { default: TFGridGqlClient } = window.tfgridGql;
const { Graphql } = window.grid3_client;
import type { NetworkEnv } from '@threefold/grid_client';
export async function getNameAndGatewayContracts(
  mnemonic: string,
  name: string,
): Promise<number[]> {
  const grid = await getGrid(mnemonic);
  const twinId = await grid.twins.get_my_twin_id();
  const gql = new Graphql(grid.getDefaultUrls(window.config.network as NetworkEnv).graphql)
  const whereNodeContract = `(where: {
    twinID_eq: ${twinId}, state_in: [Created, GracePeriod], 
    deploymentData_contains: "ThreebotDeployer" AND: {
      deploymentData_contains: "${window.config.projectNamePrefix}${twinId}${name}",
    },
  }, orderBy: twinID_ASC`
  const whereNameContract = `(where: { twinID_eq: ${twinId}, name_eq: "${window.config.projectNamePrefix}${twinId}${name}", state_in: [Created, GracePeriod] }, orderBy: twinID_ASC`
  const nameContractsCount = await gql.getItemTotalCount("nameContracts", `${whereNameContract})`);
  const nodeContractsCount = await gql.getItemTotalCount("nodeContracts", `${whereNodeContract})`)


  const body = `query getContracts($nameContractsCount: Int!, $nodeContractsCount: Int!){
    nameContracts${whereNameContract}, limit: $nameContractsCount) {
      contractID
    }
    nodeContracts${whereNodeContract}, limit: $nodeContractsCount) {
      contractID
    }
  }`;
  const contracts = await gql.query(body, {
    nodeContractsCount: nodeContractsCount,
    nameContractsCount: nameContractsCount,
  });
  console.log('contracts', contracts);
  
  return [
    ...contracts.data.nameContracts.map((x) => +x.contractID),
    ...contracts.data.nodeContracts.map((x) => +x.contractID),
  ];
}
