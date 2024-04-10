export type JettonToken = [
  string, // contractAddress
  string, // name
  string, // ticker
  number, // magntude
  boolean, // delisted
];

import tokens from "./jetton.json";

export default tokens as JettonToken[];
