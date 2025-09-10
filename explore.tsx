import React, { useState, ChangeEvent, FormEvent } from 'react';

interface UserAccount {
  id: string;
  name: string;
  savings: number;
  loanBalance: number;
}

const FinancialApp: React.FC = () => {
  const [userAccount, setUserAccount] = useState<UserAccount>({
    id: 'user123',
    name: 'Jane Doe',
    savings: 1000, // Initial savings
    loanBalance: 0, // Initial loan balance
  });

  const [depositAmount, setDepositAmount] = useState<number | ''>('');
  const [loanRequestAmount, setLoanRequestAmount] = useState<number | ''>('');

  // --- Handlers for Savings ---
  const handleDepositChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    setDepositAmount(isNaN(value) ? '' : value);
  };

  const handleDepositSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (typeof depositAmount === 'number' && depositAmount > 0) {
      setUserAccount((prev) => ({
        ...prev,
        savings: prev.savings + depositAmount,
      }));
      setDepositAmount('');
      alert(`Successfully deposited $${depositAmount}. New savings: $${userAccount.savings + depositAmount}`);
    } else {
      alert('Please enter a valid deposit amount.');
    }
  };

  // --- Handlers for Loans ---
  const handleLoanRequestChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    setLoanRequestAmount(isNaN(value) ? '' : value);
  };

  const handleRequestLoan = (e: FormEvent) => {
    e.preventDefault();
    if (typeof loanRequestAmount === 'number' && loanRequestAmount > 0) {
      // In a real app, this would involve a loan approval process.
      // For simplicity, we'll "approve" it here and add to loan balance.
      setUserAccount((prev) => ({
        ...prev,
        loanBalance: prev.loanBalance + loanRequestAmount,
        savings: prev.savings + loanRequestAmount, // Assuming loan immediately adds to savings/available funds
      }));
      setLoanRequestAmount('');
      alert(`Loan request for $${loanRequestAmount} submitted and approved! Your new loan balance is $${userAccount.loanBalance + loanRequestAmount}.`);
    } else {
      alert('Please enter a valid loan request amount.');
    }
  };

  // --- Optional: Loan Repayment ---
  const handleRepayLoan = (amount: number) => {
    if (amount > 0 && amount <= userAccount.loanBalance) {
      setUserAccount((prev) => ({
        ...prev,
        loanBalance: prev.loanBalance - amount,
        savings: prev.savings - amount, // Assuming repayment comes from savings
      }));
      alert(`Successfully repaid $${amount}. Remaining loan balance: $${userAccount.loanBalance - amount}`);
    } else if (amount > userAccount.loanBalance) {
      alert('Repayment amount exceeds current loan balance.');
    } else {
      alert('Please enter a valid repayment amount.');
    }
  };


  return (
    <div style={{ fontFamily: 'Arial, sans-serif', maxWidth: '600px', margin: '20px auto', padding: '20px', border: '1px solid #ccc', borderRadius: '8px' }}>
      <h1>{userAccount.name}'s Financial Dashboard</h1>

      <h2>Account Summary</h2>
      <p>Current Savings: **${userAccount.savings.toFixed(2)}**</p>
      <p>Outstanding Loan: **${userAccount.loanBalance.toFixed(2)}**</p>

      {/* Savings Section */}
      <section style={{ marginBottom: '30px', padding: '15px', border: '1px solid #eee', borderRadius: '4px' }}>
        <h3>Deposit Savings</h3>
        <form onSubmit={handleDepositSubmit}>
          <label htmlFor="depositAmount">Amount:</label>
          <input
            type="number"
            id="depositAmount"
            value={depositAmount}
            onChange={handleDepositChange}
            min="0.01"
            step="0.01"
            required
            style={{ marginLeft: '10px', padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
          />
          <button type="submit" style={{ marginLeft: '10px', padding: '8px 15px', backgroundColor: '#4CAF50', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
            Deposit
          </button>
        </form>
      </section>

      {/* Loan Section */}
      <section style={{ marginBottom: '30px', padding: '15px', border: '1px solid #eee', borderRadius: '4px' }}>
        <h3>Request a Loan</h3>
        <form onSubmit={handleRequestLoan}>
          <label htmlFor="loanRequestAmount">Amount:</label>
          <input
            type="number"
            id="loanRequestAmount"
            value={loanRequestAmount}
            onChange={handleLoanRequestChange}
            min="0.01"
            step="0.01"
            required
            style={{ marginLeft: '10px', padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
          />
          <button type="submit" style={{ marginLeft: '10px', padding: '8px 15px', backgroundColor: '#008CBA', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
            Request Loan
          </button>
        </form>
      </section>

      {/* Loan Repayment Section (Optional) */}
      {userAccount.loanBalance > 0 && (
        <section style={{ padding: '15px', border: '1px solid #eee', borderRadius: '4px' }}>
          <h3>Repay Loan</h3>
          <button
            onClick={() => handleRepayLoan(userAccount.loanBalance)} // Repay full amount for simplicity
            style={{ padding: '8px 15px', backgroundColor: '#f44336', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
          >
            Repay Full Loan (${userAccount.loanBalance.toFixed(2)})
          </button>
        </section>
      )}
    </div>
  );
};

export default FinancialApp;
