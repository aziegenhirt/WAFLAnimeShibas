import * as React from "react";
import * as Dapp from "@elrondnetwork/dapp";
import { contractAddress, bech32ContractAddress, network } from "config";
import { RawTransactionType } from "helpers/types";
import useNewTransaction from "pages/Transaction/useNewTransaction";
import { routeNames } from "routes";

const Actions = () => {
  const sendTransaction = Dapp.useSendTransaction();
  const { account } = Dapp.useContext();
  const newTransaction = useNewTransaction();

  const [nftsMinted, setNftsMinted] = React.useState(100);
  const [quantity, setQuantity] = React.useState(1);
  const [secondsLeft, setSecondsLeft] = React.useState(0);

  const DROP_SIZE = 100;
  const EGLD_PRICE = 0.0;
  const LKMEX_PRICE = 250;

  const getInfo = async () => {
    const url = `${network.apiAddress}/accounts/${contractAddress}/nfts/count`;
    const data = await fetch(url).then((res) => res.json());
    isNaN(data) ? setNftsMinted(100) : setNftsMinted(100 - data);
  };

  const getTimeLeft = () => {
    setInterval(() => {
      const reveal = Date.UTC(2022, 1, 7, 14, 0, 0);
      setSecondsLeft((reveal - Date.now()) / 1000);
    }, 1000);
  };

  React.useEffect(() => {
    getInfo();
    getTimeLeft();
  }, []);

  const send =
    (transaction: RawTransactionType) => async (e: React.MouseEvent) => {
      if (transaction.data?.startsWith("ESDTTransfer")) {
        const value = LKMEX_PRICE * quantity * 10 ** 5;

        // Call API
        const url = `${network.apiAddress}/accounts/${account.address}/tokens/WAFL-e74a57`;
        const tokens = await fetch(url).then((res) => res.json());
        let eligible = false;
        for (const token of tokens) {
          if (parseInt(token["balance"]) >= value) {
            eligible = true;
            alert("Balance>Value");
            const lkmex = new Buffer(token["identifier"]).toString("hex");
            transaction.data += `@${lkmex}`;
            let lkmex_amount = value.toString(16);
            if (lkmex_amount.length % 2 == 1) lkmex_amount = `0${lkmex_amount}`;
            transaction.data += `@${lkmex_amount}`;

            transaction.data += `@${bech32ContractAddress}`;
            transaction.data += `@${new Buffer("mint_with_wafl").toString(
              "hex",
            )}`;
            let qty = quantity.toString(16);
            if (qty.length % 2 == 1) qty = `0${qty}`;
            transaction.data += `@${qty}`;

            e.preventDefault();
            sendTransaction({
              transaction: newTransaction(transaction),
              callbackRoute: routeNames.transaction,
            });
            return;
          }
        }
        if (!eligible) alert("WAFL balance insufficient.");
      } else {
        transaction.value = `${Math.round(quantity * EGLD_PRICE * 100) / 100}`;
        const balance = parseInt(account.balance) / 10 ** 18;
        if (quantity * EGLD_PRICE > balance) {
          setQuantity(Math.floor(balance / EGLD_PRICE));
          alert("EGLD balance insufficient.");
        } else {
          if (quantity > 9) transaction.data = `mint@0${quantity.toString(16)}`;
          else transaction.data = `mint@0${quantity}`;
          e.preventDefault();
          sendTransaction({
            transaction: newTransaction(transaction),
            callbackRoute: routeNames.transaction,
          });
        }
      }
    };

  const mintTransaction: RawTransactionType = {
    receiver: contractAddress,
    data: "mint",
    value: `${EGLD_PRICE}`,
    gasLimit: 600000000,
  };

  const lkmexTransaction: RawTransactionType = {
    receiver: contractAddress,
    data: "ESDTTransfer",
    value: "0",
    gasLimit: 600000000,
  };

  const handleChange = (event: React.MouseEvent<HTMLButtonElement>) => {
    const self = event.target as HTMLElement;
    if (self.id === "minus") {
      if (quantity > 1) setQuantity(quantity - 1);
    } else if (self.id === "plus") {
      if (quantity < 12) setQuantity(quantity + 1);
    }
  };

  return (
    <div className="mint-container">
      {secondsLeft <= 0 && (
        <div style={{ textAlign: "center" }}>
          {nftsMinted !== DROP_SIZE && (
            <>
              <div className="input-qty">
                <button
                  className="change-qty"
                  id="minus"
                  onClick={handleChange}
                >
                  -
                </button>
                <div style={{ display: "flex", flexDirection: "column" }}>
                  <button className="mint-btn" onClick={send(lkmexTransaction)}>
                    Mint {quantity} NFT with WAFL
                  </button>
                </div>
                <button className="change-qty" id="plus" onClick={handleChange}>
                  +
                </button>
              </div>
              <div className="mint-info">
                Price: {Math.round(quantity * EGLD_PRICE * 100) / 100} EGLD /{" "}
                {(
                  Math.round(quantity * LKMEX_PRICE * 100) / 100
                ).toLocaleString()}{" "}
                WAFL
              </div>
            </>
          )}
          {nftsMinted === DROP_SIZE && (
            <div style={{ padding: "1rem 2rem" }}>SOLD OUT</div>
          )}
          <div>
            {nftsMinted}/{DROP_SIZE}
          </div>
        </div>
      )}
      {secondsLeft > 0 && (
        <div className="countdown">
          {String(Math.floor(secondsLeft / (24 * 60 * 60))).padStart(2, "0")} :{" "}
          {String(Math.floor((secondsLeft / (60 * 60)) % 24)).padStart(2, "0")}{" "}
          : {String(Math.floor((secondsLeft / 60) % 60)).padStart(2, "0")} :{" "}
          {String(Math.floor(secondsLeft % 60)).padStart(2, "0")}
        </div>
      )}
    </div>
  );
};

export default Actions;
