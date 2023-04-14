import Web3 from 'web3'
import * as bip39 from 'bip39';
import {hdkey} from 'ethereumjs-wallet';
import { Transaction } from 'ethereumjs-tx';
import {map, of, switchMap, tap} from "rxjs";


// NOTE: Run with NodeJS 16

of('surround primary stadium hat auction crew birth sketch between seven huge rely').pipe(
    switchMap(mnemonic => bip39.mnemonicToSeed(mnemonic)),
    map(seed => hdkey.fromMasterSeed(seed)),
    map(hdWallet => hdWallet.derivePath("m/44'/60'/0'/0/0")),
    map(hdWallet => hdWallet.getWallet()),
    map(wallet => ({
        addr: wallet.getAddressString(),
        pubKey: wallet.getPublicKey(),
        privKey: wallet.getPrivateKey(),
        web3: new Web3('https://goerli.infura.io/v3/031741e8f0894a678bdeb46a88e9c78f')
    })),
    switchMap(ctx => ctx.web3.eth.getTransactionCount(ctx.addr, 'pending').then(nonce => ({...ctx, nonce}))),
    map(ctx => ({...ctx, tx: new Transaction({
            nonce: ctx.web3.utils.toHex(ctx.nonce),
            to: ctx.addr,
            data: ctx.web3.utils.toHex("Keep on pump'n"),
            gasLimit: ctx.web3.utils.toHex(50000),
            gasPrice: ctx.web3.utils.toHex(ctx.web3.utils.toWei('10', 'gwei')),
        }, {chain: 5})})),
    map(ctx => {
        ctx.tx.sign(ctx.privKey);
        return ctx;
    }),
    map(ctx => ({...ctx, serializedTx: ctx.tx.serialize()})),
    switchMap(ctx => ctx.web3.eth.sendSignedTransaction('0x' + ctx.serializedTx.toString('hex'))),
    tap(console.log),
).subscribe()

