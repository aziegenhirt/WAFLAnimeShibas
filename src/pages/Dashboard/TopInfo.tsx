import * as React from "react";
import * as Dapp from "@elrondnetwork/dapp";
import { contractAddress } from "config";
import Denominate from "./../../components/Denominate";

const TopInfo = () => {
  const {
    address,
    account: { balance },
  } = Dapp.useContext();

  return (
    <div className="text-white" data-testid="topInfo">
      <div>Price: 0.4 EGLD</div>
    </div>
  );
};

export default TopInfo;
