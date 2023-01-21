
const Utils = require( './xls2cais-utils')
const ValidationRules = require('./validation-rules');

function parseAcctCustomerTradersRow( _row, _opts ) {

  let failed; 
  let customerRecord;
                                  // trim all the attributes from the sheet..
  Utils.trimAllAttibutes( _row );
                                  // if we are validating..
  if( _opts.validateSchema === true ) {
                                  // validate the row data
    failed = Utils.validateJSON( _row, ValidationRules.xlsxAccountCustomerTrader );
  
  }
        
  if( !failed ) {
                                  // create the fdidRecord from the row..
    customerRecord = Utils.row2record( 'acctCustomerTraderRecord', _row );
                                 
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
      let result;

      Utils.foreachRow( xls2cais.worksheets['ACCT-CUSTOMER-TRADERS'], async (_row, _row_number ) => {

        process.stdout.cursorTo(0);
        process.stdout.write(`Converting ACCT-CUSTOMER-TRADERS row: ${rows}`);

        rows++;
      
      });  
      
      process.stdout.cursorTo(0);
      process.stdout.clearLine(0);
      
      xls2cais.logger.info(`Parsed${_options.validateSchema===true ? '/validated' : ''} ${rows} ACCT-CUSTOMER-TRADERS rows with ${(parseErrors ? parseErrors : 'no' )} error(s) encountered`);
      
      _resolve();
   
    } catch(_err) {

      _reject(_err);

    }

  })


}
