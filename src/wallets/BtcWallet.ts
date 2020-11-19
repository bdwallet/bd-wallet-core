import { bip32, networks, payments } from 'bitcoinjs-lib';
import { Wallet } from './Wallet';

export class BtcWallet extends Wallet {
  getAddress(account: number = 0, index: number = 0, internal: boolean = false) {
    const derivePath = this.getDerivePath(account, index, internal);
    const child = this.getRoot().derivePath(derivePath);

    return payments.p2pkh({ pubkey: child.publicKey }).address;
  }

  getRoot() {
    return bip32.fromSeed(this.seed, networks.bitcoin);
  }

  protected getDerivePath(account: number, index: number, internal: boolean): string {
    return `m/${this.purpose}'/${this.getId()}'/${account}'/${internal ? 1 : 0}/${index}`;
  }

  protected getId(): number {
    return 0;
  }
}
