
const Utils = require( './xls2cais-utils')
const ValidationRules = require('./validation-rules');

function parseTidRow( _row, _opts ) {

   let failed; 
   let record;
                                 // trim all the attributes from the sheet..
   Utils.trimAllAttibutes( _row );
 
   if( _opts.validateSchema === true ) {
                                   // validate the row data
     failed = Utils.validateJSON( _row, ValidationRules.xlsxTID );
 
   }
         
   if( !failed ) {
                                     // create the fdidRecord from the row..
     record = Utils.row2record( 'tidRecord', _row );

     record.tidValue = Utils.encyptedTID(_row);
     
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

      Utils.foreachRow( xls2cais.worksheets['TID'], async (_row, _row_number ) => {

        process.stdout.cursorTo(0);
        process.stdout.write(`Converting TID row: ${rows}`);

        rows++;
      
        parsed_row = parseTidRow(_row, {validateSchema: _options.validateSchema });
      
        if( parsed_row.errors ) {
                                                // add the errors for reporting to user..
          parseErrors+=Object.keys(parsed_row.errors).length;

          Utils.logSheetParsingError( { 
            ref: 'TID',
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
              ref: 'TID',
              row: _row_number,
              data: _row,
              errors: { customerID : `The TID record specifies an customerID[${parsed_row.data.customerID}] that is not defined` },
            });
  
          } else {
                                                // delete the customerID (not in CAIS spec..)
            delete parsed_row.data.customerID;
                                                // push the customerRecord into the tidRecordList;
            xls2cais.tidsObject.tidRecordList.push( parsed_row.data );
                                                // push the customerRecord into the cais np customers list;
            xls2cais.tidsObject.tidRecordCount++;
            
          }

        }

      });  
      
      process.stdout.cursorTo(0);
      process.stdout.clearLine(0);
      
      if( parseErrors) xls2cais.logger.error(`Parsed${_options.validateSchema===true ? '/validated' : ''} ${rows} TID rows with ${(parseErrors ? parseErrors : 'no' )} error(s) encountered`);
      else xls2cais.logger.info(`Parsed${_options.validateSchema===true ? '/validated' : ''} ${rows} TID rows with ${(parseErrors ? parseErrors : 'no' )} error(s) encountered`);
      
      _resolve();
   
    } catch(_err) {

      _reject(_err);

    }

  })


}
