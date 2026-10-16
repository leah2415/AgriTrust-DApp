// After deployment, paste the contract address below.
const CONTRACT_ADDRESS = "0x44458E5e3a7ab08Dc835ef55b32e7960847053b2";

const ABI = [
  "function admin() view returns (address)",
  "function requestCount() view returns (uint256)",
  "function createRequest(string,string,uint256,string)",
  "function updateStatus(uint256,uint8)",
  "function getRequest(uint256) view returns (uint256,address,string,string,uint256,string,uint8,uint256)"
];

let provider;
let signer;
let contract;
let connectedAddress = "";

const $ = (id) => document.getElementById(id);
const statusNames = ["Pending", "Approved", "Rejected"];

function message(text, type = "") {
  $("message").textContent = text;
  $("message").className = type;
}
function validContractAddress() {
  return CONTRACT_ADDRESS !== "PASTE_DEPLOYED_CONTRACT_ADDRESS_HERE"
    && ethers.isAddress(CONTRACT_ADDRESS);
}

async function connectWallet() {
  try {
    if (!window.ethereum) throw new Error("MetaMask is not installed. Install the MetaMask browser extension.");
    if (!validContractAddress()) throw new Error("Set CONTRACT_ADDRESS in frontend/app.js after deploying the contract.");
    await window.ethereum.request({ method: "eth_requestAccounts" });
    await window.ethereum.request({
     method: "wallet_switchEthereumChain",
     params: [{ chainId: "0xaa36a7" }]
    });
    provider = new ethers.BrowserProvider(window.ethereum);
    signer = await provider.getSigner();
    connectedAddress = await signer.getAddress();
    contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, signer);
    $("wallet").textContent = `Connected: ${connectedAddress}`;
    $("connectBtn").textContent = "Wallet connected";
    const admin = await contract.admin();
    $("adminInfo").textContent = connectedAddress.toLowerCase() === admin.toLowerCase()
      ? "Connected wallet is the contract admin."
      : `Connected wallet is not the admin. Admin: ${admin}`;
    message("Wallet connected successfully.", "success");
    await loadRecords();
  } catch (err) {
    message(err.shortMessage || err.reason || err.message || String(err), "error");
  }
}

async function submitRequest(event) {
  event.preventDefault();
  try {
    if (!contract) throw new Error("Connect MetaMask first.");
    const name = $("farmerName").value.trim();
    const scheme = $("schemeName").value.trim();
    const amountText = $("amount").value;
    const details = $("details").value.trim();
    if (!name || !scheme || !details) throw new Error("Please fill in every field.");
    if (!amountText || Number(amountText) <= 0) throw new Error("Amount must be greater than zero.");
    message("Please confirm the transaction in MetaMask…");
    const tx = await contract.createRequest(name, scheme, ethers.parseEther(amountText), details);
    message(`Transaction submitted: ${tx.hash}\nWaiting for confirmation…`);
    await tx.wait();
    $("requestForm").reset();
    message(`Request submitted successfully.\nTransaction: ${tx.hash}`, "success");
    await loadRecords();
  } catch (err) {
    message(err.shortMessage || err.reason || err.message || String(err), "error");
  }
}

async function changeStatus(id, status) {
  try {
    if (!contract) throw new Error("Connect MetaMask first.");
    message("Please confirm the admin transaction in MetaMask…");
    const tx = await contract.updateStatus(id, status);
    message(`Transaction submitted: ${tx.hash}\nWaiting for confirmation…`);
    await tx.wait();
    message(`Request #${id} updated successfully. Transaction: ${tx.hash}`, "success");
    await loadRecords();
  } catch (err) {
    message(err.shortMessage || err.reason || err.message || String(err), "error");
  }
}

async function loadRecords() {
  try {
    if (!contract) throw new Error("Connect MetaMask first.");
    const count = Number(await contract.requestCount());
    const admin = await contract.admin();
    const isAdmin = connectedAddress.toLowerCase() === admin.toLowerCase();
    const container = $("records");
    container.replaceChildren();
    if (count === 0) {
      container.innerHTML = '<p class="muted">No subsidy requests have been submitted yet.</p>';
      return;
    }
    for (let id = count; id >= 1; id--) {
      const r = await contract.getRequest(id);
      const status = Number(r[6]);
      const card = document.createElement("article");
      card.className = "record";
      const heading = document.createElement("h3");
      heading.textContent = `Request #${r[0]} — ${r[3]}`;
      const badge = document.createElement("span");
      badge.className = `status ${statusNames[status].toLowerCase()}`;
      badge.textContent = statusNames[status];
      const info = document.createElement("p");
      info.textContent = `Farmer: ${r[2]} | Amount: ${ethers.formatEther(r[4])} ETH`;
      const details = document.createElement("p");
      details.textContent = `Purpose: ${r[5]}`;
      const wallet = document.createElement("p");
      wallet.className = "muted";
      wallet.textContent = `Submitted by: ${r[1]}`;
      card.append(heading, badge, info, details, wallet);
      if (isAdmin && status === 0) {
        const actions = document.createElement("div");
        actions.className = "actions";
        const approve = document.createElement("button");
        approve.textContent = "Approve";
        approve.onclick = () => changeStatus(id, 1);
        const reject = document.createElement("button");
        reject.textContent = "Reject";
        reject.className = "secondary";
        reject.onclick = () => changeStatus(id, 2);
        actions.append(approve, reject);
        card.append(actions);
      }
      container.append(card);
    }
  } catch (err) {
    message(err.shortMessage || err.reason || err.message || String(err), "error");
  }
}

$("connectBtn").addEventListener("click", connectWallet);
$("requestForm").addEventListener("submit", submitRequest);
$("refreshBtn").addEventListener("click", loadRecords);
if (window.ethereum) {
  window.ethereum.on("accountsChanged", () => window.location.reload());
  window.ethereum.on("chainChanged", () => window.location.reload());
}
