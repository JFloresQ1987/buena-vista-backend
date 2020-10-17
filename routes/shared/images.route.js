const { Router } = require('express');
const router = Router();
var fs = require ('fs');


router.get('/image', function(req, res, next) {
    res.writeHead(200,{'content-type':'image/png'});
    fs.createReadStream('public/images/buenavista-logo.png').pipe(res);
});

module.exports = router;