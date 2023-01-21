// ACCT Tab Rules

module.exports  = {
  "accountID": "required|alpha_dash",
  "largeTraderID": "required|string|max:13",
  "ltidEffectiveDate": "required|string|max:8",
  "ltidEndDate": "string|max:8",
  "ltidEndReason": "string",
}
