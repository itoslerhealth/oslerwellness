exports.handler = async (event) => {
  try{
    const payload = JSON.parse(event.body||'{}');
    // TODO: call Plato API to create a draft note.
    return { statusCode: 200, body: JSON.stringify({ok:true, echo: payload}) };
  }catch(e){
    return { statusCode: 200, body: JSON.stringify({ok:false, error: String(e)}) };
  }
};