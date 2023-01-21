const fs = require('fs');
const path = require('path');

const compressjs = require('compressjs');
const crypto = require('crypto');
const algorithm = compressjs.Bzip2;

const sprintf = require('sprintf-js').sprintf;
const ValidatorJs = require('validatorjs');

const Schemas = require( './schemas');


// Generate ssin number format
const getSSNNumber = (ssn) => {
  let formatedSSN = ssn.replace(/\D/g, '');
  formatedSSN = formatedSSN.replace(/^(\d{3})/, '$1-');
  formatedSSN = formatedSSN.replace(/-(\d{2})/, '-$1-');
  formatedSSN = formatedSSN.replace(/(\d)-(\d{4}).*/, '$1-$2');
  return formatedSSN
}

// Generate ein number format
const getEINNumber = (ein) => {
  let formatedEIN = ein.replace(/\D/g, '');
  formatedEIN = formatedEIN.replace(/^(\d{2})/, '$1-');
  return formatedEIN
}

exports.row2record = function row2record( _record, _row ) {

  rawToRecordObject =Schemas.create(_record, _row);
         
  return rawToRecordObject;
}

exports.logAccountIDMap = function logAcountIDMap( _account_id, _record_id ) {

  return new Promise( ( _resolve, _reject) => {

    try {

      const sprintf_fmt = '%-25s %-40s';
      const dashes = '----------------------------------------------';
      const log_fmt = `\n${sprintf_fmt}`;

      if( !xls2cais.accountIDMapFileFd ) {
        
        xls2cais.accountIDMapFileFd = fs.openSync(path.join( xls2cais.outputPath,xls2cais.accountIDMapFileName), 'w' );

        fs.writeSync(xls2cais.accountIDMapFileFd, sprintf( sprintf_fmt, "RecordId", "AccountId" ) );    

        fs.writeSync( xls2cais.accountIDMapFileFd, `\n${dashes.substring(0,25)} ${dashes.substring(0,40)}`);

      }
      
      fs.writeSync( xls2cais.accountIDMapFileFd, sprintf( log_fmt, _record_id, _account_id ) );    
      
      _resolve();
        
    } catch( _err ) {
      _reject(_err);
    }
        
  });
}

exports.logCustomerIDMap = function logCustomerIDMap( _customer_id, _record_id, _type ) {

  return new Promise( ( _resolve, _reject) => {

    try {

      const sprintf_fmt = '%-20s %-20s %-30s';
      const dashes = '----------------------------------------------';
      const log_fmt = `\n${sprintf_fmt}`;

      if( !xls2cais.customerIDMapFileFd ) {
        
        xls2cais.customerIDMapFileFd = fs.openSync(path.join( xls2cais.outputPath,xls2cais.customerIDMapFileName), 'w' );

        fs.writeSync(xls2cais.customerIDMapFileFd, sprintf( sprintf_fmt, "Customer Type", "RecordId", "AccountId" ) );    

        fs.writeSync( xls2cais.customerIDMapFileFd, `\n${dashes.substring(0,20)} ${dashes.substring(0,20)} ${dashes.substring(0,30)}`);

      }
      
      fs.writeSync( xls2cais.customerIDMapFileFd, sprintf( log_fmt, _type, _record_id, _customer_id ) );    
      
      _resolve();
        
    } catch( _err ) {
      _reject(_err);
    }
        
  });
}

function logError( _ref, _row, _attrib, _msg ) {

  return new Promise( ( _resolve, _reject) => {
    try {

      const sprintf_fmt = '%-25s %-6s %-25s %-30s';
      const dashes = '----------------------------------------------';
      const log_fmt = `\n${sprintf_fmt}`;
      if( !xls2cais.xls2caisErrorFileFd ) {
        
        xls2cais.xls2caisErrorFileFd = fs.openSync(path.join( xls2cais.outputPath,xls2cais.xls2caisErrorFileName), 'w' );

        fs.writeSync(xls2cais.xls2caisErrorFileFd, sprintf( sprintf_fmt, "Reference", "Row", "Column", "Error" ) );    

        fs.writeSync( xls2cais.xls2caisErrorFileFd, `\n${dashes.substring(0,25)} ${dashes.substring(0,6)} ${dashes.substring(0,25)} ${dashes.substring(0,40)}`);

      }
      
      fs.writeSync( xls2cais.xls2caisErrorFileFd, sprintf( log_fmt, _ref, _row, _attrib,  _msg ) );    
      
      _resolve();
        
    } catch( _err ) {
      _reject(_err);
    }
        
  });
}
exports.logError = logError;


