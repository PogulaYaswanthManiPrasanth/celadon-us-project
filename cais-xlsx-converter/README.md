# The CAIS Spreadsheet Converter utility

This utility takes the Adept(t) CAIS spreadsheet and converts it into a set of FINRA CAIS files that are ready for submission to FINRA.

Usage: index xls2cais [options] <File Path>

CIAS Spreadsheet Converter v1.0.0
Copyright (c) 2022 Xinthesys, Llc 
All rights reservered

Arguments:
  File Path                                  File path

Options:
  -R, --reporter <reporter CRD#>             The reporter CRD for the industry memeber that
                                             will be reporting
  -S, --submitter <submitter CRD#>           The submitter CRD that will be submitting the
                                             files
  -C, --correspondent  <correspondant CRD#>  The correspsondand CRD who is the correspondandant
                                             for the industry member (if required)
  -s, --serial <serial number>               The next file serial number to use
  -v, --validate                             Only validate the data
  --no-validate-schema                       do not validate against schemas
  --no-validate-links                        do not validate missing linkages
  -F, --force-output                         generate output even if errors are encountered
                                             (default: false)
  -o, --output <outpufile>                   output dir for the json and bzip files
  -f, --file                                 used to specify the file
  -h, --help                                 display help for command

Example : 

`node index xls2json <some excel file-name>.xlsx -R <some CRD number> -S 93010 -s <serial-number>`
