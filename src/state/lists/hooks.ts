import { ChainId, Token } from '../../sdk'
import { TokenInfo, TokenList } from '@uniswap/token-lists'
import { useMemo } from 'react'
import { useSelector } from 'react-redux'
import { DEFAULT_TOKEN_LIST_URL } from '../../constants'
import { AppState } from '../index'

/**
 * Token instances created from token info.
 */
export class WrappedTokenInfo extends Token {
  public readonly tokenInfo: TokenInfo
  constructor(tokenInfo: TokenInfo) {
    super(tokenInfo.chainId, tokenInfo.address, tokenInfo.decimals, tokenInfo.symbol, tokenInfo.name)
    this.tokenInfo = tokenInfo
  }
  public get logoURI(): string | undefined {
    return this.tokenInfo.logoURI
  }
}

export type TokenAddressMap = Readonly<{ [chainId in ChainId]: Readonly<{ [tokenAddress: string]: WrappedTokenInfo }> }>

/**
 * An empty result, useful as a default.
 */
const EMPTY_LIST: TokenAddressMap = {
  [ChainId.KOVAN]: {},
  [ChainId.RINKEBY]: {},
  [ChainId.ROPSTEN]: {},
  [ChainId.GÖRLI]: {},
  [ChainId.MAINNET]: {},
  [ChainId.BNB_TESTNET]: { 
      "0xae13d989daC2f0dEbFf460aC112a837C89BAa7cd": new WrappedTokenInfo({
        chainId: ChainId.BNB_TESTNET,
        address: '0xae13d989daC2f0dEbFf460aC112a837C89BAa7cd',
        name: 'Wrapper BNB',
        decimals: 18,
        symbol: 'WBNB'
    })
  },
  [ChainId.BNB_MAINNET]: { 
      "0xae13d989daC2f0dEbFf460aC112a837C89BAa7cd": new WrappedTokenInfo({
        chainId: ChainId.BNB_MAINNET,
        address: '0xae13d989daC2f0dEbFf460aC112a837C89BAa7cd',
        name: 'Wrapper BNB',
        decimals: 18,
        symbol: 'WBNB'
    })
  }
}

const listCache: WeakMap<TokenList, TokenAddressMap> | null =
  'WeakMap' in window ? new WeakMap<TokenList, TokenAddressMap>() : null

export function listToTokenMap(list: TokenList): TokenAddressMap {
  const result = listCache?.get(list)
  if (result) return result

  const map = list.tokens.reduce<TokenAddressMap>(
    (tokenMap, tokenInfo) => {
      const token = new WrappedTokenInfo(tokenInfo)
      console.log(tokenMap)
      if (tokenMap[token.chainId][token.address] !== undefined) throw Error('Duplicate tokens.')
      return {
        ...tokenMap,
        [token.chainId]: {
          ...tokenMap[token.chainId],
          [token.address]: token
        }
      }
    },
    { ...EMPTY_LIST }
  )
  listCache?.set(list, map)
  return map
}

