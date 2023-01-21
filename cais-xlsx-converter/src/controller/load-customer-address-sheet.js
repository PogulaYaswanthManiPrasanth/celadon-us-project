
const Utils = require( './xls2cais-utils')
const ValidationRules = require('./validation-rules');

function parseAddressRow( _row, _opts ) {

  let failed; 
  let record;
                                // trim all the attributes from the sheet..
  Utils.trimAllAttibutes( _row );

  if( _opts.validateSchema === true ) {
                                  // validate the row data
    failed = Utils.validateJSON( _row, ValidationRules.xlsxCustomerAddress );

  }
        
  if( !failed ) {
                                    // create the fdidRecord from the row..
    record = Utils.row2record( 'customerAddressRecord', _row );

  }

  return { 
    data: record, 
    errors: ( failed ? failed.errors : undefined )
  }

}


module.exports = (_options) => {

  return new Promise( async (_resolve, _reject ) => {

    try {

      let parseErrors = 0;
      let rows = 0;
      let parsed_row;
      let customer_map_record;
      let customer_record;

      Utils.foreachRow( xls2cais.worksheets['CUSTOMER-ADDRESS'], async (_row, _row_number ) => {

        process.stdout.cursorTo(0);
        process.stdout.write(`Converting CUSTOMER-ADDRESS row: ${rows}`);

        rows++;
      

        parsed_row = parseAddressRow(_row, {validateSchema: _options.validateSchema });
      
        if( parsed_row.errors ) {
                                                // add the errors for reporting to user..
          parseErrors+=Object.keys(parsed_row.errors).length;

          Utils.logSheetParsingError( { 
            ref: 'CUSTOMER-ADDRESS',
            row: _row_number,
            data: _row,
            errors: parsed_row.errors,
          });

        } else {
                                        // get the account record from the map..
          customer_map_record = Utils.getCustomerRecordByCustomerID( parsed_row.data.customerID );

           if( !customer_map_record ) { 
                                                // increiment errors..
            parseErrors++;
                                                // log the error..
            Utils.logSheetParsingError( { 
              ref: 'CUSTOMER-ADDRESS',
              row: _row_number,
              data: _row,
              errors: { customerID : `The CUSTOMER-ADDRESS record specifies an customerID[${parsed_row.data.customerID}] that is not defined` },
            });
  
          } else {

                                        // get the fdidRecord by the index
            customer_record = ( customer_map_record.type === 'LE'  
                                ? xls2cais.caisObject.legalEntityCustomerList[ customer_map_record.index ] 
                                : xls2cais.caisObject.naturalPersonCustomerList[ customer_map_record.index ] );
                                        // delete the accountID (not in CAIS spec..)
            delete parsed_row.data.customerID;
                                        // push onto list..
            customer_record.addressList.push( parsed_row.data );

          }

        }

      });  
      
      process.stdout.cursorTo(0);
      process.stdout.clearLine(0);
      
      if( parseErrors) xls2cais.logger.error(`Parsed${_options.validateSchema===true ? '/validated' : ''} ${rows} CUSTOMER-ADDRESSS rows with ${(parseErrors ? parseErrors : 'no' )} error(s) encountered`);
      else xls2cais.logger.info(`Parsed${_options.validateSchema===true ? '/validated' : ''} ${rows} CUSTOMER-ADDRESSS rows with ${(parseErrors ? parseErrors : 'no' )} error(s) encountered`);
      
      _resolve();
   
    } catch(_err) {

      _reject(_err);

    }

  })


}
