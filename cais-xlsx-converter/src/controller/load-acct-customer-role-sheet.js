
const Utils = require( './xls2cais-utils')
const ValidationRules = require('./validation-rules');

function parseAcctCustomerRoleRow( _row, _opts ) {

  let failed; 
  let customerRecord;
                                  // trim all the attributes from the sheet..
  Utils.trimAllAttibutes( _row );
                                  // if we are validating..
  if( _opts.validateSchema === true ) {
                                  // validate the row data
    errors = Utils.validateJSON( _row, ValidationRules.xlsxAccountCustomerRole );
  
  }
        
  if( !failed ) {
                                  // create the fdidRecord from the row..
    customerRecord = Utils.row2record( 'accountCustomerRoleRecord', _row );
                                 
  }

  return { 
    data: customerRecord, 
    errors: ( failed ? failed.errors : undefined )
  }

};

module.exports = (_options) => {

  return new Promise( async (_resolve, _reject ) => {

    try {

      let parseErrors = 0;
      let rows = 0;
      let parsed_row;
      let customer_record;
      let account_rec;
      
      Utils.foreachRow( xls2cais.worksheets['ACCT-CUSTOMER-ROLE'], async (_row, _row_number ) => {

        process.stdout.cursorTo(0);
        process.stdout.write(`Converting ACCT-CUSTOMER-ROLE row: ${rows}`);

        rows++;

        parsed_row = parseAcctCustomerRoleRow(_row, {validateSchema: _options.validateSchema });
      
        if( parsed_row.errors ) {
                                        // add the errors for reporting to user..
          parseErrors+=Object.keys(parsed_row.errors).length;

          Utils.logSheetParsingError( { 
            ref: 'ACCT-CUSTOMER-ROLE',
            row: _row_number,
            data: _row,
            errors: parsed_row.errors,
          });

        } else {
                                        // get the account record from the map..
          account_rec = Utils.getFDIDRecordByAccountID( parsed_row.data.accountID, false );
                                        // get the account record from the map..
          customer_record = Utils.getCustomerRecordByCustomerID( parsed_row.data.customerID );

          if( !account_rec ) { 
                                                // increiment errors..
            parseErrors++;
                                                // log the error..
            Utils.logSheetParsingError( { 
              ref: 'ACCT-CUSTOMER-ROLE',
              row: _row_number,
              data: _row,
              errors: { accountID : `The ACCT-CUSTOMER-ROLE record specifies an accountID[${parsed_row.data.accountID}] that is not defined` },
            });
  
          } else if( !customer_record ) { 
                                                // increiment errors..
            parseErrors++;
                                                // log the error..
            Utils.logSheetParsingError( { 
              ref: 'ACCT-CUSTOMER-ROLE',
              row: _row_number,
              data: _row,
              errors: { customerID : `The ACCT-CUSTOMER-ROLE record specifies an customerID[${parsed_row.data.customerID}] that is not defined` },
            });
  
          } else {
                                        // get the fdidRecord by the index
            fdid_record = xls2cais.caisObject.fdidRecordList[ account_rec.index ] 
                                        // delete the accountID (not in CAIS data spec..)
            delete parsed_row.data.accountID;
                                        // delete the accountID (not in CAIS data spec..)
            delete parsed_row.data.customerID;
                                        // add the customer role record to the fdidCustomerList..
            fdid_record.fdidCustomerList.push( parsed_row.data );

          }
        }

      });  
     

      process.stdout.cursorTo(0);
      process.stdout.clearLine(0);
      
      if( parseErrors) xls2cais.logger.error(`Parsed${_options.validateSchema===true ? '/validated' : ''} ${rows} ACCT-CUSTOMER-ROLE rows with ${(parseErrors ? parseErrors : 'no' )} error(s) encountered`);
      else xls2cais.logger.info(`Parsed${_options.validateSchema===true ? '/validated' : ''} ${rows} ACCT-CUSTOMER-ROLE rows with ${(parseErrors ? parseErrors : 'no' )} error(s) encountered`);
      
      _resolve();
   
    } catch(_err) {

      _reject(_err);

    }

  })


}