export function useTokenList(url: string): TokenAddressMap {
  const lists = useSelector<AppState, AppState['lists']['byUrl']>(state => state.lists.byUrl)
  return useMemo(() => {
    // const current = {
    //   "name": "Uniswap Default List",
    //   "timestamp": "2020-09-10T03:00:22.720Z",
    //   "version": {
    //     "major": 1,
    //     "minor": 3,
    //     "patch": 1
    //   },
    //   "tags": {},
    //   "logoURI": "ipfs://QmNa8mQkrNKp1WEEeGjFezDmDeodkWRevGFN8JCV7b4Xir",
    //   "keywords": [
    //     "uniswap",
    //     "default"
    //   ],
    //   "tokens": [
    //     {
    //       "name": "Dai Stablecoin",
    //       "address": "0xaD6D458402F60fD3Bd25163575031ACDce07538D",
    //       "symbol": "DAI",
    //       "decimals": 18,
    //       "chainId": 3,
    //       "logoURI": "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xaD6D458402F60fD3Bd25163575031ACDce07538D/logo.png"
    //     },
    //     {
    //       "name": "Wrapped Ether",
    //       "address": "0xc778417E063141139Fce010982780140Aa0cD5Ab",
    //       "symbol": "WETH",
    //       "decimals": 18,
    //       "chainId": 3,
    //       "logoURI": "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xc778417E063141139Fce010982780140Aa0cD5Ab/logo.png"
    //     },
    //     {
    //       "name": "Dai Stablecoin",
    //       "address": "0xc7AD46e0b8a400Bb3C915120d284AafbA8fc4735",
    //       "symbol": "DAI",
    //       "decimals": 18,
    //       "chainId": 4,
    //       "logoURI": "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xc7AD46e0b8a400Bb3C915120d284AafbA8fc4735/logo.png"
    //     },
    //     {
    //       "name": "Maker",
    //       "address": "0xF9bA5210F91D0474bd1e1DcDAeC4C58E359AaD85",
    //       "symbol": "MKR",
    //       "decimals": 18,
    //       "chainId": 4,
    //       "logoURI": "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xF9bA5210F91D0474bd1e1DcDAeC4C58E359AaD85/logo.png"
    //     },
    //     {
    //       "name": "Wrapped Ether",
    //       "address": "0xc778417E063141139Fce010982780140Aa0cD5Ab",
    //       "symbol": "WETH",
    //       "decimals": 18,
    //       "chainId": 4,
    //       "logoURI": "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xc778417E063141139Fce010982780140Aa0cD5Ab/logo.png"
    //     },
    //     {
    //       "name": "Wrapped Ether",
    //       "address": "0xB4FBF271143F4FBf7B91A5ded31805e42b2208d6",
    //       "symbol": "WETH",
    //       "decimals": 18,
    //       "chainId": 5,
    //       "logoURI": "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xB4FBF271143F4FBf7B91A5ded31805e42b2208d6/logo.png"
    //     },
    //     {
    //       "name": "Dai Stablecoin",
    //       "address": "0x4F96Fe3b7A6Cf9725f59d353F723c1bDb64CA6Aa",
    //       "symbol": "DAI",
    //       "decimals": 18,
    //       "chainId": 42,
    //       "logoURI": "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0x4F96Fe3b7A6Cf9725f59d353F723c1bDb64CA6Aa/logo.png"
    //     },
    //     {
    //       "name": "Maker",
    //       "address": "0xAaF64BFCC32d0F15873a02163e7E500671a4ffcD",
    //       "symbol": "MKR",
    //       "decimals": 18,
    //       "chainId": 42,
    //       "logoURI": "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xAaF64BFCC32d0F15873a02163e7E500671a4ffcD/logo.png"
    //     },
    //     {
    //       "name": "Wrapped Ether",
    //       "address": "0xd0A1E359811322d97991E03f863a0C30C2cF029C",
    //       "symbol": "WETH",
    //       "decimals": 18,
    //       "chainId": 42,
    //       "logoURI": "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xd0A1E359811322d97991E03f863a0C30C2cF029C/logo.png"
    //     },
    //     {
    //       "name": "Wrapped BNB",
    //       "address": "0xae13d989daC2f0dEbFf460aC112a837C89BAa7cd",
    //       "symbol": "WBNB",
    //       "decimals": 18,
    //       "chainId": 56,
    //       "logoURI": "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2/logo.png"
    //     },
    //     {
    //       "name": "Wrapped BNB",
    //       "address": "0xae13d989daC2f0dEbFf460aC112a837C89BAa7cd",
    //       "symbol": "WBNB",
    //       "decimals": 18,
    //       "chainId": 97,
    //       "logoURI": "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2/logo.png"
    //     }
    //   ]
    // }
    
    // if (!current) return EMPTY_LIST
    // return listToTokenMap(current)
    return EMPTY_LIST
  }, [lists, url])
}

export function useDefaultTokenList(): TokenAddressMap {
  return useTokenList(DEFAULT_TOKEN_LIST_URL)
}

// returns all downloaded current lists
export function useAllLists(): TokenList[] {
  const lists = useSelector<AppState, AppState['lists']['byUrl']>(state => state.lists.byUrl)

  return useMemo(
    () =>
      Object.keys(lists)
        .map(url => lists[url].current)
        .filter((l): l is TokenList => Boolean(l)),
    [lists]
  )
}
