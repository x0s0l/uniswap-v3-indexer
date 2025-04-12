import { createPublicClient, http, getContract, type PublicClient } from "viem";
import { readFileSync, writeFileSync, existsSync, mkdirSync } from "fs";
import { join } from "path";
import { ADDRESS_ZERO } from "./constants";
import { CHAIN_CONFIGS } from "./chains";
import * as dotenv from "dotenv";

dotenv.config();

const ERC20_ABI = [
  {
    inputs: [],
    name: "name",
    outputs: [{ type: "string" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "NAME",
    outputs: [{ type: "bytes32" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "symbol",
    outputs: [{ type: "string" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "SYMBOL",
    outputs: [{ type: "bytes32" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "decimals",
    outputs: [{ type: "uint8" }],
    stateMutability: "view",
    type: "function",
  }
] as const;

// Create .cache directory if it doesn't exist
const CACHE_DIR = join(__dirname, "../../../.cache");
if (!existsSync(CACHE_DIR)) {
  mkdirSync(CACHE_DIR, { recursive: true });
}

// Function to get cache path for a specific chain
const getCachePath = (chainId: number): string => {
  return join(CACHE_DIR, `tokenMetadata_${chainId}.json`);
};

interface TokenMetadata {
  name: string;
  symbol: string;
  decimals: bigint;
}

const getRpcUrls = (chainId: number): string[] => {
  switch (chainId) {
    case 1:
      return [
        'https://eth.drpc.org',
        'https://rpc.mevblocker.io/fast',
        'https://rpc.mevblocker.io',
        'https://1rpc.io/eth',
        'https://ethereum-rpc.publicnode.com'
      ];

    case 42161:
      return [process.env.ARBITRUM_RPC_URL || "https://arbitrum.drpc.org"];
    case 10:
      return [process.env.OPTIMISM_RPC_URL || "https://optimism.drpc.org"];
    case 8453:
      return [process.env.BASE_RPC_URL || "https://base.drpc.org"];
    case 137:
      return [process.env.POLYGON_RPC_URL || "https://polygon.drpc.org"];
    case 43114:
      return [process.env.AVALANCHE_RPC_URL || "https://avalanche.drpc.org"];
    case 56:
      return [process.env.BSC_RPC_URL || "https://bsc.drpc.org"];
    case 81457:
      return [process.env.BLAST_RPC_URL || "https://blast.drpc.org"];
    case 7777777:
      return [process.env.ZORA_RPC_URL || "https://zora.drpc.org"];
    case 1868:
      return [process.env.SONIEUM_RPC_URL || "https://sonieum.drpc.org"];
    case 130:
      return [process.env.UNICHAIN_RPC_URL || "https://unichain.drpc.org"];
    case 57073:
      return [process.env.INK_RPC_URL || "https://ink.drpc.org"];
    // Add generic fallback for any chain
    default:
      throw new Error(`No RPC URL configured for chainId ${chainId}`);
  }
};

// Cache of clients per chainId
const clients: Record<string, PublicClient> = {};

// Get client for a specific chain
const getClient = (chainId: number, rpcUrl: string): PublicClient => {
  const key = `${chainId}-${rpcUrl}`;

  if (!clients[key]) {
    try {
      // Create a simpler client configuration
      clients[key] = createPublicClient({
        transport: http(rpcUrl),
      });
      console.log(`Created client for chain ${key}`);
    } catch (e) {
      console.error(`Error creating client for chain ${key}:`, e);
      throw e;
    }
  }
  return clients[key];
};

// Cache of metadata per chainId
const metadataCaches: Record<number, Record<string, TokenMetadata>> = {};

const bigIntReviver = (k: any, v: any) => (k === 'decimals') ? BigInt(v) : v;
const bigIntReplacer = (_: any, v: any) => (typeof v === 'bigint') ? v.toString() : v;
const metadataParser = (json: string) => JSON.parse(json, bigIntReviver);
const metadataSerializer = (item: any) => JSON.stringify(item, bigIntReplacer, 2);

// Load cache for a specific chain
const loadCache = (chainId: number): Record<string, TokenMetadata> => {
  if (!metadataCaches[chainId]) {
    const cachePath = getCachePath(chainId);
    if (existsSync(cachePath)) {
      try {
        metadataCaches[chainId] = metadataParser(readFileSync(cachePath, "utf8"));
      } catch (e) {
        console.error(
          `Error loading token metadata cache for chain ${chainId}:`,
          e
        );
        metadataCaches[chainId] = {};
      }
    } else {
      metadataCaches[chainId] = {};
    }
  }
  return metadataCaches[chainId];
};

// Save cache for a specific chain
const saveCache = (chainId: number): void => {
  const cachePath = getCachePath(chainId);
  try {
    writeFileSync(cachePath, metadataSerializer(metadataCaches[chainId]));
  } catch (e) {
    console.error(`Error saving token metadata cache for chain ${chainId}:`, e);
  }
};

// Add this function to sanitize strings by removing null bytes and other problematic characters
function sanitizeString(str: string): string {
  if (!str) return "";

  // Remove null bytes and other control characters that might cause issues with PostgreSQL
  return str.replace(/[\u0000-\u001F\u007F-\u009F]/g, "").trim();
}

export async function getTokenMetadata(
  address: string,
  chainId: number
): Promise<TokenMetadata> {
  // Load cache for this chain
  const metadataCache = loadCache(chainId);
  const chainConfig = CHAIN_CONFIGS[chainId];

  // Handle native token
  if (address === ADDRESS_ZERO) {
    return {
      name: chainConfig.nativeTokenDetails.name,
      symbol: chainConfig.nativeTokenDetails.symbol,
      decimals: chainConfig.nativeTokenDetails.decimals,
    };
  }

  address = address.toLowerCase();

  // Check for token overrides in chain config
  const tokenOverride = chainConfig.tokenOverrides.find(
    (t) => t.address.toLowerCase() === address
  );

  if (tokenOverride) {
    return {
      name: tokenOverride.name,
      symbol: tokenOverride.symbol,
      decimals: tokenOverride.decimals,
    };
  }

  // Check cache
  if (metadataCache[address]) {
    return metadataCache[address];
  }

  try {
    // Use the multicall implementation for efficiency
    const metadata = await fetchTokenMetadataMulticall(address, chainId);

    // Update cache
    metadataCache[address] = metadata;
    saveCache(chainId);

    return metadata;
  } catch (e) {
    console.error(
      `Error fetching metadata for ${address} on chain ${chainId}:`,
      e
    );
    throw e;
  }
}

async function fetchTokenMetadataMulticall(
  address: string,
  chainId: number
): Promise<TokenMetadata> {
  const rpcUrls = getRpcUrls(chainId);
  let name, symbol, decimals;

  for (const rpcUrl of rpcUrls) {
    const contract = getContract({
      address: address as `0x${string}`,
      abi: ERC20_ABI,
      client: getClient(chainId, rpcUrl),
    });

    const promiseList = [];

    if (name === undefined) {
      const namePromise = contract.read.name()
                          .then(val => {
                            if (val === null) throw 'Result is null';
                            name = sanitizeString(val);
                          });
  
      const nameBytes32Promise = contract.read.NAME()
                          .then(val => name = parseBytes32String(val));
      
      promiseList.push(Promise.any([namePromise, nameBytes32Promise]));
    }

    if (symbol === undefined) {
      const symbolPromise = contract.read.symbol()
                          .then(val => {
                            if (val === null) throw 'Result is null';
                            symbol = sanitizeString(val);
                          });
  
      const symbolBytes32Promise = contract.read.SYMBOL()
                          .then(val => symbol = parseBytes32String(val));

      promiseList.push(Promise.any([symbolPromise, symbolBytes32Promise]));
    }

    if (decimals === undefined) {
      const decimalsPromise = contract.read.decimals()
                          .then(val => {
                            if (val === null) throw 'Result is null';
                            decimals = val;
                          });

      promiseList.push(decimalsPromise);
    }

    try {
      await Promise.all(promiseList);
    } catch (err) {
      console.log(err);
    }

    if (name !== undefined && symbol !== undefined && decimals !== undefined) {
      break;
    }
  }

  return {
    name: name === undefined ? 'unknown' : name,
    symbol: symbol === undefined ? 'UNKNOWN' : symbol,
    decimals: typeof decimals === "number" ? BigInt(decimals) : 18n
  };
}

function parseBytes32String(bytes32String: string | null): string {
  if (bytes32String === null) throw 'Result is null';

  return sanitizeString(
    new TextDecoder().decode(
      new Uint8Array(
        Buffer.from(bytes32String.slice(2), "hex").filter(n => n !== 0)
      )
    )
  );
}