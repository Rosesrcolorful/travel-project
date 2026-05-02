const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  res.json({
    success: true,
    data: 'Users route works',
    error: null
  });
});

module.exports = router;