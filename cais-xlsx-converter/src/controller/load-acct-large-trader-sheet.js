
const Utils = require( './xls2cais-utils')
const ValidationRules = require('./validation-rules');

function parseAcctLargeTraderRow( _row, _opts ) {

   let failed; 
   let record;
                                 // trim all the attributes from the sheet..
   Utils.trimAllAttibutes( _row );
 
   if( _opts.validateSchema === true ) {
                                   // validate the row data
     failed = Utils.validateJSON( _row, ValidationRules.xlsxAccountLargeTrader );
 
   }
         
   if( !failed ) {
                                     // create the fdidRecord from the row..
     record = Utils.row2record( 'accountLargeTraderRecord', _row );

   }
 
   return { 
     data: record, 
     errors: ( failed ? failed.errors : undefined )
   }
 
 }


module.exports = (_options) => {

  return new Promise( async (_resolve, _reject ) => {

    try {

      let rows = 0;
      let parsed_row;
      let parseErrors=0;
      let account_rec;
      let fdid_record;

      Utils.foreachRow( xls2cais.worksheets['ACCT-LARGE-TRADER'], async (_row, _row_number ) => {

        process.stdout.cursorTo(0);
        process.stdout.write(`Converting ACCT-LARGE-TRADER row: ${rows}`);

        rows++;
                                        // parse the row
        parsed_row = parseAcctLargeTraderRow(_row, {validateSchema: _options.validateSchema });
      
         if( parsed_row.errors ) {
                                                // add the errors for reporting to user..
          parseErrors+=Object.keys(parsed_row.errors).length;

          Utils.logSheetParsingError( { 
            ref: 'ACCT-LARGE-TRADER',
            row: _row_number,
            data: _row,
            errors: parsed_row.errors,
          });

        } else {
                                                // get the account record from the map..
          account_rec = Utils.getAccountRecordByAccountID( parsed_row.data.accountID, false );
                                                // if we didn't find one..
          if( !account_rec ) { 
                                                // increiment errors..
            parseErrors++;
                                                // log the error..
            Utils.logSheetParsingError( { 
              ref: 'ACCT-LARGE-TRADER',
              row: _row_number,
              data: _row,
              errors: { accountID : `The ACCT-LARGE-TRADER record specifies an accountID[${parsed_row.data.accountID}] that is not defined` },
            });
  
          } else {
                                                // get the fdidRecord by the index..
            fdid_record = xls2cais.caisObject.fdidRecordList[ account_rec.index ] 
                                                // delete the accountId from the parsed row..
            delete parsed_row.data.accountID;
                                               // if we don't have an array, create one
            if( !fdid_record.largeTraderList ) fdid_record.largeTraderList = [];
                                               // push parsed row onto the largeTraderList..
            fdid_record.largeTraderList.push( parsed_row.data );
                                   
          }

        }
      });  
      
      process.stdout.cursorTo(0);
      process.stdout.clearLine(0);
      
      xls2cais.logger.info(`Parsed${_options.validateSchema===true ? '/validated' : ''} ${rows} ACCT-LARGE-TRADER rows with ${(parseErrors ? parseErrors : 'no' )} error(s) encountered`);
      
      _resolve();
   
    } catch(_err) {

      _reject(_err);

    }

  })


}
