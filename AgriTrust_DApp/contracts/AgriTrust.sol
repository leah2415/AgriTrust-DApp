// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract AgriTrust {
    address public admin;
    uint256 public requestCount;

    enum Status { Pending, Approved, Rejected }

    struct SubsidyRequest {
        uint256 id;
        address farmer;
        string farmerName;
        string schemeName;
        uint256 amount;
        string details;
        Status status;
        uint256 createdAt;
    }

    mapping(uint256 => SubsidyRequest) private requests;

    event RequestCreated(uint256 indexed id, address indexed farmer, string schemeName);
    event RequestStatusUpdated(uint256 indexed id, Status status, address indexed updatedBy);

    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin can perform this action");
        _;
    }

    constructor() {
        admin = msg.sender;
    }

    function createRequest(
        string calldata _farmerName,
        string calldata _schemeName,
        uint256 _amount,
        string calldata _details
    ) external {
        require(bytes(_farmerName).length > 0, "Farmer name is required");
        require(bytes(_schemeName).length > 0, "Scheme name is required");
        require(_amount > 0, "Amount must be greater than zero");
        require(bytes(_details).length > 0, "Details are required");

        requestCount++;
        requests[requestCount] = SubsidyRequest({
            id: requestCount,
            farmer: msg.sender,
            farmerName: _farmerName,
            schemeName: _schemeName,
            amount: _amount,
            details: _details,
            status: Status.Pending,
            createdAt: block.timestamp
        });

        emit RequestCreated(requestCount, msg.sender, _schemeName);
    }

    function updateStatus(uint256 _id, Status _status) external onlyAdmin {
        require(_id > 0 && _id <= requestCount, "Request does not exist");
        require(_status != Status.Pending, "Status must be Approved or Rejected");
        require(requests[_id].status == Status.Pending, "Request already processed");

        requests[_id].status = _status;
        emit RequestStatusUpdated(_id, _status, msg.sender);
    }

    function getRequest(uint256 _id) external view returns (
        uint256 id,
        address farmer,
        string memory farmerName,
        string memory schemeName,
        uint256 amount,
        string memory details,
        Status status,
        uint256 createdAt
    ) {
        require(_id > 0 && _id <= requestCount, "Request does not exist");
        SubsidyRequest storage r = requests[_id];
        return (r.id, r.farmer, r.farmerName, r.schemeName, r.amount, r.details, r.status, r.createdAt);
    }
}
