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


router.get('/profile', async(req, res) => {
  try {
    console.log(req.query)
    let profile = await req.models.User.findOne({username: req.query.username})
    console.log(profile.last_login)
    const results = {username: profile.username, bio: profile.bio, lastLogin: profile.last_login}
    res.json(results)
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: 'error', error: error.message });
  }
});

router.post('/profile', async(req, res) => {
  try {
    const {username, newBio} = req.body
    const update = {bio: newBio}
    await req.models.User.findOneAndUpdate({username: username}, update)
    res.status(200).json({status: 'succuess'})
  } catch (error) {
    console.error(error)
    res.status(500).json({status: 'error', error: error.message})
  }
})


export default router;