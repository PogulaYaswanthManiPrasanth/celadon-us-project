// ACCT Tab Rules

module.exports  = {
  "accountID": "required|alpha_dash",
  "customerID": "required|string",
  "role": "required|in:AUTH3RD,AUTHREP,NTHOLDER,TRDHOLDER",
  "hasDiscretion": "boolean",
  "roleStartDate": "required|string|max:8",
  "roleEndDate": "string|max:8",
  "roleEndReason": "string",
}