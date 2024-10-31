
import { createV1, updateV1, Collection,
     Creator ,Uses,
          CreateV1InstructionAccounts,
          CreateV1InstructionData, TokenStandard, CollectionDetails,
           PrintSupply, UpdateV1InstructionAccounts,
            Data } from "@metaplex-foundation/mpl-token-metadata";
import * as web3 from "@solana/web3.js";
import { PublicKey, createSignerFromKeypair, none, percentAmount, publicKey, signerIdentity, some } from "@metaplex-foundation/umi";
import { createUmi } from '@metaplex-foundation/umi-bundle-defaults';
import { fromWeb3JsKeypair, fromWeb3JsPublicKey } from '@metaplex-foundation/umi-web3js-adapters';
import bs58 from "bs58";
import dotenv from "dotenv"
dotenv.config()
const SPL_TOKEN_2022_PROGRAM_ID: PublicKey = publicKey(
    'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA'
);


export function loadWalletKey(keypairFile: string): web3.Keypair {
    const fs = require("fs");
    const loaded = web3.Keypair.fromSecretKey(
        new Uint8Array(JSON.parse(fs.readFileSync(keypairFile).toString())),
    );
    return loaded;
}


export const retrieveEnvVariable = (variableName: string) => {
  const variable = process.env[variableName] || '';
  if (!variable) {
    console.error(`${variableName} is not set`);
    process.exit(1);
  }
  return variable;
};

const INITIALIZE = true;

async function main() {
    console.log("let's name some token-22 tokens in 2024!");
    const myKeypair = loadWalletKey("/home/asad/.config/solana/prod.json");
    const mint = new web3.PublicKey("AayL7CipMC265gcg9ZNyS7uBZ2Pn3NKNFU5HFcqkCoEW");

    const umi = createUmi(retrieveEnvVariable("RPC_URL"));
    const signer = createSignerFromKeypair(umi, fromWeb3JsKeypair(myKeypair))
    umi.use(signerIdentity(signer, true))

    const ourMetadata = { // TODO change those values!
        name: "ASAD friend",
        symbol: "ASDF",
        uri: "https://raw.githubusercontent.com/orbit-cosmos/omerta_solana_spl/refs/heads/master/metadata.json",
    }
    if (INITIALIZE) {
        const onChainData = {
            ...ourMetadata,
            // we don't need that
            sellerFeeBasisPoints: percentAmount(0, 2),
            creators: none<Creator[]>(),
            collection: none<Collection>(),
            uses: none<Uses>(),
        }
        const accounts: CreateV1InstructionAccounts = {
            mint: fromWeb3JsPublicKey(mint),
            splTokenProgram: SPL_TOKEN_2022_PROGRAM_ID
        }
        const data: CreateV1InstructionData = {
            ...onChainData,
            isMutable: false,
            discriminator: 0,
            tokenStandard: TokenStandard.Fungible,
            collectionDetails: none<CollectionDetails>(),
            ruleSet: none<PublicKey>(),
            createV1Discriminator: 0,
            primarySaleHappened: false,
            decimals: none<number>(),
            printSupply: none<PrintSupply>(),
        }
        const txid = await createV1(umi, { ...accounts, ...data }).sendAndConfirm(umi);
        //console.log(bs58.encode(txid.signature))
    } else {
        const onChainData = {
            ...ourMetadata,
            sellerFeeBasisPoints: 0,
            creators: none<Creator[]>(),
            collection: none<Collection>(),
            uses: none<Uses>(),
        }
        const accounts: UpdateV1InstructionAccounts = {
            mint: fromWeb3JsPublicKey(mint),
        }
        const data = {
            discriminator: 0,
            data: some<Data>(onChainData),
            updateV1Discriminator: 0,
        }
        const txid = await updateV1(umi, { ...accounts, ...data }).sendAndConfirm(umi);
        console.log(bs58.encode(txid.signature))
    }


}

main();