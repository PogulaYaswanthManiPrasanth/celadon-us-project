// ACCT Tab Rules

module.exports  = {
  "accountID": "required|alpha_dash",
  "firmDesignatedID": "required|string|max:40",
  "fdidType": "required|string|in:ACCOUNT,RELATIONSHIP,ENTITYID",
  "accountType": "required|string",  // in:AVERAGE,DVP/RVP,EDUCATION,ENTITYID,ERROR,FIRM,INSTITUTION,MARKET,MARGIN,OPTION,OTHER,RELATIONSHIP,RETIREMENT,UGMA/UTMA
  "accountName": "required|string|max:200",
  "fdidDate": "required|string",
  "DVPCustodianID": "string|max:5",
  "clearingBrokerID": "string|max:4",
  "branchOfficeCRD": "string|max:40",
  "registeredRepCRD": "string",
  "fdidEndDate": "string",
  "fdidEndReason": "string|in:CORRECTION,ENDED,INACTIVE,REPLACED,OTHER,TRANSFER",
  "replacedByFDID": "string",
  "priorCATReporterCRD": "string",
  "priorCATReporterFDID": "string",
}
