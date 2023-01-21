
const Utils = require( './xls2cais-utils')
const ValidationRules = require('./validation-rules');

function parseAcctRow( _row, _opts ) {

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

module.exports = (_options) => {

  return new Promise( async (_resolve, _reject ) => {

    try {

      let rows = 0;
      let result;
      let parseErrors=0;


      Utils.foreachRow( xls2cais.worksheets['ACCT'], async (_row,_row_number ) => {

        process.stdout.cursorTo(0);
        process.stdout.write(`Converting ACCT row: ${rows}`);

        rows++;
      
        result = parseAcctRow(_row, {validateSchema: _options.validateSchema });

        if( result.errors ) {
                                                // add the errors for reporting to user..
          parseErrors+=Object.keys(result.errors).length;

          Utils.logSheetParsingError( { 
            ref: 'ACCT',
            row: _row_number,
            data: _row,
            errors: result.errors,
          });

        } else {
                                              // update the map..
          xls2cais.accountIdMap[_row.accountID] = { 
            recordId: result.data.fdidRecordID,
                                              // push and store the index of the fdidRecord
            index: xls2cais.caisObject.fdidRecordList.push( result.data )-1,   
            refCount : 0,
          };

          xls2cais.caisObject.fdidRecordCount++;

          await Utils.logAccountIDMap( _row.accountID, result.data.fdidRecordID );

        }

      });  

      process.stdout.cursorTo(0);
      process.stdout.clearLine(0);
      
      if( parseErrors ) xls2cais.logger.error(`Parsed${_options.validateSchema===true ? '/validated' : ''} ${rows} ACCT rows with ${(parseErrors ? parseErrors : 'no' )} error(s) encountered`);
      else xls2cais.logger.info(`Parsed${_options.validateSchema===true ? '/validated' : ''} ${rows} ACCT rows with ${(parseErrors ? parseErrors : 'no' )} error(s) encountered`);

      _resolve();
   
    } catch(_err) {

      _reject(_err);

    }

  })


}