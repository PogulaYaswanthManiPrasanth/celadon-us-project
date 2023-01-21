// ACCT Tab Rules

module.exports  = {
  "customerID": "required|alpha_dash",
  "firstName": "required|string|max:40",
  "middleName": "string|max:20",
  "lastName": "required|string|max:200",
  "nameSuffix": "string|in:SENIOR,JUNIOR,THIRD,FOURTH,FIFTH",
  "doingBusinessAs": "string:max:200",
  "yearOfBirth": "required|integer|digits:4",
  "customerType": "required|in:ACCREDITED,ADVISER,CP,EMPLOYEE,FOREIGN,NOTAPPLICABLE,OTHBKR,TRUST",
  "updateNotification": "boolean",
}
