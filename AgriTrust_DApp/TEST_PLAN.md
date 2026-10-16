# AgriTrust Test Plan

Run these after deployment. Capture screenshots and replace the Actual Result column in README.md with what you observed.

1. **Valid request:** call `createRequest("Ravi Kumar", "Seed Support", 10000000000000000, "Seeds for next season")` in Remix (amount is in wei; this is 0.01 ETH). Expected: success, count increments, request is Pending.
2. **Empty farmer name:** call `createRequest("", "Seed Support", 10000000000000000, "Seeds")`. Expected revert: `Farmer name is required`.
3. **Empty scheme:** call `createRequest("Ravi", "", 10000000000000000, "Seeds")`. Expected revert: `Scheme name is required`.
4. **Zero amount:** call `createRequest("Ravi", "Seed Support", 0, "Seeds")`. Expected revert: `Amount must be greater than zero`.
5. **Empty details:** call `createRequest("Ravi", "Seed Support", 10000000000000000, "")`. Expected revert: `Details are required`.
6. **Admin approval:** from deployer account call `updateStatus(1, 1)`. Expected success if request #1 is Pending.
7. **Unauthorized approval:** switch Remix account to another Ganache account and call `updateStatus(1, 2)`. Expected revert: `Only admin can perform this action`.
8. **Nonexistent request:** call `getRequest(999)` when requestCount is less than 999. Expected revert: `Request does not exist`.
9. **Double processing:** attempt to update a request after it has been Approved/Rejected. Expected revert: `Request already processed`.

Note: In Remix, the uint256 amount argument is entered in wei, while the frontend accepts ETH and converts it to wei. Ganache is a local development chain; do not use real funds.
