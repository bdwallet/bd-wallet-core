import { expect } from 'chai';
import { BtcTestWallet } from './BtcTestWallet';
import { DotTestWallet } from './DotTestWallet';
import { EthTestWallet } from './EthTestWallet';

it ('create an btc transaction for bip44', async () => {
  const wallet = new BtcTestWallet(12, false);
  const meta = wallet.getAccount();

  let unspents = await wallet.getUnspents(meta.address);
  expect(unspents).to.have.length(0);

  const unspent = await wallet.applyMoney(meta.address, 10000);
  expect(unspent.value === 10000);

  unspents = (await wallet.getUnspents(meta.address)).sort((a, b) => b.value - a.value);
  expect(unspents).to.have.length(1);
  expect(JSON.stringify(unspents[0])).to.equal(JSON.stringify(unspent));

  const toAddress = 'n2Ctbobmzo5o8JZYg38rKK7Pg6KAoS8EaE';
  const outputMoney = 500;
  let fee = await wallet.calcuteFee(unspents, meta, toAddress, 10000, 2, 0);
  expect(fee).to.equal(-1);

  fee = await wallet.calcuteFee(unspents, meta, toAddress, outputMoney, 2, 0);
  await wallet.send(meta, toAddress, outputMoney, 2);
  unspents = await wallet.getUnspents(meta.address);
  const change = 10000 - outputMoney - fee;

  expect(unspents).to.have.length(1);
  expect(unspents[0].value).to.equal(change);
});

it ('create an btc transaction for bip44 with multi inputs', async () => {
  const wallet = new BtcTestWallet(15, false);
  const meta = wallet.getAccount();

  await wallet.applyMoney(meta.address, 2000);
  await wallet.applyMoney(meta.address, 2000);
  await wallet.applyMoney(meta.address, 1000);

  const toAddress = 'n2Ctbobmzo5o8JZYg38rKK7Pg6KAoS8EaE';
  const outputMoney = 2100;
  let unspents = (await wallet.getUnspents(meta.address)).sort((a, b) => b.value - a.value);

  expect(unspents).to.have.length(3);

  const fee = await wallet.calcuteFee(unspents, meta, toAddress, outputMoney, 2, 0);
  const change = 2000 + 2000 - outputMoney - fee;

  await wallet.send(meta, toAddress, outputMoney, 2);
  unspents = await wallet.getUnspents(meta.address);

  expect(unspents).to.have.length(2);
  expect(unspents[1].value).to.equal(change);
});

it ('create an btc transaction for bip49', async () => {
  const wallet = new BtcTestWallet(15, true);
  const meta = wallet.getAccount();

  let unspents = await wallet.getUnspents(meta.address);
  expect(unspents).to.have.length(0);

  const unspent = await wallet.applyMoney(meta.address, 10000);
  expect(unspent.value === 10000);

  unspents = (await wallet.getUnspents(meta.address)).sort((a, b) => b.value - a.value);
  expect(unspents).to.have.length(1);
  expect(JSON.stringify(unspents[0])).to.equal(JSON.stringify(unspent));

  const toAddress = '2MzS5eYFvsvsNSSsUZjmvuHkxqawZW8sPd5';
  const outputMoney = 3000;
  let fee = await wallet.calcuteFee(unspents, meta, toAddress, 10000, 2, 0);
  expect(fee).to.equal(-1);

  fee = await wallet.calcuteFee(unspents, meta, toAddress, outputMoney, 2, 0);
  await wallet.send(meta, toAddress, outputMoney, 2);
  unspents = await wallet.getUnspents(meta.address);
  const change = 10000 - outputMoney - fee;

  expect(unspents).to.have.length(1);
  expect(unspents[0].value).to.equal(change);
});

it ('create eth accounts transaction', async () => {
  const wallet = new EthTestWallet(
    'basket eternal level bundle tornado abuse tragic expect nerve clay vote enroll observe year abuse'
  );
  const meta = wallet.getAccount(0, 0);
  const targetAddress = wallet.getAccount(0, 1).address;
  const balance = await wallet.getWeb3().eth.getBalance(targetAddress);

  await wallet.send(meta, targetAddress, 2000, 21000);
  const newBalance = await wallet.getWeb3().eth.getBalance(targetAddress);

  expect(Number(newBalance) - Number(balance)).to.equal(2000);
});

it ('create eth contract transaction', async () => {
  const wallet = new EthTestWallet(
    'basket eternal level bundle tornado abuse tragic expect nerve clay vote enroll observe year abuse'
  );
  // @see https://ropsten.etherscan.io/token/0x0b7e66f24909bb356133b4979080ffdbe0417004?a=0xf3b35249fd03df13d3c9be1c3fc74d7c333d87a0
  const meta = wallet.getAccount(0, 0);
  const targetAddress = wallet.getAccount(0, 1).address;

  const result = await wallet.sendContract(meta, targetAddress, '0x0b7e66f24909bb356133b4979080ffdbe0417004', 1, 60000);

  expect(result.transactionHash).have.length(66);
});

it ('create dot transaction', async () => {
  const wallet = new DotTestWallet('basket eternal level bundle tornado abuse tragic expect nerve clay vote enroll observe year abuse');
  const result = await wallet.send(
    wallet.getAccount(),
    wallet.getAccount(0, 0).address,
    150000000
  );

  expect(result.toString()).to.have.length(66);
  await wallet.disconnect();
});