exports.logSheetParsingError = function logSheetParsingError( _error ) {
  
xls2cais.hasErrors = true;

process.nextTick( async () => {

  for( _attrib of Object.keys( _error.errors  ) ) {
    await logError( _error.ref, _error.row, _attrib, _error.errors[_attrib] );    
  }
  
});
    

}

exports.getNextFdidRecordId = function getNextFdidRecordId() {
  return ++xls2cais.lastFdidRecordId;
}

exports.getNextCustomerRecordId = function getNextCustomerRecordId() {
  return ++xls2cais.lastCustomerRecordId;
}


exports.getNextLargeTraderRecordId = function getNextCustomerRecordId() {
  return ++xls2cais.lastLargeTraderRecordId;
}

/**
 * @description left pad a number with zero's
 * @param {Number} _num the number
 * @param {Number} _len the lentgh of the string
 * @returns 
 */
exports.lpadZeros = function lpadZeros( _num, _len ) {
  let s = '';
  for( i=0;i<_len;i++) s +=  '0';
  s += _num;
  return s.substr(s.length - _len);
}

exports.writeCAISSubmissionFiles = () => {

  if( !fs.existsSync( xls2cais.outputPath ) ) {
    mkdirp.sync(xls2cais.outputPath);
  }

  let caisFilename = `${xls2cais.caisFileBaseName}.json`
  let tidFilename = `${xls2cais.tidsFileBaseName}.json`

  try {

    xls2cais.logger.info( `Creating ${caisFilename}` );
    fs.writeFile(`${path.join( xls2cais.outputPath,caisFilename)}`, JSON.stringify(xls2cais.caisObject), 'utf8', function (_err) {
      if (_err) {
        xls2cais.logger.error( `Error writing ${path.join(xls2cais.outputPath,caisFilename)} : ${_err.message}`);
        _reject();
      }
    });

    xls2cais.logger.info( `Creating ${caisFilename}.bz2` );

    let data = new Buffer.from(JSON.stringify(xls2cais.caisObject), 'utf8');
    let compressed = algorithm.compressFile(data);

    fs.writeFile(`${path.join( xls2cais.outputPath,caisFilename)}.bz2`, compressed, 'utf8', function (_err) {
      if (_err) {
        xls2cais.logger.error( `Error writing ${path(xls2cais.outputPath,caisFilename)}.bz2 : ${_err.message}`);
        return;
      }
    });


    xls2cais.logger.info( `Creating ${tidFilename}` );

    fs.writeFile(`${path.join( xls2cais.outputPath,tidFilename)}`, JSON.stringify(xls2cais.tidsObject), 'utf8', function (_err) {
      if (_err) {
        xls2cais.logger.error( `Error writing ${path.join(xls2cais.outputPath,tidFilename)} : ${_err.message}`);
       return;
      }
    });

    xls2cais.logger.info( `Creating ${tidFilename}.bz2` );
    
    data = new Buffer.from(JSON.stringify(xls2cais.tidsObject), 'utf8');
    compressed = algorithm.compressFile(data);

    fs.writeFile(`${path.join( xls2cais.outputPath,tidFilename)}.bz2`, compressed, 'utf8', function (_err) {
      if (_err) {
        xls2cais.logger.error( `Error writing ${path.join(xls2cais.outputPath,tidFilename)}.bz2 : ${_err.message}`);
        return;
      }
    });

  } catch(_err) {
    console.error(_err);
  }
}

exports.writeMapFile = async function writeMapFile() {

  
  return new Promise( (_resolve, _reject) => {
    let map = { 
      account : xls2cais.accountIdMap,
      customer : xls2cais.customerIdMap
    }

    fs.writeFile(`${path.join(xls2cais.outputPath,xls2cais.xls2caisFileBaseName)}.map.json`, JSON.stringify(map), 'utf8', function (_err) {
      if (_err) {
        xls2cais.logger.error( `Error writing ${xls2cais.xls2caisFileBaseName}.map.json : ${_err.message}`);
        _reject();
      }
    });
  
    _resolve();

  });
  
}

