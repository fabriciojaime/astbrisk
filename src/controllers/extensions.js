module.exports.index = function(application, req, res) {
    var newsModel = new application.src.models.extensions();
  
    newsModel.getExtensions(function(err, result) {
      res.render("extensions", {extensions : result});
    });
  }
  
  