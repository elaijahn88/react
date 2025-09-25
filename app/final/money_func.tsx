// financeFunctions.tsx

// Function 1: Saving Money
export const saveMoney = (balance: number, amount: number): number => {
  if (amount <= 0) {
    throw new Error("Amount must be greater than zero");
  }
  return balance + amount; // new balance after saving
};

// Function 2: Loans
export const takeLoan = (loanBalance: number, amount: number): number => {
  if (amount <= 0) {
    throw new Error("Loan amount must be greater than zero");
  }
  return loanBalance + amount; // increase loan balance
};

// Function 3: Sending Money
export const sendMoney = (
  senderBalance: number,
  receiverBalance: number,
  amount: number
): { sender: number; receiver: number } => {
  if (amount <= 0) {
    throw new Error("Amount must be greater than zero");
  }
  if (amount > senderBalance) {
    throw new Error("Insufficient funds");
  }
  return {
    sender: senderBalance - amount,
    receiver: receiverBalance + amount,
  };
};

// Function 4: Investment
export const invest = (
  investmentBalance: number,
  amount: number,
  rate: number
): number => {
  if (amount <= 0) {
    throw new Error("Investment amount must be greater than zero");
  }
  const profit = amount * (rate / 100);
  return investmentBalance + amount + profit; // add investment + profit
};
