
const Utils = require( './xls2cais-utils')
const ValidationRules = require('./validation-rules');

function parseLeCustomerRow( _row, _opts ) {

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


module.exports = (_options) => {

  return new Promise( async (_resolve, _reject ) => {

    try {

      let parseErrors = 0;
      let rows = 0;
      let customerId;
      let parsed_row;

      Utils.foreachRow( xls2cais.worksheets['LE-CUSTOMER'], async (_row, _row_number ) => {

        process.stdout.cursorTo(0);
        process.stdout.write(`Converting LE-CUSTOMER row: ${rows}`);

        rows++;

        parsed_row = parseLeCustomerRow(_row, {validateSchema: _options.validateSchema });

        if( parsed_row.errors ) {
                                                // add the errors for reporting to user..
          parseErrors+=Object.keys(parsed_row.errors).length;
          
          Utils.logSheetParsingError( { 
            ref: 'LE-CUSTOMER',
            row: _row_number,
            data: _row,
            errors: parsed_row.errors,
          });

        } else {
                                        // store the customerID..                                        
          customerId = parsed_row.data.customerID;
                                        // delete the customerID attribute form the parsed_row..
          delete parsed_row.data.customerID;
                                        // update the customerId map..
           xls2cais.customerIdMap[customerId] = { 
            recordId: parsed_row.data.customerRecordID, 
                                        // push and store the index of the fdidRecord
            index:  xls2cais.caisObject.legalEntityCustomerList.push( parsed_row.data ) - 1,
            type: 'LE',
            refCount : 0,
          };
          
          xls2cais.caisObject.legalEntityCustomerRecordCount++;

          await Utils.logCustomerIDMap( customerId, parsed_row.data.customerRecordID, 'LE-CUSTOMER' );

        }     
      
      });  
      
      process.stdout.cursorTo(0);
      process.stdout.clearLine(0);
      
      xls2cais.logger.info(`Parsed${_options.validateSchema===true ? '/validated' : ''} ${rows} LE-CUSTOMER rows with ${(parseErrors ? parseErrors : 'no' )} error(s) encountered`);
      
      _resolve();
   
    } catch(_err) {

      _reject(_err);

    }

  })


}