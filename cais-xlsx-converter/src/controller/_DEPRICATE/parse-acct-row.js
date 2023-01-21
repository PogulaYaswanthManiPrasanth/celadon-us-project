
const Utils = require('../xls2cais-utils');
const ValidationRules = require('../validation-rules');

module.exports = ( _row, _opts ) => {

 // return new Promise( (_resolve, _reject) => {

  let failed; 
  let fdidRecord;
                                // trim all the attributes from the sheet..
  Utils.trimAllAttibutes( _row );

  if( _opts.validateSchema === true ) {
                                  // validate the row data
    failed = Utils.validateJSON( _row, ValidationRules.xlsxAcct );

  }
        
  if( !failed ) {
                                    // create the fdidRecord from the row..
    fdidRecord = Utils.row2record( 'fdidRecord', _row );

    fdidRecord.addressList = [];
    fdidRecord.largeTraderList = [];
    fdidRecord.fdidCustomerList = [];
    fdidRecord.authTraderNamesList = [];
                                    // set the record id
    fdidRecord.fdidRecordID = Utils.getNextFdidRecordId();
  }

  return { 
    data: fdidRecord, 
    errors: ( failed ? failed.errors : undefined )
  }

}