import Withdrawal from "../models/withdrawlModel.js";

// Create a Withdrawl***************************************************************************************************

export const createWithdrawl =async (req, res) => {
    try {
      const { userId, userEmail, userName, amount, method } = req.body;
  
      // Validate required fields
      if (!userId || !userEmail || !userName || !amount || !method) {
        return res.status(400).json({ error: 'All fields are required' });
      }
  
      // Create new withdrawal
      const withdrawal = new Withdrawal({
        userId,
        userEmail,
        userName,
        amount,
        method,
      });
  
      await withdrawal.save();
      res.status(201).json({ message: 'Withdrawal request created successfully', withdrawal });
    } catch (error) {
      res.status(500).json({ error: 'Failed to create withdrawal', details: error.message });
    }
  };

// ***************************************************GET WITHDRAWLS GET REQUEST*****************************************************

  export const getWithdrawls=async (req, res) => {
    try {
      const withdrawals = await Withdrawal.find();
      res.status(200).json(withdrawals);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch withdrawals', details: error.message });
    }
  };



//   *****************************************GET SPECIFIC WITHDRAWL BY ID******************************************************************

export const getSpecificWithdrawl=async (req, res) => {
    try {
      const withdrawal = await Withdrawal.findById(req.params.id);
      if (!withdrawal) {
        return res.status(404).json({ error: 'Withdrawal not found' });
      }
      res.status(200).json(withdrawal);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch withdrawal', details: error.message });
    }
  };


//   ***************************************************************UPDATE WITHDRAWL STATUS**************************************************

export const updateWithdrawl=async (req, res) => {
    try {
      const { status } = req.body;
  
      if (!status) {
        return res.status(400).json({ error: 'Status is required' });
      }
  
      const withdrawal = await Withdrawal.findByIdAndUpdate(
        req.params.id,
        { status },
        { new: true } // Return the updated document
      );
  
      if (!withdrawal) {
        return res.status(404).json({ error: 'Withdrawal not found' });
      }
  
      res.status(200).json({ message: 'Withdrawal status updated successfully', withdrawal });
    } catch (error) {
      res.status(500).json({ error: 'Failed to update withdrawal', details: error.message });
    }
  };


//   **********************************************************DELETE WITHDRAWL**********************************************************

export const deleteWithdrawl=async (req, res) => {
    try {
      const withdrawal = await Withdrawal.findByIdAndDelete(req.params.id);
      if (!withdrawal) {
        return res.status(404).json({ error: 'Withdrawal not found' });
      }
      res.status(200).json({ message: 'Withdrawal deleted successfully', withdrawal });
    } catch (error) {
      res.status(500).json({ error: 'Failed to delete withdrawal', details: error.message });
    }
  };


//   ***************************************************display all withdrawls of the x user************************************************
export const getDataById= async (req, res) => {
    try {
      const { userId } = req.params;
  
      // Find withdrawals by userId
      const withdrawals = await Withdrawal.find({ userId });
  
      if (withdrawals.length === 0) {
        return res.status(404).json({ message: 'No withdrawals found for this user' });
      }
  
      res.status(200).json(withdrawals);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch withdrawals', details: error.message });
    }
  };

//   **************************************************************************************
  