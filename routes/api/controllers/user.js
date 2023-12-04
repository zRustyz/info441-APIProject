import express, { response } from "express";

const router = express.Router();

router.get("/myIdentity", async (req, res) => {
  if (req.session.isAuthenticated) {
    //gets the sessions information
    const info = {
      name: req.session.account.name,
      username: req.session.account.username
    }
    //options for findOneAndUpdate
    const options = {
      new: true, // Return the updated document
      upsert: true, // If no document is found, create a new one
      setDefaultsOnInsert: true, // Set default values if a new document is created
    };
    //creates a new entry in the user db if the username does not exist in the user db
    //updates the last login time
    const update = {
      username: info.username,
      last_login: new Date(),
    }
    try {
      await req.models.User.findOneAndUpdate({username: info.username}, update, options)
    } catch (error) {
      console.error(error);
      res.status(500).json({ status: 'error', error: error.message });
    }
    const response = {
      status: "loggedin",
      userInfo: info
    };
    res.json(response)
  } else {
    res.json({ status: "loggedout" });
  }
});

export default router;