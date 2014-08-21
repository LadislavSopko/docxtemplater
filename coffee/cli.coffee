fs=require('fs')
DocUtils=require('./docUtils')

showHelp=()->
  console.log('Usage: docxtemplater <configFilePath>')
  console.log('--- ConfigFile Format: json')
  console.log('--- see http://docxtemplater.readthedocs.org/en/latest/cli.html')

if(process.argv[2]=='--help' || process.argv[2]=='-h' || process.argv[2]==null || process.argv[2]==undefined)
  showHelp()
  return

res=fs.readFileSync(process.argv[2],'utf-8')
jsonInput=JSON.parse(res)

DocUtils.config={}

currentPath= process.cwd()+'/'
DocUtils.pathConfig={"node":currentPath}

for key of jsonInput
  if (key.substr(0,7)=='config.') then DocUtils.config[key.substr(7)]=jsonInput[key]

docxFileName=DocUtils.config["docxFile"]
jsonFileName=process.argv[2]

outputFile=DocUtils.config["outputFile"]
debug= DocUtils.config["debug"]
debugBool= DocUtils.config["debugBool"]

if(docxFileName=='--help' || docxFileName=='-h' || docxFileName==null || docxFileName==undefined || jsonFileName==null || jsonFileName==undefined)
  showHelp()
else
  if (debug=='-d' || debug == '--debug') then debugBool=true

  if debugBool
    console.log(process.cwd())
    console.log(debug)
  if (debugBool) then console.log("loading docx:"+docxFileName)
  DocUtils.loadDoc(docxFileName,{intelligentTagging:true})
  if (debugBool) then console.log('data:'+docXData[docxFileName])
  DocUtils.loadDoc(jsonFileName,{noDocx:true})

  if (debugBool) then console.log('data:'+docXData[jsonFileName])
  if (docXData[jsonFileName]==undefined) then throw 'no data found in json file'
  #jsonInput=JSON.parse(docXData[jsonFileName])
  if (docX[docxFileName]==undefined) then throw 'no data found in json file'
  if (debugBool) then console.log('decoded',jsonInput)
  if (debugBool) then console.log(docX)
  if (debugBool) then console.log(docX[docxFileName])

  docX[docxFileName].setTags(jsonInput)
  docX[docxFileName].qrCode=DocUtils.config["qrcode"]
  docX[docxFileName].finishedCallback=()->
    this.output({download:true,name:outputFile})
    console.log('outputed')
  docX[docxFileName].applyTags()