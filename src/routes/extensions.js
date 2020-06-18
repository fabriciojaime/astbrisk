module.exports = function(application){
    application.get('/extensions', function(req, res){
      application.src.controllers.extensions.index(application, req, res);
    });
}
  