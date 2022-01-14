import * as React from "react";
import * as Dapp from "@elrondnetwork/dapp";
import {
  Address,
  AddressValue,
  ContractFunction,
  SmartContract,
  Query,
} from "@elrondnetwork/erdjs";
import { contractAddress } from "config";
import { RawTransactionType } from "helpers/types";
import useNewTransaction from "pages/Transaction/useNewTransaction";
import { routeNames } from "routes";

const Actions = () => {
  const sendTransaction = Dapp.useSendTransaction();
  const { address, dapp } = Dapp.useContext();
  const newTransaction = useNewTransaction();

  const [nftsMinted, setNftsMinted] = React.useState(0);
  const [quantity, setQuantity] = React.useState(1);

  const DROP_SIZE = 300;
  const DROP_PRICE = 0.4;

  const getInfo = async () => {
    const url = `https://devnet-api.elrond.com/accounts/${contractAddress}/nfts/count`;
    // const data = await fetch(url).then((res) => res.json());
    const data = await fetch(url).then((res) => res.json());
    console.log(data);
    // console.log(response);
    // const buf = Buffer.from(response.returnData[0], "base64");
    // const minted = parseInt(buf.toString("hex"), 16);
    // isNaN(minted) ? setNftsMinted(0) : setNftsMinted(DROP_SIZE - minted);
  };

  React.useEffect(() => {
    getInfo();
  }, []);

  const send =
    (transaction: RawTransactionType) => async (e: React.MouseEvent) => {
      transaction.value = `${quantity * DROP_PRICE}`;
      transaction.data = `mint@0${quantity}`;
      e.preventDefault();
      sendTransaction({
        transaction: newTransaction(transaction),
        callbackRoute: routeNames.transaction,
      });
    };

  const mintTransaction: RawTransactionType = {
    receiver: contractAddress,
    data: "mint",
    value: `${DROP_PRICE}`,
    gasLimit: 600000000,
  };

  const handleChange = (event: React.MouseEvent<HTMLButtonElement>) => {
    const self = event.target as HTMLElement;
    if (self.id === "minus") {
      if (quantity > 1) setQuantity(quantity - 1);
    } else if (self.id === "plus") {
      if (quantity < 8) setQuantity(quantity + 1);
    }
  };

  return (
    <div className="mint-container">
      <div>
        <button className="change-qty" id="minus" onClick={handleChange}>
          -
        </button>
        <button className="mint-btn" onClick={send(mintTransaction)}>
          Mint {quantity} NFT
        </button>
        <button className="change-qty" id="plus" onClick={handleChange}>
          +
        </button>
      </div>
      <div>
        {nftsMinted}/{DROP_SIZE}
      </div>
    </div>
  );
};

export default Actions;
