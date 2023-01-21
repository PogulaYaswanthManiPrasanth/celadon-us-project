const Utils = require('./xls2cais-utils');
const ValidationRules = require('./validation-rules');



module.exports = ( _row, _opts ) => {

  let failed; 
  let customerRecord;
                                  // trim all the attributes from the sheet..
  Utils.trimAllAttibutes( _row );
                                  // if we are validating..
  if( _opts.validateSchema === true ) {
                                  // validate the row data
    failed = Utils.validateJSON( _row, ValidationRules.xlsxLECustomer );
  
  }
        
  if( !failed ) {
                                  // create the fdidRecord from the row..
    customerRecord = Utils.row2record( 'leCustomerRecord', _row );

    customerRecord.customerRecordID = Utils.getNextCustomerRecordId();

  }

  return { 
    data: customerRecord, 
    errors: ( failed ? failed.errors : undefined )
  }

};
