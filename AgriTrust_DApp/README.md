# AgriTrust: Blockchain Agricultural Subsidy Tracker

**Course:** Blockchain Technology (CSE4444), Assignment 2
**Author:** Leah Elsa Philip (230905079)

## 1. Problem addressed
Agricultural subsidy requests are often hard to track transparently. Farmers cannot easily see whether a request was received or processed, and records can be altered. AgriTrust stores each subsidy request and its approval or rejection on the Ethereum blockchain, so the history is public and tamper-resistant.

**Roles**
- **Farmer (any wallet):** submits a subsidy request (starts as *Pending*).
- **Admin (the wallet that deployed the contract):** approves or rejects Pending requests.
- **Anyone:** can read all requests from the blockchain through the UI.

## 2. Technology
- Solidity 0.8.20 smart contract (`contracts/AgriTrust.sol`)
- HTML, CSS, JavaScript frontend (`frontend/`)
- Ethers.js v6 for MetaMask integration
- Remix IDE for compile, deploy and testing
- Sepolia test network

## 3. Project structure
```
AgriTrust/
├── contracts/AgriTrust.sol
├── frontend/ (index.html, style.css, app.js)
├── screenshots/
├── README.md
├── TEST_PLAN.md
└── .gitignore
```

## 4. Deployment details
| Item | Value |
|------|-------|
| Network | Sepolia (chain ID 11155111) |
| Contract address | `0x44458E5e3a7ab08Dc835ef55b32e7960847053b2` |
| Deployer / admin | `0x00B389bFDbdb6EE2482eA2b4CA82955F55114802` |
| Deployment tx hash | `0x914411c38fa81d4781f0682b6aba853c988d9b446f9f45820243e2b7ee94e178` |

Etherscan link: `https://sepolia.etherscan.io/address/0x44458E5e3a7ab08Dc835ef55b32e7960847053b2`

## 5. How to run the application
1. Install the MetaMask browser extension and enable **Show test networks**. Select **Sepolia**.
2. Get free Sepolia test ETH from a faucet.
3. Open https://remix.ethereum.org and create `AgriTrust.sol`. Paste the contract source.
4. In **Solidity Compiler**, choose version 0.8.20 or newer and click **Compile**.
5. In **Deploy & Run Transactions**, set Environment to **Browser Extension / Injected Provider - MetaMask**. Confirm the network shows Sepolia (11155111).
6. Select the `AgriTrust` contract and click **Deploy**. Confirm in MetaMask. The deploying account becomes the admin.
7. Copy the deployed contract address and paste it into `CONTRACT_ADDRESS` (line 2) of `frontend/app.js`.
8. Serve the `frontend` folder (for example VS Code **Live Server**) and open `index.html`.

## 6. Connecting MetaMask and using the DApp
1. Click **Connect MetaMask** and approve. The page asks MetaMask to switch to Sepolia.
2. The page shows whether the connected wallet is the contract admin.
3. Fill the form (farmer name, scheme, amount in ETH, details) and click **Submit request**. Confirm in MetaMask.
4. The request appears under **Blockchain records** as *Pending*.
5. As admin, click **Approve** or **Reject** and confirm in MetaMask. The status updates on-chain.
6. Refresh the page to confirm the data is read back from the blockchain.

## 7. Smart contract summary
- **State:** `admin`, `requestCount`, `requests` mapping, `SubsidyRequest` struct, `Status` enum (Pending, Approved, Rejected)
- **Constructor:** sets `admin = msg.sender`
- **Functions:** `createRequest`, `updateStatus` (admin only), `getRequest`
- **Validation:** non-empty name, scheme and details; amount greater than zero; valid request ID; only admin may update; a request can only be processed once
- **Events:** `RequestCreated`, `RequestStatusUpdated`

## 8. Test cases and observed results
Tests were run in Remix and through the UI on Sepolia. Replace each cell with what you actually observed.

| ID | Type | Test | Expected | Observed result |
|----|------|------|----------|-----------------|
| T1 | Valid | Submit request with all fields, amount > 0 | Success, status Pending | Success, status Pending | 
| T2 | Valid | Admin approves a Pending request | Success, status Approved | Success, status Approved | 
| T3 | Invalid | Empty farmer name | Revert: Farmer name is required | Revert: Farmer name is required | 
| T4 | Invalid | Empty scheme name | Revert: Scheme name is required | Revert: Scheme name is required | 
| T5 | Invalid | Amount = 0 | Revert: Amount must be greater than zero | Revert: Amount must be greater than zero | 
| T6 | Invalid | Empty details | Revert: Details are required | Revert: Details are required  | 
| T7 | Unauthorized | Non-admin calls `updateStatus` | Revert: Only admin can perform this action | Revert: Only admin can perform this action |
| T8 | Invalid | `updateStatus` / `getRequest` with an ID that does not exist | Revert: Request does not exist | Revert: Request does not exist | 
| T9 | Invalid | Update an already processed request | Revert: Request already processed | Not tested | n/a |

## 9. Screenshots
| Requirement | File |
|-------------|------|
| Smart contract compilation | `screenshots/1_compile.png` |
| Smart contract deployment | `screenshots/2_deploy.png` |
| MetaMask wallet connection | `screenshots/3_walletconnected.png` |
| Successful transaction | `![Compilation](screenshots/4_request.png)` |
| Failed transaction 1| `screenshots/5_farmernameerror.png` |
| Failed transaction 2| `screenshots/6_requestexisterror.png` |
| Failed transaction 3| `screenshots/7_onlyadminerror.png` |
| Failed transaction 4| `screenshots/8_schemenameerror.png` |
| Failed transaction 5| `screenshots/5_amounterror.png` |

Embed them like this: `![Compilation](screenshots/01_compile.png)`

## 10. Security note
No private keys, seed phrases or passwords are stored in this repository. Only test accounts on Sepolia were used.
