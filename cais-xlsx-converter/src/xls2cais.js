const fs = require('fs');
const path = require('path');
const ExcelJs = require('exceljs');
const compressjs = require('compressjs');
const mkdirp = require('mkdirp');

const Schemas = require( './controller/schemas');
const Utils = require('./controller/xls2cais-utils');

const LoadAcctSheet = require('./controller/load-acct-sheet');
const LoadLeCustomerSheet = require('./controller/load-le-customer-sheet');
const LoadNpCustomerSheet = require('./controller/load-np-customer-sheet');
const LoadAcctAddressSheet = require('./controller/load-acct-address-sheet');
const LoadAcctLargeTraderSheet = require('./controller/load-acct-large-trader-sheet');
const LoadAcctCustomerRoleSheet = require('./controller/load-acct-customer-role-sheet');
const LoadAcctCustomerTradersSheet = require('./controller/load-acct-customer-traders-sheet');
const LoadCustomerAddressSheet = require('./controller/load-customer-address-sheet');
const LoadTidSheet = require('./controller/load-tid-sheet');

const Today = {
  day : ('0' + new Date().getDate()).slice(-2),
  month : ("0" + (new Date().getMonth() + 1)).slice(-2),
  year : new Date().getFullYear()
}

module.exports = async function( _sourceFile, _options ) {

  return new Promise( async(_resolve, _reject) => {

    try {

      xls2cais.caisObject = Schemas.create('caisDataObject');
                                          // for TID File
      xls2cais.tidsObject = Schemas.create('tidsDataObject');
                                          // create the serial number or <default>
      xls2cais.serialNumber = _options.serial || 1;

      outpath =  _options.output || './generated-files';

      xls2cais.outputPath = 
        ( !path.isAbsolute(outpath) ? path.join(process.cwd(), outpath ) :  outpath );

      if( !fs.existsSync( xls2cais.outputPath ) ) {
        mkdirp.sync(xls2cais.outputPath);
      }

      xls2cais.caisObject.catReporterCRD = _options.reporter ? Number(_options.reporter) : '';
      xls2cais.caisObject.catSubmitterID = _options.submitter ? Number(_options.submitter) : '';
      xls2cais.caisFileBaseName = `${xls2cais.caisObject.catSubmitterID}_${xls2cais.caisObject.catReporterCRD}_${Today.year}${Today.month}${Today.day}_CAIS_${Utils.lpadZeros(xls2cais.serialNumber,6)}`;
      xls2cais.tidsFileBaseName = `${xls2cais.caisObject.catSubmitterID}_${xls2cais.caisObject.catReporterCRD}_${Today.year}${Today.month}${Today.day}_TIDS_${Utils.lpadZeros(xls2cais.serialNumber,6)}`;
      xls2cais.xls2caisFileBaseName = `${xls2cais.caisObject.catSubmitterID}_${xls2cais.caisObject.catReporterCRD}_${Today.year}${Today.month}${Today.day}_CAIS_${Utils.lpadZeros(xls2cais.serialNumber,6)}`;
      xls2cais.xls2caisErrorFileName = `${xls2cais.caisFileBaseName}.ERRORS.log`;
      xls2cais.accountIDMapFileName = `${xls2cais.caisFileBaseName}.ACCOUNT-ID.map`;
      xls2cais.customerIDMapFileName = `${xls2cais.caisFileBaseName}.CUSTOMER-ID.map`;

      xls2cais.xls2caisMapsFileName = `${xls2cais.caisFileBaseName}.MAPS.json`;
                                          // forceably remove the error log..
      if( fs.existsSync(path.join( xls2cais.outputPath,xls2cais.xls2caisErrorFileName)))
        fs.truncateSync(path.join( xls2cais.outputPath,xls2cais.xls2caisErrorFileName));

                                          // forceably remove the map..
      if( fs.existsSync(path.join( xls2cais.outputPath,xls2cais.accountIDMapFileName)))
        fs.truncateSync(path.join( xls2cais.outputPath,xls2cais.accountIDMapFileName));

        xls2cais.logger.info( `Creating files for ${path.basename(_sourceFile)} file..` );  
      
                                         // create a workbook
      const workbook = new ExcelJs.Workbook();
      
      xls2cais.logger.info( `Reading ${path.basename(_sourceFile)} file..` );
      
          // parse the file into the workbook..
      await workbook.xlsx.readFile(`${_sourceFile}`);

      let parseErrors = [];

      let ws;

      for( _sheet of Utils.SheetNames ) {

        ws = workbook.getWorksheet( _sheet );

        if( !ws ) {
          parseErrors.push( _sheet );
        }
        else {
          xls2cais.worksheets[_sheet] = {
            worksheet: ws,
            headers: Utils.getWorksheetHeaders(ws),
            rowCount: ws.actualRowCount,
            columnCount: ws.actualColumnCount,
          }

        }

      }

      if( parseErrors.length ) { 

       xls2cais.hasErrors = true;

        xls2cais.logger.error( `Missing ${parseErrors.toString()} sheets in ${path.basename(_sourceFile)}`);

        _resolve();

      }

      await LoadAcctSheet(_options);
     
      await LoadLeCustomerSheet(_options);

      await LoadNpCustomerSheet(_options);

      await LoadAcctAddressSheet(_options);

      await LoadAcctLargeTraderSheet(_options);

      await LoadAcctCustomerRoleSheet(_options);

      //await LoadAcctCustomerTradersSheet(_options);

      await LoadCustomerAddressSheet(_options);

      await LoadTidSheet(_options);

      if( xls2cais.hasErrors === true && _options.ignoreErrors === false ) {

        xls2cais.logger.error( `Errors encountered. No submission files produced`);

      } else {
  
        Utils.writeCAISSubmissionFiles();

      }
      
      _resolve();

    } catch(_err) {

      _reject(_err);

    } finally {
                                        // if the map file is open close it..
      if( xls2cais.accountIDMapFileFd ) fs.closeSync(xls2cais.accountIDMapFileFd);
                                        // // if the map file is open close it..
      if( xls2cais.customerIDMapFileFd ) fs.closeSync(xls2cais.customerIDMapFileFd);
                                        // if the error file is open close it..
      if( xls2cais.xls2caisErrorFileFd ) fs.closeSync(xls2cais.xls2caisErrorFileFd);
      
    }

  });

}