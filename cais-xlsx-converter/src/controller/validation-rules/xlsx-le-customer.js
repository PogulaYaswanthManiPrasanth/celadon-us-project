// ACCT Tab Rules

module.exports  = {
  "customerID": "required|alpha_dash",
  "legalName": "required|string|max:200",
  "ein": "string|max:10",
  "customerType": "required|in:ACCREDITED,ADVISER,BD,FOREIGN,NOTAPPLICABLE,RIC,TRUST,EMPLOYEE",
  "lei": "string|max:20",
  "updateNotification": "boolean"
}


