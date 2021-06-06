module.exports = {
    ensureAuthenticated: function(req, res, next) {
      if (req.isAuthenticated()) {
        return next();
      }
      req.flash('error_msg', 'Please log in to view that resource');
      res.redirect('/');
    },
    forwardAuthenticated: function(req, res, next) {
      if (!req.isAuthenticated()) {
        return next();
      }
      res.redirect('/courses');      
    },    ensureAuthenticateadmin: function(req, res, next) {
        if (req.isAuthenticated()) {
            if(req.user.name=='admin')
          return next();
        }
        req.flash('error_msg', 'You must be admin to Upload/Delete Files');
        res.redirect('back');
      }

  };