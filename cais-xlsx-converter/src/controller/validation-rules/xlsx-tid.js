module.exports = {
  "customerID": "required|alpha_dash",
  "tidType": "required|string|in:EIN,FOREIGN,SSN/ITIN",
  "tidTypeValue": "required|string|max:40",
  "foreignTIDType": "string|max:40",
  "foreignTIDCountryCd": "string"
}