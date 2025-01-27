import express from "express";
import {
    createWithdrawl,
    getWithdrawls,
    getSpecificWithdrawl,
    updateWithdrawl,
    deleteWithdrawl,
    getDataById,
} from "../controllers/withdrawlController.js";

const router = express.Router();

// Route to create a new tournament
router.post("/",createWithdrawl );

router.get('/',getWithdrawls);

router.get('/:id', getSpecificWithdrawl);

router.put('/:id',updateWithdrawl);

router.delete('/:id',deleteWithdrawl);

router.get('/getdata/:userId',getDataById);

export default router;