exports.stringToBoolean = (_string) => {
    // will match one and only one of the string 'true','1', or 'on' rerardless
    // of capitalization and regardless off surrounding white-space.
    //
    regex=/^\s*(true|TRUE|1|on|yes|YES)\s*$/i

    return regex.test(_string);
}

exports.trimAllAttibutes = ( _object ) => {
                                           // trim all the attributes from the sheet..
  for( const _key of Object.keys( _object ) ) {
    if (  typeof _object[_key] === 'string'  ) {
      _object[_key] = _object[_key].trim();
    }
  }
  
}

exports.validateJSON = function validateJSON( _json, _rule, _customMgs, _cb ) {

  let validation = new ValidatorJs( _json, _rule, _customMgs );
  
  return ( validation.fails() === true ? validation.errors : undefined )      
  
}

exports.encyptedTID = (tidObject) => {
  const validEIN = ['EIN']
  const validSSNorITIN = ['SSN/ITIN', 'SSN', 'ITIN']
  if(validSSNorITIN.includes(tidObject.tidType)) {
    const ssnNumber = getSSNNumber(tidObject.tidTypeValue)
    return crypto.createHash('sha256').update(ssnNumber).digest('hex')
  } else if(validEIN.includes(tidObject.tidType)) {
    const einNumber = getEINNumber(tidObject.tidTypeValue)
    return crypto.createHash('sha256').update(einNumber).digest('hex')
  } else {
    return crypto.createHash('sha256').update(tidObject.tidTypeValue).digest('hex')
  }
}

const sheetNames = [
  'ACCT',
  'ACCT-ADDRESS',
  'ACCT-LARGE-TRADER',
  'ACCT-CUSTOMER-ROLE',
  'ACCT-CUSTOMER-TRADERS',
  'LE-CUSTOMER',
  'NP-CUSTOMER',
  'CUSTOMER-ADDRESS',
  'TID'
]
exports.SheetNames = sheetNames;

exports.getFDIDRecordByAccountID = ( _account_id, _ref_count=false ) => {

  let mapEntry = xls2cais.accountIdMap[_account_id];

  if( mapEntry && _ref_count === true ) mapEntry.ref++;

  return mapEntry;

}

exports.getAccountRecordByAccountID = ( _account_id, _ref_count=false ) => {

  let mapEntry = xls2cais.accountIdMap[_account_id];

  if( mapEntry && _ref_count === true ) mapEntry.ref++;

  return mapEntry;

}

exports.getCustomerRecordByCustomerID = ( _customer_id, _ref_count=false ) => {

  let mapEntry = xls2cais.customerIdMap[_customer_id];

  if( mapEntry && _ref_count === true ) mapEntry.ref++;

  return mapEntry;

}

const getWorksheetHeaders = (_ws) => {

  let headers = {};

  for( let i=1; i<= _ws.actualColumnCount; i++ ) {
    headers[i] = _ws.getRow(1).getCell(i).value.trim();
  }

  return headers;

}

exports.getWorksheetHeaders = getWorksheetHeaders;

exports.worksheetToJSON = ( _ws ) => {

  let headers = getWorksheetHeaders(_ws);
  let data = [{},{}];

  let row; 

  let value;

  for( let x = 2; x <= _ws.actualRowCount; x++ ) {
  
    process.stdout.cursorTo(0);
    process.stdout.write(`Converting Excel row: ${x}`);
    
    row = {}

    for( let y = 1; y <= _ws.actualColumnCount; y++ ) {

      value = _ws.getRow(x).getCell(y).value;

      row[headers[y]] = ( value ? value.toString() : value );

    }

    data.push(row);
    
  }

  process.stdout.clearLine(0);
  
  return data;

}

exports.foreachRow = function( _ws_spec, _cb ) {

  _ws_spec.worksheet.eachRow( ( _ws_row, _row_number ) => {
    
    //process.stdout.cursorTo(0);
    //process.stdout.write(`Converting Excel row: ${_row_number}`);

    let row = {}
    let value;

    if( _row_number < 2 ) {
      return
    }

    for( let y = 1; y <= _ws_spec.columnCount; y++ ) {

      value = _ws_row.getCell(y).value;

      row[_ws_spec.headers[y]] = ( value ? value.toString() : value );

    }
  
    _cb(row, _row_number );
    
  });

}
