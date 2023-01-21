const getEINNumber = (ein) => {
  let formatedEIN = ein.replace(/\D/g, '');
  formatedEIN = formatedEIN.replace(/^(\d{2})/, '$1-');
  return formatedEIN
}

const stringToBoolean = (_string) => {
  // will match one and only one of the string 'true','1', or 'on' rerardless
  // of capitalization and regardless off surrounding white-space.
  //
  regex=/^\s*(true|TRUE|1|on|yes|YES)\s*$/i

  return regex.test(_string);
}

const getAccountType =  (rawAccounts) => {
  const accountType = rawAccounts.replace(/^\,+|\,+$/g, '');
  return accountType.split(',').filter(Boolean)
}

const caisObjects = {

  caisDataObject: () => {
    return {
      version: "2.0.0",
      catReporterCRD : 0,
      catSubmitterID : 0,
      fdidRecordList: [],
      fdidRecordCount: 0,
      legalEntityCustomerList: [],
      legalEntityCustomerRecordCount: 0,
      naturalPersonCustomerList: [],
      naturalPersonCustomerRecordCount: 0
    }
  },

  tidsDataObject: () => {
    return {
      version: "2.0.0",
      tidRecordCount: 0,
      tidRecordList: []
    }
  },

  tidRecord: (raw) => {
    const tidRecordObj = {}
    tidRecordObj.customerID = raw.customerID 
    tidRecordObj.customerRecordID = xls2cais.customerIdMap[raw.customerID]?.recordId
    tidRecordObj.tidType = raw.tidType ? raw.tidType : undefined
    tidRecordObj.foreignTIDType = raw.foreignTIDType ? raw.foreignTIDType : undefined
    tidRecordObj.foreignTIDCountryCd = raw.foreignTIDCountryCd ? raw.foreignTIDCountryCd : undefined
    return tidRecordObj
  },

  fdidRecord: (raw) => {
    const fdidRecordData = {}
    fdidRecordData.firmDesignatedID = raw.firmDesignatedID ? raw.firmDesignatedID : undefined
    fdidRecordData.fdidType = raw.fdidType ? raw.fdidType : undefined
    fdidRecordData.accountType = raw.accountType ? getAccountType(raw.accountType) : undefined
    fdidRecordData.accountName = raw.accountName ? raw.accountName : undefined
    fdidRecordData.DVPCustodianID = raw.DVPCustodianID ? [raw.DVPCustodianID] : []
    fdidRecordData.clearingBrokerID = raw.clearingBrokerID ? [raw.clearingBrokerID] : []
    fdidRecordData.branchOfficeCRD = raw.branchOfficeCRD ? raw.branchOfficeCRD : undefined
    fdidRecordData.fdidDate = raw.fdidDate ? +raw.fdidDate : undefined
    fdidRecordData.fdidEndDate = raw.fdidEndDate ? +raw.fdidEndDate : undefined
    fdidRecordData.fdidEndReason = raw.fdidEndReason ? raw.fdidEndReason : undefined
    fdidRecordData.replacedByFDID = raw.replacedByFDID ? raw.replacedByFDID : undefined
    fdidRecordData.priorCATReporterCRD = raw.priorCATReporterCRD ? raw.priorCATReporterCRD : undefined
    fdidRecordData.priorCATReporterFDID = raw.priorCATReporterFDID ? raw.priorCATReporterFDID : undefined
    fdidRecordData.addressList = []
    fdidRecordData.largeTraderList = []
    fdidRecordData.fdidCustomerList = []
    fdidRecordData.authTraderNamesList = []
    return fdidRecordData
  },

  npCustomerRecord: (raw) => {
    const npCustomerRecordObj = {}
    npCustomerRecordObj.customerID = raw.customerID 
    npCustomerRecordObj.customerRecordID = raw.customerRecordID ? raw.customerRecordID : undefined
    npCustomerRecordObj.firstName = raw.firstName ? raw.firstName : undefined
    npCustomerRecordObj.middleName = raw.middleName ? raw.middleName : undefined
    npCustomerRecordObj.lastName = raw.lastName ? raw.lastName : undefined
    npCustomerRecordObj.nameSuffix = raw.nameSuffix ? raw.nameSuffix : undefined
    npCustomerRecordObj.doingBusinessAs = raw.doingBusinessAs ? raw.doingBusinessAs : undefined
    npCustomerRecordObj.yearOfBirth = raw.yearOfBirth ? +raw.yearOfBirth : undefined
    npCustomerRecordObj.customerType = raw.customerType ? [raw.customerType] : undefined
    npCustomerRecordObj.addressList = []
    npCustomerRecordObj.updateNotification = raw.updateNotification ? raw.updateNotification : false
    return npCustomerRecordObj
  },

  leCustomerRecord: (raw) => {
    const leCustomerRecordObj = {}
    leCustomerRecordObj.customerID = raw.customerID 
    leCustomerRecordObj.legalName = raw.legalName ? raw.legalName : undefined
    leCustomerRecordObj.ein = raw.ein ? getEINNumber(raw.ein) : undefined
    leCustomerRecordObj.lei = raw.lei ? raw.lei : undefined
    leCustomerRecordObj.customerType = raw.customerType ? [raw.customerType] : undefined
    leCustomerRecordObj.updateNotification = raw.updateNotification ? stringToBoolean(raw.updateNotification) : false
    leCustomerRecordObj.addressList = []
    return leCustomerRecordObj
  },

  accountAddressRecord : (raw) => {
    const addressObject = {}
    addressObject.accountID = raw.accountID 
    addressObject.addrType = raw.addrType ? raw.addrType : undefined
    addressObject.addrLine1 = raw.addrLine1 ? raw.addrLine1 : undefined
    addressObject.addrLine2 = raw.addrLine2 ? raw.addrLine2 : undefined
    addressObject.addrLine3 = raw.addrLine3 ? raw.addrLine3 : undefined
    addressObject.addrLine4 = raw.addrLine4 ? raw.addrLine4 : undefined
    addressObject.city = raw.city ? raw.city : undefined
    addressObject.regionCode = raw.regionCode ? raw.regionCode : undefined
    addressObject.countryCode = raw.countryCode ? raw.countryCode : undefined
    addressObject.postalCode = raw.postalCode ? raw.postalCode : undefined
    return addressObject
  },

  customerAddressRecord : (raw) => {
    const addressObject = {}
    addressObject.customerID = raw.customerID 
    addressObject.addrType = raw.addrType ? raw.addrType : undefined
    addressObject.addrLine1 = raw.addrLine1 ? raw.addrLine1 : undefined
    addressObject.addrLine2 = raw.addrLine2 ? raw.addrLine2 : undefined
    addressObject.addrLine3 = raw.addrLine3 ? raw.addrLine3 : undefined
    addressObject.addrLine4 = raw.addrLine4 ? raw.addrLine4 : undefined
    addressObject.city = raw.city ? raw.city : undefined
    addressObject.regionCode = raw.regionCode ? raw.regionCode : undefined
    addressObject.countryCode = raw.countryCode ? raw.countryCode : undefined
    addressObject.postalCode = raw.postalCode ? raw.postalCode : undefined
    return addressObject
  },

  accountLargeTraderRecord: (raw) => {
    const accountLargeTraderObj = {}
    accountLargeTraderObj.accountID = raw.accountID 
    accountLargeTraderObj.largeTraderID = raw.largeTraderID ? raw.largeTraderID : undefined
    accountLargeTraderObj.ltidEffectiveDate = raw.ltidEffectiveDate ? +raw.ltidEffectiveDate : undefined
    accountLargeTraderObj.ltidEndDate = raw.ltidEndDate ? +raw.ltidEndDate : undefined
    accountLargeTraderObj.ltidEndReason = raw.ltidEndReason ? raw.ltidEndReason : undefined
    return accountLargeTraderObj
  },

  accountCustomerRoleRecord: (raw) => {
    const accountCustomerRoleObject = {}
    accountCustomerRoleObject.customerID = raw.customerID
    accountCustomerRoleObject.accountID = raw.accountID 
    accountCustomerRoleObject.customerRecordID = xls2cais.customerIdMap[raw.customerID]?.recordId
    accountCustomerRoleObject.role = raw.role ? raw.role : undefined
    accountCustomerRoleObject.hasDiscretion = raw.hasDiscretion ? raw.hasDiscretion : false
    accountCustomerRoleObject.roleStartDate = raw.roleStartDate ? +raw.roleStartDate : undefined
    accountCustomerRoleObject.roleEndDate = raw.roleEndDate ? +raw.roleEndDate : undefined
    accountCustomerRoleObject.roleEndReason = raw.roleEndReason ? +raw.roleEndReason : undefined
    return accountCustomerRoleObject
  },

  accountCustomerTraderRecord: (raw) => {
    const accountCustomerTraderObject = {}
    accountCustomerRoleObject.customerRecordID = xls2cais.customerIdMap[raw.customerID]?.recordId
    accountCustomerRoleObject.role = raw.role ? raw.role : undefined
    accountCustomerRoleObject.hasDiscretion = raw.hasDiscretion ? raw.hasDiscretion : false
    accountCustomerRoleObject.roleStartDate = raw.roleStartDate ? +raw.roleStartDate : undefined
    accountCustomerRoleObject.roleEndDate = raw.roleEndDate ? +raw.roleEndDate : undefined
    accountCustomerRoleObject.roleEndReason = raw.roleEndReason ? +raw.roleEndReason : undefined
    return accountCustomerTraderObject
  }

}

exports.create = (_object_nm, raw ) => {
  if( !caisObjects[_object_nm] ) {
    throw new Error( `CAIS object '${_object_nm}' does not exist` );
  } 
  else  {
    return caisObjects[_object_nm](raw);
  }


}