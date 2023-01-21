
const Utils = require( './xls2cais-utils')
const ValidationRules = require('./validation-rules');

function parseNpCustomerRow( _row, _opts ) {

  let failed; 
  let customerRecord;
                                  // trim all the attributes from the sheet..
  Utils.trimAllAttibutes( _row );
                                  // if we are validating..
  if( _opts.validateSchema === true ) {
                                  // validate the row data
    errors = Utils.validateJSON( _row, ValidationRules.xlsxNPCustomer );
  
  }
        
  if( !failed ) {
                                  // create the fdidRecord from the row..
    customerRecord = Utils.row2record( 'npCustomerRecord', _row );

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

      Utils.foreachRow( xls2cais.worksheets['NP-CUSTOMER'], async (_row, _row_number ) => {

        process.stdout.cursorTo(0);
        process.stdout.write(`Converting Excel row: ${rows}`);
      
        rows++;

        parsed_row = parseNpCustomerRow(_row, {validateSchema: _options.validateSchema });

        if( parsed_row.errors ) {
                                        // add the errors for reporting to user..
          parseErrors+=Object.keys(parsed_row.errors).length;
          
          Utils.logSheetParsingError( { 
            ref: 'NP-CUSTOMER',
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
            index:  xls2cais.caisObject.naturalPersonCustomerList.push( parsed_row.data ) - 1, 
            type: 'NP',
            refCount : 0,

          };

          xls2cais.caisObject.naturalPersonCustomerRecordCount++;

          await Utils.logCustomerIDMap( customerId, parsed_row.data.customerRecordID, 'NP-CUSTOMER' );

        }     
        
      });  
      
      process.stdout.cursorTo(0);
      process.stdout.clearLine(0);
      
      xls2cais.logger.info(`Parsed${_options.validateSchema===true ? '/validated' : ''} ${rows} NP-CUSTOMER rows with ${(parseErrors ? parseErrors : 'no' )} error(s) encountered`);

      _resolve();
   
    } catch(_err) {

      _reject(_err);

    }

  })


}