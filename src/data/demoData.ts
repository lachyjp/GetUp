import { Account, Transaction } from '../App';

export const demoAccounts: Account[] = [
  { id: 'acc_demo_1', name: 'Everyday', balance: 1250.75, type: 'TRANSACTIONAL', owner: 'INDIVIDUAL' },
  { id: 'acc_demo_2', name: 'Savings', balance: 4200.00, type: 'SAVER', owner: 'INDIVIDUAL' },
];

export const demoTransactions: Transaction[] = [
  {
    id: 'txn_demo_1',
    description: 'Coffee - Blue Bottle',
    amount: 5.50,
    type: '',
    status: 'SETTLED',
    date: '2025-10-08',
    time: '8:15am',
    text: 'BLUE BOTTLE COFFEE',
    message: 'Morning pick-me-up',
    roundup: 'false',
  },
  {
    id: 'txn_demo_2',
    description: 'Groceries - Whole Foods',
    amount: 86.40,
    type: '',
    status: 'SETTLED',
    date: '2025-10-08',
    time: '5:42pm',
    text: 'WHOLEFOODS MARKET',
    message: 'Weekly shop',
    roundup: 'true',
  },
  {
    id: 'txn_demo_3',
    description: 'Salary - Acme Corp',
    amount: 3200.00,
    type: '+',
    status: 'SETTLED',
    date: '2025-10-07',
    time: '9:00am',
    text: 'ACME CORP PAYROLL',
    message: 'Monthly salary',
    roundup: 'false',
  },
];


