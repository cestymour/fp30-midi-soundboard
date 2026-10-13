// Compare deux dossiers de captures au pixel près ; écrit les images de différence dans le dossier parent
const path=require('path');
const NM=process.env.REGRESSION_NODE_MODULES ?? '/tmp/pwtest/node_modules';
const fs=require('fs'),{PNG}=require(NM+'/pngjs'),pm=require(NM+'/pixelmatch');
const [,,a,b]=process.argv;
for (const f of fs.readdirSync(a).sort()) {
  const A=PNG.sync.read(fs.readFileSync(a+'/'+f)),B=PNG.sync.read(fs.readFileSync(b+'/'+f));
  if (A.width!==B.width||A.height!==B.height){console.log(f,'TAILLE DIFF');continue;}
  const D=new PNG({width:A.width,height:A.height});
  const n=pm(A.data,B.data,D.data,A.width,A.height,{threshold:0});
  if(n) fs.writeFileSync(path.join(path.dirname(path.resolve(a)),'diff-'+f),PNG.sync.write(D));
  console.log(f, n? n+' px différents':'IDENTIQUE');
}
