const { Command } = require('commander');
const winston = require('winston');
const { combine, timestamp, printf, colorize, align } = winston.format;

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: combine(
    colorize({ all: true }),
    timestamp({
      format: 'YYYY-MM-DD hh:mm:ss.SSS A',
    }),
    align(),
    printf((info) => `[${info.timestamp}] ${info.level}: ${info.message}`)
  ),
  transports: [new winston.transports.Console()],
});


const xls2cais = require('./src/xls2cais');

const program = new Command();

global.xls2cais = {
  outputPath: './generated-files/',
  hasErrors: false,
  serialNumber : 1,
  errors: { 
    validation: [],
    linkage: []
  },
  caisObject : undefined,
  tidsObject : undefined,
  lastFdidRecordId : 0,
  lastCustomerRecordId : 0,
  lastLargeTraderID : 0,
  caisFileBaseName : '',
  tidsFileBaseName : '',
  xls2caisErrorFileName : '',
  xls2caisErrorFileFd : undefined,
  xls2caisMapsFileName : '',
  accountIdMap: {},
  customerIdMap: {},
  tidMap: {},
  caisCustomers:  {},
  logger: logger,
  worksheets: {}
};
//const logger = require('./services/loggerService')

program.command('xls2cais')
  .description('CIAS Spreadsheet Converter v1.0.0\nCopyright (c) 2022 Xinthesys, Llc \nAll rights reservered')
  .argument('<File Path>', 'File path')
  .requiredOption('-R, --reporter <reporter CRD#>', 'The reporter CRD for the industry memeber that will be reporting')
  .requiredOption('-S, --submitter <submitter CRD#>', 'The submitter CRD that will be submitting the files')
  .option('-C, --correspondent  <correspondant CRD#>', 'The correspsondand CRD who is the correspondandant for the industry member (if required)')
  .option('-s, --serial <serial number>', 'The next file serial number to use')
  .option('-v, --validate', 'Only validate the data')
  .option('--no-validate-schema', 'do not validate against schemas')
  .option('-I,--ignore-errors', 'do not validate missing linkages',false)
  .option('-o, --output <outpufile>', 'output dir for the json and bzip files')
  .option('-f, --file', 'used to specify the file', '') 
  .action(async(str, options) => {

    console.log('Adept(tm) CIAS Spreadsheet Converter \nCopyright (c) 2022 Xinthesys, Llc \nAll rights reservered\n================');

    logger.info( `Starting xls2json utility`);
    logger.info( `Submitter=${options.submitter}, Reporter=${options.reporter}${ (options.correspondant ? ','+options.correspondant : '' )} `);
    
    if( options.correspondant) logger.info( `Correspondant=${options.correspondant}`);
    
    if( options.validate) logger.info( `Running in validate only mode`);

    if( options.serial ) 
      options.serial = Number(options.serial);
    
    let extension = str.split('.').pop();

    if(extension !== 'xlsx') {
      logger.error('Invalid file, Try with .xlsx or .xls');
    } else {
      try {

        await xls2cais(str, options ); // <---- Main function
  
      } catch( _err ) {

        if( typeof _err === 'string') {
          logger.error(_err);
        } 
        else {
          console.error(_err);
        }
      } finally {    
        process.stdout.cursorTo(0);
        logger.info('Done.');
      }
      
    }

  });

program.parse();


