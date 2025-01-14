const express = require('express');
const { newAssetController, getAssetsController, deleteAssetsController, editAssetController } = require('../controllers/assets');

const router = express.Router();

router.get('/get_assets',           getAssetsController    );
router.put('/edit_asset',           editAssetController    );
router.post('/new_asset',           newAssetController     );
router.delete('/delete_asset/:id',  deleteAssetsController );


module.exports = { assetsRouter: router };